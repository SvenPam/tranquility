import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const pipeline = read('azure-pipelines.yml');
const bicep = read('infra/main.bicep');

test('pipeline triggers on main for push and pull requests', () => {
  assert.match(pipeline, /^trigger:\s*\n\s+branches:\s*\n\s+include: \[main\]/m);
  assert.match(pipeline, /^pr:\s*\n\s+branches:\s*\n\s+include: \[main\]/m);
});

test('pipeline has an always-run weekly schedule', () => {
  assert.match(pipeline, /^schedules:/m);
  assert.match(pipeline, /^\s+always: true/m);
});

test('pipeline runs install, audit, build and test', () => {
  for (const cmd of ['npm ci', 'npm audit', 'npm run build', 'npm test']) {
    assert.match(pipeline, new RegExp(`- script: ${cmd}\\s*$`, 'm'), cmd);
  }
});

test('pipeline deploys _site with the deployment token on main only', () => {
  for (const s of ['AzureStaticWebApp@0', 'skip_app_build: true', 'app_location: _site', '$(SWA_DEPLOYMENT_TOKEN)']) {
    assert.ok(pipeline.includes(s), s);
  }
  assert.match(pipeline, /isMain: .*refs\/heads\/main/);
  assert.match(pipeline, /condition: .*isMain/);
});

test('pipeline contains no literal token or service connection', () => {
  for (const line of pipeline.split('\n')) {
    assert.doesNotMatch(line, /[0-9a-f]{40,}/i);
    assert.doesNotMatch(line, /AzureCLI@|azureSubscription/);
  }
});

test('bicep defines a free static site with DNS TXT validation', () => {
  assert.ok(bicep.includes('Microsoft.Web/staticSites@'));
  assert.ok(bicep.includes("name: 'Free'"));
  assert.ok(bicep.includes('dns-txt-token'));
});
