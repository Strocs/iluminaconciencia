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
