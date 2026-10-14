import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { diff } from "../scripts/lib/css-normalise.mjs";

const BUILT = "_site/a/dist/css/ste-pam.min.css";
const LIVE = "docs/baseline/live/ste-pam.min.css";

function sample(label, keys) {
  if (!keys.length) return "";
  const more = keys.length > 20 ? `\n  ... and ${keys.length - 20} more` : "";
  return `\n${label} (${keys.length}):\n  ${keys.slice(0, 20).join("\n  ")}${more}`;
}

test("built stylesheet is equivalent to the live stylesheet", () => {
  assert.ok(existsSync(BUILT), `${BUILT} is missing; run npm run build first`);
  const { onlyA, onlyB, changed } = diff(readFileSync(BUILT, "utf8"), readFileSync(LIVE, "utf8"));
  const report =
    sample("Only in build", onlyA) + sample("Only in live", onlyB) + sample("Declarations differ", changed);
  assert.equal(onlyA.length + onlyB.length + changed.length, 0, `Stylesheets differ:${report}`);
});

test("section striping uses the restored odd-section rule", () => {
  const css = readFileSync(BUILT, "utf8");
  assert.ok(css.includes(".section:nth-child(odd):not(.section--footer){background-color:#e9ecef}"));
  assert.ok(!css.includes(".section--footer) .section--dark"));
});
