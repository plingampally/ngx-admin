# ngx-admin — Angular 14 -> 18 migration, step: Angular 17

Branch `angular-17` (worktree `ngx-admin-v17`) is the 16 -> 17 step, branched from `angular-16` (worktree `ngx-admin-v16`); the chain starts at `angular-14-baseline` (worktree `ngx-admin`, upstream tag `v10.0.0`).
Strategy: one worktree + branch per major version so each step can be diffed and tested independently. Per-step breakage is tracked in `MIGRATION_LOG.md` (kept in sync with the shared parent log at `../MIGRATION_LOG.md`) — update it whenever a step finds or fixes something. The reusable Devin procedure is at `../DEVIN_ANGULAR_MIGRATION_PLAYBOOK.md`.

## Toolchain (pinned)

- Node **18.20.8** (`.nvmrc`, `.node-version`). Angular CLI 17 requires ^18.13 || >=20.9; the install guard still accepts only Node 18 (Node 20 is planned for the 18 step).
  - Local: `export PATH=~/.n/n/versions/node/18.20.8/bin:$PATH` (installed via `N_PREFIX=~/.n n install`). The 14 baseline uses `~/.n/n/versions/node/16.20.2`.
  - A `preinstall` script hard-fails `npm install`/`npm ci` on any non-18 Node. (`engine-strict=true` cannot be used: it also audits transitive deps such as `karma-cli@1.0.1`, which declare ancient engines.)
- npm 10.x. `.npmrc` sets `save-exact=true` and `legacy-peer-deps=true` (still required only for the dead `tslint-language-service` peer on `tslint <6`; removable when the tslint tooling is deleted in the 18 step — see MIGRATION_LOG 16.5).
- Install with `npm ci` only, never `npm install` — `package-lock.json` is the actual version pin.
- `node_modules` may be a symlink to `node_modules.nosync` so iCloud Drive (~/Documents) doesn't evict/corrupt it; `npm ci` into it works normally.
- Versions on this branch: Angular 17.3.12, CLI 17.3.17, CDK 17.2.1 (capped: cdk >= 17.2.2 breaks Nebular 13's `sticky` typings, see MIGRATION_LOG 17.2), Nebular 13.0.0, TypeScript 5.4.5, zone.js 0.14.10, rxjs 6.6.2.
- `src/app/pages/tables/tree-grid/tree-grid-cdk-table.directive.ts` provides `CDK_TABLE` for `NbTreeGrid` (Nebular 13 bug under cdk 17.1+, MIGRATION_LOG 17.3); remove with Nebular 14.
- ngcc is gone in Angular 16: every Angular library must ship Ivy. `ng2-smart-table` -> `angular2-smart-table` (Nebular's smart-table theme is re-applied to the new selectors in `src/app/@theme/styles/_smart-table.theme.scss`), `angular2-chartjs` -> in-repo `NgxChartModule` (`<ngx-chart>`), echarts 5 is imported as a module (`NgxEchartsModule.forRoot({ echarts: () => import('echarts') })`), no global echarts script.

## Commands

- `npm ci` — install (~1-2 min; no postinstall)
- `npm start -- --port 4217` — dev server (4200 = 14 baseline, 4215 = 15 worktree, 4216 = 16 worktree)
- `npm run dev:portless` — preferred dev server at https://ngx-admin-v17.localhost. The explicit name in this script intentionally bypasses Portless's git-worktree prefix; bare `portless` would use `angular-17.ngx-admin-v17.localhost`. The script pins Portless to Node 24.7.0 while the child Angular process uses the pinned Node 18.20.8 runtime.
- `npm run dev` — raw dev server on http://localhost:4217 using the pinned Node runtime.
- `npm run build` — dev build
- `npm run test:ci` — Karma headless, single run, with coverage. Needs system Chrome; if Karma cannot find it: `export CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
- `npm test` — Karma watch mode (opens Chrome)
- `npm run lint`
- `docker build -f Dockerfile.ci -t ngx-admin-a17-ci .` — clean-room proof (install + build + test) on Node 18; CI gate only, not for dev.

## Playwright (smoke + navigation + theme + visual regression)

- Lives in `playwright/` (the `e2e/` dir is dead Protractor). `playwright.config.ts` has **no `webServer` block** — always point `BASE_URL` at an already-running dev server:
  - `BASE_URL=http://localhost:4217 npm run e2e:pw` — run against this branch's server
  - `BASE_URL=http://localhost:4216 npm run e2e:pw` — run against the Angular 16 source (must be 91/91; it is what the goldens were captured from)
  - `npm run e2e:pw:update` — regenerate snapshots (`--update-snapshots`)
  - `npm run e2e:pw:report` — open the HTML report
- **Golden policy:** snapshots in `playwright/tests/__snapshots__/` are captured from the *previous* Angular version's server (`:4216` for the 17 step; recapturing from `:4216` produced byte-identical images to the Angular 15 goldens, so the committed files were kept) and committed. Never regenerate them from the server under test — the diff between goldens and the current version IS the migration evidence.
- First run needs `npx playwright install chromium`.
- 91 tests: 41 navigation, 4 smoke, 1 theme-cycle, 45 visual. Two routes carry tolerated known console errors (`/pages/dashboard` echarts `setOption`, `/pages/editors/ckeditor` CKEditor strict-mode) — pre-existing upstream bugs verified identical on Angular 14, 15, 16 and 17; the routes still run and any *new* console error fails the test.

## Gate for every migration step

`npm ci` (from empty node_modules) -> `npm run build:prod` -> `npm run test:ci` (69/69) -> `npm run lint` -> Playwright 91/91 against `:4217`. Check the Karma "Executed N of N" line explicitly: the 15 step produced `Executed 0 of 0` with exit code 0 (see `MIGRATION_LOG.md`, issue 15.1).

## Baseline test suite

Upstream ships zero specs. The 14 baseline added 11 spec files (35 tests): theme pipes, `throwIfAlreadyLoaded`, `LayoutService`, `StateService`, `UserService`, `FooterComponent`, `AppComponent`. The 15 step adds 6 more (28 tests): `CoreModule`/ACL, `AnalyticsService`, `SeoService`, `HeaderComponent` (wrapped in an `nb-layout` host for `nb-search`), `ThemeModule.forRoot`, `pages-menu` invariants. The 16 step adds `chart.component.spec.ts` (4 tests) for the chart.js wrapper. The 17 step adds `tree-grid.component.spec.ts` (2 tests) guarding the `CDK_TABLE` provider shim. Expected: `Executed 69 of 69 SUCCESS`.
Karma prints "Some of your tests did a full page reload!" after the run — caused by the legacy `pace-js`/`tinymce` global scripts in the test bundle, not the specs.

## Deviations from upstream v10.0.0 (setup-only)

- Removed `node-sass` (unbuildable on Apple Silicon / modern Node; Angular CLI uses dart-sass).
- `angular.json` test styles: `font-awesome` -> `@fortawesome/fontawesome-free` (upstream referenced a package that isn't installed).
- Added devDeps `@babel/runtime` (build-angular's nested 7.18 lacked `regeneratorValues`), `@types/ws@8.5.3` exact (newer types break with `@types/node@12`), `karma-coverage` (needed by `--code-coverage`).
- Added `ChromeHeadlessCI` launcher and `test:ci` script.
