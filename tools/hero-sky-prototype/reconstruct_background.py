#!/usr/bin/env python3
"""Bounded native JPEG background inference; NOT physical recovery or hero integration."""
import argparse
import json
import textwrap
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import (binary_dilation, distance_transform_edt, gaussian_filter,
                           label)
from scipy.sparse import diags, eye, kron
from scipy.sparse.linalg import spsolve
from scipy.spatial.transform import Rotation

import constellation_review as review
import probe

OUT = probe.BASE / 'reconstruction-review'
OLD = review.OUT / 'results.json'
HALF = 96
SHIFT = [8, -6]  # CSS pixels: illustrative exposure, NOT a parallax specification.
STATUS = 'INFERRED SAMPLE / UNREVIEWED - human approval not granted'


def save_json(name, value):
    (OUT / name).write_text(json.dumps(value, indent=2, allow_nan=False) + '\n')


def panel(image, title, source_only=False):
    lines = [title, STATUS, review.CREDIT, review.LICENSE,
             'Unmodified source crops only; no inferred pixels.' if source_only else
             'Modified: selective native inpainting / reprojection / subset CPU overlay.',
             'Opacity 1, time 0 for overlays. No actual movement or app code.']
    lines = [p for line in lines for p in textwrap.wrap(line, max(28, (image.width-16)//6))]
    result = Image.new('RGB', (image.width, image.height+12+15*len(lines)), '#030712')
    result.paste(image, (0, 0))
    draw = ImageDraw.Draw(result)
    for i, line in enumerate(lines):
        draw.text((8, image.height+6+15*i), line, fill='white')
    return result


def strip(tiles, titles, title, filename, source_only=False):
    width, height = tiles[0].size
    sheet = Image.new('RGB', (len(tiles)*width, height+24), '#030712')
    for i, (tile, caption) in enumerate(zip(tiles, titles)):
        sheet.paste(tile, (i*width, 0))
        ImageDraw.Draw(sheet).text((i*width+3, height+4), caption, fill='white')
    panel(sheet, title, source_only=source_only).save(OUT / filename)


def validate():
    """Reuse the existing validation owner; never call align or old output writers."""
    data, associations, checks = review.validate()
    old = json.loads(OLD.read_text())
    for key in ['sourceSha256', 'inputJsonSha256', 'landmarksSha256', 'moduleHashes']:
        if checks[key] != old['sources'][key]:
            raise ValueError(f'Phase-2 input drift: {key}')
    registration = old['registration']
    if json.loads((review.OUT / 'alignment.json').read_text()) != registration:
        raise ValueError('Phase-2 alignment/report disagree')
    rotation = Rotation.from_rotvec(registration['rotationVectorRadians'])
    if not np.allclose(rotation.as_matrix(), registration['rotationMatrix'], atol=1e-12, rtol=0):
        raise ValueError('Rotation representation mismatch')
    rows = registration['landmarks']
    if len(rows) != 12 or [r['name'] for r in rows] != [r['name'] for r in associations]:
        raise ValueError('Expected the twelve inspected phase-2 landmarks')
    predicted = review.source_xy(probe.galactic(probe.world_rows([r['catalogRow'] for r in rows])), rotation)
    if not np.allclose(predicted, [r['predictedSourcePixel'] for r in rows], atol=1e-7, rtol=0):
        raise ValueError('Fixed mapping no longer reproduces stored targets')
    with Image.open(review.SOURCE) as original:
        for row, live in zip(rows, associations):
            for key in live:
                if row[key] != live[key]:
                    raise ValueError(f'Landmark drift: {row["name"]}/{key}')
            xy = np.asarray(row['measuredSourcePixel'])
            if not np.isfinite(xy).all() or np.linalg.norm(xy-row['seed']) > 6:
                raise ValueError('Untrusted source center')
            if not (0 <= xy[0] < 6000 and HALF <= xy[1] < 3000-HALF):
                raise ValueError('Source center outside bounded context')
            x, y = np.rint(xy).astype(int)
            patch = np.asarray(review.wrapped_crop(original, (x-8, y-8, x+9, y+9)), dtype=float)
            if patch[6:11, 6:11].mean() <= np.median(patch):
                raise ValueError(f'Inspected center no longer contains bright counterpart: {row["name"]}')
    for live, stored in zip(data['frames'][:2], old['frames']):
        if dict(live, dpr=2) != stored['frame']:
            raise ValueError('Responsive crop drift')
    metadata = old['sourceMetadata']
    for item in metadata['downloads']:
        # Only these public, local provenance files are admitted, never arbitrary paths.
        if item['path'] not in [f'output/hero-sky-prototype/source/{n}' for n in
                               ['eso0932a.jpg', 'eso0932a-page.html', 'eso-copyright.html']]:
            raise ValueError('Unexpected source provenance path')
        if review.digest(probe.ROOT / item['path']) != item['sha256']:
            raise ValueError('Source provenance hash drift')
    hashes = {str(p.relative_to(probe.ROOT)): review.digest(p) for p in
              [OLD, review.OUT / 'alignment.json', probe.RESULTS / 'results.json',
               Path(__file__), Path(review.__file__), Path(probe.__file__),
               probe.BASE / 'metadata/source.json']}
    return data, rows, rotation, {'passed': True, 'sources': checks, 'artifactHashes': hashes,
        'rotationVectorRadians': registration['rotationVectorRadians'],
        'targets': [{'name': r['name'], 'sourceCenter': r['measuredSourcePixel']} for r in rows],
        'frames': [f['frame'] for f in old['frames']], 'writes': False, 'alignmentRefit': False}


def patch_indices(row):
    x, y = np.rint(row['measuredSourcePixel']).astype(int)
    yy, xx = np.mgrid[y-HALF:y+HALF, x-HALF:x+HALF]
    return yy, xx % 6000


def footprint(patch):
    """Connected multiscale excess plus elliptical halo and connected wings; local only."""
    gray = patch.mean(axis=2)
    yy, xx = np.mgrid[:2*HALF, :2*HALF] - HALF
    radius = np.hypot(xx, yy)
    outer = (radius > 24) & (radius < 48)
    background = float(np.median(gray[outer]))
    noise = max(1., float(1.4826*np.median(np.abs((gray-gaussian_filter(gray, 2))[outer]))))
    excess = gaussian_filter(gray, .8)-background
    threshold = max(3*noise, 3.)
    components, _ = label((excess > threshold) & (radius < 32))
    central = components[HALF-2:HALF+3, HALF-2:HALF+3]
    ids = np.unique(central[central > 0])
    if not len(ids):
        return None, {'reason': 'No connected central excess'}
    connected = np.isin(components, ids)
    weights = np.maximum(excess-threshold, 0)*connected
    offsets = np.column_stack((xx.ravel(), yy.ravel()))
    covariance = (offsets.T * weights.ravel()) @ offsets / max(weights.sum(), 1)
    values, axes = np.linalg.eigh(covariance + np.eye(2))
    radii = np.clip(3*np.sqrt(values), 4, 26)
    uv = offsets @ axes
    ellipse = ((uv/radii)**2).sum(axis=1).reshape(gray.shape) <= 1
    # Preserve anisotropic connected wings, rather than forcing a circular PSF.
    core = binary_dilation(connected | ellipse, iterations=2)
    distance = distance_transform_edt(~core)
    alpha = np.clip((4-distance)/4, 0, 1)
    alpha = alpha*alpha*(3-2*alpha)
    clipped = bool((connected & (radius > 29)).any())
    neighbors = np.unique(components[(alpha > 0) & ~connected & (components > 0)])
    return alpha, {'backgroundEncoded8bit': background, 'noiseMadEncoded8bit': noise,
        'otherBrightComponentsInFootprint': int(len(neighbors)),
        'thresholdEncoded8bit': threshold, 'ellipseSemiaxesSourcePx': radii.tolist(),
        'ellipseAxesColumns': axes.tolist(), 'connectedExcessPixels': int(connected.sum()),
        'footprintTruncatedAt32Px': clipped, 'featherSourcePx': 4,
        'saturatedChannelSamples': int((patch >= 250).sum())}


def star_exclusion(patch):
    """Exclude strong sources, not the faint texture needed in this dense field."""
    gray = patch.mean(axis=2)
    high = gray-gaussian_filter(gray, 3)
    mad = max(1., float(1.4826*np.median(np.abs(high-np.median(high)))))
    bright = (high > max(10*mad, 32)) | (patch.max(axis=2) >= 245)
    return binary_dilation(bright, iterations=2)


def continue_structure(patch, missing, excluded):
    """Curvature-minimizing continuation of source-supported low-frequency RGB."""
    valid = ~(missing | excluded)
    gray = patch.mean(axis=2)
    excess = np.maximum(gray-gaussian_filter(gray, 3), 0)
    # Downweight faint point peaks for structure without discarding the surrounding
    # faint population. Texture is drawn separately from actual source residuals.
    weights = valid/(1+(excess/12)**2)
    support = gaussian_filter(weights, 2.5)
    low = np.stack([gaussian_filter(patch[..., c]*weights, 2.5)/np.maximum(support, 1e-8)
                    for c in range(3)], axis=2)
    n = missing.shape[0]
    line = diags([np.ones(n-1), -2*np.ones(n), np.ones(n-1)], [-1, 0, 1], format='csr')
    laplace = kron(eye(n), line, format='csr') + kron(line, eye(n), format='csr')
    unknown = np.flatnonzero(missing.ravel())
    matrix = laplace[:, unknown]
    # Hard known boundary, minimum squared Laplacian: not a plane or opaque fill.
    normal = (matrix.T @ matrix).tocsc()
    known = low.reshape(-1, 3).copy()
    known[unknown] = 0
    solved = spsolve(normal, -(matrix.T @ (laplace @ known)))
    if not np.isfinite(solved).all():
        raise ValueError('Nonfinite structure continuation; reject sample')
    low.reshape(-1, 3)[unknown] = solved
    return low, valid, support


def infer_patch(patch, missing):
    excluded = star_exclusion(patch)
    low, valid, support = continue_structure(patch, missing, excluded)
    # Source-derived high-frequency RGB, NOT random noise or copied full RGB sky.
    original_low = gaussian_filter(patch, (2.5, 2.5, 0))
    residual = patch-original_low
    ring = binary_dilation(missing, iterations=5) & ~missing & valid
    # Guard only strong sources and targets, not every faint star. A donor may
    # contain masked pixels; those are completed from valid source residuals.
    donor_valid = ~binary_dilation(missing | excluded, iterations=5)
    if not ring.any() or not donor_valid.any():
        return None, {'reason': 'No usable source support or texture remains'}
    candidates = []
    ys, xs = np.nonzero(missing)
    for dy in range(-64, 65, 8):
        for dx in range(-64, 65, 8):
            if dx*dx+dy*dy < 24**2:
                continue
            if (ys.min()+dy < 1 or ys.max()+dy >= 191 or
                    xs.min()+dx < 1 or xs.max()+dx >= 191):
                continue
            usable = donor_valid[ys+dy, xs+dx]
            if not usable.any():
                continue
            donor_low = original_low[ys[usable]+dy, xs[usable]+dx]
            mse = float(np.mean((donor_low-low[ys[usable], xs[usable]])**2))
            # Ranking, not an acceptance gate: prefer compatible mostly-intact
            # texture, while permitting completion of a few contaminating peaks.
            score = mse+400*float(1-usable.mean())
            candidates.append((score, dy, dx, mse))
    if not candidates:
        return None, {'reason': 'No usable bounded texture translation'}
    score, dy, dx, mse = min(candidates)
    donor_y, donor_x = ys+dy, xs+dx
    completed = ~donor_valid[donor_y, donor_x]
    _, nearest = distance_transform_edt(~donor_valid, return_indices=True)
    donor_y, donor_x = nearest[:, donor_y, donor_x]
    texture = residual[donor_y, donor_x]
    # Keep source RGB covariance; remove donor DC so no tinted patch is pasted.
    texture = texture-np.mean(texture, axis=0)
    fill = low.copy()
    fill[ys, xs] += texture
    return fill, {'method': 'Weighted source lowpass sigma2.5 + hard-boundary biharmonic continuation + source highpass RGB texture with strong-source completion',
        'donorOffsetSourcePx': [dx, dy], 'donorCompatibilityMseEncoded8bit': mse,
        'donorRankingScore': score, 'donorCompletedPixels': int(completed.sum()),
        'donorLocalPixelsXY': np.column_stack((donor_x, donor_y)).tolist(),
        'donorCandidateCount': len(candidates), 'donorCopiedPixels': int(missing.sum()),
        'donorExclusionDilationPx': 2, 'donorGuardPx': 5,
        'strongExcludedPixels': int(excluded.sum()),
        'boundarySupportPixels': int(ring.sum()), 'cleanSupportPixels': int(valid.sum()),
        'minimumNormalizedSupportInside': float(support[missing].min()),
        'textureRgbStd': texture.std(axis=0).tolist(),
        'structureRangeRgb': [low[missing].min(axis=0).tolist(), low[missing].max(axis=0).tolist()],
        'preclipOutOfRangeChannels': int(((fill[missing] < 0) | (fill[missing] > 255)).sum()),
        'continuityWarning': 'Curvature and source-texture constraints do not prove hidden structure; inspect seams, rings, missing nebulosity and texture repetition.'}


def prepare_masks(source, rows):
    alpha = np.zeros(source.shape[:2], dtype=np.float32)
    cases = []
    for row in rows:
        yy, xx = patch_indices(row)
        local, stats = footprint(source[yy, xx].astype(float))
        record = {'name': row['name'], 'sourceCenter': row['measuredSourcePixel'], 'footprint': stats,
                  'status': 'pending', 'uncertain': row['name'] == 'Alnitak',
                  'caveat': 'Alnitak: adjacent real nebulosity may be erased; questionable sample, not approved' if row['name'] == 'Alnitak' else 'Provisional photo identity; hidden JPEG pixels unknowable'}
        if stats.get('otherBrightComponentsInFootprint', 0):
            record['uncertain'] = True
            record['caveat'] += '; other bright component inside edit footprint: collateral-removal risk'
        if local is None or stats.get('footprintTruncatedAt32Px'):
            record['status'] = 'skipped-unbounded-or-missing-profile'
        else:
            record['localAlpha'] = local
            alpha[yy, xx] = np.maximum(alpha[yy, xx], local)
        cases.append(record)
    return alpha, cases


def reconstruct(source, rows):
    alpha, cases = prepare_masks(source, rows)
    # Reconstruct the explicit union in each support context, then average overlapping
    # predictions. No sequential erasure, and donors never include any target mask.
    total = np.zeros_like(source, dtype=np.float32)
    count = np.zeros(source.shape[:2], dtype=np.uint8)
    accepted = np.zeros_like(alpha)
    for row, case in zip(rows, cases):
        local = case.pop('localAlpha', None)
        if local is None:
            continue
        yy, xx = patch_indices(row)
        fill, info = infer_patch(source[yy, xx].astype(float), alpha[yy, xx] > 0)
        case['reconstruction'] = info
        if fill is None:
            case['status'] = 'skipped-no-reliable-donor'
            continue
        own = local > 0
        gy, gx = yy[own], xx[own]
        total[gy, gx] += fill[own]
        count[gy, gx] += 1
        accepted[gy, gx] = np.maximum(accepted[gy, gx], local[own])
        donor_x, donor_y = np.asarray(info.pop('donorLocalPixelsXY')).T
        case['reconstruction']['donorCoordinates'] = 'Exact native source coordinates after strong-source completion; x modulo6000'
        # Record actual completed donors, not merely the nominal translation.
        donor_name = f'{row["name"]}-donor.json'
        save_json(donor_name, {'sourceSha256': probe.SOURCE_HASH,
            'inferredNotMeasured': True, 'nativeSourcePixelsXY':
            np.column_stack((xx[donor_y, donor_x], yy[donor_y, donor_x])).tolist()})
        case['reconstruction']['donorFile'] = donor_name
        case['status'] = 'questionable-structure-or-neighbor' if case['uncertain'] else 'inferred-unreviewed'
    edited = accepted > 0
    result = source.copy()
    inferred = total[edited]/count[edited, None]
    blended = source[edited]*(1-accepted[edited, None])+inferred*accepted[edited, None]
    result[edited] = np.rint(np.clip(blended, 0, 255)).astype(np.uint8)
    if not np.array_equal(result[~edited], source[~edited]):
        raise ValueError('Outside-mask pixel protection failed')
    Image.fromarray(result).save(OUT / 'native-background.png')
    Image.fromarray(np.rint(accepted*255).astype(np.uint8)).save(OUT / 'native-feather-mask.png')
    Image.fromarray(edited.astype(np.uint8)*255).save(OUT / 'native-edit-union.png')
    # Check the encoded lossless derivative, not just the working array.
    with Image.open(OUT / 'native-background.png') as decoded:
        decoded_array = np.asarray(decoded)
        outside_errors = int(np.any(decoded_array[~edited] != source[~edited], axis=1).sum())
    if outside_errors:
        raise ValueError('Lossless derivative changed protected pixels')
    preservation = {'outsideMaskDifferentPixels': outside_errors, 'outsideMaskExact': True,
        'editUnionPixels': int(edited.sum()), 'fullyInferredPixels': int((accepted == 1).sum()),
        'featherPixels': int(((accepted > 0) & (accepted < 1)).sum()),
        'changedPixels': int(np.any(result != source, axis=2).sum()),
        'overlapPixels': int((count > 1).sum()), 'losslessDecodedCheck': True}
    for row, case in zip(rows, cases):
        yy, xx = patch_indices(row)
        before, after = source[yy, xx], result[yy, xx]
        mask = accepted[yy, xx]
        mask_image = before.copy()
        mask_image[mask > 0] = np.rint(.35*before[mask > 0]+.65*np.array([255, 0, 180])).astype(np.uint8)
        difference = np.abs(after.astype(float)-before.astype(float))
        filename = f'{row["name"]}-native.png'
        strip([Image.fromarray(before), Image.fromarray(mask_image), Image.fromarray(after),
               Image.fromarray(np.clip(difference*4, 0, 255).astype(np.uint8))],
              ['ORIGINAL', 'EDIT/FEATHER magenta', 'BACKGROUND ONLY', 'ABS DIFFERENCE x4'],
              row['name']+' SOURCE NATIVE 1:1 192x192; no enlargement; '+case['status'], filename)
        case['nativeFile'] = filename
        case['patchSourceBoxUnwrapped'] = [int(xx[0, HALF])-HALF, int(yy[0, 0]),
                                           int(xx[0, HALF])+HALF, int(yy[-1, 0])+1]
        case['changedPixelsInContext'] = int(np.any(before != after, axis=2).sum())
        core = mask == 1
        case['coreAfterRgbStd'] = after[core].std(axis=0).tolist() if core.any() else None
        rim = (mask > 0) & (mask < 1)
        case['featherMeanAbsChange'] = float(difference[rim].mean()) if rim.any() else None
    return result, accepted, cases, preservation


def subset_data(data, rows, names, frame, shift):
    indices = sorted({i for row in rows if row['name'] in names for i in row['currentCatalogIndices']})
    result = dict(data, mapped={})
    for key, width in [('origins', 2), ('stars', 4), ('colors', 4)]:
        values = np.asarray(data['mapped'][key]).reshape(-1, width)[indices].copy()
        if key == 'origins':
            # Invert the EXISTING mapped crop equation for a deliberate CSS offset.
            values += np.asarray(shift)/[frame['width'], frame['height']]/[frame['crop']['scaleX'], frame['crop']['scaleY']]
        result['mapped'][key] = values.ravel().tolist()
    return result, indices


def render_frames(source, background, mask, data, rows, rotation, cases):
    names = [c['name'] for c in cases if c['status'] in ['inferred-unreviewed', 'questionable-structure-or-neighbor']]
    reports = []
    for original_frame in data['frames'][:2]:
        frame = dict(original_frame, dpr=2)
        name = f'{frame["width"]}x{frame["height"]}@2x'
        photo, invalid = review.sample(source.astype(np.float32)/255, data, frame, rotation)
        bg, invalid_bg = review.sample(background.astype(np.float32)/255, data, frame, rotation)
        mask_rgb = np.repeat(mask[..., None], 3, axis=2)
        projected_mask, _ = review.sample(mask_rgb, data, frame, rotation)
        mask_view = photo.copy()
        m = projected_mask[..., 0] > 0
        mask_view[m] = .35*photo[m]+.65*np.array([1, 0, .7])
        normal_data, indices = subset_data(data, rows, names, frame, [0, 0])
        moved_data, _ = subset_data(data, rows, names, frame, SHIFT)
        arrays = [photo, mask_view, bg, probe.render_stars(bg, normal_data, frame),
                  probe.render_stars(bg, moved_data, frame)]
        titles = ['ORIGINAL', 'MASK', 'BACKGROUND ALONE', 'SUBSET original position', 'SAME SUBSET shifted']
        images = [probe.image_rgb(a) for a in arrays]
        files = []
        for key, image in zip(['original', 'mask', 'background', 'composite', 'shifted'], images):
            file = f'{name}-{key}.png'
            panel(image, f'{name} {key}; only {len(names)} named targets treated; shiftCSS={SHIFT}').save(OUT / file)
            files.append(file)
        thumbs = []
        for image in images:
            thumb = Image.new('RGB', (384, 320), '#030712')
            resized = image.copy()
            resized.thumbnail((384, 320), Image.Resampling.LANCZOS)
            thumb.paste(resized, (0, 0))
            thumbs.append(thumb)
        strip(thumbs, titles, name+' RESCALED OVERVIEW, not native sharpness proof', f'{name}-overview.png')
        details = []
        observed_world = review.source_world(np.array([r['measuredSourcePixel'] for r in rows]), rotation)
        centers = probe.edge_centers(probe.frame_wcs(data, frame), observed_world, frame['height'])*2
        for row, center in zip(rows, centers):
            x, y = np.rint(center).astype(int)
            if x < HALF or y < HALF or x+HALF > images[0].width or y+HALF > images[0].height:
                details.append({'name': row['name'], 'insideDetailFrame': False})
                continue
            box = (int(x-HALF), int(y-HALF), int(x+HALF), int(y+HALF))
            file = f'{name}-{row["name"]}-detail.png'
            strip([im.crop(box) for im in images], titles,
                  f'{row["name"]} FRAME NATIVE 1:1, DPR2; old photo center exposed; static shiftCSS={SHIFT}', file)
            details.append({'name': row['name'], 'insideDetailFrame': True, 'file': file, 'box': list(box)})
        reports.append({'frame': frame, 'invalidOriginalPixels': invalid, 'invalidBackgroundPixels': invalid_bg,
                        'renderedCatalogIndices': indices, 'files': files, 'details': details})
    return reports


def source_crops(rows):
    with Image.open(review.SOURCE) as source:
        tiles = []
        for row in rows:
            x, y = np.rint(row['measuredSourcePixel']).astype(int)
            tiles.append(review.wrapped_crop(source, (x-HALF, y-HALF, x+HALF, y+HALF)))
        for start in [0, 6]:
            strip(tiles[start:start+6], [r['name'] for r in rows[start:start+6]],
                  'ORIGINAL source native 1:1, twelve provisional identities, no reconstruction',
                  f'source-crops-{start//6+1}.png', source_only=True)


def diagnose_support(rows):
    """Four finite source-patch evaluations; read-only, no full-frame rendering."""
    with Image.open(review.SOURCE) as original:
        source = np.asarray(original)
    alpha, cases = prepare_masks(source, rows)
    for row, case in zip(rows, cases):
        if row['name'] not in ['Betelgeuse', 'Alnitak', 'Sirius', 'Spica']:
            continue
        yy, xx = patch_indices(row)
        patch = source[yy, xx].astype(float)
        missing = alpha[yy, xx] > 0
        local = case.get('localAlpha')
        if local is None:
            print(json.dumps({'name': row['name'], 'status': case['status'],
                              'fillProduced': False, 'changedPixels': 0, 'writes': False}))
            continue
        fill, info = infer_patch(patch, missing)
        result = patch.copy()
        if fill is not None:
            result = np.rint(np.clip(patch*(1-local[..., None])+fill*local[..., None], 0, 255))
        print(json.dumps({'name': row['name'], 'maskPixels': int(missing.sum()),
            'strongExcludedPixels': int(star_exclusion(patch).sum()),
            'boundarySupportPixels': info.get('boundarySupportPixels'),
            'donorCandidates': info.get('donorCandidateCount', 0),
            'completedDonorPixels': info.get('donorCompletedPixels'),
            'changedPixels': int(np.any(result != patch, axis=2).sum()),
            'outsideLocalMaskExact': bool(np.array_equal(result[local == 0], patch[local == 0])),
            'fillProduced': fill is not None, 'writes': False}))


def main():
    global STATUS
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument('--validate-only', action='store_true', help='Read-only source/input/module/landmark hashes and fixed mapping checks; no fitting or writes')
    modes.add_argument('--source-crops-only', action='store_true', help='Short native original-source contact sheets only; no reconstruction or results.json update')
    modes.add_argument('--diagnose-support', action='store_true', help='Read-only four-patch support/donor/fill diagnostic; no full rendering or writes')
    args = parser.parse_args()
    data, rows, rotation, checks = validate()
    if args.validate_only:
        print(json.dumps({'passed': checks['passed'], 'targetCount': len(rows),
            'sourceSha256': checks['sources']['sourceSha256'],
            'liveHashesMatchPhase2': True, 'fixedMappingMatches': True,
            'responsiveFramesMatch': True, 'writes': False, 'alignmentRefit': False}))
        return 0
    if args.diagnose_support:
        diagnose_support(rows)
        return 0
    OUT.mkdir(parents=True, exist_ok=True)
    if args.source_crops_only:
        source_crops(rows)
        print(json.dumps({'sourceCropSheets': 2, 'reconstructionAttempted': False, 'humanApproval': 'not-granted'}))
        return 0
    with Image.open(review.SOURCE) as original:
        source = np.asarray(original).copy()
    background, mask, cases, preservation = reconstruct(source, rows)
    performed = preservation['changedPixels'] > 0
    if not performed:
        STATUS = 'ALL SKIPPED / ZERO EDITS - NO RECONSTRUCTION PROOF'
    frames = render_frames(source, background, mask, data, rows, rotation, cases)
    # Revalidate immutable inputs after processing, including helper code and prior reports.
    _, _, _, after = validate()
    if after != checks:
        raise ValueError('Inputs changed during run; reject these artifacts')
    processed = [c['name'] for c in cases if c['status'] in ['inferred-unreviewed', 'questionable-structure-or-neighbor']]
    report = {'status': STATUS, 'humanApproval': 'not-granted', 'specs': ['S1', 'S2', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'],
        'provenance': checks, 'credit': review.CREDIT, 'license': review.LICENSE,
        'processedNameCount': len(processed), 'processedNames': processed, 'catalogCount': len(data['catalog']),
        'reconstructionPerformed': performed,
        'outcome': 'sample-generated-quality-unreviewed' if performed else 'ALL_SKIPPED_ZERO_EDITS_NO_RECONSTRUCTION_PROOF',
        'scope': 'At most twelve inspected landmarks, NOT all4666stars; all other photo stars retained. Skips are not removal proof; questionable cases require visual inspection, not automatic rejection.',
        'acceptance': {'spec': 'S10', 'userQuote': 'No necesita certeza, sólo que no se vea una mancha evidente',
            'criterion': 'Perceptually inconspicuous at intended/native size and beneath statically shifted stars; reject obvious blotches, holes, ghost halos, seams or visibly destroyed texture, not inferred pixels or lack of physical certainty.',
            'numericalMetrics': 'Descriptive diagnostics, not perceptual pass/fail gates'},
        'method': 'Adaptive connected/elliptical masks; weighted source structure and curvature continuation; translated local source high-frequency RGB texture with strong-source exclusion and nearest-valid completion; cubic feather and overlap averaging.',
        'colorDomain': 'Encoded 8-bit JPEG display RGB; identity grade, NOT physical linear photometry',
        'inferredPixels': 'All edit/feather pixels inferred, never measured behind the removed star; exact union and feather PNGs accompany native-background.png',
        'preservation': preservation, 'cases': cases, 'frames': frames,
        'staticShift': {'cssPixels': SHIFT, 'opacity': 1, 'time': 0, 'purpose': 'Expose former counterpart locations, not a product amplitude or JS parallax implementation'},
        'responsiveContract': 'Unchanged exported SKY_REFERENCE/computeSkyCrop, one stored phase2 rotation, DPR2; no fitting, local warp, crop manipulation, sharpening or global star removal',
        'renderer': 'probe.render_stars actual mapped subset profiles; CPU approximation, not pixel-identical WebGL',
        'visualInspection': 'pending parent and human; numerical continuity/variance cannot establish plausible texture',
        'limitations': ['Saturated/tone-mapped JPEG hidden data cannot be recovered physically.',
            'Biharmonic continuation can erase real dust; donor texture is inferred and can repeat.',
            'Connected masks can miss faint wings or absorb close neighbors; truncated profiles skipped.',
            'Alnitak explicitly questionable due to real nebulosity; reject if erased or seamed.',
            'Donor bright exclusion is heuristic, not a certified complete star segmentation.',
            'Most faint unresolved stars/dust/noise remain exactly outside the native edit union; inside masks they can be lost.',
            'Reprojection interpolation spreads native edits; exact preservation applies only to lossless native derivative.',
            'No application code, actual parallax, human approval, full-catalog removal or runtime proof.']}
    report['outputs'] = [review.asset_record(p) for p in sorted(OUT.glob('*.png'))]
    save_json('results.json', report)
    print(json.dumps({'output': str(OUT.relative_to(probe.ROOT)), 'processedNameCount': len(processed),
        'changedPixels': preservation['changedPixels'], 'editUnionPixels': preservation['editUnionPixels'],
        'outcome': report['outcome'], 'status': STATUS,
        'outsideMaskExact': preservation['outsideMaskExact'], 'humanApproval': 'not-granted'}))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
