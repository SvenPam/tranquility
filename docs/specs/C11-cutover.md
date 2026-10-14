# C11: Cut-over runbook

Wave 6 · Depends on: all · Size: S

## Goal

Write and dry-run the runbook that takes ste-pam.com from Umbraco on App Service to the Static Web App, with checks at each step and a rollback. Most steps are the owner's to execute (GitHub settings, Azure, Cloudflare, Azure DevOps); the agent prepares everything and verifies what it can.

## Read first

- `docs/specs/README.md`
- `docs/phase-2-plan.md` section 10.3
- `infra/README.md` (C8)
- `tests/urls.test.mjs` and `tests/expected-urls.json` (C9), run in `http` mode during cut-over

## Owns

`docs/runbook-cutover.md`, `scripts/cutover-check.sh`, plus comment-only cleanup anywhere (AC5).

## Facts the runbook relies on

| Item | Value |
| --- | --- |
| Domain | `ste-pam.com` (apex only; `www` isn't used) |
| DNS | Cloudflare, currently proxied (orange cloud) to the App Service |
| New host | Static Web App `swa-ste-pam` in `rg-ste-pam`, Free tier (C8) |
| Default branch | `master`, to be renamed `main` |
| Pipeline | `azure-pipelines.yml` in Azure DevOps, deploys `main` |
| Old stack to retire | App Service, Azure SQL database, storage account `stepam`, Application Insights, old ADO release pipeline, hcti.io and Twitter API credentials |

## Steps

### 1. `scripts/cutover-check.sh`

A wrapper the owner runs at each checkpoint:

```bash
#!/usr/bin/env bash
# Usage: scripts/cutover-check.sh https://<host>
set -euo pipefail
BASE_URL="${1:?base url}"
echo "== URL parity against $BASE_URL"
TEST_MODE=http BASE_URL="$BASE_URL" node --test tests/urls.test.mjs
echo "== Spot checks"
for p in / /about /blog /blog/sass-loops /sitemap.xml /robots.txt /og/index.png; do
  printf '%-22s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' "$BASE_URL$p")"
done
curl -sI "$BASE_URL/about/" | grep -iE '^(HTTP|location)'
curl -s "$BASE_URL/nope" -o /dev/null -w 'unknown url -> %{http_code}\n'
```

### 2. `docs/runbook-cutover.md`

A how-to in British English, no em dashes, numbered steps with **who** (owner or agent), the exact action, and a **check** for each. Required content:

**A. Before cut-over**
1. Owner: confirm the 13 restored articles are live (C10 prerequisite) and C10 is merged.
2. Agent: on the migration branch, `npm ci && npm run build && npm test` all green; `npm run test:visual` within tolerance. Paste results.
3. Owner: open a PR from the migration branch to `master` and merge it.
4. Owner: in GitHub settings, rename the default branch `master` to `main`. Check: `git ls-remote --symref origin HEAD` shows `refs/heads/main`.
5. Owner: provision Azure with `infra/README.md` steps 1 to 3; store `SWA_DEPLOYMENT_TOKEN` in ADO; create the pipeline from `azure-pipelines.yml`; disable the old release pipeline.
6. Owner: run the pipeline on `main`. Check: it deploys, and `scripts/cutover-check.sh https://<default-hostname>.azurestaticapps.net` passes (the `/cv` redirect and every other check).

**B. Domain switch** (do it at a quiet time; downtime should be minutes at most)
1. Owner: in the Azure portal, Static Web App > Custom domains > Add > `ste-pam.com`, "Other DNS", **TXT** validation. Copy the TXT value.
2. Owner: in Cloudflare DNS, add the TXT record (`_dnsauth` or as shown by Azure). Wait for Azure to show "Validated".
3. Owner: in Cloudflare, change the apex record to `CNAME ste-pam.com -> <default-hostname>.azurestaticapps.net` (Cloudflare flattens it at the apex). Set it to **DNS only** (grey cloud) first.
4. Owner: wait for Azure to issue the certificate (status "Ready").
5. Agent or owner: `scripts/cutover-check.sh https://ste-pam.com`. All checks pass.
6. Owner (optional): turn the Cloudflare proxy back on. If you do, set SSL/TLS mode to **Full (strict)** and re-run the check. If anything breaks, return to DNS only.
7. Owner: optionally add the custom domain to the Bicep params (`customDomain: 'ste-pam.com'`) so the definition matches reality.

**C. After cut-over**
1. Owner: Google Search Console: submit `https://ste-pam.com/sitemap.xml`; remove the old `sitemap?xml=true` entry if it was registered.
2. Owner: check social previews (LinkedIn Post Inspector, or the X card validator if available) for the home page and one article; they should show the generated OG card.
3. Agent: confirm the weekly scheduled run is configured (ADO shows the schedule).

**D. Rollback** (any time before decommissioning)
1. Owner: in Cloudflare, point the apex record back to the App Service (previous value, which the runbook tells the owner to **write down in step B3 before changing it**), proxy on as before.
2. Check: the old site responds at `https://ste-pam.com`.

**E. Decommission** (after at least two weeks without a rollback)
1. Owner: take a final SQL database export (`.bacpac`) and keep it with the storage account backup; the content's source of truth is now the repo, but a backup costs nothing.
2. Owner: delete the App Service (and its plan if unused), the SQL database (and server if unused), Application Insights, storage account `stepam` (after confirming `src/media` has every file in use), the old ADO release pipeline and its variable groups.
3. Owner: revoke the hcti.io API key and the Twitter app credentials.
4. Owner: remove the old Umbraco-related service connections in ADO (the Entra one that was failing).
5. Check: the Azure cost for the old resource group drops to zero next billing cycle.

**F. Follow-ups** (not part of cut-over)
- Replace the `/cv` redirect with the JSON Resume CV page.
- Update the home page meta description (still mentions StaffCircle).
- Consider analytics (GA was dropped).

### 3. Dry-run what can be dry-run

- Run `scripts/cutover-check.sh http://localhost:4280` against the SWA CLI emulator (see C7 step 5) and paste the output.
- Run it against `https://ste-pam.com` **now** (still Umbraco) to show the script works and to record today's differences.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | `docs/runbook-cutover.md` contains sections A to F with owner/agent, action and check for every step, including "write down the current DNS record" before changing it. |
| AC2 | `scripts/cutover-check.sh` is executable, uses only `bash`, `curl` and `node`, and runs against the emulator with all checks passing. |
| AC3 | The dry run against today's live site completes and its output is attached, with the expected differences explained. |
| AC5 | Final code hygiene: `grep -rnE '\bC(1[01]\|[0-9])\b\|wave [0-9]' --exclude-dir=node_modules --exclude-dir=docs --exclude-dir=.claude --exclude-dir=_site .` returns nothing. Remove any leftover chunk references in comments (and the owner column in `config/README.md`) as part of this chunk; this is the one cross-ownership edit C11 is allowed. |
| AC4 | The runbook uses the resource names from `infra/main.bicep` and the pipeline variable name from `azure-pipelines.yml`. |

## Verify

```bash
chmod +x scripts/cutover-check.sh
npm run build && (npx --yes @azure/static-web-apps-cli@2.0.10 start _site --port 4280 &) && sleep 15
scripts/cutover-check.sh http://localhost:4280
scripts/cutover-check.sh https://ste-pam.com || true
```
