# Tranquility

Source for [ste-pam.com](https://ste-pam.com): a static site built with Eleventy and hosted on Azure Static Web Apps.

The previous Umbraco 7 version is preserved on the `archive/umbraco` branch.

## Writing a post

1. Add `src/blog/<slug>.md` with front matter (see `docs/specs/README.md`, section 3.4).
2. Push to `main`. The Azure DevOps pipeline builds, tests and deploys.

## Local development

    nvm use
    npm ci
    npm run serve     # http://localhost:8080
    npm run build && npm test

Migration docs live in `docs/`.
