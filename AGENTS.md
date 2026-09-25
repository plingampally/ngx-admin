# ngx-admin — Angular 14 -> 18 migration, step: Angular 18

Branch `angular-18` (worktree `ngx-admin-v18`) is the 17 -> 18 step, branched from `angular-17` (worktree `ngx-admin-v17`); the chain starts at `angular-14-baseline` (worktree `ngx-admin`, upstream tag `v10.0.0`).
Strategy: one worktree + branch per major version so each step can be diffed and tested independently. Per-step breakage is tracked in `MIGRATION_LOG.md` (kept in sync with the shared parent log at `../MIGRATION_LOG.md`) — update it whenever a step finds or fixes something. The reusable Devin procedure is at `../DEVIN_ANGULAR_MIGRATION_PLAYBOOK.md`.

## Toolchain (pinned)

- Node **20.20.2** (`.nvmrc`, `.node-version`). Angular CLI 18 requires ^18.19.1 || ^20.11.1 || >=22; the install guard accepts only Node 20.
  - Local: `export PATH=~/.n/n/versions/node/20.20.2/bin:$PATH` (installed via `N_PREFIX=~/.n n install 20.20.2`). The 15-17 worktrees use `~/.n/n/versions/node/18.20.8`, the 14 baseline `16.20.2`.
  - A `preinstall` script hard-fails `npm install`/`npm ci` on any non-20 Node. (`engine-strict=true` cannot be used: it also audits transitive deps such as `karma-cli@1.0.1`, which declare ancient engines.)
- npm 10.x. `.npmrc` sets `save-exact=true` only; `legacy-peer-deps` was dropped in the 18 prep together with the tslint/protractor tooling (MIGRATION_LOG 16.5 closed). `npm ci` must pass with no peer flags.
- Install with `npm ci` only, never `npm install` — `package-lock.json` is the actual version pin.
- `node_modules` may be a symlink to `node_modules.nosync` so iCloud Drive (~/Documents) doesn't evict/corrupt it; `npm ci` into it works normally.
- Versions on this branch: Angular 18.2.14, CLI 18.2.21, CDK 18.2.14 (the 17.2.1 cap is gone with Nebular 14), Nebular 14.0.2, TypeScript 5.4.5, zone.js 0.14.10, rxjs 6.6.2, `@bluehalo/ngx-leaflet` 18.0.2 (renamed from `@asymmetrik`).
- The `TreeGridCdkTableDirective` shim from the 17 step is deleted: Nebular 14 provides `CDK_TABLE` itself; `tree-grid.component.spec.ts` guards that.
- `HttpClientModule` is gone: `AppModule` uses `provideHttpClient(withInterceptorsFromDi())` (v18 schematic); specs use `provideHttpClient(...)` + `provideHttpClientTesting()`.
- `src/polyfills.ts` only loads `zone.js` (+ the `SVGElement.contains` shim); IE-era polyfills and `core-js` were removed.
- ngcc is gone in Angular 16: every Angular library must ship Ivy. `ng2-smart-table` -> `angular2-smart-table` (Nebular's smart-table theme is re-applied to the new selectors in `src/app/@theme/styles/_smart-table.theme.scss`), `angular2-chartjs` -> in-repo `NgxChartModule` (`<ngx-chart>`), echarts 5 is imported as a module (`NgxEchartsModule.forRoot({ echarts: () => import('echarts') })`), no global echarts script.

## Commands

- `npm ci` — install (~1-2 min; no postinstall)
- `npm start -- --port 4218` — dev server (4200 = 14 baseline, 4215 = 15, 4216 = 16, 4217 = 17 worktree)
- `npm run dev:portless` — preferred dev server at https://ngx-admin-v18.localhost. The explicit name in this script intentionally bypasses Portless's git-worktree prefix; bare `portless` would use `angular-18.ngx-admin-v18.localhost`. The script pins Portless to Node 24.7.0 while the child Angular process uses the pinned Node 20.20.2 runtime.
- `npm run dev` — raw dev server on http://localhost:4218 using the pinned Node runtime.
- `npm run build` — dev build
- `npm run test:ci` — Karma headless, single run, with coverage. Needs system Chrome; if Karma cannot find it: `export CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
- `npm test` — Karma watch mode (opens Chrome)
- `npm run lint`
- `docker build -f Dockerfile.ci -t ngx-admin-a18-ci .` — clean-room proof (install + build + test) on Node 20; CI gate only, not for dev.
- `e2e/`, `protractor.conf.js`, `tslint.json` no longer exist; Playwright is the only e2e tooling.

## Playwright (smoke + navigation + theme + visual regression)

- Lives in `playwright/`. `playwright.config.ts` has **no `webServer` block** — always point `BASE_URL` at an already-running dev server:
  - `BASE_URL=http://localhost:4218 npm run e2e:pw` — run against this branch's server
  - `BASE_URL=http://localhost:4217 npm run e2e:pw` — run against the Angular 17 source (must be 91/91; it is what the goldens are validated against)
  - `npm run e2e:pw:update` — regenerate snapshots (`--update-snapshots`)
  - `npm run e2e:pw:report` — open the HTML report
- **Golden policy:** snapshots in `playwright/tests/__snapshots__/` are captured from the *previous* Angular version's server (`:4217` for the 18 step; the committed files are unchanged since the 15 recapture because 16 and 17 render byte-identical to them, verified 91/91 against `:4217` before this step) and committed. Never regenerate them from the server under test — the diff between goldens and the current version IS the migration evidence.
  - **Exception — Bank of America rebrand:** the demo-content rebrand (BofA theme + banking data, an intentional product change on top of `angular-18`) invalidates the Angular 17 goldens. Its snapshots were recaptured from `:4218` once, after the rebrand was reviewed page by page; from then on they are the baseline for this branch. The pre-rebrand migration goldens live unchanged on `angular-17`/`angular-18`.
- First run needs `npx playwright install chromium`.
- 102 tests: 41 navigation, 4 smoke, 1 theme-cycle, 56 visual (11 routes x 5 themes incl. `bofa`, + `/auth/login` in the boot theme `bofa`). Before the rebrand: 91 (45 visual, 4 themes). Two routes carry tolerated known console errors (`/pages/dashboard` echarts `setOption`, `/pages/editors/ckeditor` CKEditor strict-mode) — pre-existing upstream bugs verified identical on Angular 14, 15, 16, 17 and 18; the routes still run and any *new* console error fails the test.

## Gate for every migration step

`npm ci` (from empty node_modules) -> `npm run build:prod` -> `npm run test:ci` (70/70 after the rebrand; 69/69 on the plain migration branch) -> `npm run lint` -> Playwright 102/102 against `:4218`. Check the Karma "Executed N of N" line explicitly: the 15 step produced `Executed 0 of 0` with exit code 0 (see `MIGRATION_LOG.md`, issue 15.1).

## Baseline test suite

Upstream ships zero specs. The 14 baseline added 11 spec files (35 tests): theme pipes, `throwIfAlreadyLoaded`, `LayoutService`, `StateService`, `UserService`, `FooterComponent`, `AppComponent`. The 15 step adds 6 more (28 tests): `CoreModule`/ACL, `AnalyticsService`, `SeoService`, `HeaderComponent` (wrapped in an `nb-layout` host for `nb-search`), `ThemeModule.forRoot`, `pages-menu` invariants. The 16 step adds `chart.component.spec.ts` (4 tests) for the chart.js wrapper. The 17 step adds `tree-grid.component.spec.ts` (2 tests), rewritten in the 18 step to assert Nebular 14 provides `CDK_TABLE` itself. Expected: `Executed 69 of 69 SUCCESS`.
Karma prints "Some of your tests did a full page reload!" after the run — caused by the legacy `pace-js`/`tinymce` global scripts in the test bundle, not the specs.

## Deviations from upstream v10.0.0 (setup-only)

- Removed `node-sass` (unbuildable on Apple Silicon / modern Node; Angular CLI uses dart-sass).
- `angular.json` test styles: `font-awesome` -> `@fortawesome/fontawesome-free` (upstream referenced a package that isn't installed).
- Added devDeps `@babel/runtime` (build-angular's nested 7.18 lacked `regeneratorValues`), `@types/ws@8.5.3` exact (newer types break with `@types/node@12`), `karma-coverage` (needed by `--code-coverage`).
- Added `ChromeHeadlessCI` launcher and `test:ci` script.
