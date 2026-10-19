"""Canonical reprojected raster, external transparent catalog SVG and review images."""
import copy
import numpy as np
from PIL import Image, ImageDraw

import probe
import constellation_review as review


def canonical_frame(data, dpr):
    r, b = data['reference'], data['region']
    sx = (b['xMax']-b['xMin'])/r['width']
    sy = (b['yMax']-b['yMin'])/r['height']
    return {'width': 1920, 'height': 1080, 'dpr': dpr,
            'crop': {'scaleX': sx, 'scaleY': sy,
                     'offsetX': (r['x0']-b['xMin'])/r['width'],
                     'offsetY': (b['yMax']-r['y0']-r['height'])/r['height']}}


def svg(data, out, recipe):
    r = data['reference']
    # Projected coordinates set centers only. Non-scaling strokes set CSS sizes
    # when the external SVG image is assigned the complete artwork target box.
    lines = [f'<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="{r["x0"]} {-r["y0"]-r["height"]} {r["width"]} {r["height"]}" preserveAspectRatio="none">',
             '<title>Current BSC5 catalog, time zero; approximate radial core and halo</title>']
    stars = np.asarray(data['mapped']['stars']).reshape(-1, 4)
    colors = np.asarray(data['mapped']['colors']).reshape(-1, 4)
    amplitude = data['config']['twinkle']['amplitude']
    steps = recipe['svgRadialSteps']
    for (x, y), (phase, size, alpha, _), color in zip(data['projected'], stars, colors):
        half = size*(1-amplitude+np.sin(phase*6.2831853)*amplitude)
        rgb = ','.join(str(int(np.rint(v*255))) for v in color[:3])
        previous = 0.
        for k in range(steps, 0, -1):
            radius = (k-.5)/steps
            def smooth(t):
                t = np.clip(t, 0, 1)
                return 1-t*t*(3-2*t)
            target = float(np.clip((smooth(radius*1.8)+.28*smooth(radius))*alpha*color[3], 0, 1))
            opacity = (target-previous)/max(1-previous, 1e-12)
            previous = target
            lines.append(f'<path d="M{x:.12g},{-y:.12g}h0" fill="none" stroke="rgb({rgb})" stroke-opacity="{opacity:.8g}" stroke-width="{2*half*k/steps:.8g}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>')
    lines.append('</svg>')
    (out/'catalog-stars.svg').write_text('\n'.join(lines)+'\n')
    return {'dimensions': [1920, 1080], 'bounds': r,
            'targetBox': 'Full canonical artwork CSS width/height from visible crop spans; translate and clip, never scale an already rasterized SVG',
            'profile': f'{steps} radial source-over bands approximate shader smoothstep core + .28 halo, time0; AA not identical to WebGL; SVG-as-image browser sizing unverified',
            'catalogRows': len(stars), 'externalImageOnly': True}


def render(source, background, data, rotation, recipe, out):
    reports, thumbnails = [], []
    bg_native = background.astype(np.float32)/255
    src_native = source.astype(np.float32)/255
    # Each WebP is projected independently from the native lossless derivative.
    for dpr in [1, 2]:
        frame = canonical_frame(data, dpr)
        array, invalid = review.sample(bg_native, data, frame, rotation)
        if invalid:
            raise ValueError('Canonical native reprojection has invalid coverage')
        probe.image_rgb(array).save(out/f'background-{dpr}x.webp', 'WEBP',
                                   quality=recipe['webpQuality'], method=recipe['webpMethod'])
    for frame in [dict(data['frames'][0], dpr=1), dict(data['frames'][0], dpr=2),
                  dict(data['frames'][1], dpr=2)]:
        name = f'{frame["width"]}x{frame["height"]}@{frame["dpr"]}'
        bg, invalid = review.sample(bg_native, data, frame, rotation)
        original, invalid_source = review.sample(src_native, data, frame, rotation)
        if invalid or invalid_source:
            raise ValueError('Responsive frame has invalid source coverage')
        base = np.zeros_like(bg)+np.array([3, 7, 18], dtype=np.float32)/255
        moved = copy.deepcopy(data)
        origins = np.asarray(data['mapped']['origins']).reshape(-1, 2)
        crop = frame['crop']
        origins = origins+np.asarray(recipe['staticShiftCss'])/[frame['width'], frame['height']]/[crop['scaleX'], crop['scaleY']]
        moved['mapped']['origins'] = origins.ravel().tolist()
        arrays = {'original': original, 'background': bg,
                  'current-stars': probe.render_stars(base, data, frame),
                  'composite': probe.render_stars(bg, data, frame),
                  'shifted': probe.render_stars(bg, moved, frame)}
        images = {key: probe.image_rgb(a) for key, a in arrays.items()}
        files = []
        for opacity in recipe['opacities']:
            for key in arrays:
                array = base+(arrays[key]-base)*opacity
                filename = f'{name}-{key}-opacity{opacity:g}.png'
                probe.image_rgb(array).save(out/filename)
                files.append(filename)
        width, height = images['background'].size
        # Image-statistics candidates, not invented astronomical semantics.
        gray = original.mean(axis=2)
        grid = [(x, y) for y in range(96, height-95, 192) for x in range(96, width-95, 192)]
        def tile(p):
            x, y = p
            return gray[y-96:y+96, x-96:x+96]
        points = {'dense-candidate': max(grid, key=lambda p: float(tile(p).std())),
                  'bright-candidate': max(grid, key=lambda p: float(tile(p).max())),
                  'nebulous-candidate': max(grid, key=lambda p: float(tile(p).mean())),
                  'edge': (width-96, 96)}
        details = []
        for label, (x, y) in points.items():
            sheet = Image.new('RGB', (192*4, 216), '#030712')
            for column, key in enumerate(['original', 'background', 'composite', 'shifted']):
                sheet.paste(images[key].crop((x-96, y-96, x+96, y+96)), (column*192, 0))
                ImageDraw.Draw(sheet).text((column*192+2, 196), key, fill='white')
            filename = f'{name}-{label}-native.png'
            sheet.save(out/filename)
            details.append({'file': filename, 'nativeFrameBox': [x-96, y-96, x+96, y+96],
                            'selection': 'Statistics candidate; dense/nebulous identity requires image inspection'})
        sheet = Image.new('RGB', (320*5, 330), '#030712')
        for i, (key, image) in enumerate(images.items()):
            thumb = image.copy()
            thumb.thumbnail((320, 290))
            sheet.paste(thumb, (i*320, 0))
            ImageDraw.Draw(sheet).text((i*320+2, 294), name+' '+key, fill='white')
        ImageDraw.Draw(sheet).text((4, 314), review.CREDIT+' | UNREVIEWED | static +8/-6 CSS, not parallax', fill='white')
        thumbnails.append(sheet)
        reports.append({'frame': frame, 'planeLeftTopWidthHeight': list(probe.crop_plane(data, frame)),
                        'files': files, 'nativeDetails': details, 'invalidCoveragePixels': invalid})
    contact = Image.new('RGB', (1600, 330*len(thumbnails)), '#030712')
    for i, thumb in enumerate(thumbnails):
        contact.paste(thumb, (0, i*330))
    contact.save(out/'contact-sheet.png')
    return reports
