# Angular 14 -> 18 migration log

One worktree and one branch per major version. Each step must be green (`npm ci`, `npm run build:prod`, `npm run test:ci` 35/35, `npm run lint`) before the next step branches off it.

| Step | Branch / worktree | Node | Angular | CLI | CDK | Nebular | TypeScript | zone.js | Status |
|---|---|---|---|---|---|---|---|---|---|
| Baseline | `angular-14-baseline` / `ngx-admin` (tag `angular-14-baseline-v1`) | 16.20.2 | 14.3.0 | 14.2.13 | 12.1.0 -> 14.2.7 (prep) | 10.0.0 | 4.6.4 | 0.11.4 | green |
| 14 -> 15 | `angular-15` / `ngx-admin-v15` | 18.20.8 | 15.2.10 | 15.2.11 | 15.2.9 | 11.0.1 | 4.9.5 | 0.12.0 | green |
| 15 -> 16 | `angular-16` / `ngx-admin-v16` | 18.20.8 | 16.2.x | | 16.2.x | 12.x | 4.9 / 5.1 | 0.13 | not started |
| 16 -> 17 | `angular-17` / `ngx-admin-v17` | 18.20.8 or 20.x | 17.3.x | | 17.3.x | 13.x | 5.2-5.4 | 0.14 | not started |
| 17 -> 18 | `angular-18` / `ngx-admin-v18` | 20.x | 18.2.x | | 18.2.x | 14.x | 5.4-5.5 | 0.14 | not started |

Severity: **blocker** = build/test/install fails; **silent** = passes with wrong result (most dangerous); **warning** = deprecation or noise only.

---

## Baseline setup (Angular 14, before any upgrade)

Upstream `v10.0.0` did not build or test cleanly on a current machine. None of these are Angular version changes.

| # | Break | Severity | Where | Fix |
|---|---|---|---|---|
| B1 | `node-sass@4` fails to compile on Apple Silicon / modern Node | blocker (install) | `package.json` | Removed. Angular CLI uses dart-sass; `node-sass` was unused. |
| B2 | Node 24 is the machine default; Angular CLI 14 supports only Node 14/16 | blocker | toolchain | Node 16.20.2 via `n`; `.nvmrc`, `engines`, `preinstall` guard that hard-fails on wrong major. `engine-strict=true` is NOT usable: npm applies it to transitive deps and `karma-cli@1.0.1` declares `node: 0.10..6`. |
| B3 | `@angular/cdk@12.1.0` / `@angular/google-maps@12` peer-conflict with Angular 14 -> `ERESOLVE` | blocker (install) | `package.json` | `legacy-peer-deps=true` in `.npmrc` for now; proper fix is the CDK bump in the 15 prep step. |
| B4 | Test styles reference `node_modules/font-awesome/scss/font-awesome.scss`, a package that is not installed | blocker (test) | `angular.json` test config | Point at `@fortawesome/fontawesome-free/css/all.css`, same as the build config. |
| B5 | `--code-coverage` needs the `karma-coverage` plugin, which was not a devDep | blocker (test) | `karma.conf.js` | Added `karma-coverage` and registered the plugin. |
| B6 | `@types/ws` caret range re-resolves to 8.18, which uses generics incompatible with `@types/node@12` (TS2315) | blocker (build) | devDeps | Pinned `@types/ws@8.5.3` exact. |
| B7 | `build-angular` nests `@babel/runtime@7.18.9`, which lacks the `regeneratorValues` helper -> prod build fails | blocker (build:prod) | `node_modules` layout | Added `@babel/runtime` devDep. Full fix (npm `overrides`) landed in the 15 prep; the committed 14 baseline still has this gap after a fresh `npm ci` (dev build and tests are unaffected). |
| B8 | Zero spec files in upstream, so there is nothing to validate the upgrade against | silent | `src/**` | Added 11 spec files / 35 tests: theme pipes, `throwIfAlreadyLoaded`, `LayoutService`, `StateService`, `UserService`, `FooterComponent`, `AppComponent`. |
| B9 | Karma only configured for a visible Chrome | warning | `karma.conf.js` | Added `ChromeHeadlessCI` launcher and `test:ci` script. |

Noise carried forward: Karma prints "Some of your tests did a full page reload!" after every run. Caused by the global `pace-js` / `tinymce` scripts in the test bundle, not by specs. Exit code is 0.

---

## 14 -> 15

Commits: `4fef29f5` prep, `15321be9` ng update + bumps, `72231de1` manual fix.

### Prep (done while still on 14, kept green)

| # | Change | Why |
|---|---|---|
| P1 | Node 16 -> 18.20.8 | CLI 15 accepts 16.13+, but 16 and 17 require 18, so move once. |
| P2 | `@angular/cdk`, `@angular/google-maps` 12 -> 14.2.7 | Real fix for B3. |
| P3 | Removed `postinstall` ngcc script | CLI 14/15 run ngcc on demand; ngcc is deleted in v16 and the script would break `npm ci`. |
| P4 | Removed `rxjs-compat` | Unused. |
| P5 | `ng2-completer` could NOT be removed | Unused in `src/`, but `ng2-smart-table` is a View Engine library and ngcc refuses to process it with a missing peer (`missing dependencies: ng2-completer`). Goes when `ng2-smart-table` goes. |

### Breaks

| # | Break | Severity | Where | Fix |
|---|---|---|---|---|
| 15.1 | After `ng update`, Karma reports `Executed 0 of 0` with exit code 0 | **silent** | `src/test.ts` | The v15 migration removes `require.context` (the CLI now discovers specs and appends them after `test.ts`), but leaves `__karma__.loaded = ...` / `__karma__.start()` in place, so Karma starts before any spec is evaluated. Removed the `__karma__` boilerplate to match the v15 default `test.ts`. |
| 15.2 | `ng update @angular/core@15 @angular/cli@15` refuses to run because of stale peers | blocker (tooling) | `@swimlane/ngx-charts@14` (peer Angular ~9), `tslint-language-service`, `@angular-eslint@14` | Ran with `--force`. These are the abandoned libraries; they get replaced in later steps. |
| 15.3 | `@types/google.maps` floats to 3.66, which removed `HeatmapLayerOptions` -> TS2694 inside `@angular/google-maps` typings | blocker (build) | devDeps | Pinned `@types/google.maps@3.55.12`. |
| 15.4 | Nested `@babel/runtime@7.18.9` (B7) reappears on every clean install | blocker (build:prod) | `package.json` | `"overrides": { "@babel/runtime": "$@babel/runtime" }` forces the hoisted version. |

### Automatic migrations applied by `ng update`

- `tsconfig.json`: `target` es2020 -> ES2022, added `useDefineForClassFields: false`.
- `src/test.ts`: removed `require` / `require.context`.
- No changes needed: browserslist cleanup, `renderModule`, `relativeLinkResolution`, `RouterLinkWithHref`.

### What did NOT break

- No application source (`src/app/**`) changed. Nebular 10 -> 11 and TS 4.6 -> 4.9 compiled clean.
- All View Engine third-party libs (`ng2-smart-table`, `angular2-chartjs`, `ngx-echarts@4`, `@asymmetrik/ngx-leaflet@3`, `ng2-ckeditor`) still build under 15 via on-demand ngcc.
- Deep `zone.js/dist/*` imports in `test.ts` still resolve (zone 0.12 ships `dist/`).

### Metrics

| | Angular 14 | Angular 15 |
|---|---|---|
| Tests | 35/35 | 63/63 |
| Prod initial bundle (raw) | 4.50 MB | 4.34 MB |
| Prod initial bundle (est. transfer) | 778.91 kB | 768.76 kB |

### Visual regression (Playwright, goldens = Angular 14)

Goldens captured from the Angular 14 dev server (`:4200`), compared against Angular 15 (`:4215`), 1366x900, `maxDiffPixelRatio` 0.01. 12 routes x 4 themes (`default`, `dark`, `cosmic`, `corporate`; auth pages default only) = 45 screenshots.

**Result: zero visual diffs.** All 45 comparisons passed — Angular 15 + Nebular 11 renders pixel-identical to Angular 14 + Nebular 10 within tolerance on every covered page and theme.

| Page | default | dark | cosmic | corporate |
|---|---|---|---|---|
| /pages/dashboard | pass | pass | pass | pass |
| /pages/iot-dashboard | pass | pass | pass | pass |
| /pages/tables/smart-table | pass | pass | pass | pass |
| /pages/charts/echarts | pass | pass | pass | pass |
| /pages/charts/chartjs | pass | pass | pass | pass |
| /pages/charts/d3 | pass | pass | pass | pass |
| /pages/maps/leaflet | pass | pass | pass | pass |
| /pages/editors/tinymce | pass | pass | pass | pass |
| /pages/forms/inputs | pass | pass | pass | pass |
| /pages/ui-features/typography | pass | pass | pass | pass |
| /pages/extra-components/calendar | pass | pass | pass | pass |
| /auth/login | pass | — | — | — |

Non-visual specs (smoke, navigation, theme switching) pass identically on both servers.

Navigation/console-error findings (pre-existing upstream bugs, identical on 14 and 15 — tolerated known errors; route still checked for any other error):

| Route | Console error |
|---|---|
| /pages/dashboard | `CountryOrdersChartComponent.ngOnChanges`: `TypeError: Cannot read properties of undefined (reading 'setOption')` — echarts option not ready on first ngOnChanges |
| /pages/editors/ckeditor | `TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions` — CKEditor 4.7.3 under webpack strict mode |

Not covered: `/pages/maps/gmaps` (needs a Google Maps API key). Dashboard canvases are masked in visual tests (live-updating charts are nondeterministic); same for `nb-chat` and recent-users widgets.

---

## 15 -> 16 (not started)

Expected, from the pre-migration audit. Confirm or strike each one when the step runs.

- ngcc removed: every View Engine library stops building. Affects `ng2-smart-table` (+ `ng2-completer`), `angular2-chartjs`, `ngx-echarts@4`, `@asymmetrik/ngx-leaflet@3`, `ng2-ckeditor`. Each needs an Ivy-compatible release or a replacement. This is the largest step.
- `legacy-peer-deps` can only be removed once the libraries above are gone.
- `@swimlane/ngx-charts` 14 -> 20, `ngx-echarts` 4 -> 16 (ECharts 4 -> 5 API changes; global `echarts` script in `angular.json`).
- TypeScript floor 4.9.3; 5.x allowed.
- `NgModule`-based `ThemeModule.forRoot()` and `ModuleWithProviders<T>` still fine (already generic).

## 16 -> 17 (not started)

- zone.js 0.14 drops `zone.js/dist/*` deep imports -> `src/test.ts` and `src/polyfills.ts`.
- Node 18.13+ required.
- TypeScript 5.2+.
- `@asymmetrik/ngx-leaflet` renamed to `@bluehalo/ngx-leaflet`.
- `@types/node@12` and pinned `@types/ws` will conflict with TS 5.x.
- Optional, separate PR: esbuild `application` builder, `browserTarget` -> `buildTarget`. Global scripts (`tinymce`, `echarts`, `chart.js`, `pace`) and CommonJS deps behave differently under esbuild.

## 17 -> 18 (not started)

- Node 18.19+ / 20.11+.
- TypeScript 5.4+.
- Nebular 14.
- Old polyfills (`core-js/es6/reflect`, `classlist.js`, `web-animations-js`) can be dropped from `src/polyfills.ts`.
- RxJS 7 optional but recommended before the downstream component-library consumers upgrade.
- Dead tooling to delete: `tslint.json`, `codelyzer`, `protractor.conf.js`, `e2e/`.
