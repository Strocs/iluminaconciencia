#!/usr/bin/env python3
"""Additive left-photo residual retouch; no catalogue edits or image approval."""
import argparse
import json
from pathlib import Path
import re
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw

import bright_regions as bright
import probe

ROOT = probe.ROOT
BASE = probe.BASE
PRODUCTION = BASE / 'production'
APPROVED = PRODUCTION / 't13-texture-r1'
INPUT = BASE / 'input/current-sky.json'
PLAN_SHA = '990e8b7ff4fc73e4f79d4870ebee0c62adc38a8280593332dfac952edbcc8ce5'
INPUT_SHA = 'dc331ea71325bb99b7e95ca3e8e779f0429a34020f8eef2b35da0b889a3c9535'
# Manually inspected photo peaks, not a magnitude cut or catalogue identity claim.
# Indices refer to validation-t16/candidate-native-{0,1}.png, photo/catalog/both.
SELECTION = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16,
             17, 18, 19, 20, 21, 22, 23, 24, 29, 30, 31, 32, 33, 38, 47]
POINTS = [(143,124), (151,1115), (277,1292), (254,597), (42,1260),
          (456,1219), (198,745), (466,744), (402,729), (69,1151),
          (22,907), (97,355), (39,1161), (424,1024), (140,637),
          (750,373), (68,1052), (306,915), (207,132), (23,1121),
          (880,254), (753,267), (135,818), (64,314), (975,352),
          (648,381), (552,480), (523,873), (184,701), (768,173), (218,1240)]
# Inner trace of the yellow mark, in the 1925x1027 supplied PNG. It is NOT
# the canonical top-left quarter. Screenshot registration is analysis only.
MARK = [(20,32),(635,38),(590,98),(547,154),(495,205),(452,273),
        (435,350),(430,423),(415,440),(340,459),(298,480),(275,519),
        (261,565),(270,639),(295,668),(262,690),(198,712),(148,720),
        (70,720),(22,700)]
SCREEN_SCALE, SCREEN_TX, SCREEN_TY = 1.00419294, 5.01251384, 36.28734058
CORE, FEATHER = 12, 6


def require(ok, message):
    bright.require(ok, message)


def master_polygon():
    """One measured global mapping; never a per-region reprojection."""
    return [[2*(SCREEN_SCALE*(x-20)+SCREEN_TX),
             2*(SCREEN_SCALE*(y-32)+SCREEN_TY)] for x,y in MARK]


def build_plan(indices=None):
    """Explicit photo-centred padded disks, clipped to the marked local ROI."""
    roi_image = Image.new('L', (3840,2160))
    ImageDraw.Draw(roi_image).polygon([tuple(p) for p in master_polygon()], fill=255)
    roi = np.asarray(roi_image) > 0
    rim = np.clip(bright.recon.distance_transform_edt(roi)/FEATHER,0,1)
    roi_alpha = rim*rim*(3-2*rim)
    union = np.zeros((2160,3840), bool)
    alpha = np.zeros(union.shape, np.float32)
    regions = []
    selected = range(len(POINTS)) if indices is None else indices
    for i in selected:
        x,y = POINTS[i]
        radius = CORE+FEATHER
        x0,y0 = max(0,x-radius),max(0,y-radius)
        x1,y1 = min(3840,x+radius+1),min(2160,y+radius+1)
        yy,xx = np.mgrid[y0:y1,x0:x1]
        t = np.clip((radius-np.hypot(xx-x,yy-y))/FEATHER,0,1)
        local = (t*t*(3-2*t)*roi_alpha[y0:y1,x0:x1]).astype(np.float32)
        require(local[y-y0,x-x0] == 1, 'Photo target is outside marked ROI')
        alpha[y0:y1,x0:x1] = np.maximum(alpha[y0:y1,x0:x1],local)
        union[y0:y1,x0:x1] |= local > 0
        regions.append({'id':f'photo-{i:02d}', 'inspectionIndex':SELECTION[i],
                        'centerMasterXY':[x,y], 'coreRadiusMasterPx':CORE,
                        'featherMasterPx':FEATHER, 'outerRadiusMasterPx':radius,
                        'roiClipped':bool(((t>0)&~roi[y0:y1,x0:x1]).any())})
    return union,alpha,regions


def current_geometry(data):
    """Reuse the historical pure loader, never its export/write entrypoint."""
    exporter = ROOT / 'tools/hero-sky-prototype/export-inputs.mjs'
    prefix = exporter.read_text().split('// Historical snapshot export entrypoint.',1)[0]
    prefix = prefix.replace("path.resolve(import.meta.dirname, '../..')", 'process.cwd()')
    script = prefix + """
const reference = load(path.join(sourceDir, 'sky-reference.ts'))
const { computeSkyCrop } = load(path.join(sourceDir, 'sky-crop.ts'))
const frozen = JSON.parse(fs.readFileSync('output/hero-sky-prototype/input/current-sky.json','utf8'))
console.log(JSON.stringify({reference:reference.SKY_REFERENCE, region:reference.REGION_BBOX,
  frames:frozen.frames.map(f=>({...f,crop:computeSkyCrop(f.width/f.height)}))}))
"""
    result = subprocess.run(['node','--input-type=module','-e',script], cwd=ROOT,
                            capture_output=True,text=True,timeout=10,check=True)
    actual = json.loads(result.stdout)
    require(actual == {k:data[k] for k in ['reference','region','frames']},
            'Current computeSkyCrop/reference differs from frozen geometry')
    return bright.digest(exporter)


def preflight():
    require(bright.digest(APPROVED/'region-plan.json') == PLAN_SHA, 'Approved plan hash mismatch')
    old = json.loads((APPROVED/'region-plan.json').read_text())
    require(bright.digest(INPUT) == INPUT_SHA, 'Frozen input hash mismatch')
    require(bright.digest(APPROVED/'registered-clean-2x.png') ==
            old['artifacts']['registered-clean-2x.png']['sha256'], 'Approved master hash mismatch')
    require(bright.digest(bright.SOURCE) == probe.SOURCE_HASH, 'Original source hash mismatch')
    data = probe.read_inputs()
    require(len(data['catalog']) == 4666 and probe.geometry(data)['passed'], 'Frozen geometry failed')
    loader_sha = current_geometry(data)
    union,alpha,regions = build_plan()
    provenance = {'baseMasterSha256':bright.digest(APPROVED/'registered-clean-2x.png'),
                  'basePlanSha256':PLAN_SHA,'inputSha256':INPUT_SHA,
                  'sourceSha256':probe.SOURCE_HASH,
                  'renderBuffersSha256':bright.render_buffer_digest(data),
                  'loaderSha256':loader_sha,
                  'codeHashes':{Path(m.__file__).name:bright.digest(Path(m.__file__))
                                for m in [sys.modules[__name__],bright,probe,bright.inventory,bright.recon]}}
    return data,union,alpha,regions,provenance


def output_path(version):
    require(re.fullmatch(r'[a-z][a-z0-9-]{0,47}',version) is not None,
            'Invalid version name; paths are forbidden')
    out = PRODUCTION/version
    require(not any(p.is_symlink() for p in [out,*out.parents]), 'Symlink output path is forbidden')
    return out


def validate_completed(out, union, alpha, regions, provenance):
    require((out/'region-plan.json').is_file(), 'Existing version is incomplete; refusing reuse')
    plan = json.loads((out/'region-plan.json').read_text())
    require(plan['schema']==1 and plan['version']==out.name and plan['approval']=='pending'
            and plan['appEditAllowed'] is False, 'Completed schema/approval mismatch')
    require(plan['provenance']==provenance and plan['targetRegions']==regions,
            'Completed provenance/targets drift')
    require(plan['mapping']==mapping() and plan['parametersSha256']==bright.parameter_digest(plan['mapping']),
            'Completed mapping/parameter hash drift')
    frozen=probe.read_inputs()
    frames=[dict(frozen['frames'][0],dpr=1),dict(frozen['frames'][0],dpr=2),dict(frozen['frames'][1],dpr=2)]
    expected_reports=[]
    dimensions={'registered-clean-2x.png':(3840,2160),'edit-union.png':(3840,2160),
                'feather.png':(3840,2160),'background-2x.webp':(3840,2160),'background-1x.webp':(1920,1080)}
    for frame in frames:
        prefix=f"{frame['width']}x{frame['height']}@{frame['dpr']}"
        names=[f'{prefix}-{key}-opacity{opacity:g}.png' for opacity in [1,.12]
               for key in ['original','clean','composite','shifted']]
        expected_reports.append({'frame':frame,'files':names})
        dimensions.update({name:(frame['width']*frame['dpr'],frame['height']*frame['dpr']) for name in names})
    require(plan['responsiveFrames']==expected_reports, 'Responsive frame/crop descriptors drift')
    files = plan['artifacts']
    require(set(files)==set(dimensions)|{'CREDITS.txt'} and
            set(files)=={p.name for p in out.iterdir()}-{'region-plan.json'}, 'Artifact set drift')
    for name,record in files.items():
        require(Path(name).name==name and not (out/name).is_symlink(), 'Unsafe artifact path')
        require(bright.digest(out/name)==record['sha256'] and (out/name).stat().st_size==record['bytes'],
                f'Artifact drift: {name}')
        if name in dimensions:
            with Image.open(out/name) as image:
                require(image.size==dimensions[name], f'Image dimensions drift: {name}')
    with Image.open(APPROVED/'registered-clean-2x.png') as im: original=np.asarray(im.convert('RGB'))
    with Image.open(out/'registered-clean-2x.png') as im: clean=np.asarray(im.convert('RGB'))
    with Image.open(out/'edit-union.png') as im: mask=np.asarray(im)>0
    with Image.open(out/'feather.png') as im: feather=np.asarray(im)
    require(clean.shape==original.shape and np.array_equal(mask,union) and
            np.array_equal(feather,np.rint(alpha*255).astype(np.uint8)), 'Decoded mask/master drift')
    require(np.array_equal(clean[~union],original[~union]), 'Decoded outside-union mismatch')
    require(plan['preservation']==preservation(original,clean,union), 'Preservation counts drift')
    labels,count=bright.label(union,structure=np.ones((3,3),np.uint8))
    require({g['groupId'] for g in plan['groups']}==set(range(1,count+1)), 'Connected group set drift')
    for group in plan['groups']:
        require(group['unionPixels']==int((labels==group['groupId']).sum()) and
                group['donorGlobalTargetOverlapPixels']==0 and
                group['connectedComponentsEditedOnce']==1, 'Group coverage/donor drift')
    require(plan['preservation']['changedPixels']>0 and
            all(np.any(clean[y,x]!=original[y,x]) for x,y in POINTS), 'Missing photo-centre retouch')
    return {'mode':'completed-artifact-validation','passed':True,'writes':False,
            'artifactsValidated':True,'targetCount':len(regions),'preservation':plan['preservation']}


def preservation(original,clean,union):
    return {'editUnionPixels':int(union.sum()),'changedPixels':int(np.any(clean!=original,axis=2).sum()),
            'outsideMaskDifferentPixels':int(np.any(clean[~union]!=original[~union],axis=1).sum())}


def mapping():
    return {'markedScreenshotSize':[1925,1027], 'markedPolygonXY':[list(p) for p in MARK],
            'markedToGoodTranslationXY':[-20,-32], 'goodToHalfMaster':[SCREEN_SCALE,SCREEN_TX,SCREEN_TY],
            'masterPolygonXY':master_polygon(),'coreRadiusMasterPx':CORE,'featherMasterPx':FEATHER,
            'roiInnerFeatherMasterPx':FEATHER,
            'method':'Single empirical photo registration for ROI localization only; no runtime camera changes'}


def run(version,validate_only):
    out=output_path(version)
    # Refuse existing incomplete outputs before expensive processing, even in validation.
    if out.exists():
        require(validate_only, 'Output version exists; refusing overwrite')
        require((out/'region-plan.json').is_file(), 'Existing version is incomplete; refusing reuse')
    data,union,alpha,regions,provenance=preflight()
    if validate_only:
        if out.exists(): return validate_completed(out,union,alpha,regions,provenance)
        return {'mode':'preflight-only','passed':True,'writes':False,'artifactsValidated':False,
                'catalogCount':4666,'targetCount':len(regions),'editUnionPixels':int(union.sum())}
    # This full export is parent T17 work; no runtime URL promotion.
    with Image.open(APPROVED/'registered-clean-2x.png') as im: original=np.asarray(im.convert('RGB'))
    clean,feather,groups=bright.reconstruct_master(original,union,alpha)
    require(bright.render_buffer_digest(data)==provenance['renderBuffersSha256'], 'Mapped buffers changed')
    stats=preservation(original,clean,union)
    require(stats['outsideMaskDifferentPixels']==0 and stats['changedPixels']>0, 'Retouch preservation failed')
    out.mkdir(exist_ok=False)
    Image.fromarray(clean).save(out/'registered-clean-2x.png')
    Image.fromarray(union.astype(np.uint8)*255).save(out/'edit-union.png')
    Image.fromarray(np.rint(feather*255).astype(np.uint8)).save(out/'feather.png')
    Image.fromarray(clean).save(out/'background-2x.webp','WEBP',quality=95,method=4)
    Image.fromarray(clean).resize((1920,1080),Image.Resampling.LANCZOS).save(
        out/'background-1x.webp','WEBP',quality=95,method=4)
    frames=bright.write_review_frames(original,clean,data,out)
    require(bright.render_buffer_digest(data)==provenance['renderBuffersSha256'], 'Preview mutated frozen buffers')
    (out/'CREDITS.txt').write_text((APPROVED/'CREDITS.txt').read_text()+
        '\nAdditional adaptation: localized left photographic residual/halo reconstruction. Human approval pending.\n')
    plan={'schema':1,'version':version,'approval':'pending','appEditAllowed':False,
          'provenance':provenance,'mapping':mapping(),'parametersSha256':bright.parameter_digest(mapping()),
          'targetRegions':regions,'groups':groups,'preservation':stats,'responsiveFrames':frames,
          'limitations':['Inferred texture, not physical hidden dust or exact source identity.',
                         'CPU time-zero composites, not browser/WebGL proof. New S5 approval required.'],
          'artifacts':{p.name:{'sha256':bright.digest(p),'bytes':p.stat().st_size} for p in sorted(out.iterdir())}}
    (out/'region-plan.json').write_text(json.dumps(plan,indent=2,allow_nan=False)+'\n')
    return {'output':str(out.relative_to(ROOT)),'approval':'pending','targetCount':len(regions),'preservation':stats}


def main():
    parser=argparse.ArgumentParser(description=__doc__,epilog='Exit 0 never grants human image approval. Full generation is parent-owned T17.')
    parser.add_argument('--version',required=True,help='Fresh direct production label: [a-z][a-z0-9-]{0,47}; no paths or overwrite')
    parser.add_argument('--validate-only',action='store_true',help='No writes: absent version means preflight only; existing completed version validates hashes, masks and decoded preservation; incomplete versions fail')
    args=parser.parse_args()
    try: print(json.dumps(run(args.version,args.validate_only),allow_nan=False))
    except (ValueError,OSError,KeyError,IndexError,subprocess.SubprocessError) as error:
        print('Error: '+str(error),file=sys.stderr)
        return 1
    return 0


if __name__=='__main__': raise SystemExit(main())
