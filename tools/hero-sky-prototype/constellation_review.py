#!/usr/bin/env python3
"""Offline constellation-assisted sharpness candidates; never grants human approval."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from astropy.coordinates import SkyCoord
from astropy import units as u
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, map_coordinates
from scipy.optimize import least_squares
from scipy.spatial.transform import Rotation

import probe  # Reuse immutable geometry, frame conversion and actual mapped CPU profile.

OUT = probe.BASE / 'sharpness-review'
LANDMARKS = Path(__file__).with_name('landmarks.json')
SOURCE = probe.BASE / 'source/eso0932a.jpg'
SKY_MODULES = probe.ROOT / 'app/(home)/_sections/hero/capabilities/night-sky'
CREDIT = 'ESO/S. Brunier | CC BY 4.0'
STATUS = 'CANDIDATE - awaiting user approval'
LICENSE = 'https://creativecommons.org/licenses/by/4.0/'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(name, value):
    (OUT / name).write_text(json.dumps(value, indent=2, allow_nan=False) + '\n')


def validate():
    """Read-only: hashes, geometry and named locator associations, no peak fitting."""
    data = probe.read_inputs()
    landmarks = json.loads(LANDMARKS.read_text())
    hashes = {name: digest(SKY_MODULES / name) for name in data['hashes']}
    if hashes != data['hashes']:
        raise ValueError('Stale exported source hashes; stop and ask parent to re-export')
    if digest(SOURCE) != probe.SOURCE_HASH or landmarks['sourceSha256'] != probe.SOURCE_HASH:
        raise ValueError('Source hash mismatch; stop')
    with Image.open(SOURCE) as im:
        if im.size != (6000, 3000) or im.mode != 'RGB':
            raise ValueError('Source dimensions/mode mismatch')
    geom = probe.geometry(data)
    if not geom['passed']:
        raise ValueError('Actual exported geometry disagrees with independent STG')
    catalog = data['controlCatalog']
    coordinates = SkyCoord(probe.world_rows(catalog) * u.deg, frame='fk5', equinox='J2000')
    associations = []
    for item in landmarks['landmarks']:
        ra, dec = item['locator']
        locator = SkyCoord(ra=ra * 15 * u.deg, dec=dec * u.deg, frame='fk5', equinox='J2000')
        distances = coordinates.separation(locator).arcsec
        closest = float(distances.min())
        if closest > 60:
            raise ValueError(f'No supported BSC5 row for {item["name"]}')
        tied = np.flatnonzero(np.abs(distances - closest) < 1e-6).tolist()
        # Alnitak has two exported rows with IDENTICAL rounded coordinates.
        # Select the brighter component, retaining both rows as provenance.
        index = min(tied, key=lambda i: (catalog[i]['mag'], i))
        current = [i for i, row in enumerate(data['catalog']) if row == catalog[index]]
        if item['split'] == 'fit' and not current:
            raise ValueError(f'Orion landmark absent from actual current catalog: {item["name"]}')
        associations.append(dict(item, controlCatalogIndex=index, catalogRow=catalog[index],
            currentCatalogIndices=current, locatorDistanceArcsec=float(distances[index]),
            identicalDistanceRows=[{'index': i, 'row': catalog[i]} for i in tied],
            associationRule='Closest angular row; equal-distance ties within 1e-6 arcsec use brighter magnitude, then row index'))
    if len({s['controlCatalogIndex'] for s in associations}) != len(associations):
        raise ValueError('Duplicate named catalog associations')
    return data, associations, {'passed': True, 'sourceSha256': probe.SOURCE_HASH,
        'inputJsonSha256': digest(probe.BASE / 'input/current-sky.json'),
        'landmarksSha256': digest(LANDMARKS), 'moduleHashes': hashes, 'geometry': geom,
        'catalogAssociations': associations, 'landmarkProvenance': landmarks}


def vectors(gb):
    lon, lat = np.deg2rad(gb).T
    return np.column_stack((np.cos(lat)*np.cos(lon), np.cos(lat)*np.sin(lon), np.sin(lat)))


def source_xy(gb, rotation):
    xyz = rotation.apply(vectors(gb))
    lon = np.rad2deg(np.arctan2(xyz[:, 1], xyz[:, 0]))
    lat = np.rad2deg(np.arcsin(np.clip(xyz[:, 2], -1, 1)))
    return np.column_stack(((3000 - lon * 6000 / 360) % 6000, 1500 - lat * 3000 / 180))


def source_world(xy, rotation):
    gb = np.column_stack(((3000 - xy[:, 0]) * 360 / 6000, (1500 - xy[:, 1]) * 180 / 3000))
    xyz = rotation.inv().apply(vectors(gb))
    sky = SkyCoord(l=np.arctan2(xyz[:, 1], xyz[:, 0]) * u.rad,
                   b=np.arcsin(np.clip(xyz[:, 2], -1, 1)) * u.rad, frame='galactic')
    eq = sky.transform_to(SkyCoord(0*u.deg, 0*u.deg, frame='fk5', equinox='J2000').frame)
    return np.column_stack((eq.ra.degree, eq.dec.degree))


def delta_pixels(a, b):
    delta = a - b
    delta[:, 0] = (delta[:, 0] + 3000) % 6000 - 3000
    return delta


def align(original, associations, data):
    # Explicit inspected seeds only: a tiny detection-only patch, not blind peak matching.
    measured = []
    for row in associations:
        x, y = row['seed']
        patch = np.asarray(original.crop((x-7, y-7, x+8, y+8)), dtype=float).mean(axis=2)
        detection = gaussian_filter(patch, 1.5)[3:-3, 3:-3]
        iy, ix = np.unravel_index(np.argmax(detection), detection.shape)
        measured.append([x + int(ix) - 4, y + int(iy) - 4])
    measured = np.asarray(measured, dtype=float)
    world = probe.world_rows([s['catalogRow'] for s in associations])
    gb = probe.galactic(world)
    fit = np.array([s['split'] == 'fit' for s in associations])
    solution = least_squares(lambda p: delta_pixels(source_xy(gb[fit], Rotation.from_rotvec(p)),
                                                      measured[fit]).ravel(),
                             np.zeros(3), bounds=(-.15, .15), max_nfev=80)
    if not solution.success:
        raise ValueError('Bounded Orion rotation fit failed; do not manufacture alignment')
    rotation = Rotation.from_rotvec(solution.x)
    predicted = source_xy(gb, rotation)
    observed_world = source_world(measured, rotation)
    frames = []
    for f in data['frames'][:3]:
        expected = probe.edge_centers(probe.frame_wcs(data, f), world, f['height'])
        observed = probe.edge_centers(probe.frame_wcs(data, f), observed_world, f['height'])
        offsets = np.linalg.norm(observed - expected, axis=1)
        inside = ((expected >= 0) & (expected < [f['width'], f['height']])).all(axis=1)
        frames.append({'css': [f['width'], f['height']], 'landmarks': [
            {'name': row['name'], 'insideFrame': bool(inside[i]), 'expectedCss': expected[i].tolist(),
             'offsetCssPx': float(offsets[i]), 'offsetNativePxAt2x': float(offsets[i]*2)}
            for i, row in enumerate(associations)]})
    rows = [dict(row, measuredSourcePixel=measured[i].tolist(),
                 predictedSourcePixel=predicted[i].tolist(),
                 offsetSourcePx=float(np.linalg.norm(delta_pixels(predicted[i:i+1], measured[i:i+1]))))
            for i, row in enumerate(associations)]
    return rotation, {'status': 'Tentative global mapping; inspect named patterns and held-outs',
        'model': 'Galactic CAR after ONE global 3D rotation; fixed 6000x3000 scale and handedness',
        'rotationVectorRadians': solution.x.tolist(), 'rotationMatrix': rotation.as_matrix().tolist(),
        'equation': 'v=R*GalacticUnitVector(FK5 J2000); x=(3000-atan2(vy,vx)*6000/(2pi))%6000; y=1500-asin(vz)*3000/pi',
        'freeParameters': 3, 'boundsRotvecRadians': [-.15, .15],
        'fitGroup': 'Seven principal Orion stars, belt + both shoulders + both feet',
        'heldOutGroup': 'Sirius, Canopus, Aldebaran, Regulus, Spica; NEVER used to fit rotation',
        'landmarks': rows, 'frameOffsets': frames,
        'uncertainty': 'At least 5 source px per inspected seed; integer smoothed-peak proxy, not an astrometric centroid. '
                       'Orion-only fit extrapolation and held-out identities remain provisional; no catalog epoch/proper-motion correction or external plate solution.',
        'threshold': 'No 0.5px gate. Errors reported without filtering or declaring human approval.'}


def panel(image, title):
    # Wrapping is needed for narrow mobile panels; every review footer has full credit.
    lines = [title, STATUS, CREDIT, LICENSE,
             'Modified: rotation/reprojection, catalog overlay where labeled, encoding.',
             'No subtraction or sharpening; CPU time 0 / opacity 1; not an app screenshot.']
    import textwrap
    lines = [part for line in lines for part in textwrap.wrap(line, width=max(25, (image.width-16)//6))]
    out = Image.new('RGB', (image.width, image.height + 12 + 15*len(lines)), '#030712')
    out.paste(image, (0, 0))
    draw = ImageDraw.Draw(out)
    for i, line in enumerate(lines):
        draw.text((8, image.height+6+i*15), line, fill='#ffd080' if 'CANDIDATE' in line else 'white')
    return out


def wrapped_crop(image, box):
    x0, y0, x1, y1 = box
    # Only longitude wraps. These inspection boxes never cross a polar boundary.
    if y0 < 0 or y1 > image.height:
        raise ValueError('Inspection crop crosses polar boundary')
    out = Image.new('RGB', (x1-x0, y1-y0))
    for shift in [-image.width, 0, image.width]:
        left, right = max(x0, shift), min(x1, shift+image.width)
        if right > left:
            out.paste(image.crop((left-shift, y0, right-shift, y1)), (left-x0, 0))
    return out


def identity_panels(original, registration, data):
    rows = registration['landmarks']
    crop = original.crop((5350, 1550, 5850, 2000))
    draw = ImageDraw.Draw(crop)
    for row in rows[:7]:
        x, y = np.array(row['measuredSourcePixel']) - [5350, 1550]
        draw.ellipse((x-7, y-7, x+7, y+7), outline='cyan')
        label = (325, 310 + 23*(rows.index(row)-4)) if row['name'] in ['Mintaka', 'Alnilam', 'Alnitak'] else (x+9, y-10)
        draw.line((x, y, *label), fill='cyan')
        draw.text(label, row['name'], fill='cyan')
    panel(crop, 'ORIGINAL JPEG native 1:1: Orion pattern / provisional identities').save(OUT / 'orion-original-annotated.png')
    # Diagram uses the ACTUAL current crop and catalog coordinates, not seed geometry.
    f = data['frames'][0]
    world = probe.world_rows([r['catalogRow'] for r in rows[:7]])
    points = probe.edge_centers(probe.frame_wcs(data, f), world, f['height'])
    diagram = Image.new('RGB', (700, 600), '#030712')
    lo, hi = points.min(axis=0), points.max(axis=0)
    scale = min(530/(hi[0]-lo[0]), 450/(hi[1]-lo[1]))
    p = (points-lo)*scale + [50, 50]
    d = ImageDraw.Draw(diagram)
    for a, b in [(0, 2), (2, 4), (4, 5), (5, 6), (6, 0), (4, 1), (6, 3), (1, 3)]:
        d.line((*p[a], *p[b]), fill='#405070', width=2)
    for row, (x, y) in zip(rows, p):
        d.ellipse((x-4, y-4, x+4, y+4), fill='white')
        d.text((x+8, y), row['name'], fill='white')
    panel(diagram, 'Current catalog STG diagram (rescaled overview, NOT native sky pixels)').save(OUT / 'orion-current-catalog-diagram.png')
    sheet = Image.new('RGB', (1200, 260), '#030712')
    for i, row in enumerate(rows[7:]):
        x, y = np.rint(row['measuredSourcePixel']).astype(int)
        tile = wrapped_crop(original, (x-120, y-120, x+120, y+120))
        d = ImageDraw.Draw(tile)
        d.ellipse((113, 113, 127, 127), outline='cyan')
        dx, dy = delta_pixels(np.array([row['predictedSourcePixel']]), np.array([[x, y]]))[0]
        d.line((120+dx-7, 120+dy, 120+dx+7, 120+dy), fill='lime')
        d.line((120+dx, 120+dy-7, 120+dx, 120+dy+7), fill='lime')
        sheet.paste(tile, (i*240, 0))
        ImageDraw.Draw(sheet).text((i*240+4, 242), row['name']+' HELD-OUT / tentative', fill='white')
    panel(sheet, 'Original native 1:1 held-outs: cyan=inspected seed peak, green=Orion-only prediction; seam wraps').save(OUT / 'distributed-checks.png')


def sample(source, data, frame, rotation):
    wcs, dpr = probe.frame_wcs(data, frame), frame['dpr']
    width, height = frame['width']*dpr, frame['height']*dpr
    output = np.empty((height, width, 3), dtype=np.float32)
    invalid = 0
    for y0 in range(0, height, 96):
        yy, xx = np.mgrid[y0:min(y0+96, height), :width]
        css = np.column_stack(((xx.ravel()+.5)/dpr-.5, frame['height']-(yy.ravel()+.5)/dpr-.5))
        xy = source_xy(probe.galactic(wcs.all_pix2world(css, 0)), rotation)
        valid = np.isfinite(xy).all(axis=1) & (xy[:, 1] >= 0) & (xy[:, 1] <= 2999)
        invalid += int((~valid).sum())
        coords = [np.clip(xy[:, 1], 0, 2999), xy[:, 0]]
        for c in range(3):
            values = map_coordinates(source[..., c], coords, order=1, mode='grid-wrap', prefilter=False)
            values[~valid] = [1, 0, 1][c]  # Expose holes, NEVER blur-fill.
            output[y0:y0+yy.shape[0], :, c] = values.reshape(yy.shape)
    return output, invalid


def asset_record(path):
    with Image.open(path) as im:
        im.load()
        width, height = im.size
        return {'file': path.name, 'bytes': path.stat().st_size, 'sha256': digest(path),
                'dimensions': [width, height], 'decodedRgbBytes': width*height*3,
                'decodedRgbaBytes': width*height*4}


def native_details(name, images, frame, data, rows):
    photo = np.asarray(images['photo'][0], dtype=float).mean(axis=2)
    h, w = photo.shape
    half = 96
    # Dust is a statistics-selected faint-structure candidate, not an invented identification.
    grid = [(x, y, photo[y-half:y+half, x-half:x+half].mean(),
             photo[y-half:y+half, x-half:x+half].std())
            for y in range(half, h-half, 192) for x in range(half, w-half, 192)]
    low = np.percentile([r[2] for r in grid], 40)
    dust = max((r for r in grid if r[2] <= low), key=lambda r: r[3])
    points = [('faint-dust-candidate', dust[:2]), ('edge', (w-half, half))]
    bright = rows[0]
    world = probe.world_rows([bright['catalogRow']])
    center = probe.edge_centers(probe.frame_wcs(data, frame), world, frame['height'])[0]*frame['dpr']
    if (center >= half).all() and (center < [w-half, h-half]).all():
        points.insert(0, ('Betelgeuse-bright-point', center))
        belt = probe.world_rows([rows[5]['catalogRow']])
        belt_center = probe.edge_centers(probe.frame_wcs(data, frame), belt, frame['height'])[0]*frame['dpr']
        if (belt_center >= half).all() and (belt_center < [w-half, h-half]).all():
            points.insert(1, ('Orion-belt', belt_center))
    else:
        inside = max(grid, key=lambda r: photo[int(r[1])-half:int(r[1])+half, int(r[0])-half:int(r[0])+half].max())
        points.insert(0, ('bright-region-candidate', inside[:2]))
    result = []
    for label, center in points:
        x, y = np.rint(center).astype(int)
        box = (int(x-half), int(y-half), int(x+half), int(y+half))
        sheet = Image.new('RGB', (192*3, 212*2), '#030712')
        metrics = []
        for row_index, key in enumerate(['photo', 'composite']):
            reference = np.asarray(images[key][0].crop(box), dtype=float)
            for column, image in enumerate(images[key]):
                tile = image.crop(box)  # Exact native 1:1; NEVER resized.
                sheet.paste(tile, (column*192, row_index*212))
                title = f'{key} / '+['PNG', 'WebP90', 'WebP95'][column]
                ImageDraw.Draw(sheet).text((column*192+3, row_index*212+194), title, fill='white')
                error = np.asarray(tile, dtype=float)-reference
                metrics.append({'kind': key, 'encoding': ['PNG', 'WebP90', 'WebP95'][column],
                                'rmseEncoded8bit': float(np.sqrt(np.mean(error**2)))})
        file = f'{name}-native-{label}.png'
        panel(sheet, f'NATIVE 1:1 192x192 crops: {label}; display at 100%, no sharpening').save(OUT / file)
        result.append({'file': file, 'boxNativePixels': list(box), 'metrics': metrics,
                       'selection': 'Named catalog point when inside; otherwise image-statistics candidate. Dust semantics unconfirmed.'})
    return result


def render(original, data, rotation, registration):
    source = np.asarray(original, dtype=np.float32)/255
    variants, details, frame_reports, thumbnails = [], [], [], []
    for original_frame in data['frames'][:2]:
        frame = dict(original_frame, dpr=2)  # Reuse actual CSS crop unchanged, including mobile.
        name = f"{frame['width']}x{frame['height']}@2x"
        photo, invalid = sample(source, data, frame, rotation)
        base = np.empty_like(photo)
        base[:] = np.array([3, 7, 18])/255
        arrays = {'photo': photo, 'current-stars-only': probe.render_stars(base, data, frame),
                  'composite': probe.render_stars(photo, data, frame)}
        decoded = {}
        overview = Image.new('RGB', (1440, 410), '#030712')
        for column, (key, array) in enumerate(arrays.items()):
            im = probe.image_rgb(array)
            decoded[key] = [im]
            png = OUT / f'{name}-{key}.png'
            im.save(png)
            variants.append(dict(asset_record(png), kind=key, encoding='lossless PNG reference', skyOnly=True))
            panel(im, f'{name} {key}; SAME crop/identity grade').save(OUT / f'{name}-{key}-panel.png')
            for quality in [90, 95]:
                path = OUT / f'{name}-{key}-q{quality}.webp'
                im.save(path, 'WEBP', quality=quality, method=4)
                variants.append(dict(asset_record(path), kind=key, quality=quality, skyOnly=True))
                with Image.open(path) as encoded:
                    decoded[key].append(encoded.convert('RGB'))
            thumb = im.copy()
            thumb.thumbnail((480, 360), Image.Resampling.LANCZOS)
            overview.paste(thumb, (column*480, 0))
            ImageDraw.Draw(overview).text((column*480+8, 370), name+' '+key+' OVERVIEW', fill='white')
        thumbnails.append(overview)
        details.extend(native_details(name, decoded, frame, data, registration['landmarks']))
        frame_reports.append({'frame': frame, 'invalidCoveragePixels': invalid,
                              'coverageFraction': 1-invalid/(photo.shape[0]*photo.shape[1])})
    contact = Image.new('RGB', (1440, 820), '#030712')
    for i, thumb in enumerate(thumbnails):
        contact.paste(thumb, (0, i*410))
    panel(contact, 'OVERVIEW thumbnails only; inspect native detail sheets separately').save(OUT / 'contact-sheet.png')
    return {'variants': variants, 'nativeDetails': details, 'frames': frame_reports}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument('--validate-only', action='store_true', help='Read-only hashes, actual STG geometry and named BSC5 row validation; no fitting/writes')
    modes.add_argument('--alignment-only', action='store_true', help='Bounded inspected-seed rotation and identity panels only; no full-frame rendering')
    args = parser.parse_args()
    data, associations, checks = validate()
    if args.validate_only:
        print(json.dumps(checks, indent=2, allow_nan=False))
        return 0
    OUT.mkdir(parents=True, exist_ok=True)
    with Image.open(SOURCE) as original:
        rotation, registration = align(original, associations, data)
        identity_panels(original, registration, data)
        write_json('alignment.json', registration)
        if args.alignment_only:
            print(json.dumps({'alignment': str(OUT / 'alignment.json'), 'humanApproval': 'not-granted'}))
            return 0
        outputs = render(original, data, rotation, registration)
    report = {'status': STATUS, 'humanApproval': 'not-granted', 'specs': ['S1', 'S2', 'S5', 'S6', 'S7', 'S8'],
        'sources': checks, 'sourceMetadata': json.loads((probe.BASE / 'metadata/source.json').read_text()),
        'credit': CREDIT, 'license': LICENSE, 'registration': registration, **outputs,
        'cropContract': 'Immutable exported SKY_REFERENCE/computeSkyCrop; frame_wcs and mapped buffers from probe.py; ONE rotation reused for every frame. DPR 2 only changes raster density.',
        'grade': 'Identity normalized encoded JPEG RGB, bilinear reprojection; identical PNG/WebP inputs; no sharpening, upscale filter or local warp',
        'renderer': 'probe.render_stars: actual mapped current-star profile approximation, time0, opacity1. NOT pixel-identical WebGL.',
        'subtraction': {'attempted': False, 'reason': 'Photo preserved intact; photo+canvas duplicates deliberately remain visible.'},
        'limitations': ['Provisional identities, not externally solved WCS; held-outs can challenge but not certify source identities.',
                        'Source stitching, JPEG PSF, proper motion and epoch are unresolved; captioned planets are not catalog identifications.',
                        '4K raster does not imply 4K photographic detail everywhere: native source scale varies with latitude and STG reprojection.',
                        'Native crops expose interpolation and codec loss; no residual/separated-background claim.',
                        'Magenta denotes any invalid source coverage; inspect stretched polar/edge regions rather than blur-fill.',
                        'No app integration, runtime/browser validation, human approval or production budget established.'],
        'previousResults': 'output/hero-sky-prototype/results is untouched; phase-1 failure is not a verdict on this mapping.'}
    write_json('results.json', report)
    print(json.dumps({'output': str(OUT.relative_to(probe.ROOT)), 'humanApproval': 'not-granted',
                      'variants': len(outputs['variants']), 'frames': outputs['frames']}))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
