# Infrastructure

The site is hosted on an Azure Static Web App, defined in `main.bicep`. The resource is created once by hand. The Azure DevOps pipeline then deploys to it using the deployment token only, so no Entra ID service connection is needed.

## 1. Prerequisites

- Azure CLI, logged in with `az login`.
- A subscription selected (`az account set --subscription <id>`).

## 2. Create the resource group and app

One-off, from your machine:

```bash
az group create --name rg-ste-pam --location westeurope
az deployment group create --resource-group rg-ste-pam --parameters infra/main.bicepparam
```

## 3. Get the deployment token

```bash
az staticwebapp secrets list --name swa-ste-pam --resource-group rg-ste-pam --query properties.apiKey -o tsv
```

Treat the token as a secret. Never commit it.

## 4. Azure DevOps setup

- Create a pipeline from `azure-pipelines.yml` in the GitHub repo. This uses the Azure DevOps GitHub connection (OAuth or the GitHub App), not Entra ID.
- Add a secret pipeline variable `SWA_DEPLOYMENT_TOKEN` with the token. If you prefer a variable group named `ste-pam`, add `variables: - group: ste-pam` to the YAML.
- Rename or disable the old release pipeline so it stops trying to deploy Umbraco.

## 5. Rotating the token

```bash
az staticwebapp secrets reset-api-key --name swa-ste-pam --resource-group rg-ste-pam
```

Then update the `SWA_DEPLOYMENT_TOKEN` variable with the new value.

## 6. Custom domain

See `docs/runbook-cutover.md`. Once DNS is ready, set `customDomain` in `main.bicepparam` and redeploy.
