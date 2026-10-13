# C0: Clean slate and asset relocation

Wave 1 · Depends on: none · Size: S

## Goal

Remove the Umbraco solution from the migration branch and move the few files worth keeping into their final locations under `src/`. After this chunk the repo contains only docs, the relocated assets and fresh repo housekeeping files. The old code stays available on branch `archive/umbraco`.

## Read first

- `docs/specs/README.md` (sections 1, 2, 3.1)
- `docs/phase-2-plan.md` section 3 (target layout)

## Owns

`.gitignore`, `.gitattributes`, `README.md`, `src/styles/**`, `src/assets/**`, `src/old/**`, `src/static/**`. Deletes `Tranquility.CMS/` and `Tranquility.sln`.

## Steps

### 1. Confirm the archive exists

```bash
git fetch origin archive/umbraco
git rev-parse --verify origin/archive/umbraco   # must succeed; stop if not
```

### 2. Move assets with `git mv` (keeps history)

| From | To |
| --- | --- |
| `Tranquility.CMS/a/src/styles/` | `src/styles/` |
| `Tranquility.CMS/a/src/images/` | `src/assets/img/` |
| `Tranquility.CMS/a/src/sprites/sprite.svg` | `src/assets/sprites/sprite.svg` |
| `Tranquility.CMS/old/` (all files, including PDFs and the zip) | `src/old/` |
| `Tranquility.CMS/android-chrome-192x192.png` | `src/static/android-chrome-192x192.png` |
| `Tranquility.CMS/android-chrome-384x384.png` | `src/static/android-chrome-384x384.png` |
| `Tranquility.CMS/apple-touch-icon.png` | `src/static/apple-touch-icon.png` |
| `Tranquility.CMS/favicon.ico` | `src/static/favicon.ico` |
| `Tranquility.CMS/favicon-16x16.png` | `src/static/favicon-16x16.png` |
| `Tranquility.CMS/favicon-32x32.png` | `src/static/favicon-32x32.png` |
| `Tranquility.CMS/mstile-150x150.png` | `src/static/mstile-150x150.png` |
| `Tranquility.CMS/browserconfig.xml` | `src/static/browserconfig.xml` |
| `Tranquility.CMS/manifest.json` | `src/static/manifest.json` |

Do **not** move `robots.txt` (C7 generates it), `a/src/scripts/external-references.json` (unused), `css/RTE.css` (back-office only) or `package.json`/`gulpfile.js`.

File names with spaces (e.g. `FYP Progress Review Poster (K0025970).pdf`) must keep their exact names; they are public URLs under `/old/`.

### 3. Strip the UTF-8 BOM from moved text files

Several SCSS files and `manifest.json` start with a BOM (`EF BB BF`), which Dart Sass tolerates but some tools don't. Remove it from every `*.scss`, `*.json`, `*.xml` and `*.svg` under `src/`:

```bash
find src -type f \( -name '*.scss' -o -name '*.json' -o -name '*.xml' -o -name '*.svg' \) \
  -exec sed -i '1s/^\xEF\xBB\xBF//' {} +
```

Make no other content change to the moved files.

### 4. Delete the rest

```bash
git rm -r -q Tranquility.CMS Tranquility.sln
```

### 5. Replace housekeeping files

`.gitignore`:

```gitignore
node_modules/
_site/
.cache/
test-results/
.env
*.log
.DS_Store
```

`.gitattributes`:

```gitattributes
* text=auto eol=lf
*.png binary
*.jpg binary
*.jpeg binary
*.JPG binary
*.gif binary
*.ico binary
*.pdf binary
*.zip binary
*.woff binary
*.woff2 binary
```

`README.md` (short; British English, no em dashes):

```markdown
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
```

(The commands in "Local development" only work after C1; that's expected.)

### 6. Commit

`chore(c0): remove Umbraco solution and relocate reusable assets`

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | `Tranquility.CMS/` and `Tranquility.sln` no longer exist in the working tree. |
| AC2 | `src/styles/ste-pam.scss` exists, along with all 7 ITCSS folders (`01-settings` to `07-trumps`) and all their files. Contents are byte-identical to `archive/umbraco` apart from a removed BOM. |
| AC3 | `src/assets/img/` contains every file from `Tranquility.CMS/a/src/images/` on `archive/umbraco` (same relative paths, including `generic/2-100.jpg` and `social/*.svg`). |
| AC4 | `src/assets/sprites/sprite.svg` exists and contains `id="warning"`, `id="menu"`, `id="x"`, `id="home"`, `id="person"`, `id="pencil"`, `id="chat"`, `id="chevron-left"`. |
| AC5 | `src/old/` contains all 26 files from `Tranquility.CMS/old/` with identical names and bytes. |
| AC6 | `src/static/` contains exactly the 9 files in the table above. |
| AC7 | No file under `src/` starts with a UTF-8 BOM. |
| AC8 | `.gitignore`, `.gitattributes` and `README.md` match step 5. |
| AC9 | `docs/` is untouched (`git diff --stat HEAD~1 -- docs` is empty). |

## Verify

```bash
test ! -e Tranquility.CMS && test ! -e Tranquility.sln && echo "AC1 ok"
git diff --stat origin/archive/umbraco HEAD -M -- src | tail -3
for d in 01-settings 02-tools 03-generic 04-elements 05-objects 06-components 07-trumps; do test -d src/styles/$d || echo "missing $d"; done
diff <(git ls-tree -r --name-only origin/archive/umbraco Tranquility.CMS/a/src/images | sed 's|Tranquility.CMS/a/src/images/||' | sort) \
     <(cd src/assets/img && find . -type f | sed 's|^\./||' | sort) && echo "AC3 ok"
diff <(git ls-tree -r --name-only origin/archive/umbraco Tranquility.CMS/old | sed 's|Tranquility.CMS/old/||' | sort) \
     <(cd src/old && find . -type f | sed 's|^\./||' | sort) && echo "AC5 ok"
ls src/static | wc -l     # 9
grep -rlP '^\xEF\xBB\xBF' src || echo "AC7 ok"
```
