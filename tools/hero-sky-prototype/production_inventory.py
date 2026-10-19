"""Full-row inventory and bounded, once-only native connected-group reconstruction."""
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, maximum_filter, label

import probe
import constellation_review as review
import reconstruct_background as recon


def coverage(data):
    """Full time-varying quad envelope, not just center or current twinkle phase."""
    r = data['reference']
    points = np.asarray(data['projected'])
    centers = (points-[r['x0'], r['y0']+r['height']])*[1920/r['width'], -1080/r['height']]
    sizes = np.asarray(data['mapped']['stars']).reshape(-1, 4)[:, 1]
    inside = ((centers >= 0) & (centers <= [1920, 1080])).all(axis=1)
    visible = ((centers+sizes[:, None] >= 0) &
               (centers-sizes[:, None] <= [1920, 1080])).all(axis=1)
    return centers, visible, inside


def context(source, x, y):
    yy, xx = np.mgrid[y-96:y+96, x-96:x+96]
    if yy.min() < 0 or yy.max() >= 3000:
        raise ValueError('Nonperiodic Y context crosses source pole')
    return source[yy, xx % 6000].astype(float), yy, xx % 6000


def inventory(source, data, rotation, recipe, inspected):
    # Preserve the already inspected identities/centers (including all identical
    # Alnitak components), rather than demoting approved samples to blind peaks.
    anchors = {(r['catalogRow']['ra'], r['catalogRow']['dec']): r for r in inspected}
    centers, visible, inside = coverage(data)
    predicted = review.source_xy(probe.galactic(probe.world_rows(data['catalog'])), rotation)
    rows, candidates = [], []
    for i, (row, xy) in enumerate(zip(data['catalog'], predicted)):
        record = {'id': f'catalog-{i:05d}', 'catalogIndex': i, 'catalogRow': row,
                  'predictedSourcePixel': xy.tolist(), 'canonicalCenterCss': centers[i].tolist(),
                  'footprintVisible': True, 'canonicalQuadVisible': bool(visible[i]),
                  'haloOnly': bool(not inside[i]),
                  'status': 'unresolved', 'reason': 'pending local verification',
                  'sourceGroup': None, 'peak': None, 'mask': None, 'donor': None}
        rows.append(record)
        # Keep all 64 catalog-envelope halo-only rows for photographic checks.
        # A photograph's PSF/halo need not fit the renderer's much smaller quad;
        # quad nonintersection is not sufficient evidence of nonobservability.
        x, y = np.rint(xy).astype(int)
        if y < 96 or y >= 2904:
            record['reason'] = 'Visible prediction lacks nonperiodic Y context; no polar wrapping'
            continue
        patch, _, _ = context(source, x, y)
        gray = patch.mean(axis=2)
        smooth = gaussian_filter(gray, recipe['detectionSigma'])
        high = smooth-gaussian_filter(gray, 3)
        noise = max(1., float(1.4826*np.median(np.abs(high-np.median(high)))))
        threshold = max(recipe['minimumExcessEncoded8bit'], recipe['noiseMultiplier']*noise)
        yy, xx = np.mgrid[:192, :192]
        radius = recipe['searchRadiusSourcePx']
        search = (xx-96)**2+(yy-96)**2 <= radius**2
        found = np.column_stack(np.nonzero(search & (high == maximum_filter(high, 3)) & (high > threshold)))
        peaks = sorted([(float(np.hypot(px-96, py-96)), -float(high[py, px]), int(py), int(px))
                        for py, px in found])
        record['detection'] = {'noiseMad': noise, 'threshold': threshold,
                               'searchRadiusSourcePx': radius, 'candidateCount': len(peaks),
                               'candidatesLocalYX': found.tolist()}
        if not peaks:
            # Distinguish a flat/noise neighborhood from a broad, saturated or off-axis excess.
            excess = float(high[search].max())
            saturated = bool((patch[90:103, 90:103] >= 250).any())
            if excess < threshold and not saturated:
                record.update(status='nonobservable', reason='No locally distinguishable counterpart above recorded noise threshold; not removal success')
            else:
                record['reason'] = 'Broad/saturated excess without distinguishable local peak'
            continue
        anchor = anchors.get((row['ra'], row['dec']))
        if anchor:
            record['peak'] = list(anchor['measuredSourcePixel'])
            record['inspectedIdentity'] = {'name': anchor['name'], 'provenance': 'Validated stored phase2 identity/center; twelve-sample appearance approved, complete asset not approved'}
        else:
            _, _, py, px = peaks[0]
            record['peak'] = [int((x+px-96) % 6000), int(y+py-96)]
            if len(peaks) > 1:
                record['reason'] = 'Ambiguous neighboring source peaks inside measured alignment uncertainty'
                continue
        record['peak'] = [int(v) for v in record['peak']]
        peak_x, peak_y = record['peak']
        if peak_y < 96 or peak_y >= 2904:
            record['reason'] = 'Detected peak lacks nonperiodic Y context'
            continue
        patch, gy, gx = context(source, peak_x, peak_y)
        alpha, stats = recon.footprint(patch)
        record['mask'] = stats
        if alpha is None or stats.get('footprintTruncatedAt32Px'):
            record['reason'] = 'Missing or truncated photograph-derived connected PSF/halo'
            continue
        if stats['otherBrightComponentsInFootprint'] and not anchor:
            record['reason'] = 'Mask includes unidentified bright neighbor; collateral-removal review required'
            continue
        record['reviewWarnings'] = []
        if stats['otherBrightComponentsInFootprint']:
            record['reviewWarnings'].append('Inspected sample has other bright components in footprint; compare approved source-native sample, no automatic quality pass')
        if stats['saturatedChannelSamples']:
            record['reviewWarnings'].append('Saturation present in source context; inspect reconstructed halo/texture')
        if peak_x < 96 or peak_x >= 5904:
            record['reviewWarnings'].append('Periodic X seam context; inspect source-native continuity')
        own = alpha > 0
        candidates.append({'index': i, 'y': gy[own], 'x': gx[own], 'alpha': alpha[own]})
        record['reason'] = 'Locally verified provisional counterpart; grouping pending'
    return rows, candidates


def infer_group(patch, missing, other_targets):
    """Adapt the approved two-argument helper only when separate exclusions exist.

    infer_patch couples its solve mask to donor exclusion and cannot accept other
    targets as support-only exclusions. Keep its method/ranking/completion here,
    reusing its structure/source-exclusion owners without mutating their globals.
    """
    if not other_targets.any():
        return recon.infer_patch(patch, missing)
    excluded = recon.star_exclusion(patch) | other_targets
    low, valid, support = recon.continue_structure(patch, missing, excluded)
    original_low = gaussian_filter(patch, (2.5, 2.5, 0))
    residual = patch-original_low
    ring = recon.binary_dilation(missing, iterations=5) & ~missing & valid
    donor_valid = ~recon.binary_dilation(missing | excluded, iterations=5)
    if not ring.any() or not donor_valid.any():
        return None, {'reason': 'No usable source support or texture remains'}
    ys, xs = np.nonzero(missing)
    candidates = []
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
            score = mse+400*float(1-usable.mean())
            candidates.append((score, dy, dx, mse))
    if not candidates:
        return None, {'reason': 'No usable bounded texture translation'}
    score, dy, dx, mse = min(candidates)
    donor_y, donor_x = ys+dy, xs+dx
    completed = ~donor_valid[donor_y, donor_x]
    _, nearest = recon.distance_transform_edt(~donor_valid, return_indices=True)
    donor_y, donor_x = nearest[:, donor_y, donor_x]
    texture = residual[donor_y, donor_x]
    texture = texture-np.mean(texture, axis=0)
    fill = low.copy()
    fill[ys, xs] += texture
    return fill, {'method': 'Approved weighted structure + source highpass RGB texture; other target groups excluded from support/donors, not solved',
        'donorOffsetSourcePx': [dx, dy], 'donorCompatibilityMseEncoded8bit': mse,
        'donorRankingScore': score, 'donorCompletedPixels': int(completed.sum()),
        'donorLocalPixelsXY': np.column_stack((donor_x, donor_y)).tolist(),
        'donorCandidateCount': len(candidates), 'donorCopiedPixels': int(missing.sum()),
        'donorExclusionDilationPx': 2, 'donorGuardPx': 5,
        'strongExcludedPixels': int(recon.star_exclusion(patch).sum()),
        'boundarySupportPixels': int(ring.sum()), 'cleanSupportPixels': int(valid.sum()),
        'minimumNormalizedSupportInside': float(support[missing].min()),
        'textureRgbStd': texture.std(axis=0).tolist(),
        'structureRangeRgb': [low[missing].min(axis=0).tolist(), low[missing].max(axis=0).tolist()],
        'preclipOutOfRangeChannels': int(((fill[missing] < 0) | (fill[missing] > 255)).sum()),
        'continuityWarning': 'Inspect inferred structure, seams, halos and texture repetition; numerical support is not visual approval.'}


def reconstruct(source, rows, candidates, out, recipe, dump):
    """One global union/label pass; only 192-square contexts enter sparse solves."""
    union = np.zeros((3000, 6000), dtype=np.float32)
    for c in candidates:
        union[c['y'], c['x']] = np.maximum(union[c['y'], c['x']], c['alpha'])
    labels, n = label(union > 0, structure=np.ones((3, 3)))
    parent = list(range(n+1))

    def root(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    # Longitude seam connectivity without connecting north and south.
    for y in range(3000):
        a = int(labels[y, 0])
        if a:
            for b in labels[max(0, y-1):min(3000, y+2), -1]:
                if b:
                    parent[root(int(b))] = root(a)
    groups = {}
    for c in candidates:
        ids = np.unique(labels[c['y'], c['x']])
        roots = {root(int(v)) for v in ids if v}
        if len(roots) != 1:
            raise ValueError('A connected source mask unexpectedly split')
        groups.setdefault(roots.pop(), []).append(c)
    result = source.copy()
    accepted = np.zeros((3000, 6000), dtype=np.uint8)
    group_reports = []
    for members in sorted(groups.values(), key=lambda group: min(c['index'] for c in group)):
        indices = sorted(c['index'] for c in members)
        gid = f'group-{indices[0]:05d}'
        ys = np.concatenate([c['y'] for c in members])
        xs = np.concatenate([c['x'] for c in members])
        base = int(xs[0])
        unwrapped = base+(xs-base+3000) % 6000-3000
        x = int(np.rint((unwrapped.min()+unwrapped.max())/2)) % 6000
        y = int(np.rint((ys.min()+ys.max())/2))
        extent = [int(np.ptp(unwrapped)+1), int(np.ptp(ys)+1)]
        report = {'id': gid, 'catalogIndices': indices, 'extentSourcePx': extent,
                  'status': 'unresolved', 'contextCenterSourcePixel': [x, y]}
        group_reports.append(report)
        for i in indices:
            rows[i]['sourceGroup'] = gid
        reason = 'Connected group exceeds bounded 64px donor/context extent'
        fill = None
        if max(extent) <= recipe['maximumGroupExtentSourcePx'] and 96 <= y < 2904:
            patch, gy, gx = context(source, x, y)
            local_targets = union[gy, gx] > 0
            ids = np.unique(labels[ys, xs])
            own = np.isin(labels[gy, gx], ids) & local_targets
            other_targets = local_targets & ~own
            fill, info = infer_group(patch, own, other_targets)
            info.update(solveMaskPixels=int(own.sum()), otherTargetMaskPixels=int(other_targets.sum()))
            report['reconstruction'] = info
            reason = info.get('reason', 'Context source texture inferred; pending visual review')
        if fill is not None:
            # Validate completed (not merely nominal translated) donor coordinates
            # before any edit. Solves and donors must never absorb another group.
            donors = np.asarray(info['donorLocalPixelsXY'])
            if (donors.shape != (int(own.sum()), 2) or not np.isfinite(donors).all() or
                    not np.equal(donors, np.rint(donors)).all() or
                    (donors < 0).any() or (donors >= 192).any()):
                raise ValueError('Invalid completed group donor coordinates')
            donor_x, donor_y = donors.astype(int).T
            if local_targets[donor_y, donor_x].any():
                raise ValueError('Completed group donor overlaps a target mask')
            info['donorOverlapsAnyTargetPixels'] = 0
            if accepted[gy[own], gx[own]].any():
                raise ValueError('Repeated erasure of connected group')
            alpha = union[gy, gx][own, None]
            result[gy[own], gx[own]] = np.rint(np.clip(patch[own]*(1-alpha)+fill[own]*alpha, 0, 255)).astype(np.uint8)
            accepted[gy[own], gx[own]] = 255
            donor_x, donor_y = np.asarray(info.pop('donorLocalPixelsXY')).T
            donor_file = f'{gid}-donor.json'
            dump(out/donor_file, {'sourceSha256': probe.SOURCE_HASH,
                 'nativeSourcePixelsXY': np.column_stack((gx[donor_y, donor_x], gy[donor_y, donor_x])).tolist()})
            report.update(status='treated', maskPixels=int(own.sum()), donorFile=donor_file,
                          saturated=any(rows[i]['mask']['saturatedChannelSamples'] for i in indices))
            for j, i in enumerate(indices):
                rows[i].update(status='treated' if j == 0 else 'merged', reason=reason,
                               donor=donor_file, mergedInto=rows[indices[0]]['id'] if j else None)
        else:
            report['reason'] = reason
            for i in indices:
                rows[i]['reason'] = reason
    Image.fromarray(result).save(out/'native-background.png')
    Image.fromarray(accepted).save(out/'native-edit-union.png')
    with Image.open(out/'native-background.png') as im:
        decoded = np.asarray(im)
    outside = int(np.any(decoded[accepted == 0] != source[accepted == 0], axis=1).sum())
    if outside:
        raise ValueError('Decoded native derivative changed pixels outside edit union')
    return result, group_reports, {'outsideMaskDifferentPixels': outside,
        'editUnionPixels': int(np.count_nonzero(accepted)),
        'changedPixels': int(np.any(decoded != source, axis=2).sum())}


def diagnostics(source, background, rows, out):
    """Every unresolved visible row has an explicit native preview locator."""
    chosen = [r for r in rows if r['status'] == 'unresolved' and r['footprintVisible']]
    # Also preserve comparison to all twelve approved sample locations.
    _, landmarks, _, _ = recon.validate()
    points = [(r, r['peak'] or r['predictedSourcePixel']) for r in chosen]
    points += [({'id': r['name']}, r['measuredSourcePixel']) for r in landmarks]
    for record, xy in points:
        x, y = np.rint(xy).astype(int)
        y = int(np.clip(y, 96, 2903))
        a, _, _ = context(source, x, y)
        b, _, _ = context(background, x, y)
        tile = Image.new('RGB', (384, 216), '#030712')
        tile.paste(Image.fromarray(a.astype(np.uint8)), (0, 0))
        tile.paste(Image.fromarray(b.astype(np.uint8)), (192, 0))
        ImageDraw.Draw(tile).text((2, 196), record['id']+' original | inferred; native 1:1', fill='white')
        name = record['id']+'-native.png'
        tile.save(out/name)
        record['preview'] = name
        record['previewSourceBoxUnwrapped'] = [int(x-96), y-96, int(x+96), y+96]
