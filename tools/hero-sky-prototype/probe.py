#!/usr/bin/env python3
"""Bounded, local-only photographic feasibility experiment; never approves integration."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from astropy.coordinates import SkyCoord
from astropy import units as u
from astropy.wcs import WCS
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, maximum_filter, map_coordinates
from scipy.optimize import least_squares
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'output/hero-sky-prototype'
RESULTS = BASE / 'results'
SOURCE_HASH = '60400c92c54b7c1bd12299c69e83b16e5b6256e7dabacc478c021758ecd28179'
CREDIT = 'ESO/S. Brunier | CC BY 4.0 | modified offline experiment; NOT an app screenshot'
STATUS = 'UNVALIDATED / NO-GO - human approval REQUIRED'


def read_inputs():
    return json.loads((BASE / 'input/current-sky.json').read_text())


def crop_plane(data, frame):
    r, c = data['region'], frame['crop']
    width = (r['xMax'] - r['xMin']) / c['scaleX']
    height = (r['yMax'] - r['yMin']) / c['scaleY']
    left = r['xMin'] + c['offsetX'] * width
    top = r['yMax'] - c['offsetY'] * height
    return left, top, width, height


def frame_wcs(data, frame):
    left, top, width, height = crop_plane(data, frame)
    dx, dy = width / frame['width'], height / frame['height']
    wcs = WCS(naxis=2)
    wcs.wcs.ctype = ['RA---STG', 'DEC--STG']
    wcs.wcs.crval = [data['tangent']['raHours'] * 15, data['tangent']['decDegrees']]
    wcs.wcs.crpix = [0.5 - left / dx, 0.5 - (top - height) / dy]
    wcs.wcs.cdelt = np.rad2deg([-dx, dy])
    return wcs


def world_rows(catalog):
    return np.array([[s['ra'] * 15, s['dec']] for s in catalog])


def edge_centers(wcs, world, height):
    # WCSLIB origin=0 returns center indices; CSS uses edge coordinates.
    points = wcs.all_world2pix(world, 0) + 0.5
    points[:, 1] = height - points[:, 1]
    return points


def geometry(data):
    world = world_rows(data['catalog'])
    projected = np.asarray(data['projected'])
    origins = np.asarray(data['mapped']['origins']).reshape(-1, 2)
    outcomes = []
    for f in data['frames']:
        left, top, width, height = crop_plane(data, f)
        independent = edge_centers(frame_wcs(data, f), world, f['height'])
        expected = (projected - [left, top]) * [f['width'] / width, -f['height'] / height]
        c = f['crop']
        gpu = (origins * [c['scaleX'], c['scaleY']] - [c['offsetX'], c['offsetY']]) * [f['width'], f['height']]
        outcomes.append({'css': [f['width'], f['height']],
                         'projectStarMaxCssPx': float(np.max(np.linalg.norm(independent - expected, axis=1))),
                         'gpuMaxCssPx': float(np.max(np.linalg.norm(independent - gpu, axis=1)))})
    header = {k: v for k, v in data['candidateMasterWcs'].items() if k != 'note'}
    master = WCS(header)
    master_points = edge_centers(master, world, 2160)
    s = data['reference']
    expected = (projected - [s['x0'], s['y0'] + s['height']]) * [3840 / s['width'], -2160 / s['height']]
    master_error = float(np.max(np.linalg.norm(master_points - expected, axis=1)))
    passed = master_error < 1e-7 and all(x['projectStarMaxCssPx'] < 1e-7 and x['gpuMaxCssPx'] < .001 for x in outcomes)
    return {'passed': passed, 'method': 'Independent Astropy/WCSLIB STG; origin0 +0.5; inverted Y',
            'candidateMasterMaxCssPx': master_error, 'frames': outcomes,
            'photographicRegistrationProven': False}


def galactic(world):
    # BSC5 coordinates treated as FK5 J2000, not silently equated with ICRS.
    g = SkyCoord(world[:, 0] * u.deg, world[:, 1] * u.deg, frame='fk5', equinox='J2000').galactic
    return np.column_stack((g.l.wrap_at(180 * u.deg).degree, g.b.degree))


def panorama(points, model, shape):
    h, w = shape[:2]
    p = model['parameters']  # dx, dy, longitude scale, latitude scale
    x = (w / 2 + model['hand'] * points[:, 0] * w / 360 * p[2] + p[0]) % w
    y = h / 2 - model['north'] * points[:, 1] * h / 180 * p[3] + p[1]
    return np.column_stack((x, y))


def detect_peaks(source):
    gray = np.mean(source, axis=2)
    # Filters are detection-only; no blurred pixels enter any delivered sky image.
    high = gray - gaussian_filter(gray, 4)
    mask = (high == maximum_filter(high, size=9)) & (high > max(.055, float(np.percentile(high, 99.5))))
    y, x = np.nonzero(mask)
    order = np.argsort(high[y, x])[::-1][:5000]
    return np.column_stack((x[order], y[order])), high[y[order], x[order]]


def matching(tree, points, width):
    # Periodic x through replicated peaks, but physical peak identities remain unique.
    distance, indices = tree.query(points, k=2)
    return distance[:, 0], indices[:, 0], distance[:, 1]


def summary_error(values):
    if not len(values):
        return {'count': 0, 'median': None, 'p95': None, 'max': None}
    return {'count': len(values), 'median': float(np.median(values)),
            'p95': float(np.percentile(values, 95)), 'max': float(np.max(values))}


def calibrate(source, data, peaks):
    h, w = source.shape[:2]
    controls = [s for s in data['controlCatalog'] if s['mag'] <= 3.5]
    world = world_rows(controls)
    gb = galactic(world)
    keep = np.abs(gb[:, 1]) < 65  # avoid ill-conditioned panorama poles
    world, gb = world[keep], gb[keep]
    controls = [s for s, valid in zip(controls, keep) if valid]
    fit = np.arange(len(gb)) % 3 != 0
    extended = np.concatenate([peaks, peaks + [w, 0], peaks - [w, 0]])
    tree = cKDTree(extended)
    hypotheses = []
    # Explicit CAR hypotheses only: both axes, 24 longitude offsets, +/-2% scales.
    # A broader projection family is NOT inferred from the 2:1 container.
    for hand in [-1, 1]:
        for north in [-1, 1]:
            for offset in range(-180, 180, 15):
                for scale in [.98, 1., 1.02]:
                    m = {'projection': 'Galactic CAR', 'hand': hand, 'north': north,
                         'parameters': [offset * w / 360, 0., scale, 1.]}
                    d, _, _ = matching(tree, panorama(gb[fit], m, source.shape), w)
                    m['score'] = float(np.mean(np.minimum(d, 25) ** 2))
                    hypotheses.append(m)
    hypotheses.sort(key=lambda m: m['score'])
    refined = []
    for candidate in hypotheses[:8]:
        model = dict(candidate)
        initial = np.array(model['parameters'])
        # Limited global alignment: no affine shear, local warp or per-star edits.
        bounds = (initial - [140, 65, .025, .025], initial + [140, 65, .025, .025])
        for _ in range(4):
            predicted = panorama(gb[fit], model, source.shape)
            distances, ids, second = matching(tree, predicted, w)
            selected = (distances < 25) & (second > distances * 1.4)
            if selected.sum() < 8:
                break
            targets = extended[ids[selected]]
            def residual(p):
                trial = dict(model, parameters=p.tolist())
                delta = panorama(gb[fit][selected], trial, source.shape) - targets
                delta[:, 0] = (delta[:, 0] + w / 2) % w - w / 2
                return delta.ravel()
            solution = least_squares(residual, model['parameters'], bounds=bounds,
                                     loss='soft_l1', f_scale=2, max_nfev=60)
            model['parameters'] = solution.x.tolist()
        d, _, _ = matching(tree, panorama(gb[fit], model, source.shape), w)
        model['score'] = float(np.mean(np.minimum(d, 25) ** 2))
        refined.append(model)
    refined.sort(key=lambda m: m['score'])
    model = refined[0]
    predicted = panorama(gb, model, source.shape)
    d, ids, second = matching(tree, predicted, w)
    unique, multiplicity = np.unique(ids % len(peaks), return_counts=True)
    repeated = set(unique[multiplicity > 1].tolist())
    matched = (d < 12) & (second > np.maximum(3, d * 1.5))
    matched &= np.array([int(i % len(peaks)) not in repeated for i in ids])
    measured = extended[ids]
    # Convert each observed panorama peak back through the fitted CAR to celestial sky.
    lon = ((measured[:, 0] - w / 2 - model['parameters'][0] + w / 2) % w - w / 2)
    lon /= model['hand'] * w / 360 * model['parameters'][2]
    lat = (h / 2 + model['parameters'][1] - measured[:, 1]) / (model['north'] * h / 180 * model['parameters'][3])
    observed = SkyCoord(l=lon * u.deg, b=np.clip(lat, -90, 90) * u.deg, frame='galactic').transform_to('fk5')
    observed_world = np.column_stack((observed.ra.degree, observed.dec.degree))
    errors = {}
    rows = []
    covered = set()
    inside_any = np.zeros(len(gb), dtype=bool)
    for f in data['frames'][:2]:
        wcs = frame_wcs(data, f)
        expected = edge_centers(wcs, world, f['height'])
        actual = edge_centers(wcs, observed_world, f['height'])
        inside = (expected[:, 0] >= 0) & (expected[:, 0] < f['width']) & (expected[:, 1] >= 0) & (expected[:, 1] < f['height'])
        inside_any |= inside
        e = np.linalg.norm(actual - expected, axis=1)
        key = f"{f['width']}x{f['height']}"
        errors[key] = {'fitCssPx': summary_error(e[fit & matched & inside]),
                       'heldOutCssPx': summary_error(e[~fit & matched & inside]),
                       'heldOutExpected': int((~fit & inside).sum()),
                       'heldOutRejected': int((~fit & inside & ~matched).sum())}
        if f is data['frames'][0]:
            for x, y in expected[~fit & matched & inside]:
                covered.add((int(x / f['width'] * 4), int(y / f['height'] * 3)))
    for i, star in enumerate(controls):
        rows.append({'catalog': star, 'split': 'fit' if fit[i] else 'held-out',
                     'predictedSourcePixel': predicted[i].tolist(), 'nearestPeakPixel': measured[i].tolist(),
                     'distanceSourcePx': float(d[i]), 'accepted': bool(matched[i])})
    held = ~fit & inside_any
    plausible = int((matched & fit).sum()) >= 20 and np.median(d[fit]) < 8
    # No max-error claim from a filtered subset alone: require held-out completeness too.
    numerical = plausible and len(covered) >= 8 and held.sum() >= 20 and (matched & held).sum() / max(1, held.sum()) >= .9
    numerical = bool(numerical and all(v['heldOutCssPx']['count'] >= 10 and
                     v['heldOutCssPx']['max'] <= .5 for v in errors.values()))
    return model, {'model': model, 'hypothesesEvaluated': len(hypotheses), 'topRefined': refined,
                   'plausibleForExperimentalSubtraction': bool(plausible),
                   'numericalRegistrationGate': numerical, 'errors': errors,
                   'heldOutDesktopCellsOf12': len(covered), 'controls': rows,
                   'uncertainty': 'Nearest-peak identities are tentative, not external plate-solve identifications. '
                   'J2000/proper motion, JPEG halos, scale and projection remain uncertain; no exact supplied WCS.'}


def subtract_sources(source, data, model, peaks, plausible):
    residual = source.copy()
    counts = {'catalog': len(data['catalog']), 'fit': 0, 'subtracted': 0, 'skipped': 0,
              'saturated': 0, 'crowded': 0, 'poorFit': 0, 'unmatched': 0}
    report = []
    if not plausible:
        counts['skipped'] = counts['catalog']
        return residual, {'counts': counts, 'attempted': False, 'reason': 'Calibration implausible; residual is unchanged source', 'fits': []}
    predicted = panorama(galactic(world_rows(data['catalog'])), model, source.shape)
    tree = cKDTree(peaks)
    distances, ids = tree.query(predicted)
    nearest = cKDTree(predicted).query(predicted, k=2)[0][:, 1]
    used = set()
    h, w = source.shape[:2]
    for i, ((px, py), distance, peak_id) in enumerate(zip(predicted, distances, ids)):
        if distance > 3 or peak_id in used:
            counts['unmatched'] += 1
            continue
        x, y = np.rint(peaks[peak_id]).astype(int)
        radius = 10
        if x < radius or x >= w - radius or y < radius or y >= h - radius:
            counts['unmatched'] += 1
            continue
        patch = source[y-radius:y+radius+1, x-radius:x+radius+1]
        if np.max(patch) >= 250 / 255:
            counts['saturated'] += 1
            continue
        if nearest[i] < 2 * radius or len(tree.query_ball_point([x, y], 12)) > 1:
            counts['crowded'] += 1
            continue
        yy, xx = np.mgrid[-radius:radius+1, -radius:radius+1]
        gray = patch.mean(axis=2)
        background = np.median(gray)
        def profile(p):
            return np.exp(-((xx-p[0])**2 + (yy-p[1])**2) / (2*p[2]**2))
        def objective(p):
            return (p[3] * profile(p) + p[4] + p[5]*xx + p[6]*yy - gray).ravel()
        solution = least_squares(objective, [0, 0, 1.6, max(.001, gray.max()-background), background, 0, 0],
                                 bounds=([-1.5, -1.5, .65, 0, 0, -.03, -.03],
                                         [1.5, 1.5, 4, 1.5, 1, .03, .03]), max_nfev=45)
        counts['fit'] += 1
        p = solution.x
        gaussian = profile(p)
        design = np.column_stack((gaussian.ravel(), np.ones(gray.size), xx.ravel(), yy.ravel()))
        coeff = np.linalg.lstsq(design, patch.reshape(-1, 3), rcond=None)[0]
        error = float(np.sqrt(np.mean(objective(p)**2)))
        amplitude = coeff[0]
        if not solution.success or error > .04 or p[2] > 3.8 or np.any(amplitude < 0):
            counts['poorFit'] += 1
            continue
        subtraction = gaussian[..., None] * amplitude
        residual[y-radius:y+radius+1, x-radius:x+radius+1] -= subtraction
        used.add(peak_id)
        counts['subtracted'] += 1
        report.append({'catalogIndex': i, 'sourcePixel': [int(x), int(y)],
                       'sigmaSourcePx': float(p[2]), 'rmseEncodedRgb': error,
                       'negativeSamplesInPatch': int(np.sum(patch - subtraction < 0))})
    counts['skipped'] = counts['catalog'] - counts['subtracted']
    return residual, {'counts': counts, 'attempted': True, 'fits': report,
                      'method': 'Constrained isolated Gaussian + per-channel plane in encoded display RGB; no global blur',
                      'negativeChannelSamples': int(np.sum(residual < 0)),
                      'minimumBeforeDisplayClamp': float(residual.min()),
                      'psfNumericalGate': bool(counts['subtracted'] >= 20 and not np.any(residual < -.02)),
                      'quality': 'Empirical only; Gaussian mismatch, extended halos and skipped saturated/crowded sources require visual rejection checks'}


def sample_frame(source, data, frame, model):
    # Chunk rows so desktop/mobile do not allocate full-sky coordinate cubes.
    wcs = frame_wcs(data, frame)
    dpr = frame['dpr']
    width, height = frame['width'] * dpr, frame['height'] * dpr
    output = np.empty((height, width, 3), dtype=np.float32)
    valid_count = 0
    for y0 in range(0, height, 96):
        yy, xx = np.mgrid[y0:min(y0+96, height), :width]
        css = np.column_stack(((xx.ravel()+.5)/dpr-.5,
                               frame['height']-(yy.ravel()+.5)/dpr-.5))
        world = wcs.all_pix2world(css, 0)
        xy = panorama(galactic(world), model, source.shape)
        valid = (xy[:, 1] >= 0) & (xy[:, 1] <= source.shape[0]-1)
        valid_count += int(valid.sum())
        # Wrap longitude only, never latitude; retain explicit invalid coverage.
        coords = [np.clip(xy[:, 1], 0, source.shape[0]-1), xy[:, 0]]
        for channel in range(3):
            sampled = map_coordinates(source[..., channel], coords, order=1, mode='grid-wrap', prefilter=False)
            sampled[~valid] = [3/255, 7/255, 18/255][channel]
            output[y0:y0+yy.shape[0], :, channel] = sampled.reshape(yy.shape)
    return output, valid_count / (width * height)


def render_stars(background, data, frame):
    image = background.copy()
    origins = np.asarray(data['mapped']['origins']).reshape(-1, 2)
    stars = np.asarray(data['mapped']['stars']).reshape(-1, 4)
    colors = np.asarray(data['mapped']['colors']).reshape(-1, 4)
    c, dpr = frame['crop'], frame['dpr']
    positions = (origins * [c['scaleX'], c['scaleY']] - [c['offsetX'], c['offsetY']]) * [frame['width'], frame['height']] * dpr
    amplitude = data['config']['twinkle']['amplitude']
    for (cx, cy), (phase, size, alpha, speed), color in zip(positions, stars, colors):
        half = size * (1-amplitude + np.sin(phase * 6.2831853) * amplitude) * dpr
        x0, x1 = max(0, int(np.floor(cx-half))), min(image.shape[1], int(np.ceil(cx+half)))
        y0, y1 = max(0, int(np.floor(cy-half))), min(image.shape[0], int(np.ceil(cy+half)))
        if x1 <= x0 or y1 <= y0:
            continue
        yy, xx = np.mgrid[y0:y1, x0:x1]
        distance = np.sqrt(((xx+.5-cx)/half)**2 + ((yy+.5-cy)/half)**2)
        def reversed_smoothstep(t):
            t = np.clip(t, 0, 1)
            return 1 - t*t*(3-2*t)
        a = (reversed_smoothstep(distance*1.8) + .28*reversed_smoothstep(distance))*alpha*color[3]
        # Normalized RGBA framebuffer clamps fragment channels; premultiplied blend.
        rgb = np.clip(color[:3]*a[..., None], 0, 1)
        a = np.clip(a, 0, 1)
        image[y0:y1, x0:x1] = rgb + image[y0:y1, x0:x1]*(1-a[..., None])
    return image


def image_rgb(array):
    return Image.fromarray(np.rint(np.clip(array, 0, 1)*255).astype(np.uint8))


def footer(image, label):
    output = Image.new('RGB', (image.width, image.height+62), '#030712')
    output.paste(image, (0, 0))
    draw = ImageDraw.Draw(output)
    draw.text((8, image.height+4), label, fill='white')
    draw.text((8, image.height+22), STATUS, fill='#ffc080')
    draw.text((8, image.height+40), CREDIT, fill='white')
    return output


def save_panel(array, name, label):
    im = footer(image_rgb(array), label)
    im.save(RESULTS / f'{name}.png')
    return im


def details(panels, desktop, data):
    src = panels['candidate-source']
    gray = src.mean(axis=2)
    # Data-selected diagnostics, not invented celestial coordinates.
    grid = []
    for y in range(96, src.shape[0]-96, 96):
        for x in range(96, src.shape[1]-96, 96):
            patch = gray[y-64:y+64, x-64:x+64]
            grid.append((x, y, float(patch.mean()), float(np.std(patch))))
    # Prefer a bright catalog star with no nearby catalog neighbor, away from edges.
    world = world_rows(data['catalog'])
    centers = edge_centers(frame_wcs(data, desktop), world, desktop['height'])
    separation = cKDTree(centers).query(centers, k=2)[0][:, 1]
    eligible = [i for i, (x, y) in enumerate(centers) if 96 <= x < src.shape[1]-96
                and 96 <= y < src.shape[0]-96 and separation[i] > 15]
    if eligible:
        index = min(eligible, key=lambda i: data['catalog'][i]['mag'])
        x, y = np.rint(centers[index]).astype(int)
        bright = (int(x), int(y), float(gray[y, x]), 0.)
    else:
        bright = max(grid, key=lambda p: np.max(gray[p[1]-64:p[1]+64, p[0]-64:p[0]+64]) - p[2])
    crowded = max(grid, key=lambda p: p[3])
    dark = min(grid, key=lambda p: p[2])
    result = []
    for label, (x, y, mean, spread) in zip(['bright-isolation-candidate', 'crowded-field-candidate', 'dark-dust-candidate'], [bright, crowded, dark]):
        sheet = Image.new('RGB', (512*4, 512+62), '#030712')
        for i, key in enumerate(['candidate-source', 'residual', 'current-stars-only', 'composite']):
            crop = image_rgb(panels[key][y-64:y+64, x-64:x+64]).resize((512, 512), Image.Resampling.NEAREST)
            sheet.paste(footer(crop, key), (i*512, 0))
        sheet.save(RESULTS / f'detail-{label}.png')
        result.append({'label': label, 'desktopCssCenter': [x, y], 'cropCssSize': [128, 128],
                       'selection': 'Image-statistics candidate; semantic category/isolation requires human inspection'})
    return result


def run(data):
    source_path = BASE / 'source/eso0932a.jpg'
    digest = hashlib.sha256(source_path.read_bytes()).hexdigest()
    if digest != SOURCE_HASH:
        raise ValueError('Source hash mismatch; refusing to process')
    with Image.open(source_path) as original:
        if original.size != (6000, 3000) or original.mode != 'RGB':
            raise ValueError('Unexpected source dimensions/mode')
        source = np.asarray(original, dtype=np.float32) / 255
    RESULTS.mkdir(parents=True, exist_ok=True)
    peaks, strength = detect_peaks(source)
    if len(peaks) < 20:
        raise ValueError('Insufficient photographic peaks for bounded hypothesis evaluation')
    model, registration = calibrate(source, data, peaks)
    residual, subtraction = subtract_sources(source, data, model, peaks,
                                             registration['plausibleForExperimentalSubtraction'])
    preview = image_rgb(source).resize((1500, 750))
    draw = ImageDraw.Draw(preview)
    for c in registration['controls']:
        x, y = np.asarray(c['predictedSourcePixel']) / 4
        draw.ellipse((x-3, y-3, x+3, y+3), outline='lime' if c['accepted'] else 'red')
    footer(preview, 'Original source panorama + predicted control anchors (green tentative / red rejected)').save(RESULTS / 'source-anchors.png')
    footer(image_rgb(source).resize((1500, 750)), 'Original complete panorama; unchanged exposure').save(RESULTS / 'original-panorama.png')
    negative = np.any(residual < 0, axis=2)
    mask = np.zeros(source.shape, dtype=np.uint8)
    mask[negative] = [255, 0, 255]
    footer(Image.fromarray(mask), 'Negative residual pixel mask (magenta); displayed RGB otherwise clamps at zero').save(RESULTS / 'negative-residual-mask.png')
    del mask, negative
    variants, contacts, crops = [], [], []
    for frame in data['frames'][:2]:
        name = f"{frame['width']}x{frame['height']}@{frame['dpr']}x"
        registered, coverage = sample_frame(source, data, frame, model)
        resampled, _ = sample_frame(residual, data, frame, model)
        base = np.empty_like(registered)
        base[:] = np.array([3, 7, 18]) / 255
        panels = {'candidate-source': registered, 'residual': resampled,
                  'current-stars-only': render_stars(base, data, frame),
                  'composite': render_stars(np.clip(resampled, 0, 1), data, frame)}
        row = Image.new('RGB', (480*5, 360+62), '#030712')
        original_thumbnail = image_rgb(source)
        original_thumbnail.thumbnail((480, 360))
        row.paste(original_thumbnail, (0, 0))
        ImageDraw.Draw(row).text((8, 364), 'Original entire panorama (different projection)', fill='white')
        for i, (key, array) in enumerate(panels.items(), start=1):
            save_panel(array, f'{name}-{key}', f'{name} | {key} | opacity 1; time 0')
            thumbnail = image_rgb(array)
            thumbnail.thumbnail((480, 360))
            row.paste(thumbnail, (i*480, 0))
            ImageDraw.Draw(row).text((i*480+8, 364), f'{name} {key}', fill='white')
        ImageDraw.Draw(row).text((8, 388), STATUS+' | '+CREDIT, fill='#ffc080')
        contacts.append(row)
        for quality in [80, 90]:
            file = RESULTS / f'{name}-residual-q{quality}.webp'
            image_rgb(resampled).save(file, 'WEBP', quality=quality, method=4)
            with Image.open(file) as encoded:
                dimensions = list(encoded.size)
            variants.append({'file': file.name, 'bytes': file.stat().st_size, 'dimensions': dimensions,
                             'quality': quality, 'skyOnlyNoFooter': True, 'coverageFraction': coverage,
                             'decodedRgbaMiB': dimensions[0]*dimensions[1]*4/1048576})
        if frame['width'] == 1920:
            crops = details(panels, frame, data)
    sheet = Image.new('RGB', (2400, sum(i.height for i in contacts)), '#030712')
    y = 0
    for row in contacts:
        sheet.paste(row, (0, y))
        y += row.height
    sheet.save(RESULTS / 'contact-sheet.png')
    report = {'status': STATUS, 'sourceSha256': digest, 'credit': CREDIT,
              'sourceMetadata': json.loads((BASE / 'metadata/source.json').read_text()),
              'environment': json.loads((BASE / 'metadata/environment.json').read_text()),
              'inputModuleHashes': data['hashes'], 'geometry': geometry(data),
              'detectedPeaks': len(peaks), 'registration': registration, 'subtraction': subtraction,
              'variants': variants, 'details': crops, 'humanApproval': 'REQUIRED; not supplied',
              'colorSpace': 'Normalized encoded JPEG RGB; identity exposure mapping before/after. '
              'Empirical display-domain subtraction, NOT physical linear photometry. Clamp only for display/encoding.',
              'renderer': 'CPU approximation of current shader profiles, mapped buffers, time0, opacity1; '
              'CSS half-size scaled by DPR; not pixel-identical WebGL.',
              'limitations': ['CAR is a fitted hypothesis, not supplied WCS; alternatives remain untested',
                              'Non-catalog sources including captioned planets are not removed',
                              'Saturated, crowded, unmatched and poorly fitted sources remain visible',
                              'No runtime, DOM, visual approval or production quality is established'],
              'gates': {'G3': registration['numericalRegistrationGate'],
                        'G4': False, 'G5': 'Measured variants, no approved budget',
                        'G6': 'Not run; application integration prohibited'}}
    (RESULTS / 'results.json').write_text(json.dumps(report, indent=2, allow_nan=False)+'\n')
    print(json.dumps({'status': STATUS, 'results': str(RESULTS.relative_to(ROOT)),
                      'registrationGate': registration['numericalRegistrationGate'],
                      'subtracted': subtraction['counts']['subtracted'], 'variants': len(variants)}))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--geometry-only', action='store_true',
                        help='Compare Astropy STG with actual projectStar/GPU exports; JSON only, no images')
    args = parser.parse_args()
    data = read_inputs()
    if args.geometry_only:
        result = geometry(data)
        print(json.dumps(result, indent=2, allow_nan=False))
        return 0 if result['passed'] else 1
    if not geometry(data)['passed']:
        raise ValueError('Geometry contract failed; refusing photographic run')
    run(data)
    return 0  # Feasibility NO-GO is an experimental result, not a process failure.


if __name__ == '__main__':
    raise SystemExit(main())
