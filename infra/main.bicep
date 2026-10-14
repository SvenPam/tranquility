@description('Static Web App name')
param name string = 'swa-ste-pam'

@description('Region for the Static Web App control plane (content is served globally)')
@allowed(['westeurope', 'centralus', 'eastus2', 'westus2', 'eastasia'])
param location string = 'westeurope'

@description('Apex custom domain. Set to an empty string on a fresh deploy and add it after DNS is ready (see docs/runbook-cutover.md)')
param customDomain string = 'ste-pam.com'

resource swa 'Microsoft.Web/staticSites@2023-12-01' = {
  name: name
  location: location
  sku: { name: 'Free', tier: 'Free' }
  properties: {
    // No repository link: content is pushed by the GitHub Actions workflow with the deployment token.
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
