# ngx-admin — Angular 14 baseline

Branch `angular-14-baseline` is cut from upstream tag `v10.0.0` (Angular 14.2.x / Nebular 10 / TypeScript 4.6).
It is the frozen "before" state for the Angular 14 -> 18 migration. Do not bump Angular, Nebular, or TypeScript on this branch.

## Toolchain (pinned)

- Node **16.20.2** (`.nvmrc`, `.node-version`). Node 18+ is not supported by Angular CLI 14; Node 24 is the machine default.
  - Local: `export PATH=~/.n/n/versions/node/16.20.2/bin:$PATH` (installed via `n` under `~/.n`).
  - A `preinstall` script hard-fails `npm install`/`npm ci` on any non-16 Node. (`engine-strict=true` cannot be used: it also audits transitive deps such as `karma-cli@1.0.1`, which declare ancient engines.)
- npm 8.x. `.npmrc` sets `save-exact=true` and `legacy-peer-deps=true` (required: `@angular/cdk@12.1.0` peer-conflicts with Angular 14).
- Install with `npm ci` only, never `npm install` — `package-lock.json` is the actual version pin.

## Commands

- `npm ci` — install (runs ngcc postinstall; ~1-2 min)
- `npm start` — dev server on http://localhost:4200
- `npm run build` — dev build
- `npm run test:ci` — Karma headless, single run, with coverage. Needs system Chrome; if Karma cannot find it: `export CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
- `npm test` — Karma watch mode (opens Chrome)
- `npm run lint`
- `docker build -f Dockerfile.ci -t ngx-admin-a14-ci .` — clean-room proof (install + build + test) on Node 16; CI gate only, not for dev.

## Baseline test suite

Upstream ships zero specs. This branch adds 11 spec files (35 tests): theme pipes, `throwIfAlreadyLoaded`, `LayoutService`, `StateService`, `UserService`, `FooterComponent`, `AppComponent`. Expected: `Executed 35 of 35 SUCCESS`.
Karma prints "Some of your tests did a full page reload!" after the run — caused by the legacy `pace-js`/`tinymce` global scripts in the test bundle, not the specs.

## Deviations from upstream v10.0.0 (setup-only)

- Removed `node-sass` (unbuildable on Apple Silicon / modern Node; Angular CLI uses dart-sass).
- `angular.json` test styles: `font-awesome` -> `@fortawesome/fontawesome-free` (upstream referenced a package that isn't installed).
- Added devDeps `@babel/runtime` (build-angular's nested 7.18 lacked `regeneratorValues`), `@types/ws@8.5.3` exact (newer types break with `@types/node@12`), `karma-coverage` (needed by `--code-coverage`).
- Added `ChromeHeadlessCI` launcher and `test:ci` script.
