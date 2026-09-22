# Angular 14 -> 18 migration log

One worktree and one branch per major version. Each step must be green (`npm ci`, `npm run build:prod`, `npm run test:ci` 35/35, `npm run lint`) before the next step branches off it.

| Step | Branch / worktree | Node | Angular | CLI | CDK | Nebular | TypeScript | zone.js | Status |
|---|---|---|---|---|---|---|---|---|---|
| Baseline | `angular-14-baseline` / `ngx-admin` (tag `angular-14-baseline-v1`) | 16.20.2 | 14.3.0 | 14.2.13 | 12.1.0 -> 14.2.7 (prep) | 10.0.0 | 4.6.4 | 0.11.4 | green |
| 14 -> 15 | `angular-15` / `ngx-admin-v15` | 18.20.8 | 15.2.10 | 15.2.11 | 15.2.9 | 11.0.1 | 4.9.5 | 0.12.0 | green |
| 15 -> 16 | `angular-16` / `ngx-admin-v16` | 18.20.8 | 16.2.12 | 16.2.16 | 16.2.14 | 12.0.0 | 4.9.5 | 0.13.3 | green |
| 16 -> 17 | `angular-17` / `ngx-admin-v17` | 18.20.8 | 17.3.12 | 17.3.17 | 17.2.1 (cap, see 17.2) | 13.0.0 | 5.4.5 | 0.14.10 | green |
| 17 -> 18 | `angular-18` / `ngx-admin-v18` | 20.20.2 | 18.2.14 | 18.2.21 | 18.2.14 | 14.0.2 | 5.4.5 | 0.14.10 | green |

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

## 16 -> 17

Branch `angular-17`, worktree `ngx-admin-v17`, from `angular-16` @ `2c4151da`. Commits: `bf511213` prep, `bca35549` ng update, `3b5b19e3` version pins, `4c7822c0` CDK_TABLE fix, `f18bb655` tree-grid regression spec.

Source baseline re-verified before starting (Node 18.20.8, npm 10.8.2, Chrome for Testing 137): `npm ci` ok, `build:prod` ok (3.43 MB / 533.25 kB), `test:ci` 67/67, `lint` 0 errors / 1 pre-existing warning, Playwright 91/91 against `:4216`. Recapturing goldens from `:4216` into the 17 worktree produced byte-identical files to the committed ones (Angular 16 renders pixel-identical to the Angular 15 images on this machine), so the committed goldens serve as the Angular 16 baseline. Logs in `<workspace-root>/logs/baseline16-*.log`, `17-*.log`.

Workspace note: in this Devin environment `<workspace-root>/ngx-admin` is checked out on `angular-15` (not `angular-14-baseline`) and the shared log lives in the repo (`MIGRATION_LOG.md` on each branch) rather than in the parent directory. `ngx-admin-v16` and `ngx-admin-v17` were added as direct-sibling worktrees; no worktree was renamed or moved.

### Versions

| | Angular 16 | Angular 17 |
|---|---|---|
| Node / npm | 18.20.8 / 10.8.2 | 18.20.8 / 10.8.2 (CLI 17 needs ^18.13 \|\| >=20.9; no change, guard unchanged) |
| @angular/* | 16.2.12 | 17.3.12 |
| @angular/cli, build-angular | 16.2.16 | 17.3.17 |
| @angular/cdk, google-maps | 16.2.14 | **17.2.1** (not 17.3.x — see 17.2) |
| @nebular/* | 12.0.0 | 13.0.0 |
| TypeScript | 4.9.5 | 5.4.5 (build-angular 17 allows >=5.2 <5.5) |
| zone.js | 0.13.3 | 0.14.10 |
| rxjs | 6.6.2 | 6.6.2 |
| @angular-eslint/* | 16.3.1 | 17.5.3 |
| @typescript-eslint/eslint-plugin, parser / eslint | 5.x / 8.23 | 7.18.0 / 8.57 |
| ngx-echarts / echarts | 16.2.0 / 5.6.0 | 17.2.0 / 5.6.0 |
| @asymmetrik/ngx-leaflet | 16.0.1 | 17.0.0 (the `@bluehalo/ngx-leaflet` rename starts at 18.0.2; no 17 exists under the new name) |
| @types/node / @types/ws | 12.12 / 8.5.3 exact | 18.19.130 / ^8.5.3 (lock resolves 8.5.3) |
| unchanged | | @swimlane/ngx-charts 20.5.0 (peers >=12), angular2-smart-table 3.8.0 (peers 16-20), ng2-ckeditor 1.3.7, chart.js 2.7.1, tinymce, leaflet |

### Prep (`bf511213`, done while still on 16, kept green: build / 67 tests / lint)

- `@types/node` ^12 -> ^18.19.130 (matches the runtime; 12 was the reason for the exact `@types/ws` pin). `@types/ws` relaxed to ^8.5.3.

### Breaks

| # | Break | Severity | Where | Fix |
|---|---|---|---|---|
| 17.1 | `ng update @angular/core@17 @angular/cli@17` refuses: `@angular-eslint/schematics@16.3.1` peers CLI `<17`, `tslint-language-service@0.9.9` peers `typescript <3` | blocker (tooling) | `logs/17-ng-update.log` | `--force`; angular-eslint moved to 17.5.3 in `3b5b19e3`, tslint-language-service is dead tooling scheduled for deletion in the 18 step. |
| 17.2 | With `@angular/cdk` 17.3.x, Nebular 13 fails to compile: `NbColumnDefDirective`, `NbHeaderRowDefDirective`, `NbFooterRowDefDirective` declare `sticky` as a property but cdk >= 17.2.2 defines it as an accessor (TS2610) | blocker (build) | `node_modules/@nebular/theme` vs `@angular/cdk/table` | Pin `@angular/cdk` and `@angular/google-maps` to **17.2.1**, the highest release where `sticky` is still a plain property (verified by inspecting 17.2.1 vs 17.2.2 tarballs). Nebular 13 peers `^17.1.0`, so this is within range. Lifts with Nebular 14 in the 18 step. |
| 17.3 | `/pages/tables/tree-grid` throws `NullInjectorError: No provider for InjectionToken CDK_TABLE` at runtime (Playwright navigation test 90/91) | blocker (runtime) | `src/app/pages/tables/tree-grid/` | cdk >= 17.1 row outlets (`DataRowOutlet` etc.) `inject(CDK_TABLE)` non-optionally; Nebular 13's `NbTreeGridComponent` overrides `CdkTable`'s providers with `NB_TABLE_PROVIDERS`, which lacks `{ provide: CDK_TABLE, useExisting }`. Added `TreeGridCdkTableDirective` (selector `table[nbTreeGrid]`) that provides `CDK_TABLE` via `useExisting: forwardRef(() => NbTreeGridComponent)`, declared in `TablesModule`. Upstream Nebular bug; delete the shim once Nebular 14 provides the token. `tree-grid.component.spec.ts` guards it. |

### Automatic migrations applied by `ng update`

- `angular.json`: `browserTarget` -> `buildTarget` in `serve` (options + production) and `extract-i18n`. Nothing else: no tsconfig, `test.ts`, `main.ts`, `polyfills.ts` or `src/app/**` change (the app stays on `NgModule`s, `browser` builder, webpack).
- ng update itself bumped TypeScript to 5.4.5, zone.js to 0.14.10 and `@angular/language-service`.

### What did NOT break

- Nebular 12 -> 13 compiled and rendered pixel-identical on all covered pages; only the tree-grid runtime issue above.
- TypeScript 4.9 -> 5.4 needed no source change (`useDefineForClassFields: false` from the 15 step still in place).
- zone.js 0.14: nothing to do, deep imports were removed in 16.2.
- `@types/google.maps@3.55.12` pin and `@babel/runtime` override still needed and still work.
- ngx-echarts 17, ngx-leaflet 17, ngx-charts 20.5, angular2-smart-table 3.8, ng2-ckeditor 1.3.7: no API changes hit.
- Same two CommonJS warnings as 16 (`leaflet`, `eva-icons`) and the same "1 rules skipped due to selector errors" sass notice.

### Warnings

- `npm ci` now prints `EBADENGINE` for the transitive `undici@7.x` (wants Node >= 20.18.1). Non-fatal on 18.20.8; Node 20 is required for the 18 step anyway.
- `karma-cli@1.0.1` ancient-engine warning, unchanged.

### Metrics

| | Angular 16 | Angular 17 |
|---|---|---|
| Tests | 67/67 | 69/69 (+2 tree-grid / CDK_TABLE) |
| Prod initial bundle (raw) | 3.43 MB | 3.45 MB |
| Prod initial bundle (est. transfer) | 533.25 kB | 538.40 kB |
| Largest lazy chunk | pages-pages-module 1.56 MB | 1.56 MB / 390.81 kB |
| Playwright | 91/91 | 91/91 |

### Visual regression (Playwright, goldens = Angular 16, `:4216`)

Before the 17.3 fix: 90/91 (tree-grid navigation only; zero visual diffs). After: **91/91, zero visual diffs**, same 12 routes x 4 themes. The two tolerated console errors (`/pages/dashboard` echarts `setOption`, `/pages/editors/ckeditor` strict mode) are unchanged; no new console error on any route. `/pages/maps/gmaps` still uncovered (API key).

### Known limitations

- `@angular/cdk` capped at 17.2.1 until Nebular 14 (17.2).
- `TreeGridCdkTableDirective` shim (17.3) to be removed with Nebular 14.
- `legacy-peer-deps=true` remains (16.5 / 17.1).
- Still on the webpack `browser` builder; the esbuild `application` builder migration is deferred (global scripts and CommonJS deps behave differently).

## 17 -> 18

Branch `angular-18`, worktree `ngx-admin-v18`, from `angular-17` @ `525345b6`. Commits: `972000d7` prep, `91771629` ng update, `483a2a86` version pins + Nebular 14 + polyfill/shim removal, `631e2bad` formatting restore after the schematic.

Source baseline re-verified before starting (Node 18.20.8, npm 10.8.2, Chrome for Testing 137): `npm ci` ok, `build:prod` ok (3.45 MB / 538.40 kB), `test:ci` 69/69, `lint` 0 errors / 1 pre-existing warning, Playwright 91/91 against `:4217`. The committed goldens are unchanged from `angular-17` and pass 91/91 against the Angular 17 server on this machine, so they serve as the Angular 17 baseline (not recaptured). Logs in `<workspace-root>/logs/baseline17-*.log`, `18-*.log`.

Workspace note: same layout as the 17 step (`ngx-admin` on `angular-15`, log kept in-repo). `ngx-admin-v18` was added as a direct-sibling worktree via `git worktree add -b angular-18 ../ngx-admin-v18 angular-17`; no worktree was renamed or moved.

### Versions

| | Angular 17 | Angular 18 |
|---|---|---|
| Node / npm | 18.20.8 / 10.8.2 | **20.20.2** / 10.8.2 (CLI 18 needs ^18.19.1 \|\| ^20.11.1 \|\| >=22; `.nvmrc`, `.node-version`, `engines`, `preinstall` guard, `dev` script and `Dockerfile.ci` all moved to 20) |
| @angular/* | 17.3.12 | 18.2.14 |
| @angular/cli, build-angular | 17.3.17 | 18.2.21 |
| @angular/cdk, google-maps | 17.2.1 (cap) | 18.2.14 (cap lifted, see 18.2) |
| @nebular/* | 13.0.0 | 14.0.2 |
| TypeScript | 5.4.5 | 5.4.5 (build-angular 18 allows >=5.4 <5.6; 5.5 not needed) |
| zone.js | 0.14.10 | 0.14.10 |
| rxjs | 6.6.2 | 6.6.2 (Nebular 14 still peers ^6.5.3 \|\| ^7.4.0) |
| @angular-eslint/* | 17.5.3 | 18.4.3 |
| @typescript-eslint/* / eslint | 7.18.0 / 8.57 | 7.18.0 / 8.57 (unchanged; angular-eslint 18 peers utils ^7.11 \|\| ^8) |
| ngx-leaflet | `@asymmetrik/ngx-leaflet` 17.0.0 | **`@bluehalo/ngx-leaflet` 18.0.2** (package rename; `LeafletModule` API identical) |
| ngx-echarts / echarts | 17.2.0 / 5.6.0 | 18.0.0 / 5.6.0 |
| @types/node | 18.19.130 | 20.19.43 |
| removed | | `core-js` 2.5.1, `classlist.js`, `web-animations-js`, `intl` (dead polyfills); `tslint`, `tslint-language-service`, `codelyzer`, `protractor`, `ts-node`, `jasmine-spec-reporter`, `@types/jasminewd2` (dead tooling); `.npmrc legacy-peer-deps` |
| unchanged | | @swimlane/ngx-charts 20.5.0, angular2-smart-table 3.8.0 (peers 16-20), ng2-ckeditor 1.3.7, chart.js 2.7.1, tinymce, leaflet |

### Prep (`972000d7`, done while still on 17, kept green: build 3.45 MB / 538.40 kB, 69/69 tests, lint)

- Node 20.20.2 pinned everywhere the 18 pin lived (`.nvmrc`, `.node-version`, `engines.node: 20.x`, `preinstall` guard `/^20\./`, `dev` script runtime path and port `4218`, `portless.json` name `ngx-admin-v18`, `Dockerfile.ci` `node:20.20.2-bookworm`), `@types/node` ^20.
- Deleted the dead tslint/protractor tooling scheduled since 16.5: `tslint.json`, `protractor.conf.js`, `e2e/`, the `ngx-admin-demo-e2e` project in `angular.json`, the `tslint-language-service` plugin in `tsconfig.json`, `e2e/tsconfig.json` in `.eslintrc.json`, scripts `pree2e`/`e2e`, and the devDeps listed above.
- Removed `legacy-peer-deps=true` from `.npmrc`; the lockfile was regenerated once (`rm package-lock.json && npm install`, then `npm ci` from empty) with **no** ERESOLVE. 2053 -> 1888 packages; every `@angular*`/`@nebular` resolution stayed identical to the 17 lock. The `undici@7` EBADENGINE warning from the 17 step disappeared with the regenerated lock; only `karma-cli@1.0.1` still warns.

### Breaks

| # | Break | Severity | Where | Fix |
|---|---|---|---|---|
| 18.1 | `ng update @angular/core@18 @angular/cli@18` refuses: `@angular-eslint/schematics@17.5.3` peers `@angular/cli >= 17.0.0 < 18.0.0` | blocker (tooling) | `logs/18-ng-update.log` | `--force` (same pattern as 16.1/17.1); angular-eslint moved to 18.4.3 in `483a2a86`. This was the only refusal — the tslint peer from 17.1 is gone because the tooling was deleted in prep. |
| 18.2 | Regenerating the lockfile after the version pins: the first `npm install` wrote a lock missing `chokidar@4.0.3` and its transitive entries, so `npm ci` failed with `EUSAGE` (lock out of sync) | blocker (install) | `package-lock.json` | Re-ran `npm install` once, which completed the tree; `rm -rf node_modules && npm ci` then passes cleanly. Root cause is an npm 10.8.2 lock-repair quirk, not a dependency conflict; always follow `npm install` with a clean `npm ci` before committing the lock. |

No Angular, Nebular, TypeScript or template compile error occurred. No `src/app/**` change was *required* by the upgrade; the ones below are schematic output or removals of shims that Nebular 14 makes obsolete.

### Automatic migrations applied by `ng update`

- `@angular/core` v18 `HttpClientModule` deprecation migration ("3 files modified"): `src/app/app.module.ts` `HttpClientModule` -> `providers: [provideHttpClient(withInterceptorsFromDi())]`; `src/app/@core/core.module.spec.ts` and `src/app/@theme/theme.module.spec.ts` `HttpClientTestingModule` -> `provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()`. Behaviour-preserving (`withInterceptorsFromDi` keeps the `HTTP_INTERCEPTORS` DI path). The schematic re-printed the three decorators/`TestBed` blocks on one line with 4-space indentation; `631e2bad` restores the original layout without changing content.
- Other v18 core migrations (`afterRender` phase, invalid two-way bindings) reported "No changes made".
- Optional `use-application-builder` (webpack `browser` -> esbuild `application`) was **not** run; the app still relies on global `scripts` (`pace-js`, `tinymce`, `chart.js`) and CommonJS deps. Deferred, see Known limitations.
- `ng update` did not touch `angular.json`, `tsconfig*.json`, `src/test.ts`, `src/main.ts` or `src/polyfills.ts`.

### Manual compatibility changes (`483a2a86`)

- Nebular 13 -> 14.0.2. Verified against the 14.0.2 tarball before pinning: `NbColumnDefDirective`/row defs now declare `sticky` as an accessor (so cdk 18.2.14 compiles — closes 17.2) and `NbTreeGridComponent`'s providers include `{ provide: CDK_TABLE, useExisting: NbTreeGridComponent }` (closes 17.3). Deleted `src/app/pages/tables/tree-grid/tree-grid-cdk-table.directive.ts` and its `TablesModule` declaration; `tree-grid.component.spec.ts` now asserts that the `NbTreeGridComponent` injector resolves `CDK_TABLE` to the grid itself (regression guard replaces the old "fails without the shim" test; count stays 69).
- `@asymmetrik/ngx-leaflet` -> `@bluehalo/ngx-leaflet` 18.0.2: import path only in `maps.module.ts` and `e-commerce.module.ts`.
- `src/polyfills.ts`: removed `classlist.js`, `web-animations-js`, `core-js/es6/reflect`, `core-js/es7/{reflect,array,object}` (IE-era; Angular 18 supports only evergreen browsers). `import 'zone.js'` and the `SVGElement.prototype.contains` shim remain. `intl` was an unreferenced dependency.

### What did NOT break

- Nebular 13 -> 14 compiled clean and rendered pixel-identical on all 12 covered routes x 4 themes.
- TypeScript 5.4.5, zone.js 0.14.10, rxjs 6.6.2 needed no change.
- ngx-echarts 18, ngx-charts 20.5, angular2-smart-table 3.8, ng2-ckeditor 1.3.7: no API changes hit. `find node_modules -name '*.metadata.json'` is empty (no View Engine leftovers).
- `@types/google.maps@3.55.12` pin and `@babel/runtime` override still needed and still work.
- Same two CommonJS warnings as 17 (`leaflet` via `@bluehalo/ngx-leaflet`, `eva-icons`) and the same "1 rules skipped due to selector errors" sass notice.
- Removing the polyfills changed nothing visible (Chromium has native `classList`/Web Animations/`Reflect`).

### Metrics

| | Angular 17 | Angular 18 |
|---|---|---|
| Tests | 69/69 | 69/69 |
| Prod initial bundle (raw) | 3.45 MB | 3.55 MB |
| Prod initial bundle (est. transfer) | 538.40 kB | 530.37 kB |
| Largest lazy chunk (pages-pages-module) | 1.56 MB / 390.81 kB | 1.64 MB / 400.33 kB |
| Playwright | 91/91 | 91/91 |
| npm packages (`npm ci`) | 2053 | 1888 |

### Visual regression (Playwright, goldens = Angular 17, `:4217`)

**91/91, zero visual diffs** against `:4218` (41 navigation, 4 smoke, 1 theme-cycle, 45 visual). The two tolerated console errors (`/pages/dashboard` echarts `setOption`, `/pages/editors/ckeditor` strict mode) are unchanged and no new console error appeared on any route. `/pages/maps/gmaps` still uncovered (API key).

### Known limitations

- Still on the webpack `browser` builder; the optional `use-application-builder` migration is deferred (global scripts / CommonJS deps need re-validation under esbuild).
- rxjs 6.6.2 still; Nebular 14 and Angular 18 accept it, but Angular 19+/Nebular 15 will want rxjs 7.
- `angular2-smart-table` 3.8.0 kept (4.x peers 18-21 and is available for the 19 step).
- `/pages/maps/gmaps` unverified (no API key). `Dockerfile.ci` was updated to Node 20 but not built in this environment (no Docker).

## 18 -> 19 (not started)

- Angular 19 needs TypeScript >=5.5 <5.7 and Node ^18.19.1 || ^20.11.1 || >=22; Node 20.20.2 stays valid.
- Nebular 15 for Angular 19; check the release still peers rxjs 6 or move to rxjs 7 first (prep step).
- `@bluehalo/ngx-leaflet` 19.x, ngx-echarts 19.x, @angular-eslint 19.x (eslint 9 flat config becomes the default — plan the `.eslintrc.json` -> `eslint.config.js` move).
- v19 defaults `standalone: true` for components; the migration adds `standalone: false` to every NgModule-declared component — expect a large mechanical diff.
- Consider the esbuild `application` builder before 20 (`browser` builder deprecation).
