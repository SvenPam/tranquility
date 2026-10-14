# Tranquility

Source for [ste-pam.com](https://ste-pam.com): a static site built with Eleventy and hosted on Azure Static Web Apps.

The previous Umbraco 7 version is preserved on the `archive/umbraco` branch.

## Writing a post

1. Add `src/blog/<slug>.md` with front matter (copy the front matter from an existing post; `npm run validate` checks it).
2. Push to `main`. The Azure DevOps pipeline builds, tests and deploys.

## Local development

    nvm use
    npm ci
    npm run serve     # http://localhost:8080
    npm run build && npm test

The cut-over runbook is `docs/runbook-cutover.md`. The full migration history (discovery, plan, specs, live snapshot, proofreading logs) is on the `archive/migration-workings` branch.
