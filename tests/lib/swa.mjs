import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { SITE } from "./site.mjs";

/** Message used when routing checks run before the SWA config is generated. */
export const ROUTING_SKIP = "routing config not built yet (C7)";

/** Loads `staticwebapp.config.json` from the build output, or returns null. */
export function loadConfig(root = SITE) {
  const file = path.join(root, "staticwebapp.config.json");
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

export const config = loadConfig();

/**
 * Returns the first route that matches `urlPath`, following Static Web Apps'
 * first-match order. A route matches when it equals the path
 * (case-insensitive) or ends in `/*` and is a prefix of the path.
 *
 * For wildcard routes whose redirect also ends in `/*`, the returned copy has
 * the matched remainder substituted into `redirect`.
 */
export function matchRoute(urlPath, cfg = config) {
  if (!cfg || !Array.isArray(cfg.routes)) return null;
  const p = urlPath.replace(/[?#].*$/, "").toLowerCase();
  for (const route of cfg.routes) {
    if (typeof route.route !== "string") continue;
    const r = route.route.toLowerCase();
    if (r === p) return route;
    if (r.endsWith("/*")) {
      const prefix = r.slice(0, -1);
      if (p.startsWith(prefix)) {
        if (typeof route.redirect === "string" && route.redirect.endsWith("/*")) {
          const rest = urlPath.replace(/[?#].*$/, "").slice(prefix.length);
          return { ...route, redirect: route.redirect.slice(0, -1) + rest };
        }
        return route;
      }
    }
  }
  return null;
}
