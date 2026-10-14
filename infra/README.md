# Infrastructure

The site is hosted on an Azure Static Web App, defined in `main.bicep`. The resource is created once by hand. The GitHub Actions workflow (`.github/workflows/deploy.yml`) then deploys to it using the deployment token only, so no Entra ID service connection is needed.

## 1. Prerequisites

- Azure CLI, logged in with `az login`.
- A subscription selected (`az account set --subscription <id>`).

## 2. Create the resource group and app

One-off, from your machine:

```bash
az group create --name rg-ste-pam --location ukwest
az deployment group create --resource-group rg-ste-pam --parameters infra/main.bicepparam
```

The resource group can be in any region. The Static Web App's own `location` parameter is limited to the regions Static Web Apps supports (default `westeurope`), so the app sits in West Europe inside a UK West group. Readers are served from the edge network regardless.

## 3. Get the deployment token

```bash
az staticwebapp secrets list --name swa-ste-pam --resource-group rg-ste-pam --query properties.apiKey -o tsv
```

Treat the token as a secret. Never commit it.

## 4. GitHub setup

- In the GitHub repo go to Settings > Secrets and variables > Actions and add a repository secret named `SWA_DEPLOYMENT_TOKEN` with the token.
- The workflow needs nothing else: it runs on pushes and PRs to `main`, and deploys on `main` only.
- Disable the old Azure DevOps build and release pipelines so they stop trying to deploy Umbraco.

## 5. Rotating the token

```bash
az staticwebapp secrets reset-api-key --name swa-ste-pam --resource-group rg-ste-pam
```

Then update the `SWA_DEPLOYMENT_TOKEN` secret with the new value.

## 6. Custom domain

See `docs/runbook-cutover.md`. Once DNS is ready, set `customDomain` in `main.bicepparam` and redeploy.
