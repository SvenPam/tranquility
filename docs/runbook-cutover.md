# Runbook: cut over ste-pam.com to the Static Web App

How to move ste-pam.com from Umbraco on App Service to the Azure Static Web App, with a check at every step and a way back. Most steps are the owner's, because they need GitHub, Azure, Cloudflare or Azure DevOps (for the old pipelines) access. The agent prepares and verifies what it can.

## Facts

| Item | Value |
| --- | --- |
| Domain | `ste-pam.com` (apex only; `www` isn't used) |
| DNS | Cloudflare, currently proxied (orange cloud) to the App Service |
| New host | Static Web App `swa-ste-pam`, Free tier, in resource group `rg-ste-pam`. The group is in `ukwest`; the app's control plane is in `westeurope` because UK West isn't a supported Static Web Apps region (`infra/main.bicep`). Content is served from the edge network either way. |
| Default branch | `master`, to be renamed `main` |
| Pipeline | `.github/workflows/deploy.yml` in GitHub Actions, deploys `main`; repository secret `SWA_DEPLOYMENT_TOKEN`; weekly rebuild Mondays 05:00 UTC |
| Old stack to retire | App Service, Azure SQL database, storage account `stepam`, Application Insights, old ADO release pipeline, hcti.io and Twitter API credentials |

The checkpoint script is `scripts/cutover-check.sh <base-url>`. It runs the URL parity tests over HTTP (`TEST_MODE=http`), prints status and content type for key URLs, shows the `/about/` redirect and checks that an unknown URL returns 404. It needs only `bash`, `curl` and `node`. It runs every part and exits non-zero if the URL tests failed.

## A. Before cut-over

1. **Owner.** Disable BOTH the old Azure DevOps build (CI) pipeline and the old release pipeline, so that merging to `master` and renaming it to `main` can't deploy Umbraco to the App Service.
   Check: both show as disabled in Azure DevOps, and neither triggers when you push a test commit to a scratch branch.
2. **Owner.** Confirm the 13 restored articles are live on the current site.
   Check: `ls src/blog/*.md | wc -l` on the PR branch gives 58, and `NODE_USE_ENV_PROXY=1 TEST_MODE=http BASE_URL=https://ste-pam.com node --test --test-name-pattern="\[content\]" tests/urls.test.mjs` passes (every baseline article URL returns 200 on live). Drop `NODE_USE_ENV_PROXY=1` if you aren't behind a proxy.
3. **Agent.** On the PR branch run `npm ci && npm run build && npm test`. Keep the results for the PR description (the PR is opened in the next step).
   Check: all tests pass and `npm audit` reports 0 vulnerabilities. Also run `grep -rnIE '\bC(1[01]|[0-9])\b|wave [0-9]' --exclude-dir=node_modules --exclude-dir=docs --exclude-dir=.claude --exclude-dir=_site --exclude-dir=.cache --exclude-dir=.git --exclude-dir=social --exclude=package-lock.json .` and expect no output. The `-I` flag and the excludes matter: without them the grep matches binaries, the cache and the SVG path data under `src/assets/img/social/`.
4. **Owner.** Open a PR from `clean/static-site` to `master`, paste the results from the previous step into its description, and merge it.
   Check: the merge commit is on `master`.
5. **Owner.** In GitHub settings, rename the default branch `master` to `main`.
   Check: `git ls-remote --symref origin HEAD` shows `ref: refs/heads/main`. Then update each local clone with `git branch -m master main`, `git fetch origin`, `git branch -u origin/main main` and `git remote set-head origin -a`.
6. **Owner.** Provision Azure with `infra/README.md` steps 1 to 3 (resource group `rg-ste-pam` in `ukwest`, Static Web App `swa-ste-pam`, deployment token). Store the token as the repository secret `SWA_DEPLOYMENT_TOKEN` (GitHub > Settings > Secrets and variables > Actions).
   Check: `az staticwebapp show --name swa-ste-pam --resource-group rg-ste-pam --query defaultHostname -o tsv` prints a hostname.
7. **Owner.** Run the workflow on `main`: GitHub > Actions > Deploy > Run workflow.
   Check: the run deploys, and `scripts/cutover-check.sh https://<default-hostname>.azurestaticapps.net` passes, including the `/cv` redirect and every other redirect.
8. **Agent or owner.** Routing checks the local emulator can't do. SWA CLI 2.0.10 ignores `trailingSlash` and breaks its 404 override after the first request, so confirm these against the `azurestaticapps.net` URL and record the results:
   - `curl -sI <url>/about` returns 200 with no redirect, and `curl -sI <url>/about/` returns 301 to `/about`. Same for `/blog/sass-loops`.
   - `curl -s -o /dev/null -w '%{http_code} %{size_download}\n' '<url>/blog?page=2'` returns 200 with the full blog list.
   - Two consecutive requests to an unknown URL both return 404 with the custom Not Found page (the body contains "U2 is still looking").
   - `/Areas/ste_pam/Uploads/Stephen%20Pammenter%20-%20CV.pdf` and `/res/FYP%20Progress%20Review%20Poster%20(K0025970).pdf` redirect to `/old/...`. This shows whether Azure matches routes on the encoded or decoded path.

   Check: all four bullets hold. If `/about` doesn't return 200, stop: the permalink scheme needs changing before DNS moves.

## B. Domain switch

Do this at a quiet time. Downtime should be minutes at most.

Certificate timing: with TXT validation Azure may issue the certificate before the record moves. If the custom domain already shows "Ready" before step 3, change the record at that point to avoid TLS errors. Otherwise keep the order below and expect a short window while the certificate is issued.

1. **Owner.** In the Azure portal open Static Web App `swa-ste-pam` > Custom domains > Add > `ste-pam.com`, "Other DNS", **TXT** validation. Copy the TXT value.
   Check: the portal shows the domain as "Validating" with a TXT record to add.
2. **Owner.** In Cloudflare DNS, add the TXT record (`_dnsauth` or as shown by Azure). Wait for Azure to show "Validated".
   Check: `dig +short TXT _dnsauth.ste-pam.com` returns the value, and the portal status changes to Validated.
3. **Owner.** **Write down the current apex record** (type, value and proxy status; for example by screenshot or `dig +short ste-pam.com`), the current Cloudflare SSL/TLS mode, and any page rules or redirect rules in a safe place. Rollback depends on it. Then change the apex record to `CNAME ste-pam.com -> <default-hostname>.azurestaticapps.net` (Cloudflare flattens it at the apex) and set it to **DNS only** (grey cloud).
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
3. **Owner.** Confirm the weekly scheduled run is configured.
   Check: `.github/workflows/deploy.yml` has the `0 5 * * 1` schedule, and the Actions tab shows a scheduled run after the first Monday.

## D. Rollback

Possible any time before decommissioning.

1. **Owner.** In Cloudflare, set the apex record back to the value recorded in step B3, with the proxy on as before, and restore the SSL/TLS mode and any page or redirect rules recorded there. Leave the Static Web App in place.
   Check: `dig +short ste-pam.com` returns the recorded value.
2. **Owner.** Confirm the old site is back.
   Check: `https://ste-pam.com` responds from the old Umbraco site (for example `/sitemap?xml=true` works and `/og/index.png` returns 404).

## E. Decommission

Only after at least two weeks without a rollback.

1. **Owner.** Take a final SQL database export (`.bacpac`) and keep it with the storage account backup. The repository is now the source of truth for content, but a backup costs nothing.
   Check: the `.bacpac` file exists and is non-empty.
2. **Owner.** Delete the App Service (and its plan if unused), the SQL database (and server if unused), Application Insights, the storage account `stepam` (after confirming `src/media` has every file in use: `npm test` passes its link check, and every path from `grep -rho '/media/[^)"' ]*' src | sort -u` exists in the output of `find src/media -type f`), the old ADO release pipeline and its variable groups.
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

Result: 18 or 19 of 84 URL tests passed, depending on whether the emulator had already served a 404; spot checks ran. The failures are emulator limitations:

- **`/about`, `/blog`, `/contact`, `/sitemap`, `/not-found` and every `/blog/<slug>` returned 301 to a trailing-slash URL.** The emulator ignores `trailingSlash: "never"`, so it redirects the folder-style output to `/about/` instead of serving `/about`. Real Static Web Apps behaviour is checked in step A8.
- **`/about/` returned 200 instead of 301 to `/about`.** Same cause.
- **Unknown URLs returned 404 without the custom page.** The emulator's 404 override looks up `not-foundindex.html` (missing slash) after the first request. Also checked in step A8.
- Redirects (including `/cv`, `/work` and the file moves), `/`, `/sitemap.xml`, `/robots.txt` and `/og/index.png` behaved correctly.

### Live Umbraco site (`https://ste-pam.com`, today)

Result: 78 URL tests passed and 6 failed, all expected. `/og/index.png` is a spot check, not one of the 6 URL-test failures. Run with `NODE_USE_ENV_PROXY=1` so Node's fetch uses the sandbox proxy.

| Check | Live today | Why |
| --- | --- | --- |
| `/sitemap.xml` | 404 | The old site only has `sitemap?xml=true`. |
| `/og/index.png` (spot check only) | 404 | OG cards are new. |
| `/about/` to `/about` 301 | 200 | The old site serves both forms; `trailingSlash: "never"` adds the redirect. |
| `/cv` to LinkedIn 302 | 301 | The old redirect goes to Stack Overflow; the new target is deliberately different. |
| `/work` to `/about` 302 | 200 | `/work` is a new redirect; the old site served a page. |
| `/res/Class1.jpg`, `/res/MiruScreen1.jpg` to `/old/...` 301 | 404 | The files moved to `/old/` in the new build. |

Spot checks on live: `/`, `/about`, `/blog`, `/blog/sass-loops` and `/robots.txt` return 200; `/sitemap.xml` and `/og/index.png` return 404; an unknown URL returns 404. The "HTTP/1.1 200 Connection Established" line before `HTTP/2 200` comes from the sandbox proxy, not the site.
