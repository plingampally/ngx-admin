# ngx-admin — Angular 14 -> 18 migration, step: Angular 15

Branch `angular-15` (worktree `ngx-admin-v15`) is the 14 -> 15 step, branched from `angular-14-baseline` (worktree `ngx-admin`, upstream tag `v10.0.0`).
Strategy: one worktree + branch per major version so each step can be diffed and tested independently. Per-step breakage is tracked in `MIGRATION_LOG.md` — update it whenever a step finds or fixes something.

## Toolchain (pinned)

- Node **18.20.8** (`.nvmrc`, `.node-version`). Node 24 is the machine default and is not supported by Angular CLI 15.
  - Local: `export PATH=~/.n/n/versions/node/18.20.8/bin:$PATH` (installed via `N_PREFIX=~/.n n install`). The 14 baseline uses `~/.n/n/versions/node/16.20.2`.
  - A `preinstall` script hard-fails `npm install`/`npm ci` on any non-18 Node. (`engine-strict=true` cannot be used: it also audits transitive deps such as `karma-cli@1.0.1`, which declare ancient engines.)
- npm 10.x. `.npmrc` sets `save-exact=true` and `legacy-peer-deps=true` (still required: `ng2-smart-table` peers on Angular ^10 and the other View Engine libs have stale peer ranges; removable once they are replaced in the 16 step).
- Install with `npm ci` only, never `npm install` — `package-lock.json` is the actual version pin.
- Versions on this branch: Angular 15.2.10, CLI 15.2.11, CDK 15.2.9, Nebular 11.0.1, TypeScript 4.9.5, zone.js 0.12.0, rxjs 6.6.2.

## Commands

- `npm ci` — install (~1-2 min; no postinstall — ngcc runs on demand during build)
- `npm start -- --port 4215` — dev server (4200 is used by the 14 baseline worktree)
- `npm run build` — dev build
- `npm run test:ci` — Karma headless, single run, with coverage. Needs system Chrome; if Karma cannot find it: `export CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
- `npm test` — Karma watch mode (opens Chrome)
- `npm run lint`
- `docker build -f Dockerfile.ci -t ngx-admin-a15-ci .` — clean-room proof (install + build + test) on Node 18; CI gate only, not for dev.

## Playwright (smoke + navigation + theme + visual regression)

- Lives in `playwright/` (the `e2e/` dir is dead Protractor). `playwright.config.ts` has **no `webServer` block** — always point `BASE_URL` at an already-running dev server:
  - `BASE_URL=http://localhost:4215 npm run e2e:pw` — run against this branch's server
  - `BASE_URL=http://localhost:4200 npm run e2e:pw` — run against the Angular 14 baseline
  - `npm run e2e:pw:update` — regenerate snapshots (`--update-snapshots`)
  - `npm run e2e:pw:report` — open the HTML report
- **Golden policy:** snapshots in `playwright/tests/__snapshots__/` are captured from the *previous* Angular version's server (`:4200` for the 15 step) and committed. Never regenerate them from the server under test — the diff between goldens and the current version IS the migration evidence.
- First run needs `npx playwright install chromium`.
- 91 tests: 41 navigation, 4 smoke, 1 theme-cycle, 45 visual. Two navigation tests are `test.fixme` for pre-existing upstream console errors (`/pages/dashboard` echarts `setOption`, `/pages/editors/ckeditor` CKEditor strict-mode) — verified identical on Angular 14.

## Gate for every migration step

`npm ci` (from empty node_modules) -> `npm run build:prod` -> `npm run test:ci` (63/63) -> `npm run lint`. Check the Karma "Executed N of N" line explicitly: the 15 step produced `Executed 0 of 0` with exit code 0 (see MIGRATION_LOG 15.1).

## Baseline test suite

Upstream ships zero specs. The 14 baseline added 11 spec files (35 tests): theme pipes, `throwIfAlreadyLoaded`, `LayoutService`, `StateService`, `UserService`, `FooterComponent`, `AppComponent`. The 15 step adds 6 more (28 tests): `CoreModule`/ACL, `AnalyticsService`, `SeoService`, `HeaderComponent` (wrapped in an `nb-layout` host for `nb-search`), `ThemeModule.forRoot`, `pages-menu` invariants. Expected: `Executed 63 of 63 SUCCESS`.
Karma prints "Some of your tests did a full page reload!" after the run — caused by the legacy `pace-js`/`tinymce` global scripts in the test bundle, not the specs.

## Deviations from upstream v10.0.0 (setup-only)

- Removed `node-sass` (unbuildable on Apple Silicon / modern Node; Angular CLI uses dart-sass).
- `angular.json` test styles: `font-awesome` -> `@fortawesome/fontawesome-free` (upstream referenced a package that isn't installed).
- Added devDeps `@babel/runtime` (build-angular's nested 7.18 lacked `regeneratorValues`), `@types/ws@8.5.3` exact (newer types break with `@types/node@12`), `karma-coverage` (needed by `--code-coverage`).
- Added `ChromeHeadlessCI` launcher and `test:ci` script.
