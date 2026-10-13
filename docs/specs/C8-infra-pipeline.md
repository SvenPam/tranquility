# C8: Infra and pipeline

Wave 3 · Depends on: C1 · Size: M

## Goal

Define the Azure Static Web App in Bicep (deployed once by hand) and an Azure DevOps YAML pipeline that validates pull requests and deploys `main`, plus a weekly rebuild. The pipeline authenticates to the Static Web App with its **deployment token only**, so it never needs an Entra ID service connection. That avoids the identity problem that broke the old pipeline.

## Read first

- `docs/specs/README.md` (3.7 npm scripts)
- `docs/phase-2-plan.md` section 10

## Owns

`azure-pipelines.yml`, `infra/main.bicep`, `infra/main.bicepparam`, `infra/README.md`, `tests/pipeline.test.mjs`.

## Steps

### 1. `infra/main.bicep`

```bicep
@description('Static Web App name')
param name string = 'swa-ste-pam'

@description('Region for the Static Web App control plane (content is served globally)')
@allowed(['westeurope', 'centralus', 'eastus2', 'westus2', 'eastasia'])
param location string = 'westeurope'

@description('Apex custom domain. Leave empty on first deploy; add after DNS is ready (see docs/runbook-cutover.md)')
param customDomain string = ''

resource swa 'Microsoft.Web/staticSites@2023-12-01' = {
  name: name
  location: location
  sku: { name: 'Free', tier: 'Free' }
  properties: {
    // No repository link: content is pushed by the Azure DevOps pipeline with the deployment token.
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Enabled'
  }
  tags: { project: 'ste-pam.com' }
}

resource domain 'Microsoft.Web/staticSites/customDomains@2023-12-01' = if (!empty(customDomain)) {
  parent: swa
  name: customDomain
  properties: { validationMethod: 'dns-txt-token' }
}

output defaultHostname string = swa.properties.defaultHostname
output name string = swa.name
```

`infra/main.bicepparam`:

```bicep
using 'main.bicep'
param name = 'swa-ste-pam'
param location = 'westeurope'
param customDomain = ''
```

If a newer stable API version for `Microsoft.Web/staticSites` is available when you implement this, use it and note the change.

### 2. `infra/README.md`

A short how-to (British English, no em dashes), with these sections and commands:

1. **Prerequisites:** Azure CLI logged in (`az login`), a subscription selected.
2. **Create the resource group and app** (one-off, from your machine):
   ```bash
   az group create --name rg-ste-pam --location westeurope
   az deployment group create --resource-group rg-ste-pam --parameters infra/main.bicepparam
   ```
3. **Get the deployment token:**
   ```bash
   az staticwebapp secrets list --name swa-ste-pam --resource-group rg-ste-pam --query properties.apiKey -o tsv
   ```
4. **Azure DevOps setup:**
   - Create a pipeline from `azure-pipelines.yml` in the GitHub repo (this needs ADO's GitHub connection, which is OAuth or the GitHub App, not Entra).
   - Add a secret pipeline variable `SWA_DEPLOYMENT_TOKEN` with the token (or a variable group `ste-pam` if preferred; then add `variables: - group: ste-pam` to the YAML).
   - Rename the old release pipeline or disable it so it stops trying to deploy Umbraco.
5. **Rotating the token:** `az staticwebapp secrets reset-api-key --name swa-ste-pam --resource-group rg-ste-pam`, then update the variable.
6. **Custom domain:** pointer to `docs/runbook-cutover.md`.

### 3. `azure-pipelines.yml`

```yaml
# Build, test and deploy ste-pam.com to Azure Static Web Apps.
# PRs: build + test. main: build + test + deploy. Weekly: rebuild main so the
# copyright year and "Old Article" banners stay current.

trigger:
  branches:
    include: [main]

pr:
  branches:
    include: [main]

schedules:
  - cron: "0 5 * * 1"
    displayName: Weekly rebuild
    branches:
      include: [main]
    always: true

pool:
  vmImage: ubuntu-latest

variables:
  npm_config_cache: $(Pipeline.Workspace)/.npm
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1"
  isMain: $[eq(variables['Build.SourceBranch'], 'refs/heads/main')]

steps:
  - task: UseNode@1
    displayName: Use Node 22
    inputs:
      version: 22.x

  - task: Cache@2
    displayName: Cache npm
    inputs:
      key: 'npm | "$(Agent.OS)" | package-lock.json'
      path: $(npm_config_cache)

  - task: Cache@2
    displayName: Cache image crops and OG cards
    inputs:
      key: 'build-cache | "$(Agent.OS)" | package-lock.json'
      restoreKeys: 'build-cache | "$(Agent.OS)"'
      path: .cache

  - script: npm ci
    displayName: Install

  - script: npm run build
    displayName: Build

  - script: npm test
    displayName: Test

  - task: AzureStaticWebApp@0
    displayName: Deploy to Azure Static Web Apps
    condition: and(succeeded(), eq(variables.isMain, true))
    inputs:
      app_location: _site
      output_location: ""
      skip_app_build: true
      skip_api_build: true
      azure_static_web_apps_api_token: $(SWA_DEPLOYMENT_TOKEN)
```

Notes:
- `npm test` runs every suite including `[content]` tests. That's correct once C10 has landed. Before then, the pipeline isn't used for deploys.
- Visual tests (`npm run test:visual`) need a browser and are local-only; don't add them here.
- If `AzureStaticWebApp@0` requires `cwd`, set `cwd: $(System.DefaultWorkingDirectory)`.

### 4. Test: `tests/pipeline.test.mjs`

No YAML library is installed, so do structural checks with string and regex matching:

- `azure-pipelines.yml` exists, has `trigger` and `pr` blocks including `main`, a `schedules` block with `always: true`, `npm ci`, `npm run build`, `npm test`, `AzureStaticWebApp@0`, `skip_app_build: true`, `app_location: _site`, `$(SWA_DEPLOYMENT_TOKEN)`, and a deploy `condition` referencing `refs/heads/main`.
- No line contains a literal token (nothing matching `/[0-9a-f]{40,}/i`) or `AzureCLI@`/`azureSubscription` (no service connection).
- `infra/main.bicep` contains `Microsoft.Web/staticSites@`, `name: 'Free'`, and `dns-txt-token`.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | `azure-pipelines.yml` matches step 3 (content may be reordered or commented, behaviour identical). |
| AC2 | The pipeline uses no Azure service connection; the deploy authenticates only with `$(SWA_DEPLOYMENT_TOKEN)`. |
| AC3 | `tests/pipeline.test.mjs` passes. |
| AC4 | If the Bicep CLI is available (`az bicep build` or `bicep build`), `infra/main.bicep` compiles with no errors. If not available, say so in the report; the owner will run it. |
| AC5 | `infra/README.md` covers the six sections in step 2, with commands that use the names from the Bicep defaults. |
| AC6 | No secrets are committed anywhere in the repo. |

## Verify

```bash
node --test tests/pipeline.test.mjs
(command -v az >/dev/null && az bicep build --file infra/main.bicep --stdout >/dev/null && echo "bicep ok") || echo "bicep CLI not available"
grep -rnE '[0-9a-f]{40,}' azure-pipelines.yml infra || echo "no secrets"
```
