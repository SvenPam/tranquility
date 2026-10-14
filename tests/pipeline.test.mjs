import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const pipeline = read('.github/workflows/deploy.yml');
const bicep = read('infra/main.bicep');

test('pipeline triggers on main for push and pull requests', () => {
  assert.match(pipeline, /^on:\s*\n\s+push:\s*\n\s+branches: \[main\]/m);
  assert.match(pipeline, /^\s+pull_request:\s*\n\s+branches: \[main\]/m);
});

test('pipeline has a weekly schedule', () => {
  assert.match(pipeline, /^\s+schedule:\s*\n\s+- cron: "0 5 \* \* 1"/m);
});

test('pipeline runs install, audit, build and test', () => {
  for (const cmd of ['npm ci', 'npm audit', 'npm run build', 'npm test']) {
    assert.match(pipeline, new RegExp(`run: ${cmd}\\s*$`, 'm'), cmd);
  }
});

test('pipeline deploys _site with the deployment token on main only', () => {
  for (const s of ['Azure/static-web-apps-deploy@', 'skip_app_build: true', 'app_location: _site', 'secrets.SWA_DEPLOYMENT_TOKEN']) {
    assert.ok(pipeline.includes(s), s);
  }
  assert.match(pipeline, /if: github\.ref == 'refs\/heads\/main' && github\.event_name != 'pull_request'/);
});

test('pipeline contains no literal token and only reads repository contents', () => {
  for (const line of pipeline.split('\n')) {
    assert.doesNotMatch(line, /[0-9a-f]{40,}/i);
  }
  assert.match(pipeline, /^permissions:\s*\n\s+contents: read/m);
});

test('bicep defines a free static site with DNS TXT validation', () => {
  assert.ok(bicep.includes('Microsoft.Web/staticSites@'));
  assert.ok(bicep.includes("name: 'Free'"));
  assert.ok(bicep.includes('dns-txt-token'));
});
