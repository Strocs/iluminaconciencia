#!/usr/bin/env python3
"""Compose the final photograph and time-zero CPU star layer; never use SVG."""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image

from probe import image_rgb, render_stars
from production_assets import canonical_frame

ROOT = Path(__file__).resolve().parents[2]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True, type=Path, help='Isolated current-sky.json exported from the active catalogue.')
    parser.add_argument('--output', required=True, type=Path, help='New output directory; existing directories are refused.')
    parser.add_argument('--quality', type=int, choices=range(1, 101), default=75,
                        help='Lossy WebP quality from 1 to 100 (default: 75).')
    args = parser.parse_args()
    data = json.loads(args.input.read_text())
    photos = ROOT / 'public/images/hero/sky/t16-left-r1'
    args.output.mkdir(parents=True, exist_ok=False)
    files = []
    for dpr in (1, 2):
        frame = canonical_frame(data, dpr)
        photo = photos / f'background-{dpr}x.webp'
        with Image.open(photo) as source:
            expected = (frame['width'] * dpr, frame['height'] * dpr)
            if source.size != expected:
                raise ValueError(f'Unexpected photograph dimensions: {photo}')
            background = np.asarray(source.convert('RGB'), dtype=np.float32) / 255
        composite = image_rgb(render_stars(background, data, frame))
        target = args.output / f'composite-{dpr}x.webp'
        composite.save(target, 'WEBP', quality=args.quality, method=6)
        files.append({'file': target.name, 'dimensions': list(composite.size), 'bytes': target.stat().st_size})
    credits = (photos / 'CREDITS.txt').read_text().rstrip()
    (args.output / 'CREDITS.txt').write_text(
        credits + '\n\nAdditional adaptation: static photograph + BSC5 star composition, '
        'CPU reproduction of the current shader at time zero; not a WebGL screenshot.\n'
    )
    print(json.dumps({'output': str(args.output), 'stars': len(data['catalog']),
                      'profile': 'existing CPU shader reproduction, time zero, full artwork opacity',
                      'encoding': 'lossy WebP', 'quality': args.quality, 'files': files}))


if __name__ == '__main__':
    main()
