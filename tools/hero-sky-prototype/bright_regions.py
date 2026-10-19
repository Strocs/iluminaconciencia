#!/usr/bin/env python3
"""Rebuild padded bright-star regions on one registered sky master; approval pending."""
import argparse
import copy
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import sys

import numpy as np
from PIL import Image, ImageDraw, features
from scipy.ndimage import gaussian_filter, map_coordinates, label

import probe
import constellation_review as review
import production_inventory as inventory
import reconstruct_background as recon

TOOLS = Path(__file__).resolve().parent
BASE = probe.BASE
PRODUCTION = BASE / 'production'
FIXTURE = PRODUCTION / 'v2'
FIXTURE_IMAGE = FIXTURE / '1920x1080@2-original-opacity1.png'
FIXTURE_MANIFEST = FIXTURE / 'manifest.json'
SOURCE = BASE / 'source/eso0932a.jpg'
TARGET_MAGNITUDE = 3
MASTER_SCALE = 2
# Renderer maximum is size 9px * 1.06 twinkle = 9.54 CSS px; at 2x,
# half-extent is 19.08 master px. Add 5px registered displacement and 6px feather.
REGISTRATION_PADDING = 5
FEATHER = 6
CONTEXT_SIZE = 192
CONTEXT_HALF = CONTEXT_SIZE // 2


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parameter_digest(parameters):
    return hashlib.sha256(json.dumps(parameters,sort_keys=True,separators=(',',':')).encode()).hexdigest()


def render_buffer_digest(data):
    payload={key:data['mapped'][key] for key in ['origins','stars','colors']}
    payload['config']=data['config']
    return hashlib.sha256(json.dumps(payload,separators=(',',':'),allow_nan=False).encode()).hexdigest()


def metadata_sections(plan):
    """One canonical lookup schema used by generation validation and probes."""
    require(isinstance(plan.get('provenance'),dict) and isinstance(plan.get('parameters'),dict) and
            isinstance(plan.get('artifacts'),dict),'Missing top-level completed metadata sections')
    return plan['provenance'],plan['parameters'],plan['artifacts']


def require(ok, message):
    if not ok:
        raise ValueError(message)


def current_preflight():
    """Call existing validated owners; no fresh alignment or input writes."""
    data, landmarks, rotation, checks = recon.validate()
    centers, visible, inside = inventory.coverage(data)
    selected = [(i, row) for i, row in enumerate(data['catalog']) if row['mag'] <= TARGET_MAGNITUDE]
    require(len(data['catalog']) == 4666 and len(selected) == 112, 'Expected 4666 live stars and 112 mag<=3 targets')
    require(np.asarray(data['mapped']['origins']).size == 4666*2 and
            np.asarray(data['mapped']['stars']).size == 4666*4 and
            np.asarray(data['mapped']['colors']).size == 4666*4, 'Live render buffers changed')
    ref = data['reference']
    expected = [ref['x0'], ref['y0']+ref['height'], ref['width'], ref['height']]
    manifest = json.loads(FIXTURE_MANIFEST.read_text())
    live_input_hash=digest(BASE/'input/current-sky.json')
    require(manifest['provenance']['inputJsonSha256']==live_input_hash and
            manifest['provenance']['liveModuleHashes']==data['hashes'],
            'v2 fixture does not match the current exported 4666-row/render-buffer snapshot')
    frame = next((f for f in manifest['frames'] if f['frame']['width'] == 1920 and
                  f['frame']['height'] == 1080 and f['frame']['dpr'] == 2), None)
    require(frame is not None, 'Fixture lacks canonical 1920x1080 DPR-2 frame')
    require(np.allclose([manifest['referenceBounds'][k] for k in ['x0','y0','width','height']],
                        [ref[k] for k in ['x0','y0','width','height']], atol=1e-12, rtol=0),
            'Fixture manifest reference differs from live reference')
    require(np.allclose(frame['planeLeftTopWidthHeight'], expected, atol=1e-12, rtol=0),
            'Fixture recorded plane differs from live canonical reference')
    rec = next(a for a in manifest['files'] if a['file'] == FIXTURE_IMAGE.name)
    require(digest(FIXTURE_IMAGE) == rec['sha256'], 'Immutable fixture hash mismatch')
    require(rec['dimensions'] == [3840,2160], 'Fixture must be the registered 2x master')
    require(digest(SOURCE) == probe.SOURCE_HASH, 'Immutable source JPEG hash mismatch')
    for frame_data in data['frames']:
        left,top,width,height=probe.crop_plane(data,frame_data); eps=1e-10
        require(left>=ref['x0']-eps and top<=ref['y0']+ref['height']+eps and
                left+width<=ref['x0']+ref['width']+eps and top-height>=ref['y0']-eps,
                f"Exported crop outside canonical reference: {frame_data['width']}x{frame_data['height']}")
    # Canonical quadrant assignment uses reference-center coordinates, not crop frames.
    stars = np.asarray(data['mapped']['stars']).reshape(-1,4)
    indices = [i for i,_ in selected]
    sizes = stars[:,1]
    require(len(sizes)==4666 and np.isfinite(sizes).all(),'Live star sizes are not intact')
    projected = np.asarray(data['projected'])[indices]
    centers_master = (projected - [ref['x0'], ref['y0']+ref['height']]) * [MASTER_SCALE*1920/ref['width'], -MASTER_SCALE*1080/ref['height']]
    q = []
    for x,y in centers_master:
        q.append(('q1-TL' if y < 1080 and x < 1920 else
                  'q2-TR' if y < 1080 else 'q3-BL' if x < 1920 else 'q4-BR'))
    counts = dict(Counter(q))
    require(counts == {'q1-TL':21,'q2-TR':23,'q3-BL':39,'q4-BR':29},
            f'Canonical quadrant census mismatch: {counts}')
    return data, selected, centers_master, counts, manifest, rec, checks, sizes, render_buffer_digest(data)


def planned_masks(shape, selected, centers, sizes, twinkle_factor):
    """Per-target maximum shader footprint, registered padding and outer feather."""
    h,w = shape
    union=np.zeros((h,w),bool); alpha_union=np.zeros((h,w),np.float32); regions=[]
    for (index,row),(cx,cy),size in zip(selected,centers,sizes):
        half_extent=float(size)*twinkle_factor*MASTER_SCALE
        core_radius=int(np.ceil(half_extent+REGISTRATION_PADDING))
        radius=core_radius+FEATHER
        yy,xx=np.ogrid[-radius:radius+1,-radius:radius+1]
        distance=np.sqrt(xx*xx+yy*yy)
        t=np.clip((radius-distance)/FEATHER,0,1)
        alpha=t*t*(3-2*t)
        alpha[distance<=core_radius]=1
        alpha[distance>radius]=0
        disk=alpha>0
        x,y=int(round(cx)),int(round(cy))
        # Keep clipped frame-edge regions bounded; no opposite poster wrapping.
        x0,x1=max(0,x-radius),min(w,x+radius+1)
        y0,y1=max(0,y-radius),min(h,y+radius+1)
        if x0>=x1 or y0>=y1: raise ValueError(f'Target outside master: catalog-{index:05d}')
        local=disk[y0-(y-radius):y1-(y-radius),x0-(x-radius):x1-(x-radius)]
        union[y0:y1,x0:x1] |= local
        local_alpha=alpha[y0-(y-radius):y1-(y-radius),x0-(x-radius):x1-(x-radius)]
        alpha_union[y0:y1,x0:x1]=np.maximum(alpha_union[y0:y1,x0:x1],local_alpha)
        regions.append({'id':f'catalog-{index:05d}','catalogIndex':index,'magnitude':row['mag'],
          'centerMasterXY':[float(cx),float(cy)],'quadrant':('q1-TL' if cy<1080 and cx<1920 else 'q2-TR' if cy<1080 else 'q3-BL' if cx<1920 else 'q4-BR'),
          'radiusMasterPx':radius,'coreRadiusMasterPx':core_radius,'maxShaderHalfExtentMasterPx':half_extent,
          'mappedStarSizeCssPx':float(size),'twinkleMaximumFactor':twinkle_factor,
          'registrationPaddingMasterPx':REGISTRATION_PADDING,'featherMasterPx':FEATHER,
          'clippedAtCanonicalBorder':bool(x0==0 or y0==0 or x1==w or y1==h)})
    return union,alpha_union,regions


def reconstruct_master(original, union, alpha_union, group_order=None):
    """Edit each global component once; support and donors always read original."""
    labels,n=label(union,structure=np.ones((3,3),dtype=np.uint8))
    ids=list(range(1,n+1))
    if group_order is not None: ids=group_order(ids)
    result=original.copy(); feather_map=np.zeros(union.shape,np.float32); groups=[]
    for group_id in ids:
        ys,xs=np.nonzero(labels==group_id)
        minx,maxx=int(xs.min()),int(xs.max()); miny,maxy=int(ys.min()),int(ys.max())
        require(maxx-minx+1<=CONTEXT_SIZE and maxy-miny+1<=CONTEXT_SIZE,
                f'Connected target group {group_id} exceeds the real-context solver window')
        cx=(minx+maxx)//2; cy=(miny+maxy)//2
        x0=min(max(cx-CONTEXT_HALF,0),original.shape[1]-CONTEXT_SIZE)
        y0=min(max(cy-CONTEXT_HALF,0),original.shape[0]-CONTEXT_SIZE)
        x1=x0+CONTEXT_SIZE; y1=y0+CONTEXT_SIZE
        require(x0<=minx and x1>maxx and y0<=miny and y1>maxy,
                f'Cannot place full real context around connected group {group_id}')
        patch=original[y0:y1,x0:x1].astype(float)
        missing=labels[y0:y1,x0:x1] == group_id
        global_targets=union[y0:y1,x0:x1]
        other_targets=global_targets & ~missing
        # Reuse inventory's support/donor-exclusion adapter. Donor coordinates
        # are validated against the global target union before any master edit.
        fill,info=inventory.infer_group(patch,missing,other_targets)
        require(fill is not None,f'No contextual texture donor for connected group {group_id}: {info}')
        donors=np.asarray(info['donorLocalPixelsXY'])
        require(donors.shape==(int(missing.sum()),2) and np.isfinite(donors).all() and
                np.equal(donors,np.rint(donors)).all() and (donors>=0).all() and
                (donors<CONTEXT_SIZE).all(),f'Invalid completed donor coordinates in group {group_id}')
        donor_x,donor_y=donors.astype(int).T
        require(not global_targets[donor_y,donor_x].any(),
                f'Completed donor samples overlap a global bright-target mask in group {group_id}')
        # Add a bounded finer-scale source texture layer so inferred regions retain
        # faint point structure rather than only broad grain. Strong-source and
        # target exclusions are inherited from the validated completed donor map.
        fine_residual=patch-gaussian_filter(patch,(0.8,0.8,0))
        fine_texture=fine_residual[donor_y,donor_x]
        fine_texture-=fine_texture.mean(axis=0)
        fill[missing]+=0.35*fine_texture
        local_alpha=alpha_union[y0:y1,x0:x1]
        require(np.isfinite(fill[missing]).all(),f'Nonfinite fill in group {group_id}')
        blended=patch*(1-local_alpha[...,None])+fill*local_alpha[...,None]
        result[y0:y1,x0:x1][missing]=np.rint(np.clip(blended[missing],0,255)).astype(np.uint8)
        feather_map[y0:y1,x0:x1]=np.maximum(feather_map[y0:y1,x0:x1],local_alpha)
        groups.append({'groupId':int(group_id),'connectedComponentsEditedOnce':1,
          'unionPixels':int(missing.sum()),'bboxMasterXYXY':[minx,miny,maxx+1,maxy+1],
          'contextMasterXYXY':[x0,y0,x1,y1],
          'contextSource':'immutable original registered master; direct nonperiodic slice, no synthetic padding',
          'otherTargetMaskPixels':int(other_targets.sum()),
          'donorGlobalTargetOverlapPixels':0,'method':info.get('method'),
          'donorOffsetSourcePx':info.get('donorOffsetSourcePx'),
          'donorCompletedPixels':info.get('donorCompletedPixels',0),'donorPixels':info.get('donorCopiedPixels')})
    return result,feather_map,groups


def crop_registered_master(master, data, frame):
    """Resample one master through the existing exported computeSkyCrop frame."""
    left,top,width,height=probe.crop_plane(data,frame)
    dpr=frame['dpr']; out_w=int(frame['width']*dpr); out_h=int(frame['height']*dpr)
    ref=data['reference']
    output=np.empty((out_h,out_w,3),np.float32)
    master_float=master.astype(np.float32)
    for y0 in range(0,out_h,64):
        yy,xx=np.mgrid[y0:min(y0+64,out_h),:out_w]
        plane_x=left+(xx.ravel()+.5)/dpr*width/frame['width']
        plane_y=top-(yy.ravel()+.5)/dpr*height/frame['height']
        mx=(plane_x-ref['x0'])*3840/ref['width']-.5
        my=(ref['y0']+ref['height']-plane_y)*2160/ref['height']-.5
        eps=1e-7
        valid=(mx>=-eps)&(mx<=3839+eps)&(my>=-eps)&(my<=2159+eps)
        if not valid.all(): raise ValueError('Responsive crop genuinely exceeds registered master bounds')
        mx=np.clip(mx,0,3839); my=np.clip(my,0,2159)
        for c in range(3):
            values=map_coordinates(master_float[...,c],[my,mx],order=1,mode='nearest',prefilter=False)
            output[y0:y0+yy.shape[0],:,c]=values.reshape(yy.shape)/255
    return output


def write_review_frames(original,clean,data,out):
    """All views derive from the same master and actual exported crop equations."""
    reports=[]
    frames=[dict(data['frames'][0],dpr=1),dict(data['frames'][0],dpr=2),dict(data['frames'][1],dpr=2)]
    for frame in frames:
        name=f"{frame['width']}x{frame['height']}@{frame['dpr']}"
        photo=crop_registered_master(original,data,frame)
        background=crop_registered_master(clean,data,frame)
        base=np.zeros_like(background)+np.array([3,7,18],dtype=np.float32)/255
        shifted=copy.deepcopy(data)
        o=np.asarray(data['mapped']['origins']).reshape(-1,2).copy()
        crop=frame['crop']; o+=np.asarray([8,-6])/[frame['width'],frame['height']]/[crop['scaleX'],crop['scaleY']]
        shifted['mapped']['origins']=o.ravel().tolist()
        arrays={'original':photo,'clean':background,'composite':probe.render_stars(background,data,frame),
          'shifted':probe.render_stars(background,shifted,frame)}
        for opacity in [1,.12]:
            for key,array in arrays.items():
                value=base+(array-base)*opacity
                probe.image_rgb(value).save(out/f'{name}-{key}-opacity{opacity:g}.png')
        reports.append({'frame':frame,'files':[f'{name}-{k}-opacity{o:g}.png' for o in [1,.12] for k in arrays]})
    return reports


def write_quadrants(original,clean,data,out):
    """Render once in the canonical camera, then crop quadrant review batches."""
    reports=[]; canonical=dict(data['frames'][0],dpr=2)
    clean_float=clean.astype(np.float32)/255
    composite=np.rint(np.clip(probe.render_stars(clean_float,data,canonical),0,1)*255).astype(np.uint8)
    moved=copy.deepcopy(data); origins=np.asarray(data['mapped']['origins']).reshape(-1,2).copy()
    crop=canonical['crop']; origins+=np.asarray([8,-6])/[1920,1080]/[crop['scaleX'],crop['scaleY']]
    moved['mapped']['origins']=origins.ravel().tolist()
    shifted=np.rint(np.clip(probe.render_stars(clean_float,moved,canonical),0,1)*255).astype(np.uint8)
    overview=Image.new('RGB',(1280,4*198+20),'#030712')
    for row,(name,(x0,y0)) in enumerate({'q1-TL':(0,0),'q2-TR':(1920,0),'q3-BL':(0,1080),'q4-BR':(1920,1080)}.items()):
        box=(x0,y0,x0+1920,y0+1080)
        images={'original':original[y0:y0+1080,x0:x0+1920],'clean':clean[y0:y0+1080,x0:x0+1920],
                'composite':composite[y0:y0+1080,x0:x0+1920],'shifted':shifted[y0:y0+1080,x0:x0+1920]}
        for col,(key,image) in enumerate(images.items()):
            Image.fromarray(image).save(out/f'{name}-{key}.png')
            thumb=Image.fromarray(image).resize((320,180),Image.Resampling.LANCZOS)
            overview.paste(thumb,(col*320,row*198))
            ImageDraw.Draw(overview).text((col*320+4,row*198+182),f'{name} {key}',fill='white')
        reports.append({'quadrant':name,'boundsMasterXYXY':list(box),'files':[f'{name}-{k}.png' for k in images]})
    ImageDraw.Draw(overview).text((4,4*198+3),
      'ESO/S. Brunier | CC BY 4.0 | Selective inferred adaptation | Human review pending',fill='white')
    overview.save(out/'contact-sheet.png')
    return reports


def build_plan(data, selected, centers, counts, all_sizes):
    amplitude=float(data['config']['twinkle']['amplitude'])
    twinkle_factor=max(1.0,1.0+amplitude)
    require(np.isfinite(twinkle_factor) and twinkle_factor<=1.06+1e-9,
            'Live twinkle maximum exceeds the renderer footprint contract')
    target_sizes=np.asarray([all_sizes[i] for i,_ in selected],dtype=float)
    union,alpha,regions=planned_masks((2160,3840),selected,centers,target_sizes,twinkle_factor)
    labels,n=label(union,structure=np.ones((3,3),dtype=np.uint8))
    for r,(i,row) in zip(regions,selected):
        x,y=int(round(r['centerMasterXY'][0])),int(round(r['centerMasterXY'][1]))
        r['connectedGroup']=int(labels[y,x])
    return union,alpha,regions,{'targetCount':len(regions),'quadrantCounts':counts,'connectedGroupCount':int(n),
      'unionPixels':int(union.sum()),'minTargetRadiusMasterPx':min(r['radiusMasterPx'] for r in regions),
      'maxTargetRadiusMasterPx':max(r['radiusMasterPx'] for r in regions),
      'maxShaderHalfExtentMasterPx':max(r['maxShaderHalfExtentMasterPx'] for r in regions),
      'paddingMasterPx':REGISTRATION_PADDING,'featherMasterPx':FEATHER,
      'allTargetsAssigned':all(r['connectedGroup']>0 for r in regions)}


def validate_completed(out, data, selected, centers, counts, sizes, checks, render_hash):
    plan_path=out/'region-plan.json'
    require(plan_path.is_file(),'Completed version lacks region-plan.json')
    plan=json.loads(plan_path.read_text())
    require(plan.get('schema')==1 and plan.get('version')==out.name and
            plan.get('approval')=='pending' and plan.get('appEditAllowed') is False,
            'Version/approval state mismatch')
    union,alpha,expected_regions,expected_stats=build_plan(data,selected,centers,counts,sizes)
    require(plan.get('targetRegions')==expected_regions and plan.get('stats')==expected_stats,
            'Recomputed target/group coverage differs from completed plan')
    require(len(expected_regions)==112 and expected_stats['quadrantCounts']==counts and
            expected_stats['allTargetsAssigned'],'112-target coverage did not reconcile')
    expected_members={g:sorted(r['id'] for r in expected_regions if r['connectedGroup']==g)
                      for g in range(1,expected_stats['connectedGroupCount']+1)}
    actual_groups={int(g['groupId']):g for g in plan['groups']}
    require(set(actual_groups)==set(expected_members),'Connected group set does not recompute')
    require(all(sorted(actual_groups[g].get('targetIds',[]))==members for g,members in expected_members.items()),
            'Per-group target ownership differs from recomputed region plan')
    provenance,params,artifacts=metadata_sections(plan)
    require(provenance['sourceSha256']==digest(SOURCE) and
            provenance['inputJsonSha256']==digest(BASE/'input/current-sky.json') and
            provenance['fixtureSha256']==digest(FIXTURE_IMAGE) and
            provenance['fixtureManifestSha256']==digest(FIXTURE_MANIFEST) and
            provenance['reference']==data['reference'] and provenance['validationSources']==checks and
            provenance['renderBuffersSha256']==render_hash,
            'Completed artifact input/source/reference provenance drift')
    code_paths=[Path(__file__),Path(recon.__file__),Path(inventory.__file__),Path(review.__file__),Path(probe.__file__)]
    current_codes={str(p.relative_to(probe.ROOT)):digest(p) for p in code_paths}
    require(provenance['codeHashes']==current_codes,'Completed artifact code hashes drifted')
    parameters_digest=parameter_digest(params)
    require(plan['parametersSha256']==parameters_digest,'Parameter digest mismatch')
    amplitude=float(data['config']['twinkle']['amplitude'])
    expected_params={'targetMagnitudeMaximum':TARGET_MAGNITUDE,'masterScale':MASTER_SCALE,
      'shaderQuadCssPx':9,'twinkleAmplitude':amplitude,'twinkleMaximum':max(1.0,1+amplitude),
      'registrationPaddingMasterPx':REGISTRATION_PADDING,'featherMasterPx':FEATHER,
      'contextSize':CONTEXT_SIZE,'webpQuality':95,'webpMethod':4}
    require(params==expected_params,'Stored parameters differ from live renderer/producer settings')
    require(plan['encoder']=={'pillow':Image.__version__,'webp':features.version('webp'),
            'masterFormat':'RGB PNG lossless','webpQuality':95,'webpMethod':4},
            'Encoder/runtime provenance differs')
    require(plan['fixture']=={'path':str(FIXTURE_IMAGE.relative_to(probe.ROOT)),
            'sha256':digest(FIXTURE_IMAGE),'bounds':data['reference'],'masterDimensions':[3840,2160]},
            'Fixture descriptor differs from validated registered master')
    require(set(artifacts)=={Path(n).name for n in artifacts} and
            all(Path(n).suffix in {'.png','.webp','.txt','.json'} for n in artifacts),
            'Unsafe artifact filename')
    expected_files=set(artifacts)|{'region-plan.json'}
    require(not any(p.is_symlink() for p in out.iterdir()),'Symlink artifact is forbidden')
    require({p.name for p in out.iterdir()}==expected_files,'Completed artifact set has missing/extra files')
    for name,record in artifacts.items():
        require(Path(name).name==name and name not in ['.','..'],'Nonlocal artifact path')
        path=out/name
        require(path.is_file() and path.stat().st_size==record['bytes'] and digest(path)==record['sha256'],
                f'Artifact drift: {name}')
    with Image.open(out/'registered-original-2x.png') as im: original=np.asarray(im.convert('RGB'))
    with Image.open(out/'registered-clean-2x.png') as im: clean=np.asarray(im.convert('RGB'))
    with Image.open(out/'edit-union.png') as im: mask=np.asarray(im.convert('L'))>0
    require(original.shape==(2160,3840,3) and clean.shape==original.shape and mask.shape==original.shape[:2],
            'Registered master dimensions differ')
    with Image.open(FIXTURE_IMAGE) as im: fixture=np.asarray(im.convert('RGB'))
    require(np.array_equal(original,fixture) and np.array_equal(mask,union),'Stored master/mask differs from validated fixture/plan')
    outside=int(np.any(original[~mask]!=clean[~mask],axis=1).sum())
    preservation=plan['preservation']
    require(outside==0 and outside==preservation['outsideMaskDifferentPixels'] and
            preservation['editUnionPixels']==int(union.sum()) and
            preservation['changedPixels']==int(np.any(clean!=original,axis=2).sum()),
            'Registered-master preservation/counts failed')
    return {'mode':'completed-artifact-validation','passed':True,'writes':False,'targetCount':len(selected),
            'groupCount':expected_stats['connectedGroupCount'],'quadrantCounts':counts,
            'outsideMaskDifferentPixels':outside}


def run(version, validate_only):
    out=PRODUCTION/version
    require(re.fullmatch(r'[a-z][a-z0-9-]{0,47}',version) is not None,'Invalid version name; paths are forbidden')
    require(out.resolve().parent==PRODUCTION.resolve(),'Version must be direct production child')
    data,selected,centers,counts,fixture_manifest,fixture_record,checks,sizes,render_hash=current_preflight()
    union,alpha,regions,stats=build_plan(data,selected,centers,counts,sizes)
    if validate_only and (out/'region-plan.json').exists():
        print(json.dumps(validate_completed(out,data,selected,centers,counts,sizes,checks,render_hash)))
        return
    if validate_only:
        print(json.dumps({'mode':'preflight-only','passed':True,'writes':False,'targetCount':len(selected),
          'catalogCount':len(data['catalog']),'quadrantCounts':counts,'fixtureSha256':fixture_record['sha256'],
          'projectionValidated':True,'mask':stats,'artifactsValidated':False}))
        return
    require(not out.exists(),'Output version exists; refusing overwrite')
    out.mkdir(parents=True,exist_ok=False)
    with Image.open(FIXTURE_IMAGE) as im: original=np.asarray(im.convert('RGB')).copy()
    clean,feather,groups=reconstruct_master(original,union,alpha)
    Image.fromarray(original).save(out/'registered-original-2x.png')
    Image.fromarray(clean).save(out/'registered-clean-2x.png')
    Image.fromarray(union.astype(np.uint8)*255).save(out/'edit-union.png')
    Image.fromarray(np.rint(np.clip(feather,0,1)*255).astype(np.uint8)).save(out/'feather.png')
    Image.fromarray(clean).save(out/'background-2x.webp','WEBP',quality=95,method=4)
    Image.fromarray(clean).resize((1920,1080),Image.Resampling.LANCZOS).save(out/'background-1x.webp','WEBP',quality=95,method=4)
    frame_reports=write_review_frames(original,clean,data,out)
    quadrant_reports=write_quadrants(original,clean,data,out)
    require(render_buffer_digest(data)==render_hash,'Full mapped star/config buffers changed during preview generation')
    (out/'CREDITS.txt').write_text('ESO/S. Brunier — eso0932a — CC BY 4.0\n'
      'https://www.hq.eso.org/public/images/eso0932a/\nhttps://creativecommons.org/licenses/by/4.0/\n'
      'Adaptations: global projection/reprojection, crop/resampling, selective inferred region reconstruction, '
      'catalog overlays, lossless PNG and WebP95 derivatives, review shifts and thumbnails.\n'
      'Human approval pending; this file does not authorize application integration.\n')
    with Image.open(out/'registered-clean-2x.png') as im: decoded=np.asarray(im)
    outside=int(np.any(decoded[~union]!=original[~union],axis=1).sum())
    require(outside==0,'Decoded registered master changed pixels outside mask union')
    Image.fromarray(original[600:984,600:984]).save(out/'before-interior.png')
    Image.fromarray(clean[600:984,600:984]).save(out/'after-interior.png')
    # Local native before/after crops centered on the highest-magnitude target in fixture.
    j=min(range(len(regions)),key=lambda k:regions[k]['magnitude']); cx,cy=regions[j]['centerMasterXY']; cx,cy=int(round(cx)),int(round(cy))
    box=(max(0,cx-96),max(0,cy-96),min(3840,cx+96),min(2160,cy+96))
    Image.fromarray(original[box[1]:box[3],box[0]:box[2]]).save(out/'target-before-1to1.png')
    Image.fromarray(clean[box[1]:box[3],box[0]:box[2]]).save(out/'target-after-1to1.png')
    twinkle_amplitude=float(data['config']['twinkle']['amplitude'])
    summary={'status':'rebuilt-candidate-human-review-pending','approval':'pending','appEditAllowed':False,
      'targetCount':len(regions),'connectedGroupCount':len(groups),'quadrantCounts':counts,
      'outsideMaskDifferentPixels':outside,'changedPixels':int(np.any(decoded!=original,axis=2).sum()),
      'contactSheet':'contact-sheet.png','creditFile':'CREDITS.txt',
      'message':'All 112 planned targets reconstructed; this structural result is not image-quality approval.'}
    (out/'summary.json').write_text(json.dumps(summary,indent=2,allow_nan=False)+'\n')
    plan={'schema':1,'version':version,'approval':'pending','appEditAllowed':False,'fixture':{'path':str(FIXTURE_IMAGE.relative_to(probe.ROOT)),
      'sha256':fixture_record['sha256'],'bounds':fixture_manifest['referenceBounds'],'masterDimensions':[3840,2160]},
      'targetRegions':regions,'stats':stats,'groups':groups,'quadrants':quadrant_reports,'responsiveFrames':frame_reports,'preservation':{'outsideMaskDifferentPixels':outside,
      'editUnionPixels':int(union.sum()),'changedPixels':int(np.any(decoded!=original,axis=2).sum())},
      'provenance':{'sourceSha256':digest(SOURCE),'inputJsonSha256':digest(BASE/'input/current-sky.json'),
      'fixtureSha256':fixture_record['sha256'],'fixtureManifestSha256':digest(FIXTURE_MANIFEST),
      'reference':data['reference'],'validationSources':checks,'renderBuffersSha256':render_hash,
      'codeHashes':{str(p.relative_to(probe.ROOT)):digest(p) for p in [Path(__file__),Path(recon.__file__),Path(inventory.__file__),Path(review.__file__),Path(probe.__file__)]}},
      'parameters':{'targetMagnitudeMaximum':TARGET_MAGNITUDE,'masterScale':MASTER_SCALE,'shaderQuadCssPx':9,
      'twinkleAmplitude':twinkle_amplitude,'twinkleMaximum':1+twinkle_amplitude,
      'registrationPaddingMasterPx':REGISTRATION_PADDING,'featherMasterPx':FEATHER,'contextSize':CONTEXT_SIZE,
      'webpQuality':95,'webpMethod':4},
      'encoder':{'pillow':Image.__version__,'webp':features.version('webp'),
      'masterFormat':'RGB PNG lossless','webpQuality':95,'webpMethod':4},
      'artifacts':{p.name:{'sha256':digest(p),'bytes':p.stat().st_size} for p in sorted(out.iterdir()) if p.is_file()},
      'credit':'ESO/S. Brunier | CC BY 4.0; selective inferred regions, registered projection and lossless PNG proof.',
      'approval':'pending','appEditAllowed':False,
      'limitations':['Photographic source peaks are not individually identified.','Interior replacement is inferred, not physical hidden dust recovery.','Preview generation is local validation proof, not full responsive delivery.']}
    plan['parametersSha256']=parameter_digest(plan['parameters'])
    for group in groups:
        group['targetIds']=sorted(r['id'] for r in regions if r['connectedGroup']==group['groupId'])
    # Add final artifact hashes after every image, contact sheet and credit is written.
    plan['artifacts']={p.name:{'sha256':digest(p),'bytes':p.stat().st_size}
                       for p in sorted(out.iterdir()) if p.is_file()}
    (out/'region-plan.json').write_text(json.dumps(plan,indent=2,allow_nan=False)+'\n')
    print(json.dumps({'output':str(out.relative_to(probe.ROOT)),'targets':len(regions),'groups':len(groups),
      'preservation':plan['preservation'],'proofs':['target-before-1to1.png','target-after-1to1.png']}))


def main():
    parser=argparse.ArgumentParser(description=__doc__,epilog='Offline only. Exit 0 is structural success, never image approval.')
    parser.add_argument('--version',required=True,help='Fresh version label, lowercase letters/digits/hyphens, max48')
    parser.add_argument('--validate-only',action='store_true',help='Read-only preflight; if region-plan.json exists, also validates completed artifact set/hashes, provenance, 112-target/group coverage and outside-mask equality')
    args=parser.parse_args()
    try: run(args.version,args.validate_only)
    except (ValueError,OSError,KeyError,IndexError) as e:
        print('Error: '+str(e),file=sys.stderr); return 1
    return 0

if __name__=='__main__': raise SystemExit(main())
