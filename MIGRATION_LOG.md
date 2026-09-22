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

## 15 -> 16

Branch `angular-16`, worktree `ngx-admin-v16`, from `angular-15` @ `HEAD`. Commits: `3b5c6b48` goldens from :4215, `3ded7c46` prep, `02c3f303` ng update, `d4c6be1a` Nebular 12 + Ivy replacements, `5aab0197` + `95655025` smart-table theme.

Source baseline re-verified before starting (Node 18.20.8, npm 10.8.2): `npm ci` ok, `build:prod` ok, `test:ci` 63/63, `lint` 0 errors / 1 pre-existing warning. Logs in `<workspace-root>/logs/baseline-*.log`.

### Versions

| | Angular 15 | Angular 16 |
|---|---|---|
| Node / npm | 18.20.8 / 10.8.2 | 18.20.8 / 10.8.2 (CLI 16 needs ^16.14 \|\| ^18.10; no change) |
| @angular/* | 15.2.10 | 16.2.12 |
| @angular/cli, build-angular | 15.2.11 | 16.2.16 |
| @angular/cdk, google-maps | 15.2.9 | 16.2.14 |
| @nebular/* | 11.0.1 | 12.0.0 |
| TypeScript | 4.9.5 | 4.9.5 (CLI 16 allows >=4.9.3 <5.2; 5.x deferred to 17) |
| zone.js | 0.12.0 | 0.13.3 |
| rxjs | 6.6.2 | 6.6.2 |
| @angular-eslint/* | 15.2.1 | 16.3.1 |
| @asymmetrik/ngx-leaflet | 3.0.1 | 16.0.1 |
| ngx-echarts / echarts | 4.2.2 / 4.9.0 | 16.2.0 / 5.6.0 |
| @swimlane/ngx-charts | 14.0.0 | 20.5.0 |
| ng2-ckeditor (+ @types/ckeditor peer) | 1.2.9 | 1.3.7 (+ 4.9.10) |
| ng2-smart-table / ng2-completer | 1.6.0 / 9.0.1 | removed -> `angular2-smart-table` 3.8.0 (+ `lodash-es` 4.17.21 peer) |
| angular2-chartjs | 0.4.1 | removed -> in-repo `NgxChartModule` (`src/app/pages/charts/chartjs/chart.component.ts`), chart.js stays 2.7.1 |
| jasmine-core / @types/jasmine / @types/jasminewd2 | 3.6 / 3.3 / 2.0.3 | 3.99.1 / 3.10.18 / 2.0.13 |

### Ivy audit (the ngcc cliff)

`find node_modules -name '*.metadata.json'` on the 15 tree listed six View Engine Angular libraries. Every one had to move:

| Library | Ivy release? | Action |
|---|---|---|
| `@asymmetrik/ngx-leaflet` 3 | yes, 16.0.1 | in-place; `LeafletModule.forRoot()` removed upstream -> `LeafletModule` |
| `ng2-ckeditor` 1.2 | yes, 1.3.7 | in-place; same `CKEditorModule`/`<ckeditor>` API |
| `ngx-echarts` 4 | yes, 16.2.0 | in-place, but requires echarts 5 (see 16.4) |
| `@swimlane/ngx-charts` 14 | yes, 20.5.0 | in-place; introduced a CommonJS bailout on `rfdc` -> added to `allowedCommonJsDependencies` |
| `ng2-smart-table` 1.7 | no (last release 2020, peers Angular ^10) | replaced with `angular2-smart-table` 3.8.0, a maintained fork with the same `settings`/`LocalDataSource` API; element and CSS prefix renamed `ng2-smart-*` -> `angular2-smart-*`, inner components `ng2-st-*` -> `angular2-st-*` (see 16.6). `ng2-completer` (P5 in the 15 step) goes with it. |
| `angular2-chartjs` 0.4 | no (last release 2018) | replaced with a 50-line in-repo `ngx-chart` component porting its behaviour (create canvas, `update()` on data change, recreate on type/options change, `destroy()`); 4 unit tests added. Selector `<chart>` -> `<ngx-chart>` in the six chartjs demo components + one `::ng-deep` rule. |

### Prep (`3ded7c46`, done while still on 15, kept green: build/63 tests/lint/91 Playwright)

- chart.js wrapper, ng2-ckeditor 1.3.7, ngx-charts 20.5.0 + `rfdc` CommonJS allowance. All three also compile under Angular 15, so they were landed and validated before touching Angular.

### Breaks

| # | Break | Severity | Where | Fix |
|---|---|---|---|---|
| 16.1 | `ng update @angular/core@16 @angular/cli@16` refuses: `@angular-eslint/schematics@15` peers CLI `<16`, `ng2-smart-table` peers Angular `^10` | blocker (tooling) | `logs/16-ng-update.log` | Re-ran with `--force`; both offenders are fixed in `d4c6be1a` (eslint 16.3.1, smart-table replaced). |
| 16.2 | zone.js 0.13 no longer ships `zone.js/dist/*`; `src/test.ts` deep imports fail to resolve -> Karma bundle fails | blocker (test) | `src/test.ts` | Six deep imports -> `import 'zone.js/testing'`. (`src/polyfills.ts` already used `import 'zone.js'`.) The 17 prediction "zone deep imports" is therefore already done. |
| 16.3 | `LeafletModule.forRoot` does not exist in ngx-leaflet 16 | blocker (build) | `src/app/pages/maps/maps.module.ts` | `LeafletModule`. |
| 16.4 | ngx-echarts 16 requires echarts 5 and expects the module, not the global `echarts` script; echarts 5 typings conflict with `declare var echarts: any` | blocker (build) | `angular.json` scripts, `src/typings.d.ts`, 12 dashboard/e-commerce components | Removed `echarts.min.js` / `bmap.min.js` global scripts and the `echarts`/`zrender` CommonJS allowances; `NgxEchartsModule.forRoot({ echarts: () => import('echarts') })` in `charts`, `dashboard`, `e-commerce` modules; components that used the global now `import * as echarts from 'echarts'` (only `echarts.graphic.LinearGradient` is used — API unchanged in 5). |
| 16.5 | Removing `legacy-peer-deps` still fails `npm ci`: `tslint-language-service@0.9.9` peers `tslint <6`, and `karma-jasmine-html-reporter@1.7` peers `jasmine-core >=3.8` | warning (tooling) | `.npmrc`, `logs/16-npm-install-nolegacy.log` | Jasmine bumped to 3.99.1 / types 3.10.18 (jasminewd2 2.0.13 was needed to avoid a duplicate `Matchers` augmentation). `legacy-peer-deps=true` **kept** for the dead tslint tooling; removable in the 18 step when `tslint`/`codelyzer` are deleted. |
| 16.6 | Smart table renders unstyled (no borders/striping, giant stacked action icons) — 4 visual failures, diff 5%/theme | blocker (visual) | `src/app/@theme/styles/_smart-table.theme.scss` (new) | Nebular 12's `global/tables/_smart-table.theme.scss` still targets `ng2-smart-table` / `.ng2-smart-*` / `ng2-st-*`. Copied that mixin into the app theme with the `angular2-` prefixes and `@include ngx-smart-table-theme()` in `styles.scss`. First pass (classes only) got to ~1.2% diff; also renaming the inner `ng2-st-*` element selectors brought all 4 themes to pass. |

### Automatic migrations applied by `ng update`

- Only `package.json`/lockfile changes. No schematic touched `tsconfig*.json`, `angular.json`, `src/main.ts`, `src/polyfills.ts` or app code (the v16 schematics — `Router` guard/resolver class removal, `@Directive` inheritance — did not apply here).

### What did NOT break

- Nebular 11 -> 12 compiled and rendered pixel-identical on all 11 non-smart-table pages.
- `@types/google.maps@3.55.12` pin and `@babel/runtime` override from the 15 step still needed and still work.
- `tinymce`, `pace-js`, `chart.js` global scripts unchanged.
- No `standalone`/`inject()` migration needed; `NgModule`s stay.

### Metrics

| | Angular 15 | Angular 16 |
|---|---|---|
| Tests | 63/63 | 67/67 (+4 for the chart.js wrapper) |
| Prod initial bundle (raw) | 4.34 MB | 3.43 MB (echarts moved out of global scripts into a lazy chunk) |
| Prod initial bundle (est. transfer) | 768.76 kB | 532.97 kB |
| Playwright | 91/91 | 91/91 |

### Visual regression (Playwright, goldens = Angular 15)

Goldens recaptured from the Angular 15 server (`:4215`) on this machine (`3b5c6b48`) — the 14-derived goldens committed on `angular-15` failed 4 typography screenshots here through font anti-aliasing alone (see `logs/baseline-e2e-pw.log`), so the 16 comparison uses same-machine 15 images. Verified stable: two 15-vs-15 runs at 91/91.

**Result against Angular 16 (`:4216`): 91/91, zero visual diffs** after 16.6. Same 12 routes x 4 themes as the 15 step; the echarts pages (`/pages/charts/echarts`, dashboard widgets) pass under echarts 5 within the 1% tolerance. The two tolerated console errors from the 15 step are unchanged and no new console error appeared on any route. `/pages/maps/gmaps` still uncovered (API key).

### Known limitations

- `legacy-peer-deps=true` remains (16.5).
- `angular2-smart-table` adds a horizontal-scroll wrapper and a `<angular2-smart-table-tags-list>` element; visually identical here but the DOM differs from `ng2-smart-table` — anything selecting on `ng2-smart-*` classes downstream must be renamed.
- `chart.js` 2.7.1 is now driven by an in-repo wrapper; the library itself is unchanged and still a global script.

## 16 -> 17 (not started)

- zone.js 0.14: deep imports already removed in 16.2; only the version bump remains.
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
