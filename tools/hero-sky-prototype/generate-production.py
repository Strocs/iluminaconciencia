#!/usr/bin/env python3
"""Versioned offline sky assets. Exit 0 is structural success, never visual approval."""
import argparse
from collections import Counter
from importlib.metadata import version as package_version
import json
from pathlib import Path
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

import numpy as np
from PIL import Image, features

import probe
import constellation_review as review
import reconstruct_background as recon
import production_inventory as inventory
import production_assets as assets

TOOLS = Path(__file__).resolve().parent
RECIPE = TOOLS/'production-recipe.json'
PRODUCTION = probe.BASE/'production'


def dump(path, value):
    path.write_text(json.dumps(value, indent=2, allow_nan=False)+'\n')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def destination(value):
    if not re.fullmatch(r'[a-z][a-z0-9-]{0,47}', value):
        raise ValueError('Version must match [a-z][a-z0-9-]{0,47}; paths are forbidden')
    out = PRODUCTION/value
    require(not any(p.is_symlink() for p in [out, *out.parents]), 'Symlink output paths are forbidden')
    require(out.resolve().parent == PRODUCTION.resolve(), 'Output must be a direct production version')
    return out


def preflight():
    data, landmarks, rotation, checks = recon.validate()
    recipe = json.loads(RECIPE.read_text())
    require(recipe['schema'] == 1 and recipe['sourceSha256'] == probe.SOURCE_HASH,
            'Unsupported recipe schema/source')
    require(recipe['method'] == 'local-connected-context-texture-v1', 'Unsupported reconstruction method')
    require(recipe['seed'] == 0 and recipe['searchRadiusSourcePx'] == 6 and
            recipe['maximumGroupExtentSourcePx'] == 64, 'Unsupported context/search recipe')
    require(recipe['webpQuality'] == 95 and recipe['webpMethod'] == 4 and
            recipe['svgRadialSteps'] == 16 and recipe['staticShiftCss'] == [8, -6] and
            recipe['opacities'] == [1, .12], 'Unsupported encoding/preview recipe')
    require(recipe['detectionSigma'] == .8 and recipe['minimumExcessEncoded8bit'] == 3 and
            recipe['noiseMultiplier'] == 4, 'Unsupported detection recipe')
    require(set(recipe['packages']) == {'numpy', 'scipy', 'astropy', 'Pillow'}, 'Recipe must pin all four direct packages')
    packages = {name: package_version(name) for name in recipe['packages']}
    require(packages == recipe['packages'], 'Installed direct package versions differ from recipe')
    require(features.check('webp'), 'Pillow WebP support required')
    n = len(data['catalog'])
    for key, width in [('origins', 2), ('stars', 4), ('colors', 4)]:
        array = np.asarray(data['mapped'][key])
        require(array.size == n*width and np.isfinite(array).all(), 'Invalid mapped catalog buffer')
    centers, visible, inside = inventory.coverage(data)
    require(np.isfinite(centers).all(), 'Nonfinite canonical geometry')
    reference = data['reference']
    expected = [reference['x0'], reference['y0']+reference['height'], reference['width'], reference['height']]
    require(np.allclose(probe.crop_plane(data, assets.canonical_frame(data, 1)), expected, atol=1e-12, rtol=0),
            'Canonical reference/REGION uniform conversion failed')
    for f in data['frames']:
        left, top, width, height = probe.crop_plane(data, f)
        require(left >= reference['x0']-1e-12 and top <= reference['y0']+reference['height']+1e-12 and
                left+width <= reference['x0']+reference['width']+1e-12 and top-height >= reference['y0']-1e-12,
                'Exported responsive crop outside canonical domain')
    paths = [Path(__file__), RECIPE, TOOLS/'production_inventory.py', TOOLS/'production_assets.py',
             TOOLS/'export-inputs.mjs', TOOLS/'requirements.txt', review.LANDMARKS,
             probe.BASE/'metadata/environment.json', probe.BASE/'metadata/source.json',
             Path(probe.__file__), Path(review.__file__), Path(recon.__file__)]
    hashes = {str(p.relative_to(probe.ROOT)): review.digest(p) for p in paths}
    hashes.update(checks['artifactHashes'])
    runtime = subprocess.run(['node', '-e', "console.log(JSON.stringify({node:process.versions.node,typescript:require('typescript/package.json').version}))"],
                             cwd=probe.ROOT, capture_output=True, text=True, timeout=5)
    require(runtime.returncode == 0, 'Cannot identify existing Node/TypeScript exporter versions')
    summary = {'catalogRows': n, 'centerInsideReference': int(inside.sum()),
               'maximumRendererQuadVisible': int(visible.sum()), 'haloOnlyRows': int((~inside).sum()),
               'outsideRendererQuad': int((~visible).sum()),
               'photographicLocalChecksRequired': n}
    provenance = {'sourceSha256': probe.SOURCE_HASH, 'liveModuleHashes': data['hashes'],
                  'inputJsonSha256': checks['sources']['inputJsonSha256'], 'codeAndEvidenceHashes': hashes,
                  'packages': packages, 'python': sys.version.split()[0],
                  'webpEncoder': features.version('webp'), 'jpegDecoder': features.version('jpg'),
                  'exportRuntime': json.loads(runtime.stdout),
                  'rotationVectorRadians': rotation.as_rotvec().tolist(),
                  'rotationMatrix': rotation.as_matrix().tolist(),
                  'coordinateFrame': 'FK5 J2000 -> Galactic; one stored Orion rotation; mirrored STG; source X periodic, Y nonperiodic',
                  'interpolation': 'Bilinear native reprojection, encoded display RGB; no global grade/blur',
                  'seed': recipe['seed'], 'ties': recipe['ties']}
    return data, rotation, recipe, provenance, summary


def artifact(path):
    result = {'file': path.name, 'bytes': path.stat().st_size, 'sha256': review.digest(path)}
    if path.suffix in ['.png', '.webp']:
        with Image.open(path) as im:
            im.load()
            result['dimensions'] = list(im.size)
    return result


def validate_completed(out, data, recipe, provenance):
    require(out.is_dir() and (out/'manifest.json').is_file(), 'Existing version is incomplete; manifest.json required')
    require(not any(p.is_symlink() for p in out.rglob('*')), 'Symlink artifact forbidden')
    manifest = json.loads((out/'manifest.json').read_text())
    require(manifest['schema'] == 1 and manifest['version'] == out.name, 'Manifest schema/version mismatch')
    require(manifest['provenance'] == provenance, 'Generated version no longer matches live immutable inputs/code')
    require(json.loads((out/'production-recipe.json').read_text()) == recipe, 'Snapshot recipe drift')
    require(json.loads((out/'current-sky.json').read_text()) == data, 'Actual export snapshot drift')
    expected_files = {a['file'] for a in manifest['files']} | {'manifest.json'}
    require({p.name for p in out.iterdir()} == expected_files, 'Artifact set differs from manifest')
    for record in manifest['files']:
        name = record['file']
        require(Path(name).name == name and name not in ['.', '..'], 'Nonlocal manifest artifact')
        require(artifact(out/name) == record, f'Artifact hash/bytes/dimensions mismatch: {name}')
    rows = json.loads((out/'inventory.json').read_text())
    counts = dict(Counter(r['status'] for r in rows))
    require(len(rows) == len(data['catalog']) and counts == manifest['inventoryCounts'], 'Inventory does not reconcile')
    require(set(counts) <= {'treated', 'merged', 'nonobservable', 'unresolved'}, 'Unknown inventory status')
    groups = {g['id']: g for g in json.loads((out/'groups.json').read_text())}
    for i, row in enumerate(rows):
        require(row['id'] == f'catalog-{i:05d}' and row['catalogRow'] == data['catalog'][i] and row['reason'],
                'Unstable/incomplete catalog row')
        if row['status'] in ['treated', 'merged']:
            require(groups[row['sourceGroup']]['status'] == 'treated' and row['donor'] in expected_files,
                    'Resolved row lacks treated source group/donor')
        if row['status'] == 'unresolved' and row['footprintVisible']:
            require(row['preview'] in expected_files, 'Visible unresolved row lacks preview locator')
    with Image.open(review.SOURCE) as im:
        original = np.asarray(im)
    with Image.open(out/'native-background.png') as im:
        background = np.asarray(im)
    with Image.open(out/'native-edit-union.png') as im:
        mask = np.asarray(im)
    require(background.shape == original.shape and mask.shape == original.shape[:2], 'Native artifact dimensions mismatch')
    require(set(np.unique(mask)) <= {0, 255}, 'Edit union is not binary')
    outside = int(np.any(background[mask == 0] != original[mask == 0], axis=1).sum())
    preservation = {'outsideMaskDifferentPixels': outside, 'editUnionPixels': int(np.count_nonzero(mask)),
                    'changedPixels': int(np.any(background != original, axis=2).sum())}
    require(outside == 0 and preservation == manifest['preservation'], 'Decoded native preservation mismatch')
    tree = ET.parse(out/'catalog-stars.svg')
    root = tree.getroot()
    ns = '{http://www.w3.org/2000/svg}'
    require(root.tag == ns+'svg' and root.attrib['preserveAspectRatio'] == 'none', 'Invalid SVG geometry root')
    paths = list(root.iter(ns+'path'))
    require(len(paths) == len(rows)*recipe['svgRadialSteps'], 'SVG catalog population mismatch')
    for element in root.iter():
        require(element.tag in {ns+'svg', ns+'title', ns+'path'}, 'Unsafe SVG element')
        require(not any(k.startswith('on') or 'href' in k or 'url(' in v for k, v in element.attrib.items()), 'Unsafe SVG attribute')
    require(all(p.attrib.get('vector-effect') == 'non-scaling-stroke' for p in paths), 'SVG CSS-size contract lost')
    for scale in [1, 2]:
        with Image.open(out/f'background-{scale}x.webp') as im:
            require(im.size == (1920*scale, 1080*scale), 'Canonical raster dimensions mismatch')
    return {'mode': 'completed-artifact-validation', 'passed': True, 'writes': False,
            'inventoryCounts': counts, 'preservation': preservation, 'approval': manifest['approval']}


def generate(out, data, rotation, recipe, provenance, summary):
    started = time.monotonic()
    # Exclusive directory creation is the immutable-history boundary. Failures
    # remain inspectable incomplete versions; never resume/overwrite automatically.
    out.mkdir(parents=True, exist_ok=False)
    result = subprocess.run(['node', str(TOOLS/'export-inputs.mjs'), '--output', str(out)],
                            capture_output=True, text=True, timeout=25)
    require(result.returncode == 0, 'Fresh actual-module export failed: '+result.stderr)
    require(json.loads((out/'current-sky.json').read_text()) == data, 'Fresh export differs from validated inputs')
    dump(out/'production-recipe.json', recipe)
    dump(out/'preflight.json', {'provenance': provenance, 'summary': summary})
    with Image.open(review.SOURCE) as im:
        source = np.asarray(im).copy()
    inspected = recon.validate()[1]
    rows, candidates = inventory.inventory(source, data, rotation, recipe, inspected)
    background, groups, preservation = inventory.reconstruct(source, rows, candidates, out, recipe, dump)
    inventory.diagnostics(source, background, rows, out)
    dump(out/'inventory.json', rows)
    dump(out/'groups.json', groups)
    svg = assets.svg(data, out, recipe)
    frames = assets.render(source, background, data, rotation, recipe, out)
    _, _, _, after, _ = preflight()
    require(after == provenance, 'Inputs/code changed during generation')
    counts = dict(Counter(r['status'] for r in rows))
    require(sum(counts.values()) == len(data['catalog']), 'Inventory counts do not reconcile')
    credit = ('ESO/S. Brunier | CC BY 4.0\nhttps://www.hq.eso.org/public/images/eso0932a/\n'
              +review.LICENSE+'\nAdaptations: selective inferred local structure and source texture; '
              'rotation/reprojection, crop, catalog overlays and WebP95 encoding.\n'
              'Review pending. Visible accessible credit is required in any future application.\n')
    (out/'CREDITS.txt').write_text(credit)
    unresolved = [{'id': r['id'], 'reason': r['reason'], 'preview': r['preview']}
                  for r in rows if r['status'] == 'unresolved' and r['footprintVisible']]
    dump(out/'summary.json', {'inventoryCounts': counts, 'unresolvedVisible': unresolved,
         'uniqueGroups': len(groups), 'treatedGroups': sum(g['status'] == 'treated' for g in groups),
         'preservation': preservation, 'review': 'pending; exit0 does not mean all stars removed',
         'preview': 'contact-sheet.png', 'frames': frames})
    manifest = {'schema': 1, 'version': out.name, 'approval': 'pending-complete-asset-review',
        'provenance': provenance, 'referenceBounds': data['reference'], 'inventoryCounts': counts,
        'geometryCensus': summary, 'preservation': preservation, 'frames': frames, 'catalogSvg': svg,
        'raster': {'bounds': data['reference'], 'dimensions': [[1920, 1080], [3840, 2160]],
                   'encoding': 'WebP95 method4 directly from native reprojection'},
        'credit': credit, 'proposedManifestUrlsOnly': {n: f'/images/hero/sky/{out.name}/{n}' for n in
            ['background-1x.webp', 'background-2x.webp', 'catalog-stars.svg', 'manifest.json', 'CREDITS.txt']},
        'limitations': ['Counterpart detection is local and provisional, not an external astrometric identification.',
            'Saturated profiles can be inferred but are explicitly flagged; dense, truncated and ambiguous cases remain unresolved.',
            'Approved footprint has a 4px minimum ellipse and 4px feather; faint neighbors inside edits may be lost.',
            'Unresolved visible counterparts remain in the photograph and must be inspected before approval.',
            'No hero/SSR/readiness integration, browser SVG validation, actual parallax or performance acceptance.'],
        'files': [artifact(p) for p in sorted(out.iterdir())]}
    dump(out/'manifest.json', manifest)
    validated = validate_completed(out, data, recipe, provenance)
    print(json.dumps({'output': str(out.relative_to(probe.ROOT)), 'seconds': round(time.monotonic()-started, 3),
        'inventoryCounts': counts, 'unresolvedVisible': len(unresolved), 'preservation': preservation,
        'validated': validated['passed'], 'approval': manifest['approval'], 'preview': 'contact-sheet.png'}))


def main():
    parser = argparse.ArgumentParser(description=__doc__, epilog='No application/public writes. Existing or failed versions cannot be regenerated; choose a fresh version. No all-removed or visual approval claim from exit 0.')
    parser.add_argument('--version', required=True, help='Fresh direct version name, e.g. v1; lowercase letters/digits/hyphens, starting with a letter (max48)')
    parser.add_argument('--validate-only', action='store_true', help='Read-only: fresh name checks source/code/recipe/rotation/geometry and catalog coverage; a manifest additionally requires completed artifact/hash/inventory/SVG/native preservation validation; no manifest means preflight only, never completion')
    args = parser.parse_args()
    try:
        out = destination(args.version)
        require(args.validate_only or not out.exists(), 'Output version already exists; refusing all writes')
        data, rotation, recipe, provenance, summary = preflight()
        if args.validate_only:
            result = validate_completed(out, data, recipe, provenance) if (out/'manifest.json').exists() else {
                'mode': 'preflight-only', 'passed': True, 'writes': False, **summary,
                'sourceSha256': provenance['sourceSha256'], 'artifactsValidated': False,
                'approval': 'pending-complete-asset-review'}
            print(json.dumps(result))
        else:
            generate(out, data, rotation, recipe, provenance, summary)
        return 0
    except (ValueError, OSError, KeyError, subprocess.SubprocessError) as error:
        print('Error: '+str(error), file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
