# Footer asset sources

All published originals below were downloaded byte-for-byte. SHA-256 values are for the saved files.

| File | Source | Format and native dimensions | Transparency | SHA-256 |
|---|---|---|---|---|
| `gore.svg` | https://iluminaconciencia.userena.digital/static/images/gore.svg | SVG, viewBox 0 0 300 300 | Vector; rendered artwork appears opaque | `dac331612834d49f701b2897e34f46ebd922a79b8bc1eeb2fd77c0b52033bc68` |
| `logo.svg` | https://iluminaconciencia.userena.digital/static/images/logo.svg | SVG, viewBox 0 0 300 90 | Vector; rendered artwork appears opaque | `681658a844a8f8ad97ef9ab2e5d56da8bdec94b0acb24632e9a96b13a85df00f` |
| `core.jpg` | https://iluminaconciencia.userena.digital/static/images/core.jpg | JPEG, 1024 × 980 | Opaque (JPEG) | `e4600b8bff304379835d833b2a42f23dc8159c750106337e7b7fb3dd1f7030d0` |
| `logo_eso.png` | https://iluminaconciencia.userena.digital/static/images/logo_eso.png | PNG, 2817 × 729 | Opaque image; the published image has a white background | `e1bc72e34547d43192ac9da22f043096e4d0573c9def50095e22a621ba339848` |
| `core-consejo-regional.png` | Extracted byte-for-byte from `LOGO CORE.png` in https://www.corecoquimbo.cl/core/site/docs/20250114/20250114163918/logos_consejo_regional_de_coquimbo.zip | PNG, 1951 × 1951, RGBA | Transparency present | `a62c28b82d14ec835bd53d71c08ca2973e714c42e34ae60c381265e46d3b2f4f` |

The CORE archive was inspected in memory; it contains five PNG variants (`color.png`, `cyan.png`, `negativo.png`, `positivo.png`, and `LOGO CORE.png`) plus JPEGs. `LOGO CORE.png` was visually inspected and selected: it is the full-color Gobierno Regional de Coquimbo / Consejo Regional mark and has transparency. The downloaded `core.jpg` is a distinct composite image with large CORE lettering and the Gobierno Regional mark; it remains JPEG and was not converted.

## Separate published institutional marks

The following candidate assets were fetched directly from the official URLs supplied for this work. Their saved bytes were not converted or modified; SHA-256 values identify the saved originals.

| File | Source | Format and native dimensions | Transparency | SHA-256 | Observed use / edition notes |
|---|---|---|---|---|---|
| `eso-lettering-color.png` | https://www.eso.org/public/archives/logos/transparent/logo_lettering_v1_color.png | PNG, 2341 × 1276, RGBA | Transparency present | `6bcc5b8cd5c6b0a01fa02086c88bfff7d02f2973de5e150d906d7ec3bcc58b60` | Full ESO lettering-and-symbol mark with `www.eso.org`; a different composition from the compact ESO symbol panel in the published composite. Do not describe it as an exact visual match. |
| `sochias-apaisado.png` | https://sochias.cl/wp-content/uploads/2024/05/Logo-SOCHIAS-apaisado.png | PNG, 759 × 209, RGBA | Transparency present | `ce279ce113a4fd43430a7f1cbe4cda1441f1eb2409d281426315623296c6b053` | Horizontal SOCHIAS presentation, selected as the closer aspect/layout option for a horizontal footer; it is not the same treatment or scale as SOCHIAS at the far right of the composite. |
| `sochias-transparente-chico.png` | https://sochias.cl/wp-content/uploads/2024/03/cropped-cropped-Logo-SOCHIAS-transparente-chico-1.png | PNG, 200 × 202, RGBA | Transparency present | `42f194ece857ff263b9b4b460915a95a37ab35990aedfb339bcfb82681ece86b` | Compact near-square SOCHIAS variant; retained as an alternative, not chosen as the horizontal layout candidate. |
| `minciencia.svg` | https://minciencia.gob.cl/static/images/logo.svg | SVG, viewBox 0 0 542 146 | Vector canvas has no opaque background element | `cb673a7a33508c6be1788f350dd2543e38b611131b1ebcdf50dcdde8c642f07b` | Officially hosted horizontal government/ministry identity artwork. It differs in layout and presentation from the Ciencia panel in the composite; no exact match is claimed. |

The ESO logo page at https://www.eso.org/public/products/logos/ notes that the ESO logo is protected and that prior written consent is required for use. This is recorded as an asset-use caution, not as an independent legal interpretation; obtain the required permission before use. The page's usage restrictions apply even though a transparent PNG is publicly downloadable.

A separately sourced Foreign Affairs original was not obtained. The parent's attempt to access the Chilean Ministry of Foreign Affairs homepage (https://www.minrel.gob.cl/) returned HTTP 403. The visual Foreign Affairs panel in the published composite was therefore cropped losslessly to `minrel-panel.png`; it is a derivative, not an independently sourced original. The untouched composite remains preserved at `logo_eso.png`.

| Derivative | Source | Crop geometry (source pixel coordinates; left, top, right, bottom) | Dimensions | SHA-256 |
|---|---|---|---|---|
| `minrel-panel.png` | `logo_eso.png` (published composite above) | `(581, 9, 1365, 720)`; right and bottom bounds are exclusive | 784 × 711 PNG | `054caf9428820b4467ed133d83ab42f0000c8656909bbb9f63afd7ec97e06a4b` |
| `eso-symbol-color.png` | `eso-lettering-color.png` (official transparent ESO PNG above) | `(0, 0, 946, 1235)`; right and bottom bounds are exclusive | 946 × 1235 PNG | `a92e6063dd14c40aeac3a1fa1fab6fb6c4e37ef845711b985879935e734e9d91` |

The Minrel crop contains the complete blue Chilean coat-of-arms panel and red ministry-name panel with the original white background and surrounding white margin. It is retained as provenance but is no longer used in the active UI; `minrel-user-selected.png` below replaces it. The ESO derivative is a symbol-only crop: pixel-bound analysis found the symbol panel at source coordinates x=0–945, y=0–1234; separate nontransparent lettering begins at x=1247 and extends through y=1274, so it is fully excluded. The crop retains the complete blue symbol and its integrated ESO lettering without altering pixels, colors, or transparency. Both crops were extracted without resizing or pixel alteration using ImageMagick: `magick logo_eso.png -crop 784x711+581+9 +repage minrel-panel.png` and `magick eso-lettering-color.png -crop 946x1235+0+0 +repage eso-symbol-color.png`. The ESO crop was independently pixel-compared to its source rectangle (absolute-error metric 0).

## Composite image contents

Visual inspection of the published `logo_eso.png` shows four distinct marks arranged side-by-side: ESO, Gobierno de Chile / Ministerio de Relaciones Exteriores, Gobierno de Chile / Ministerio de Ciencia, Tecnología, Conocimiento e Innovación, and SOCHIAS (Sociedad Chilena de Astronomía). It is a composite, not a single ESO logo. No separate originals were substituted for any part of this composite; the composite is retained unchanged. An official ESO logos page is listed by the project at https://www.eso.org/public/products/logos/.

## Published funding wording

The published project home page (https://iluminaconciencia.userena.digital/) states exactly:

> Proyecto financiado por el Gobierno Regional de Coquimbo, a través del Fondo de Innovación para la Competitividad Regional FIC-R.

This wording is transcribed from the published page; no alternate funding language has been inferred.

## User-selected footer assets

The following files are direct downloads of the exact URLs supplied by the user. They are used byte-for-byte without conversion, re-encoding, recoloring, or transparency edits.

| File | Source | Format and native dimensions | Transparency | SHA-256 |
|---|---|---|---|---|
| `eso-user-selected.jpg` | https://www.eso.org/public/archives/logos/large/eso-logo-p3005.jpg | JPEG, 981 × 1279 | No; JPEG is intrinsically opaque | `43e9d15cb9ca83bdddfca2e4bbe8eb51eaa7511841a75c018b5f8bc7f9602510` |
| `minrel-user-selected.png` | https://upload.wikimedia.org/wikipedia/commons/9/94/Logo_del_MINREL_Chile.png | PNG, 1248 × 1134 | Yes, RGBA | `094c9525a000493ff19a2b6c89b4a71ea0b2a3b97052e6645a3e3e93b26eb251` |
| `minciencia-user-selected.png` | https://upload.wikimedia.org/wikipedia/commons/1/1c/Logo_del_Ministerio_de_Ciencia%2C_Tecnolog%C3%ADa%2C_Conocimiento_y_Innovaci%C3%B3n_de_Chile.png | PNG, 1248 × 1134 | Yes, RGBA | `aea55be4c189d743434182662695465174724aca22abd8b60221186752d76fd5` |
| `sochias-user-selected.png` | https://astronomia.udp.cl/wp-content/uploads/2023/08/Logo-Sochias-blanco-888x1024.png | PNG, 888 × 1024 | Yes, RGBA | `b1e6ddcdcfe0c7fa9afc84db9617bacbe289c71d95390e7a6d6c8c7bb3460720` |

ESO's selected original is JPEG and therefore opaque. Its white/opaque background is retained exactly; no transparency was simulated and no lossy re-encoding was performed. The selected Foreign Affairs PNG is used byte-for-byte and replaces the composite-derived `minrel-panel.png` in the active footer; the crop itself remains preserved. The selected white SOCHIAS mark is likewise used unchanged.

## GORE optical-margin derivative

`gore.svg` remains unchanged. `gore-trimmed.svg` is a vector derivative made by changing only the root SVG `viewBox` from `0 0 300 300` to `46 48 208 204`. Bounds were derived from ImageMagick's rasterized native-viewBox output: a 2% fuzz trim against the white canvas returned artwork bounds `200 × 196` at `(50, 52)`; the derivative expands those observed bounds by 4 viewBox units on each side to retain anti-aliased edge artwork without clipping. No paths, shapes, colors, or source bytes were modified; the original remains available as `gore.svg`. This is a numeric/geometric derivation only; no visual inspection or browser comparison was performed.
