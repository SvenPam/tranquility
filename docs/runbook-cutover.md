# Runbook: cut over ste-pam.com to the Static Web App

How to move ste-pam.com from Umbraco on App Service to the Azure Static Web App, with a check at every step and a way back. Most steps are the owner's, because they need GitHub, Azure, Cloudflare or Azure DevOps access. The agent prepares and verifies what it can.

## Facts

| Item | Value |
| --- | --- |
| Domain | `ste-pam.com` (apex only; `www` isn't used) |
| DNS | Cloudflare, currently proxied (orange cloud) to the App Service |
| New host | Static Web App `swa-ste-pam` in resource group `rg-ste-pam`, Free tier, `westeurope` (`infra/main.bicep`) |
| Default branch | `master`, to be renamed `main` |
| Pipeline | `build/azure-pipelines.yml` in Azure DevOps, deploys `main`; secret variable `SWA_DEPLOYMENT_TOKEN`; weekly rebuild Mondays 05:00 UTC |
| Old stack to retire | App Service, Azure SQL database, storage account `stepam`, Application Insights, old ADO release pipeline, hcti.io and Twitter API credentials |

The checkpoint script is `scripts/cutover-check.sh <base-url>`. It runs the URL parity tests over HTTP (`TEST_MODE=http`), prints status and content type for key URLs, shows the `/about/` redirect and checks that an unknown URL returns 404. It needs only `bash`, `curl` and `node`. It runs every part and exits non-zero if the URL tests failed.

## A. Before cut-over

1. **Owner.** Confirm the 13 restored articles are live on the current site and that the content conversion branch is merged.
   Check: `ls src/blog/*.md | wc -l` on the migration branch matches the article count in `tests/expected-urls.json`.
2. **Agent.** On the migration branch run `npm ci && npm run build && npm test`, then `npm run test:visual`. Paste the results into the PR.
   Check: all tests pass, `npm audit` reports 0 vulnerabilities, and the visual diff is within tolerance.
3. **Owner.** Open a PR from the migration branch to `master` and merge it.
   Check: the merge commit is on `master`.
4. **Owner.** In GitHub settings, rename the default branch `master` to `main`.
   Check: `git ls-remote --symref origin HEAD` shows `ref: refs/heads/main`.
5. **Owner.** Provision Azure with `infra/README.md` steps 1 to 3 (resource group `rg-ste-pam`, Static Web App `swa-ste-pam`, deployment token). Store the token as the secret pipeline variable `SWA_DEPLOYMENT_TOKEN` in Azure DevOps. Create the pipeline from `build/azure-pipelines.yml`. Disable the old release pipeline.
   Check: `az staticwebapp show --name swa-ste-pam --resource-group rg-ste-pam --query defaultHostname -o tsv` prints a hostname; the old release pipeline shows as disabled.
6. **Owner.** Run the pipeline on `main`.
   Check: the run deploys, and `scripts/cutover-check.sh https://<default-hostname>.azurestaticapps.net` passes, including the `/cv` redirect and every other redirect.
7. **Agent or owner.** Routing checks the local emulator can't do. SWA CLI 2.0.10 ignores `trailingSlash` and breaks its 404 override after the first request, so confirm these against the `azurestaticapps.net` URL and record the results:
   - `curl -sI <url>/about` returns 200 with no redirect, and `curl -sI <url>/about/` returns 301 to `/about`. Same for `/blog/sass-loops`.
   - `curl -s -o /dev/null -w '%{http_code} %{size_download}\n' '<url>/blog?page=2'` returns 200 with the full blog list.
   - Two consecutive requests to an unknown URL both return 404 with the custom Not Found page (the body contains "U2 is still looking").
   - `/Areas/ste_pam/Uploads/Stephen%20Pammenter%20-%20CV.pdf` and `/res/FYP%20Progress%20Review%20Poster%20(K0025970).pdf` redirect to `/old/...`. This shows whether Azure matches routes on the encoded or decoded path.

   Check: all four bullets hold. If `/about` doesn't return 200, stop: the permalink scheme needs changing before DNS moves.

## B. Domain switch

Do this at a quiet time. Downtime should be minutes at most.

1. **Owner.** In the Azure portal open Static Web App `swa-ste-pam` > Custom domains > Add > `ste-pam.com`, "Other DNS", **TXT** validation. Copy the TXT value.
   Check: the portal shows the domain as "Validating" with a TXT record to add.
2. **Owner.** In Cloudflare DNS, add the TXT record (`_dnsauth` or as shown by Azure). Wait for Azure to show "Validated".
   Check: `dig +short TXT _dnsauth.ste-pam.com` returns the value, and the portal status changes to Validated.
3. **Owner.** **Write down the current apex record** (type, value and proxy status; for example by screenshot or `dig +short ste-pam.com`) in a safe place. Rollback depends on it. Then change the apex record to `CNAME ste-pam.com -> <default-hostname>.azurestaticapps.net` (Cloudflare flattens it at the apex) and set it to **DNS only** (grey cloud).
   Check: the old value is recorded; `dig +short ste-pam.com` no longer returns the App Service address.
4. **Owner.** Wait for Azure to issue the certificate.
   Check: the custom domain status is "Ready" and `curl -sI https://ste-pam.com | head -1` shows a valid response with no TLS error.
5. **Agent or owner.** Run `scripts/cutover-check.sh https://ste-pam.com`.
   Check: all tests and spot checks pass.
6. **Owner (optional).** Turn the Cloudflare proxy back on. If you do, set SSL/TLS mode to **Full (strict)** and re-run the check. If anything breaks, return to DNS only.
   Check: `scripts/cutover-check.sh https://ste-pam.com` passes with the proxy on.
7. **Owner (optional).** Set `customDomain: 'ste-pam.com'` in `infra/main.bicepparam` so the definition matches reality, and redeploy as described in `infra/README.md`.
   Check: the deployment succeeds and the domain stays "Ready".

## C. After cut-over

1. **Owner.** In Google Search Console, submit `https://ste-pam.com/sitemap.xml`. Remove the old `sitemap?xml=true` entry if it was registered.
   Check: Search Console reports the sitemap as read successfully.
2. **Owner.** Check social previews (LinkedIn Post Inspector, or the X card validator if available) for the home page and one article.
   Check: both show the generated OG card.
3. **Agent.** Confirm the weekly scheduled run is configured.
   Check: Azure DevOps shows the "Weekly rebuild" schedule for `main`, Mondays 05:00 UTC.

## D. Rollback

Possible any time before decommissioning.

1. **Owner.** In Cloudflare, set the apex record back to the value recorded in step B3, with the proxy on as before. Leave the Static Web App in place.
   Check: `dig +short ste-pam.com` returns the recorded value.
2. **Owner.** Confirm the old site is back.
   Check: `https://ste-pam.com` responds from the old Umbraco site (for example `/sitemap?xml=true` works and `/og/index.png` returns 404).

## E. Decommission

Only after at least two weeks without a rollback.

1. **Owner.** Take a final SQL database export (`.bacpac`) and keep it with the storage account backup. The repository is now the source of truth for content, but a backup costs nothing.
   Check: the `.bacpac` file exists and is non-empty.
2. **Owner.** Delete the App Service (and its plan if unused), the SQL database (and server if unused), Application Insights, the storage account `stepam` (after confirming `src/media` has every file in use), the old ADO release pipeline and its variable groups.
   Check: none of them appears in the Azure portal or in Azure DevOps.
3. **Owner.** Revoke the hcti.io API key and the Twitter app credentials.
   Check: both providers show the credentials as revoked.
4. **Owner.** Remove the old Umbraco-related service connections in Azure DevOps, including the Entra one that was failing.
   Check: Project settings > Service connections lists none of them.
5. **Owner.** Check the Azure cost for the old resource group.
   Check: it drops to zero in the next billing cycle.

## F. Follow-ups

Not part of the cut-over.

- Replace the `/cv` redirect with the JSON Resume CV page.
- Update the home page meta description, which still mentions StaffCircle.
- Consider analytics (Google Analytics was dropped).

## Dry run (recorded on 2026-10-14)

The pre-cut-over checks were exercised in two places. Each difference has a cause.

### Local emulator (`http://localhost:4280`, SWA CLI 2.0.10)

Result: 18 of 84 URL tests passed; spot checks ran. The failures are emulator limitations:

- **`/about`, `/blog`, `/contact`, `/sitemap`, `/not-found` and every `/blog/<slug>` returned 301 to a trailing-slash URL.** The emulator ignores `trailingSlash: "never"`, so it redirects the folder-style output to `/about/` instead of serving `/about`. Real Static Web Apps behaviour is checked in step A7.
- **`/about/` returned 200 instead of 301 to `/about`.** Same cause.
- **Unknown URLs returned 404 without the custom page.** The emulator's 404 override looks up `not-foundindex.html` (missing slash) after the first request. Also checked in step A7.
- Redirects (including `/cv`, `/work` and the file moves), `/`, `/sitemap.xml`, `/robots.txt` and `/og/index.png` behaved correctly.

### Live Umbraco site (`https://ste-pam.com`, today)

Result: 78 passed, 6 failed, all expected. Run with `NODE_USE_ENV_PROXY=1` so Node's fetch uses the sandbox proxy.

| Check | Live today | Why |
| --- | --- | --- |
| `/sitemap.xml` | 404 | The old site only has `sitemap?xml=true`. |
| `/og/index.png` | 404 | OG cards are new. |
| `/about/` to `/about` 301 | 200 | The old site serves both forms; `trailingSlash: "never"` adds the redirect. |
| `/cv` to LinkedIn 302 | 301 | The old redirect goes to Stack Overflow; the new target is deliberately different. |
| `/work` to `/about` 302 | 200 | `/work` is a new redirect; the old site served a page. |
| `/res/Class1.jpg`, `/res/MiruScreen1.jpg` to `/old/...` 301 | 404 | The files moved to `/old/` in the new build. |

Spot checks on live: `/`, `/about`, `/blog`, `/blog/sass-loops` and `/robots.txt` return 200; `/sitemap.xml` and `/og/index.png` return 404; an unknown URL returns 404. The "HTTP/1.1 200 Connection Established" line before `HTTP/2 200` comes from the sandbox proxy, not the site.
