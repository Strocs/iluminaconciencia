# Current hero sky and raster fallback

The live catalogue contains 2,087 stars after removing 2,579 mapped profiles through 2 CSS px: 955 at ≤1.5 px, 911 in inclusive [1.5, 1.75] px, and 713 in inclusive [1.75, 2] px. Original row ordinals preserve retained phases, sizes, alpha, speeds and colors. The active WebPs in `t16-left-r1` and `composite-2087-r1` are the user's final photo exports and existing composites rotated 180° for an illustrative view looking north from Coquimbo. No photographic reconstruction or star recomposition is involved; original source photographs and historical assets remain unchanged. Saving the rotated WebPs requires lossy re-encoding (photo quality 95, composite quality 75, method 6), with the original 1×/2× dimensions preserved.

## Runtime presentation

`HeroSky` declares a photograph plane, one full-image raster fallback and the WebGL canvas. The photograph and fallback each use Next `Image` inside native `picture` with manual 1×/2× selection, `unoptimized` and eager loading. Static image imports supply dimensions and build-time blur metadata; the 2× `source` uses the imported asset's `.src`. There is no manually stored base64 preview. No SVG participates in the live fallback.

Before the first valid draw, without JavaScript/WebGL, with reduced motion, after context loss/draw failure, or after a photograph error, only the opaque composite image is visible. The live photo and canvas are hidden. A valid draw shows the photo + canvas and hides the composite; all planes keep the same artwork crop. The single group fade stays 0.12→1 by progress 0.7 and canvas opacity stays 1. No custom React effects or loading callbacks are added.

The shared stereographic projection and its region/artwork/portrait bounds use the same 180° orientation as the files. This preserves the previous rotated appearance at every aspect ratio, including the off-center portrait star group. Neither the artwork nor the badge coordinates apply a separate rotation; labels consume the same mapped star positions as the renderer and remain upright.

## Archived data and offline tools

All catalogue backups are outside `app/`:

- `docs/backups/hero/star-catalog.ts.bak`: original 5,530-record source.
- `docs/backups/hero/star-catalog.before-1_5px-filter.ts.bak`: byte-exact 4,666-row pre-size-filter snapshot.
- `docs/backups/hero/development-star-catalog-4666.ts.bak`: retired comparison-module backup.
- `docs/backups/hero/catalog-gt-2px-r1/`: retired current SVG and its historical manifest.

`tools/hero-sky-prototype/prefilter-star-catalog.mjs` retains its historical geometric prefilter. Its source and output paths now resolve from the repository root. **Do not run its write mode to rebuild the current sample:** it does not reapply the later size filters or preserve their ordinal array. It is not invoked by the app, build or raster export. The source catalogue's header records this original selection step, not a full recipe for the current filtered sample.

`export-inputs.mjs` keeps its `--output DIRECTORY` CLI and payload schema. The pure application-module loader remains restricted to the source directory; the archived control catalogue is parsed as numeric TypeScript literals, without evaluating archive code. The repository ignores `docs/`; explicitly retain only the requested archive paths when preparing any future commit.

## Generate the complete raster fallback

Use a fresh isolated snapshot directory; never overwrite the frozen `input/current-sky.json` or an existing version:

```sh
mkdir output/hero-sky-prototype/integration/raster-fallback-2087-r1
node tools/hero-sky-prototype/export-inputs.mjs --output output/hero-sky-prototype/integration/raster-fallback-2087-r1
PYTHONDONTWRITEBYTECODE=1 output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/export-raster-fallback.py --input output/hero-sky-prototype/integration/raster-fallback-2087-r1/current-sky.json --output public/images/hero/sky/composite-2087-r1 --quality 75
```

The Python CLI requires `--input` and `--output`; `--help` describes them. It refuses an existing output directory and uses existing dependencies only. `--quality` accepts integers from 1 to 100 and defaults to 75; the value is validated before the output directory is created. The generator uses lossy WebP at the selected quality (75 in the command above), trading some image fidelity for smaller files; fixed inputs, quality, and encoder method make the output reproducible. The JSON report records the actual mode and selected quality. It reuses `probe.render_stars` and `production_assets.canonical_frame` to compose the current buffers over each final photograph: 1920×1080 at DPR 1 and 3840×2160 at DPR 2. This is a CPU reproduction of the current shader at time zero, **not a WebGL screenshot or an SVG rasterization**. Output credits preserve the source attribution and identify the extra adaptation. No visual approval or measured byte-size claim is implied.

The original 4,666-star SVG and earlier 3,711/2,800-star outputs remain historical; their public files and immutable evidence are not refreshed. The retired 2,087-star SVG/manifest move to the documented archive without changing their bytes. Historical photo approval hashes predate the user's manual retouch and are not hashes of the current public WebPs. The user-deleted photo manifest is not recreated.

The original raster-generation delivery did not run new tests, lint/type/build checks or browser/visual verification, as requested at that time. Asset generation is not runtime validation or manual approval.

## Historical approved delivery (`t13-texture-r1`)

The original promoted photo files were byte-identical copies from the explicitly approved production directory. Their approval record is `odd/plans/evidence/hero-hybrid-sky-background-approval.json`; public `manifest.json` binds the approval plan hash, photo hashes, canonical bounds and CC BY 4.0 source/adaptations. The photo files/history remain unchanged.

The transparent catalog-star fallback was generated with the existing `production_assets.svg` helper, from the immutable exported `current-sky.json` catalog/mapped profiles/projection and `production-recipe.json` radial bands. Its manifest records snapshot, catalog, mapper, reference, recipe, and generator hashes. **Do not refresh/overwrite the historical input snapshot.** The approved snapshot SHA-256 is `dc331ea71325bb99b7e95ca3e8e779f0429a34020f8eef2b35da0b889a3c9535`; only regenerate after validating that identity, using the existing helper:

```sh
PYTHONDONTWRITEBYTECODE=1 output/hero-sky-prototype/venv/bin/python -B -c 'import hashlib,json,pathlib,sys; sys.path.insert(0,"tools/hero-sky-prototype"); import production_assets as assets; root=pathlib.Path("."); source=root/"output/hero-sky-prototype/input/current-sky.json"; assert hashlib.sha256(source.read_bytes()).hexdigest()=="dc331ea71325bb99b7e95ca3e8e779f0429a34020f8eef2b35da0b889a3c9535"; data=json.loads(source.read_text()); recipe=json.loads((root/"tools/hero-sky-prototype/production-recipe.json").read_text()); assets.svg(data,root/"public/images/hero/sky/t13-texture-r1",recipe)'
```

This deterministic one-off adds no CLI or dependency. The external SVG retains all 4,666 catalog rows and current 16-band profiles. Its raw size is 14,579,681 bytes; the parent's approximately 1,098,961-byte gzip figure is an estimate, **not measured HTTP transfer or raster cost**. Browser SVG-as-image sizing, transfer, decode, and rasterization await authorized T15 browser verification.

## Hero delivery usage

`HeroSky` renders Next `Image` inside native `<picture>` elements for the photograph and the full-image WebP fallback, plus the canvas. It selects the 1x/2x files directly (no Next optimizer): normal mode shows photo + canvas; fallback mode shows only the static composition. The temporary DEV comparison switch and its live renderer-swap/listener wiring are retired; the 4,666-row module is preserved at `docs/backups/hero/development-star-catalog-4666.ts.bak`. If restoration is needed, copy that backup back to `app/(home)/_sections/hero/capabilities/night-sky/development-star-catalog.ts` and restore the corresponding switch/runtime wiring from source history. The temporary switch component and app data module have been removed; the full sample remains only in the documented backup. `computeSkyCrop` produces the one crop shared with the renderer and an asset-plane placement; canvas geometry remains the untransformed host box. CSS container-query placement derives its coefficients from `SKY_REFERENCE` and `PORTRAIT_GROUP`. The group fade is 0.12→1 by progress 0.7; canvas opacity remains 1. Per S22/S23, the HTML credit overlay and its unused CSS are removed, without relocation into the footer or decorative ALT. Empty ALT, aria-hidden decoration and existing license/provenance records are preserved. The static fallback contains both layers; it is not a separate star overlay. This presentation change makes no new license interpretation.

### Named star badges

The hero labels 45 selected stars/systems from `night-sky/named-stars.ts`, plus one cluster target in `night-sky/star-badge-targets.ts`, for 46 badges. All members are keyed by preserved original catalogue ordinals (not HR identifiers). Alpha Centauri, Castor, Mizar, Algieba and Gamma Velorum each have one system badge, not separate labels for unresolved components. Gamma Velorum uses its designation rather than the informal nickname Regor. No catalogue records or rendered components are removed.

The cluster badge shows only **Pléyades**. Selecting it draws one circle around its 10 identified members already present in the bright-star sample: Celaeno, Electra, 18 Tauri, Taygeta, Maia, Merope, Alcyone, HD 23753, Atlas and Pleione. There are no individual member rings, individual member labels or extra GPU stars. The circle uses the visible members' centroid and enclosing radius, including their halo sizes and padding, with terrain/control exclusions applied per member. This does not claim to render every physical member of the cluster.

Names are hidden initially on every device. Mouse proximity reveals one name and its enclosing highlight circle; a touch/pen tap selects one star, another tap changes the selection, and tapping elsewhere dismisses it. Movement over 10 CSS px, scroll, cancellation and window blur clear the selection without cancelling native gestures. Passive document capture detects stars through noninteractive hero/header text and panels, but links, buttons and other native controls remain excluded. Labels have no focus stops, click handlers or pointer interception.

The fixed, pointer-transparent badge layer sits outside the hero's sticky stacking context, above content/header text, and follows the actual canvas bounds and artwork opacity. Placement shares `computeSkyCrop`, flips/clamps at the edges and avoids controls. A non-painted copy of the existing foreground silhouette supplies terrain hit testing; obscured stars do not get labels. Labels work with the static fallback. There are no new dependencies or changes to the star renderer. The 45 labels include the two approved expansion groups (10 and 12 names); every added label refers to stars already rendered, without adding GPU star instances.

# Local left-photo retouch — T16 tooling, T17 approval pending

`retouch_left_region.py` repairs explicit residual photographic peaks/halos on the **approved `t13-texture-r1` registered PNG**, not the raw JPEG. No catalogue offsets, independent quadrant warps, runtime URL changes or new dependencies are involved. All 4,666 frozen rows/profiles/colors/config remain unchanged. The previous approval does **not** approve this new candidate.

## Quick path

```sh
PYTHONDONTWRITEBYTECODE=1 output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/retouch_left_region.py --help
PYTHONDONTWRITEBYTECODE=1 output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/retouch_left_region.py --version t16-left-check --validate-only
# Parent T17 only: FIRST full generation; t16-left-r1 must still be absent.
PYTHONDONTWRITEBYTECODE=1 output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/retouch_left_region.py --version t16-left-r1
PYTHONDONTWRITEBYTECODE=1 output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/retouch_left_region.py --version t16-left-r1 --validate-only
```

Allow a conservative **900-second parent scheduling bound** for first full generation (not a measured runtime). The worker's final five-target solve, real native/composite panels and PNG decode check took 10.50 seconds including preflight. Full 31-target reconstruction, WebP encoding and all responsive previews remain parent work; do not launch an unknown full run under a 30-second worker limit.

## Local scope and evidence

Evidence lives in `output/hero-sky-prototype/integration/validation-t16/`. Start with `left-top-matched.png` / `left-lower-matched.png`: actual screenshot → matched photo → catalogue → composite. Their matching uses one uniform photo scale/translation across six patches, not an assumption that a screenshot identifies stars or proves active DOM state. The visible pair's photographic peak remains present in the **photo-only** panel. No global astronomy/detector recalibration is needed for this local intervention.

The yellow-marked 1925×1027 screenshot is translated −20/−32 to the first capture for analysis. Its inner polygon maps to the 3840×2160 master by `X=2*(1.00419294*(x-20)+5.01251384)`, `Y=2*(1.00419294*(y-32)+36.28734058)`. `roi-analysis.json` preserves the polygon; `screenshot-registration.json` records the real patch comparison. `mark-translation-check.json` independently measures +20/+32 in five shared screenshot patches. This is an empirical mark locator, not a claim about exact CSS box/DPR or a camera adjustment. The marked region is not the canonical quarter.

`candidate-native-0.png` / `candidate-native-1.png` show photo/catalogue/composite comparisons at native scale. The CLI stores **31 manually inspected photo-centred targets**, including additional residuals beyond the old magnitude≤3 work. It never reruns a magnitude cut or erases the faint field. New masks have a 12-master-pixel opaque radius and 6-pixel smooth feather, clipped to the marked polygon with an additional 6-pixel inward ROI feather to avoid a hard edge; the complete union is 30,797 pixels (30 connected groups). Exact points, masks and mapping are in `planned-retouch.json` and the producer. The exploratory peak charts are selection aids only, not source-identity or eligibility proofs.

The implementation reuses `bright_regions.reconstruct_master`: globally connected masks solved once, immutable approved-master context, existing weighted structure/biharmonic continuation and two source RGB texture bands. All planned masks are excluded from donors/support, even in the bounded five-target proof. Group records preserve original context boxes, donor offsets, interpolation/completion counts and zero target overlap. Reconstruction infers plausible dust/faint texture; it cannot recover physical hidden pixels.

Open `final-local-{00,03,04,20,10}-native.png` at 1:1: approved photo → mask → local retouch → before/after with all 4,666 catalogue rows, opacity 1. `final-local-proof.json` records five real targets, 4,863 local mask pixels, 3,918 changed pixels and **zero decoded changes outside that local union**. It includes dense faint texture and an ROI-clipped left-border target; no canonical lower Milky Way dust cloud lies inside this marked ROI. `final-local-proof-master.png` is only this bounded proof, **not the full candidate**. Earlier four-target proof files remain as history. Parent/human inspection of every complete new region, desktop/mobile and shifted views remains mandatory.

## CLI safety and validation

Labels match `[a-z][a-z0-9-]{0,47}`. Paths, symlink output ancestors and existing generation destinations are rejected. Writes are confined to a fresh `production/<version>/`; failures never overwrite/resume history. An absent version with `--validate-only` means **read-only preflight**, `artifactsValidated:false`. Existing incomplete versions fail. Completed validation checks code/input/base provenance, mapping hash, target/group coverage, exact artifact set/hashes/dimensions, crops, decoded masks/feather and exact decoded PNG equality outside the **new** local union. WebP is lossy; that equality claim applies to the PNG master only.

The frozen input hash and approved base-plan/master/source hashes are verified. The exporter's existing in-memory module loader executes current public `computeSkyCrop` and checks its reference/frames against the frozen snapshot without exporting or calling stale live-module preflights. Full review frames reuse the existing registered-master crop and all-row CPU compositor, including opacity 1/.12 and static +8/−6 CSS diagnostics. These are not browser/GPU proof. Completed output stays `approval:pending`, `appEditAllowed:false`; T17 human S5 approval precedes T18 promotion. Existing legal metadata is preserved, including inherited `CREDITS.txt` plus the additional adaptation record.

No new tests/framework or browser are authorized. Empirical retouch has no meaningful predetermined RED; use the real-image proof and bounded CLI/structural checks. Existing helpers/commands are unchanged, so sibling-option differential checks are N/A. Rollback is limited to the additive retouch producer, this documentation, the small credit presentation removal and new T16 proof files; never alter old sources/assets/history.

# Bright-region rebuild — padded photographic replacements

`bright_regions.py` is the additive T10 entrypoint. It preserves all 4,666 canvas rows and plans 112 photographic replacement regions (catalog magnitude ≤3), grouped globally on one registered 3840×2160 reference master. Quadrants are review batches, not separately transformed images. Human approval remains pending; this output does not authorize app edits.

## Quick path

```sh
PYTHONDONTWRITEBYTECODE=1 output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/bright_regions.py --help
PYTHONDONTWRITEBYTECODE=1 output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/bright_regions.py --version validation-t10 --validate-only
PYTHONDONTWRITEBYTECODE=1 output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/bright_regions.py --version t10-candidate
```

Preflight is read-only and checks current catalog/render buffers, source hash, stored projection validation, fixture hash/plane/reference equality, all 112 targets and quadrant counts. A fresh version is immutable; generation refuses an existing destination. The registered 2x fixture is used as the master, so exact preservation is measured against its decoded PNG outside the new union—not against the raw JPEG before reprojection.

Each region derives its own maximum shader half-extent from the live mapped star size and configured twinkle maximum. The 5 master-pixel registration allowance is included inside the opaque core; a 6-pixel feather extends outside it. Overlaps are globally unioned and each connected group is reconstructed once from immutable master context. Context is a real 192×192 window shifted inward at poster edges; completed donor coordinates are checked against every target mask. Inspection of the first complete render found geometric texture patches where a large share of translated donors had been completed by nearest-valid-pixel copying. The correction retains the validated donor ranking/offset and replaces those replicated residual samples with normalized 2px Gaussian interpolation from valid immutable-context donors only; texture bands without supported valid context are omitted rather than filled by nearest-pixel repetition. Every target mask and strong-source exclusion remains protected. The two source RGB residual bands (2.5px and 0.8px) and the 0.35 fine-texture gain are recorded per group. This is plausible local texture inference, not source-peak identity or physical hidden-dust recovery.

`--validate-only` without `region-plan.json` is read-only preflight, never completed success. On a generated version it validates the full 112-target/group census, provenance and parameter hash, exact artifact set and hashes, dimensions, original fixture identity, and decoded outside-mask equality. The generated `CREDITS.txt`, quadrant/contact-sheet previews and summary keep ESO/S. Brunier CC BY 4.0 attribution and pending approval visible. Every output records `approval: pending` and `appEditAllowed: false`. A successful structural check is not human visual acceptance. No app/public assets, legacy generator, input, source, v1/v2 or failed PSF evidence is changed.

---

# Production generator — offline assets, review still required

T5 provides a reproducible full-row pipeline. **No full production run or asset approval is implied by the bounded preflight checks.** The approved twelve samples remain historical evidence; the complete asset must pass plan gates B–C before any hero integration. No application, public assets, dependencies or historical outputs are written.

## Quick path (repository root)

```sh
# Read-only preflight: source/provenance, live module hashes, pinned packages,
# recipe, stored rotation, independent geometry and complete catalog census.
PYTHONDONTWRITEBYTECODE=1 output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/generate-production.py --version v1 --validate-only

# Parent only: potentially long full generation, fresh v1 reserved for first run.
PYTHONDONTWRITEBYTECODE=1 output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/generate-production.py --version v1

# Read-only completed-artifact validation after generation.
PYTHONDONTWRITEBYTECODE=1 output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/generate-production.py --version v1 --validate-only
```

Use `--help` for the complete interface. Version names match `[a-z][a-z0-9-]{0,47}`; no paths, uppercase, separators or output override. All writes are confined to `output/hero-sky-prototype/production/<version>/`. Generation refuses **any existing directory**, even empty/incomplete, before writing. Symlink output ancestors are rejected. A failed generation leaves its incomplete evidence intact; select a fresh version, never overwrite/resume history.

Validation writes nothing. Without `manifest.json` it performs **preflight only**, even for an existing incomplete directory: `artifactsValidated:false` is not completion. With a manifest it additionally checks the exact artifact set, hashes/bytes/decoded dimensions, snapshot recipe/export, row/group/donor reconciliation, external SVG safety/population, canonical dimensions and decoded native outside-mask equality. Drift/errors exit 1 with `Error:` on stderr; argparse usage errors exit 2. Exit 0 never grants visual approval or means every counterpart was removed.

Allow a **7200-second finite parent-run bound** initially; this is a conservative scheduling allowance, not a measured runtime. Full throughput/peak memory remain unmeasured. The worker does not launch full processing. Local solves are 192×192 contexts, not full-frame solves/float RGB accumulators per star. One global union/label allocation is used, and only connected groups no larger than 64 source pixels are eligible for donor inference. Large/dense groups remain explicitly unresolved rather than degrading to flat fills. Generation prints compact elapsed time, reconciled counts, preservation and preview locator; deterministic pixel/manifest data excludes wallclock values.

## Reproducible inputs and inventory

`production-recipe.json` pins the four installed direct packages, fixed source SHA, deterministic tie rules, seed (no stochastic pixels), local search/detection settings, group bound, WebP95 and preview parameters. No installs/network/services/AI are needed. Historical `probe.py`, `constellation_review.py`, `reconstruct_background.py`, source, landmarks and reports stay unchanged. Their validation owners verify the one stored Orion-seeded rotation and provenance; there is no blind calibration or per-device warp.

The exporter remains the owner of actual TypeScript execution and export shape. Its no-argument command/format is unchanged. Additive `node tools/hero-sky-prototype/export-inputs.mjs --output DIRECTORY` writes the same `current-sky.json` there; the production CLI supplies only its newly created version directory. Never invoke the historical default against immutable input. Generation compares the fresh actual-module snapshot to the independently validated historical input, and rechecks input/code hashes after processing.

Every exported row has stable `catalog-NNNNN` ID, full row, predicted source coordinate, renderer-footprint evidence, local detection candidates/noise/threshold, status/reason and group/mask/donor evidence where applicable. Historical T5/T6 evidence reconciles to its then-exported 4,666-row baseline, not twelve; the 3,711-row T19 and 2,800-row T20 catalogues were intermediates, and the live catalogue is now 2,087 rows after T21. In that historical 4,666-row snapshot, all **64 center-outside catalog-envelope rows** received photographic checks: only 11 of those had an actual maximum-size renderer quad intersecting the canonical rectangle, but photographic halos could be larger. Renderer-quad nonintersection never discards a photographic candidate. Every unresolved row gets an explicit source-native preview locator.

States are exclusive: `treated`, `merged` into a treated connected source group, `nonobservable` with no locally distinguishable peak above recorded noise, or `unresolved` with an actionable reason. Nonobservable is not removal success. The twelve validated inspected identities/centers take precedence (including both identical Alnitak components), preserving the approved samples rather than rematching them blindly. Other local peak selection searches six source pixels (the existing alignment uncertainty), requires a noise-supported distinguishable peak, and rejects ambiguous neighbors. Matching radius is unrelated to the canvas quad. Identical Alnitak components and overlapping masks share a single connected intervention. X wraps at the native panorama seam; Y never wraps. Saturation/seam contexts and the inspected samples' previously disclosed neighbor warnings are explicit review warnings, never quality passes; unknown neighbors, truncation and unsupported donors remain unresolved.

The photograph-derived connected/elliptical core/halo mask and feather reuse the sample implementation. Its covariance-derived radii have the existing 4px floor and 26px ceiling, with connected wings checked at 32px. This can overmask small/faint profiles and miss broader halos: inspect these cases, not just counts. Faint population outside masks is byte-exact in the native derivative; faint stars inside inferred masks may be lost. Reconstruction reuses weighted low-frequency structure, biharmonic continuation and ranked/completed source high-frequency RGB donors. Groups blend once from immutable original pixels; nearby masks are excluded from donors, not sequentially erased. Compatible texture is inferred, not recovered physical dust.

A 192×192 context may contain several independent groups. Only the **current connected group's mask** enters its solve and 64px extent guard; all other target masks are excluded from structure support and from the five-pixel-guarded donor domain, never added to that group's unknown pixels. `infer_group` calls unchanged `reconstruct_background.infer_patch` when no other masks occur. Otherwise its narrow adapter reuses `star_exclusion` / `continue_structure` and preserves the original donor ranking/completion method: the historical two-argument helper has no separate support/donor-exclusion parameter. Completed donor coordinates are checked for shape, integer bounds and zero overlap with **any** target before editing. Group reports expose solve-mask / other-target-mask counts and donor validation. Independent 16px groups 80px apart are not rejected merely because their combined context extent is 96px; genuinely oversized groups or exhausted donor domains remain unresolved. Bounded before/after and unchanged-Alnitak evidence is retained under `production/validation-t5/`; this is not full-field or perceptual approval.

## Review outputs in each version

| Output | Review purpose |
| --- | --- |
| `current-sky.json`, `production-recipe.json`, `preflight.json` | Fresh live catalog/reference/crop/mapper/config/shader snapshot, recipe and input/code provenance |
| `inventory.json`, `groups.json`, `group-*-donor.json` | Exhaustive reconciled row states, masks/support, grouped treatment and exact completed native donor coordinates |
| `native-background.png`, `native-edit-union.png` | 6000×3000 lossless reconstruction and authoritative binary edit union; decoded original exact outside union |
| `background-1x.webp`, `background-2x.webp` | Canonical SKY_REFERENCE bounds, 1920×1080 and 3840×2160; independently reprojected from native, WebP95 method4, never from another WebP |
| `catalog-stars.svg` | Transparent **external image**, all actual mapped colors/alpha/time0 sizes, projected centers and non-scaling-stroke core/halo radial approximation; no scripts/fonts/remotes/inline HTML module |
| `1920x1080@1-*`, `1920x1080@2-*`, `390x844@2-*` | Full original/background/current-stars/composite/static-shift PNGs at opacity 1 and intro .12; same actual exported crop |
| `*-native.png`, `contact-sheet.png` | Native-source original/background comparison for all unresolved rows and twelve approved reference locations; frame-native 1:1 original/background/composite/shifted diagnostics for statistics-selected dense/bright/nebulous/edge candidates; overview thumbnails are not sharpness proof |
| `summary.json`, `manifest.json`, `CREDITS.txt` | Actionable unresolved locators, frame/crop bounds, file hashes/bytes/dimensions, source/code/catalog/recipe/rotation/encoder provenance, adaptations, ESO/S. Brunier CC BY4.0 credit and explicit pending approval |

`proposedManifestUrlsOnly` are future URLs, **not public delivery**. Existing ESO/S. Brunier / CC BY4.0 provenance records remain intact; S22/S23 governs current credit presentation as described above. File hashes cover all other artifacts; the manifest is not self-hashed.

The canonical bitmap uses SKY_REFERENCE, **not REGION-normalized UVs**. Preflight verifies the conversion; previews reuse `probe.crop_plane` and `constellation_review.sample` for the actual crops. CPU composites retain current profiles/colors/alpha/time0; opacity .12 is a single artistic-group fade over the existing sky color. Static +8/−6 CSS displacement is diagnostic only, never actual parallax. No alternate portrait framing, global blur, sharpening or second full-photo fallback is produced.

SVG uses 16 concentric non-scaling stroke bands per row to approximate the current smoothstep nucleus/halo; center geometry is projected-plane precision, stroke widths are CSS pixels. It is an external resource, never thousands of injected HTML/RSC nodes. **SVG-as-image non-scaling stroke behavior, antialiasing, alpha, target-box sizing and decode/raster cost still require later authorized browser verification.** CPU preview PNGs are not SVG renderer proof. Bounds and required artwork-box mapping are declared in the manifest; no claim of exact shader AA or runtime performance.

No tests/new framework per repository policy; RED/GREEN are not claimed. Use bounded help/live-preflight/rejection checks and isolated baseline exporter differential checks. Completed artifact validation, native processing, reproducible full-run pixel hashes and perceptual quality remain parent T6/T7 work. Rollback boundary is the production entrypoint/helpers/recipe, additive exporter option, this README section and only the new production version outputs; preserve all historical experiments and original data. No commits, application readiness code or hero integration here.

---

# Phase 3: inferred background reconstruction — bounded offline sample

**Corrected sample run completed: twelve targets reconstructed; awaiting human visual approval.** The parent inspected representative native/background-only/static-shift panels and independently checked all 42 PNGs, outside-mask equality and protected inputs. This is a sample-quality candidate, not a full-catalog or app/parallax implementation. The first full run changed zero pixels: broad exclusion removed nearly all usable support. Its report and exact code remain in `reconstruction-review/attempt-1/`, untouched. The corrected support/donor path produces nonzero fills in four read-only representative patch diagnostics; that is functional evidence, not visual approval. This experiment attempts to remove only the twelve previously inspected photographic counterparts and infer plausible structure and texture beneath them. It is **not all4666stars**, physical recovery, actual parallax, or permission to integrate the hero. Read `reconstruction-review/results.json` after the full run for the actual processed subset, skipped donors/profiles and questionable cases.

**Primary acceptance (S10): «No necesita certeza, sólo que no se vea una mancha evidente».** Judge whether the reconstructed region is perceptually inconspicuous at intended/native display size and in the static shifted-star comparisons. Obvious blotches, holes, ghost halos, seams and visibly destroyed texture matter; exact hidden dust, physical certainty and numerical thresholds do not. Inference and uncertainty labels are disclosures, **not automatic rejection**. Metrics remain descriptive; human image inspection decides.

## Run and review

From the repository root, with the existing environment only:

```sh
output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/reconstruct_background.py --help
output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/reconstruct_background.py --validate-only
output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/reconstruct_background.py --source-crops-only
output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/reconstruct_background.py --diagnose-support
```

`--validate-only` is read-only: it checks live original/public provenance hashes, exported application module hashes, landmarks and actual source centers against phase 2, independent geometry, the stored rotation representations and exact desktop/mobile crop contract. It never fits alignment or writes old outputs. `--source-crops-only` writes two short original-source contact sheets, not reconstruction proof; it does not update `results.json`. A stale report can therefore coexist with newer source sheets or corrected code: check report code/input hashes. `--diagnose-support` is a finite read-only check on Betelgeuse, Alnitak, Sirius and Spica: it evaluates actual union masks, strong-source exclusions, boundary support, donor candidates/completion, changed pixels and local outside-mask equality, without saving images or reports. It does not establish perceptual quality.

**Parent-run full command, foreground inside the managed background runner, suggested bound 240 seconds:**

```sh
output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/reconstruct_background.py
```

No installs, network, models, application code, shaders, catalogs or dependencies change. All generated files go only to `output/hero-sky-prototype/reconstruction-review/`. Same-named phase-3 artifacts are overwritten on rerun; source, exported input, phase-1 `results/`, phase-2 `sharpness-review/` and existing helper modules remain untouched. Nonzero means a processing/validation error; exit 0 can still be a visually poor or entirely skipped **NO-GO sample**. CLI/report now expose changed-pixel and edit-union counts plus an explicit `ALL_SKIPPED_ZERO_EDITS_NO_RECONSTRUCTION_PROOF` outcome when nothing changes; unchanged images and trivial outside-mask equality are not removal success. The full run must finish and its images must be inspected before claiming any reconstructed result.

| Review order / output in `reconstruction-review/` | What it establishes |
| --- | --- |
| `source-crops-1.png`, `source-crops-2.png` (optional mode) | Twelve original native 192×192 crops; provisional identities, not removal |
| `*-native.png` | Source **1:1** original → magenta edit/feather overlay → background alone → absolute RGB difference ×4; inspect rings, ghosts, dark holes, erased dust, seams and texture repetition at 100% |
| `native-background.png` | Lossless 6000×3000 derivative, no footer; unchanged decoded original pixels outside the explicit edit union |
| `native-edit-union.png`, `native-feather-mask.png` | Exact binary edit footprint and 8-bit feather visualization; union is authoritative, even if feather rounding becomes zero |
| `1920x1080@2x-overview.png`, `390x844@2x-overview.png` | **Rescaled thumbnails**, not native sharpness evidence: original → mask → background alone → treated canvas subset at original positions → SAME subset shifted |
| `*@2x-{original,mask,background,composite,shifted}.png` | Full native-frame PNG panels with credited footers; no crop adjustment to hide defects |
| `*@2x-*-detail.png` | Exact frame-native 192×192 five-stage details around actual photographic centers; shifted stars expose old locations; points outside the crop are recorded, never reframed |
| `*-donor.json`, `results.json` | Exact native donor coordinates, support/mask/profile metrics, skips/uncertainty, code/source/old-report hashes, changed-pixel counts and decoded outside-mask equality |

## One bounded reconstruction method

1. Work in original encoded JPEG RGB **before** reprojection. Reuse the twelve phase-2 measured source centers without refitting; longitude wraps at the panorama seam. Connected excess and intensity-weighted elliptical covariance adapt core/halo footprints per source; connected wings are retained and a four-source-pixel cubic feather is explicit. Profiles reaching the bounded detection edge are skipped rather than truncated silently. This heuristic can miss faint wings or absorb close neighbors.
2. Exclude target footprints and **strong** sources, rather than treating the entire faint star field as contamination. Strong-source detection uses local excess above max(10×MAD, 32 encoded levels), saturation and two-pixel dilation; these are source-selection parameters, not quality gates. Faint peaks retain positive robust support weight. Continue the weighted source low-frequency RGB (sigma 2.5) beneath masks with the same hard-boundary, minimum-squared-Laplacian (biharmonic) solve. This retains local structure without demanding an unrealistically star-free boundary or painting dust onto dark sky.
3. Rank bounded translated **source high-frequency RGB residuals** by local structure similarity and contamination fraction. A five-pixel guard protects strong sources/targets, but the whole translated footprint need not be pristine. Complete its contaminated positions from nearest valid source residual pixels, retaining the original residual at valid positions; never copy a rejected bright peak/target. This can retain genuine faint stars/grain. Remove donor DC, add source texture to continued structure and use the existing feather. Exact donor provenance records the actual completed coordinates, not just the nominal translation; completion counts expose possible repetition. No usable source support means an explicit skip, not a blank fill. Overlapping predictions still average before one union blend.
4. Assert and re-decode the native PNG to verify exact outside-mask equality. This does **not** certify plausible pixels inside the mask. Reprojection interpolation spreads changes beyond native mask boundaries; the preservation claim applies only to the native derivative.

The sample includes orange Betelgeuse, bright/saturated Rigel, Sirius and Canopus, Alnitak near real nebulosity, and outer-field Spica, with the remaining inspected landmarks also attempted. **Alnitak is explicitly questionable:** inferred continuation may erase real nebulosity. Other close neighbors, diffraction, unknown JPEG tone mapping, saturation and source stitching can defeat the method. Faint unresolved stars/dust/noise outside explicit footprints are preserved, not globally removed. Faint objects inside footprints may be lost. Star-excluded donor selection is heuristic, not proof of perfect segmentation; texture can repeat, smooth continuation can erase real structure, and continuity/variance numbers are diagnostics, not aesthetic approval.

## Fixed display and approval boundary

Both actual exported CSS frames retain the phase-2 rotation, crop and DPR 2. Helpers reuse `constellation_review.sample`, source/world geometry and `probe.render_stars`; none of their old output writers run. Only successfully treated named catalog entries are overlaid. All other photographic stars remain; they are not falsely described as reconstructed. The same mapped point profiles, alpha/color and time-0 twinkle are used at **opacity 1**, with a deliberate static **[+8, −6] CSS-pixel** translation for the comparison. This is an illustrative exposure of former locations, **not a product parallax amplitude**, JavaScript animation, or pixel-identical WebGL rendering. Mobile is not moved to include Orion.

Hidden saturated/tone-mapped JPEG data cannot be physically recovered. Every edited/feathered pixel is **inferred**, including source-derived texture: plausible local dark-sky texture is the goal in dark regions, not invented dust everywhere. There is no sharpening, color grade, AI upscale or global removal. The original JPEG remains immutable: SHA-256 `60400c92c54b7c1bd12299c69e83b16e5b6256e7dabacc478c021758ecd28179`.

Credit: **ESO/S. Brunier**, [eso0932a](https://www.hq.eso.org/public/images/eso0932a/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Modifications are selective inferred inpainting, reprojection, labeled diagnostic differences, subset CPU overlays and thumbnail resizing. Keep raw native derivative/masks with the credited review panels/report. **Human approval remains `not-granted` and is required before any hero integration.** Quality can legitimately be partial or NO-GO; do not hide ambiguous samples or scale this blindly to the catalog.

No test files per repository policy. Empirical image quality has no meaningful predetermined RED; use finite public validation, source inspection and the parent-run image process. Existing app/old CLI code is unchanged, so app build/differential checks are N/A. Rollback for this work unit is only `reconstruct_background.py`, this phase-3 README section and `reconstruction-review/`; do not remove historical inputs/results. Parent owns execution, review, task reconciliation and Git actions.

---

# Constellation-assisted sharpness review — offline only

**Current experiment: preserve sharpness and responsive framing, inspect real Orion identities, then ask for human approval.** The older failed nearest-peak experiment below remains unchanged as history; its 0.5 CSS-pixel gate is **not** a requirement for this new candidate. Neither experiment authorizes application integration.

## New command: prepare and render candidates

Run from the repository root using the existing environment. No export, installation, network, browser or application changes are needed. Validation is read-only and refuses stale exported module/source hashes.

```sh
output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/constellation_review.py --help
output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/constellation_review.py --validate-only
```

**Parent-run full command (background job, suggested timeout 240 seconds):**

```sh
output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/constellation_review.py
```

Optional parent-run `--alignment-only` stops after small identity panels and `alignment.json`; it does not render full frames or update `results.json`. An existing `results.json` may therefore describe an earlier full run: check its landmark/input hashes before comparing it to a newer alignment-only run.

All new writes stay under `output/hero-sky-prototype/sharpness-review/`; same-named **new-experiment** artifacts may be overwritten on rerun. Source, environment, exported input and `results/` are never modified. No subpixel pass/fail gate, PSF subtraction, sharpening or per-device fit is applied. A process error is nonzero; a tentative scientific result can exit 0 without establishing identity or approval.

### Inputs and inspectable identities

- Existing `source/eso0932a.jpg`, `metadata/source.json`, and immutable `input/current-sky.json` supply the photo, license provenance and real catalog/GPU/crop exports.
- `landmarks.json` records manually inspected source-pixel seeds, approximate named locator provenance, confidence and a fixed fit/held-out split. Actual BSC5 coordinates are obtained from the nearest exported **stored row** within 60 arcsec. Equal-distance ties use the brighter magnitude, then index: Alnitak has two identically rounded component coordinates, both retained in provenance. Rows lack HR identifiers; the report keeps indices, full rows and locator distances rather than inventing identifiers.
- Seven principal Orion stars (three belt stars, Betelgeuse, Rigel, Bellatrix, Saiph) seed one bounded three-parameter spherical rotation before fixed Galactic CAR sampling. This replaces, rather than relabels, the earlier blind longitude search. Source peaks are refined only inside tiny manually selected patches; detection smoothing never changes delivered photographic pixels.
- Sirius, Canopus, Aldebaran, Regulus and Spica are separately inspected **tentative bright-object associations**, held out from fitting. Cross-field agreement is supporting evidence, not an independent plate solution. Unidentified points, including possible captioned planets, are not assigned catalog identities.

### Review in this order

| Output under `sharpness-review/` | Meaning |
| --- | --- |
| `orion-original-annotated.png` | Original native JPEG crop with inspectable Orion identities; no photographic resize/grade |
| `orion-current-catalog-diagram.png` | Real current-frame STG catalog pattern, rescaled **diagram**, not a sky raster |
| `distributed-checks.png`, `alignment.json` | Native held-out crops; cyan inspected points vs green Orion-only predictions; all source/CSS offsets, including disagreements |
| `contact-sheet.png` | Desktop/mobile **overview thumbnails**, not sharpness evidence |
| `1920x1080@2x-*`, `390x844@2x-*` | 3840×2160 and 780×1688 native sky pixels: photo, current-stars-only, intact photo + canvas composite |
| `*-panel.png` | Approval panels with credit, license, modifications and CANDIDATE/awaiting-user-approval footers **outside sky pixels** |
| `*-native-*.png` | Exact 192×192 native **1:1**, never enlarged: PNG vs WebP90/95 photo/composite detail crops; bright point/belt when visible, faint-structure candidate and edge |
| `results.json` | Hashes, exact associations/provenance, global mapping/crop contract, measured encoding bytes/dimensions/decode memory, coverage and limitations; `humanApproval: not-granted` |

Full-size PNG references and WebP90/95 are sky-only assets with identical crop and identity grade. Keep them with the credited approval panels and report. Pre-existing `inspection-*.png` files are exploratory crop records, not approved alignment evidence. Native crops must be viewed at 100%: a high-DPI viewer may otherwise rescale them.

### Display coherence is not astrometric certification

The single rotation is reused for both actual exported CSS crops; DPR 2 changes raster density only. Mobile is **not** reframed to retain Orion. Geometry, WCS conversions and CPU mapped star rendering reuse `probe.py`; opacity is 1 and twinkle time 0. This is not pixel-identical WebGL or a runtime screenshot. Source-pixel and frame offsets are reported without a 0.5px rejection threshold; the decision is recognizable coherence and sharpness at actual display size.

Integer smoothed peak proxies carry at least five source pixels of identification/centering uncertainty; stitching, epoch and projection remain provisional. There is no subtraction: duplicates/halos remain honestly visible in the composite. Faint photographic detail is preserved. Bilinear reprojection and the finite 6000×3000 JPEG limit detail; **a 4K output is not proof of 4K source detail everywhere**, especially near projection edges/poles. Any invalid coverage is exposed in magenta and counted, never blur-filled. Human inspection must reject unsupported identities, objectionable stretching, duplicate stars or poor sharpness; user approval remains mandatory before any implementation.

No test files are authored: unknown source identity is an empirical outcome, not an invented RED. Use the two finite functional commands above and the parent-run image process. Existing app and old probe behavior are unchanged, so app differential/build checks are not applicable. Rollback for this unit is confined to `constellation_review.py`, `landmarks.json`, this new README section and `sharpness-review/`; preserve all previous inputs/results and source/environment.

---

# Historical phase 1: photographic feasibility probe

This probe produces **candidate images, never application approval**. It compares the existing star geometry with independent Astropy STG, evaluates the real ESO panorama against explicit Galactic CAR hypotheses, and attempts conservative empirical subtraction only when alignment is plausible. A failed gate is a useful **NO-GO**, not permission to invent a background.

## Run from the repository root

The isolated environment and source are already present. **Do not install packages or modify frontend dependencies.** `requirements.txt` records the four directly imported packages, matching the supplied environment; Photutils/reproject are installed but unused. Constrained SciPy fitting is sufficient for this bounded experiment.

```sh
node tools/hero-sky-prototype/export-inputs.mjs
output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/probe.py --help
output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/probe.py --geometry-only
```

The export executes actual pure TypeScript modules using installed `typescript.transpileModule`, in memory. It preserves explicit `.ts` imports, includes original backup stars only for controls, and exports current catalog, projection, crops, shaders, config and correctly shaped GPU arrays. It does not emit application JavaScript. Geometry mode prints JSON, writes no images, and exits 1 on disagreement; otherwise 0. It independently checks the previous candidate master WCS and all exported frames. Origin-0 WCS center indices gain 0.5 before conversion to CSS edge coordinates; Y is inverted.

**Long command for the parent to run with a 240-second background-job timeout:**

```sh
output/hero-sky-prototype/venv/bin/python -B tools/hero-sky-prototype/probe.py
```

No network, temporary state, subprocesses or application execution occurs. All generated writes are confined to `output/hero-sky-prototype/input/` and `output/hero-sky-prototype/results/`. Do not track the venv, exported JSON or result images in Git. Rerunning overwrites identically named outputs. An exception exits nonzero; an experimental NO-GO exits 0 with explicit status in JSON. The observed full-image run completed in 49.019 seconds in this environment. Peak memory remains unmeasured; the full source and residual alone require about 412 MiB combined, with additional working arrays.

## Review the evidence, in this order

| Output under `output/hero-sky-prototype/results/` | What to inspect |
| --- | --- |
| `results.json` | Hash/provenance, independent geometry, model hypotheses, every control and split, completeness/outliers, CSS errors, subtraction counts, measured bytes/dimensions and missing gates |
| `original-panorama.png`, `source-anchors.png` | Unchanged full panorama; tentative predicted anchors (green accepted nearest peaks, red rejected), not established identifications |
| `contact-sheet.png` | Desktop/mobile five-column comparison: original entire panorama → candidate source → residual → current stars → composite; the original has a different projection |
| `1920x1080@1x-*.png` | Full-size annotated desktop panels |
| `390x844@2x-*.png` | 780×1688 sky pixels, with annotation footer below the frame |
| `detail-*.png` | Four-panel 4× nearest-neighbor enlargements: bright isolated **candidate**, crowded-field candidate and dark/dust candidate |
| `negative-residual-mask.png` | Full native-resolution mask; magenta marks any negative RGB sample before display clamp |
| `*-residual-q80.webp`, `*-residual-q90.webp` | Real encoded residual candidates, sky pixels only; exact file sizes and decoded RGBA memory in JSON |

PNG panels add 62 footer pixels **outside** sky-frame pixels. The footer identifies source, modifications and mandatory approval. WebP assets omit footers for accurate delivery-size measurements and remain unvalidated experimental assets. The residual equals the source when calibration is implausible; this is explicitly recorded, not a successful separation. Keep all panels together with `results.json`.

## Scientific and visual contracts

### Registration is measured, not assumed

The 6000×3000 JPEG has no supplied WCS. The probe evaluates **288 explicit CAR hypotheses** (both longitude handednesses, both north directions, 24 longitude offsets and three longitude scales). Eight candidates receive limited robust global fitting: longitude/latitude shifts and two independent scales, bounded by ±140/65 source pixels and ±0.025 around their initial values. There is no shear, arbitrary warp or manually invented star coordinate. Other projections are **not ruled out** by a CAR failure.

Controls are actual backup BSC5 stars with Vmag ≤3.5 and |Galactic latitude| <65°. Every third eligible row is held out before fitting. Detection-only high-pass/local maxima find up to 5000 photographic peaks; the delivered source is never blurred. Matching is tentative: unique nearest peaks within 12 native pixels with a second-neighbor ambiguity rejection. All controls, rejected distances and candidate scores are retained. Accepted-only fit errors cannot establish registration by themselves.

Plausibility for experimental subtraction requires ≥20 matched fitting controls and an all-fit median nearest-peak distance <8 native pixels. This is deliberately weaker than validation. The proposed numerical gate requires ≥20 held-out controls in the combined target frames, ≥90% matched completeness, ≥8 of 12 desktop spatial cells covered and ≥10 accepted held-outs per frame with **maximum error ≤0.5 CSS px in each frame**. Errors are transformed through the fitted source model back to the actual independent STG WCS, not guessed from a constant panorama pixel scale. Gate failure keeps every image labeled UNVALIDATED/NO-GO. Even a pass is only numerical evidence, not reliable catalog identification or human visual approval.

BSC5 J2000 is treated as FK5 J2000. Proper motion, observation date, source stitching and exact astrometric provenance are unresolved. Dense-field chance matches can fool nearest-peak fitting; inspect the alternative scores, spatial distribution, completeness and real anchor image. No external plate solution or independent reference survey is available here.

### Subtraction is empirical, not physical photometry

Only current-catalog sources within three source pixels of a detected peak are eligible. An isolated 21×21 patch receives a constrained shared Gaussian profile (sigma 0.65–4 native pixels, centroid ±1.5 pixels) and per-channel background planes. Sources near edges, saturated channels ≥250/255, nearby catalog/detected neighbors, reused peaks, failed fits, RMSE >0.04 and very broad fits are skipped. Fit/subtracted/skipped/saturated/crowded/poor-fit/unmatched counts are reported. Saturated and crowded sources deliberately remain, potentially producing doubled composite stars.

The color space is **normalized encoded JPEG RGB**, with identity exposure mapping before/after and no extra brightness grade. This is empirical display-domain regression, **not** linear-light flux subtraction: changing containers or applying an sRGB inverse transfer function cannot undo unknown tone mapping. The fitted point profile alone is subtracted locally. No faint population is globally removed, and no dust/cloud/grain image is globally filtered. No new catalog depth or generative imagery is introduced. Non-catalog bright objects, including the captioned planets, are left alone; tentative matching can still be wrong and is a rejection risk.

Signed residual values are counted before display clipping; the native negative mask exposes them. PNG/WebP display clamps to [0,1], identically across panels, so consult the mask and minimum values rather than trusting attractive clipped images. Gaussian fits cannot promise realistic halos or wings. Numerical PSF diagnostics are **not G4 approval**: G4 stays false pending inspection for halos, doubled stars, dark holes, ringing and missing faint structure. A failed PSF gate is an acceptable NO-GO.

### Rendering and framing

Both source and residual use exactly the same fitted source mapping, exported current crop and identity exposure mapping. The CPU point approximation consumes the actual mapper phase/size/alpha/color buffers; it mirrors the current core/halo profile, premultiplied alpha blend and fixed twinkle time 0. Overall opacity is 1. Sizes remain CSS pixels and are multiplied by DPR (desktop 1, mobile 2), never magnified with the photograph. Stars-only uses #030712. This is **not pixel-identical WebGL, a screenshot, a fabricated landscape or UI**. No browser, DOM framing, fallback lifecycle, scroll or runtime performance is verified.

## Credit, limitations and decision

Source: ESO/S. Brunier, `eso0932a`; SHA-256 `60400c92c54b7c1bd12299c69e83b16e5b6256e7dabacc478c021758ecd28179`. The probe verifies the hash, RGB mode and dimensions before processing. Original source and downloaded image/license page snapshots remain untouched alongside `metadata/source.json`.

- Image page: https://www.hq.eso.org/public/images/eso0932a/
- General CC BY 4.0 policy: https://www.hq.eso.org/public/outreach/copyright/
- License text: https://creativecommons.org/licenses/by/4.0/
- Modifications: tentative calibration/reprojection, local experimental subtraction, catalog overlay, resizing and WebP encoding; preserve the credit and check image-specific exceptions before any reuse.

**Human visual approval is REQUIRED before any application implementation.** Neither tool exit 0, numerical geometry, measured asset bytes nor a promising image authorizes integration. G3 remains tentative until reliable registration is established, G4 is not approved, G5 is measurement without an approved budget, and G6 is untested. S1–S5 are supported only as offline feasibility evidence, preserving intentional opacity and the analysis/approval boundary.

No tests are authored per repository policy. Empirical source feasibility has no meaningful predetermined RED outcome; use the three bounded functional commands above and the real-image run instead. Existing application commands/options are unchanged, so differential app checks and builds are N/A. Rollback boundary: remove only the four tool files and their generated input/results outputs; source, environment, prior evidence and application are independent and must remain untouched. Parent owns review, task reconciliation and any terminal Git actions.
