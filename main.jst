import * as THREE from 'three';

// v51.104 compatibility/event patch loaded BEFORE the main game module.
// 1) removes the extra mobile pit lip that caused doubled/broken recess borders;
// 2) keeps pit walls slightly separated in depth to avoid z-fighting;
// 3) fixes rank badge crop + shine;
// 4) after a pour map first reaches 100%, switches its top surface after 30 s
//    to the earlier smooth/levelled fresh-concrete PBR set (v2).
// Rebar creation/material/height is intentionally untouched.

const TOUCH_DEVICE_PATCH = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
const DRY_AFTER_MS = 30_000;
const DRY_STORAGE_KEY = 'beton_concrete_cure_v5199';
const DRY_TEXTURE_DIR = TOUCH_DEVICE_PATCH
  ? './assets/final_mobile_textures'
  : './assets/final_pc_textures';

const concreteSurfaces = new Map();
const concreteSkirts = new Map();
const dryTimers = new Map();
const dryMaterials = new Map();

// v51.104: finer rebar texture tiling only; mesh/collision/height remain untouched.
const REBAR_REPEAT_MULT = 1.6;
const REBAR_NAME_RE = /(rebar|armat|армат)/i;
const patchedRebarTextures = new WeakSet();
let rebarPatchFrames = 0;
const originalRendererRender = THREE.WebGLRenderer.prototype.render;
function textureSourceLabel(tex) {
  if (!tex) return '';
  const img = tex.image || tex.source?.data || null;
  return String(img?.currentSrc || img?.src || tex.name || '');
}
function maybePatchRebarMaterial(material, meshName = '') {
  if (!material) return;
  const matName = String(material.name || '');
  const candidates = [material.map, material.normalMap, material.bumpMap, material.alphaMap, material.roughnessMap];
  const isRebar = REBAR_NAME_RE.test(meshName) || REBAR_NAME_RE.test(matName) || candidates.some(tex => REBAR_NAME_RE.test(textureSourceLabel(tex)));
  if (!isRebar) return;
  for (const tex of candidates) {
    if (!tex || patchedRebarTextures.has(tex)) continue;
    const label = textureSourceLabel(tex);
    if (!(REBAR_NAME_RE.test(label) || REBAR_NAME_RE.test(meshName) || REBAR_NAME_RE.test(matName))) continue;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    const rx = Number(tex.repeat?.x) || 1;
    const ry = Number(tex.repeat?.y) || 1;
    tex.repeat.set(Math.max(1, rx * REBAR_REPEAT_MULT), Math.max(1, ry * REBAR_REPEAT_MULT));
    tex.anisotropy = Math.max(Number(tex.anisotropy) || 0, TOUCH_DEVICE_PATCH ? 4 : 8);
    tex.needsUpdate = true;
    patchedRebarTextures.add(tex);
  }
  material.needsUpdate = true;
}
function patchRebarScene(scene) {
  if (!scene?.traverse) return;
  scene.traverse(obj => {
    if (!obj?.isMesh || !obj.material) return;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const material of materials) maybePatchRebarMaterial(material, String(obj.name || ''));
  });
}
THREE.WebGLRenderer.prototype.render = function patchedRender(scene, camera) {
  if (scene && rebarPatchFrames < 240) {
    patchRebarScene(scene);
    rebarPatchFrames += 1;
  }
  return originalRendererRender.call(this, scene, camera);
};


// v51.100: one PBR family for every runtime piece of still-liquid concrete.
// This deliberately does NOT touch rebar or the cured v2 floor material.
const liquidRuntimeMeshes = new Set();
const liquidPatchedMaterials = new WeakSet();
const LIQUID_RUNTIME_GROUPS = new Set([
  'CONCRETE_PHYSICS_BLOBS',
  'HOSE_SPLASH_PARTICLES',
  'HOSE_WET_SPOTS',
]);
let liquidTextures = null;
const liquidMapSets = new Map();

function cloneLiquidTexture(texture, repeat = 2) {
  const clone = texture.clone();
  clone.wrapS = THREE.RepeatWrapping;
  clone.wrapT = THREE.RepeatWrapping;
  clone.repeat.set(repeat, repeat);
  clone.colorSpace = texture.colorSpace;
  clone.anisotropy = TOUCH_DEVICE_PATCH ? 4 : 8;
  clone.needsUpdate = true;
  return clone;
}

function getLiquidMapSet(kind, repeat) {
  if (!liquidTextures) return null;
  const key = `${kind}:${repeat}`;
  let set = liquidMapSets.get(key);
  if (!set) {
    set = {
      albedo: cloneLiquidTexture(liquidTextures.albedo, repeat),
      normal: cloneLiquidTexture(liquidTextures.normal, repeat),
      height: cloneLiquidTexture(liquidTextures.height, repeat),
    };
    liquidMapSets.set(key, set);
  }
  return set;
}

const liquidTexturesPromise = Promise.all([
  loadTexture(`${DRY_TEXTURE_DIR}/wet_concrete_v3_albedo.webp`, true),
  loadTexture(`${DRY_TEXTURE_DIR}/wet_concrete_v3_normal.webp`, false),
  loadTexture(`${DRY_TEXTURE_DIR}/wet_concrete_v3_height.webp`, false),
]).then(([albedo, normal, height]) => {
  liquidTextures = { albedo, normal, height };
  for (const mesh of liquidRuntimeMeshes) applyLiquidConcreteLook(mesh);
  return liquidTextures;
}).catch(error => {
  console.warn('[v51.100] flowing concrete PBR maps unavailable', error);
  return null;
});

function liquidKindFor(mesh, parentName = '') {
  const name = String(mesh?.name || '');
  if (parentName === 'CONCRETE_PHYSICS_BLOBS') return 'blob';
  if (parentName === 'HOSE_SPLASH_PARTICLES') return 'drop';
  if (parentName === 'HOSE_WET_SPOTS') return 'spot';
  if (/^SURFACE_SPILL_/i.test(name)) return 'spill';
  if (/^FRESH_CONCRETE_ZONE_\d+(?:_SKIRT_.*)?$/i.test(name)) return 'surface';
  return '';
}

function applyLiquidConcreteLook(mesh, parentName = mesh?.parent?.name || '') {
  if (!mesh?.isMesh || !mesh.material) return;
  const kind = liquidKindFor(mesh, parentName);
  if (!kind) return;

  liquidRuntimeMeshes.add(mesh);
  if (!liquidTextures) return;

  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const material of materials) {
    if (!material || material.userData?.curedConcrete || liquidPatchedMaterials.has(material)) continue;

    // Main-game fresh floor surfaces already own a dynamic roughness map and
    // vertex wetness. Keep those systems and only enforce the same v3 maps.
    const repeat = kind === 'drop' ? 1 : kind === 'blob' ? 1.35 : kind === 'spot' ? 1.6 : 2.4;
    const maps = getLiquidMapSet(kind, repeat);
    material.map = maps?.albedo || material.map;

    if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
      material.normalMap = maps?.normal || material.normalMap;
      material.bumpMap = maps?.height || material.bumpMap;
      material.metalness = 0;
      if (kind === 'drop') {
        material.roughness = .20;
        material.normalScale = new THREE.Vector2(.10, .10);
        material.bumpScale = .003;
      } else if (kind === 'blob') {
        material.roughness = .22;
        material.normalScale = new THREE.Vector2(.16, .16);
        material.bumpScale = .006;
      } else if (kind === 'spill') {
        material.roughness = .24;
        material.normalScale = new THREE.Vector2(.22, .22);
        material.bumpScale = .010;
      } else if (kind === 'surface') {
        // Don't overwrite the per-zone dynamic roughness texture.
        material.normalScale = new THREE.Vector2(.28, .28);
        material.bumpScale = .014;
      } else {
        material.roughness = .28;
        material.normalScale = new THREE.Vector2(.12, .12);
        material.bumpScale = .004;
      }
      material.envMapIntensity = Math.max(.55, Number(material.envMapIntensity) || 0);
    } else if (kind === 'spot' && material.isMeshBasicMaterial) {
      // Flat splash decals cannot use normal maps. They still receive the exact
      // liquid albedo and keep their existing transparent/fade behaviour.
      material.color?.set?.(0xffffff);
    }

    material.color?.set?.(0xffffff);
    material.needsUpdate = true;
    liquidPatchedMaterials.add(material);
  }
}

function readDryState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DRY_STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}
let dryState = readDryState();

function writeDryState() {
  try { localStorage.setItem(DRY_STORAGE_KEY, JSON.stringify(dryState)); } catch (_) {}
}

function configureMap(texture, isColor = false) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.anisotropy = TOUCH_DEVICE_PATCH ? 4 : 8;
  texture.needsUpdate = true;
  return texture;
}

function loadTexture(url, isColor = false) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      texture => resolve(configureMap(texture, isColor)),
      undefined,
      reject
    );
  });
}

// v2 is the earlier smooth/levelled fresh-floor material; v3 remains the active
// flowing aggregate material used while the player is pouring/levelling.
const dryTexturesPromise = Promise.all([
  loadTexture(`${DRY_TEXTURE_DIR}/wet_concrete_v2_albedo.webp`, true),
  loadTexture(`${DRY_TEXTURE_DIR}/wet_concrete_v2_normal.webp`, false),
  loadTexture(`${DRY_TEXTURE_DIR}/wet_concrete_v2_height.webp`, false),
]).then(([albedo, normal, height]) => ({ albedo, normal, height }))
  .catch(error => {
    console.warn('[v51.99] smooth concrete maps unavailable; using material-only cure fallback', error);
    return null;
  });

function makeDryMaterial(zoneId, sourceMaterial, textures) {
  const material = sourceMaterial?.clone?.() || new THREE.MeshStandardMaterial();
  material.name = `CURED_CONCRETE_ZONE_${zoneId}_MATERIAL`;
  material.vertexColors = false;
  material.color = material.color || new THREE.Color();
  material.color.set(0xd3d6d2);
  material.metalness = 0;
  material.roughness = .73;
  material.roughnessMap = null;
  material.envMapIntensity = .46;
  material.transparent = false;
  material.opacity = 1;
  material.side = THREE.DoubleSide;
  material.polygonOffset = true;
  material.polygonOffsetFactor = -1;
  material.polygonOffsetUnits = -2;

  if (textures) {
    material.map = textures.albedo;
    material.normalMap = textures.normal;
    material.normalScale = new THREE.Vector2(.16, .16);
    material.bumpMap = textures.height;
    material.bumpScale = .006;
  } else {
    material.normalMap = null;
    material.bumpMap = null;
  }

  material.userData = {
    ...(material.userData || {}),
    curedConcrete: true,
    curedAt: Date.now(),
  };
  material.needsUpdate = true;
  return material;
}

async function applyCuredLook(zoneId) {
  const id = Number(zoneId);
  if (!Number.isFinite(id) || id < 1) return;
  const surface = concreteSurfaces.get(id);
  if (!surface) return;

  if (surface.userData?.curedConcrete) return;
  const textures = await dryTexturesPromise;
  if (!surface.parent && !surface.isObject3D) return;

  let material = dryMaterials.get(id);
  if (!material) {
    material = makeDryMaterial(id, surface.material, textures);
    dryMaterials.set(id, material);
  }

  surface.material = material;
  surface.userData = { ...(surface.userData || {}), curedConcrete: true };

  // Keep only the top material change dramatic. Skirts merely become neutral/matte
  // so the cured top does not retain a glossy dark vertical rim.
  for (const skirt of concreteSkirts.get(id) || []) {
    const sideMat = skirt.material?.clone?.() || new THREE.MeshStandardMaterial();
    sideMat.map = null;
    sideMat.normalMap = null;
    sideMat.bumpMap = null;
    sideMat.roughnessMap = null;
    sideMat.color?.set?.(0x767b76);
    sideMat.roughness = .86;
    sideMat.metalness = 0;
    sideMat.needsUpdate = true;
    skirt.material = sideMat;
  }

  dryState[id] = { ...(dryState[id] || {}), cured: true, cureAt: Date.now() };
  writeDryState();
}

function armCure(zoneId, delay = DRY_AFTER_MS) {
  const id = Number(zoneId);
  if (!Number.isFinite(id) || id < 1) return;
  if (dryState[id]?.cured) {
    applyCuredLook(id);
    return;
  }
  if (dryTimers.has(id)) return;

  const now = Date.now();
  const existingAt = Number(dryState[id]?.cureAt || 0);
  const cureAt = existingAt > 0 ? existingAt : now + Math.max(0, delay);
  dryState[id] = { ...(dryState[id] || {}), cureAt, cured: false };
  writeDryState();

  const remaining = Math.max(0, cureAt - now);
  const timer = setTimeout(() => {
    dryTimers.delete(id);
    applyCuredLook(id);
  }, remaining);
  dryTimers.set(id, timer);
}

function registerRuntimeConcreteObject(object) {
  if (!object?.name) return;
  let match = /^FRESH_CONCRETE_ZONE_(\d+)$/.exec(object.name);
  if (match) {
    const id = Number(match[1]);
    concreteSurfaces.set(id, object);
    if (dryState[id]?.cured) applyCuredLook(id);
    else if (Number(dryState[id]?.cureAt || 0) > 0) armCure(id);
    return;
  }

  match = /^FRESH_CONCRETE_ZONE_(\d+)_SKIRT_/.exec(object.name);
  if (match) {
    const id = Number(match[1]);
    const list = concreteSkirts.get(id) || [];
    if (!list.includes(object)) list.push(object);
    concreteSkirts.set(id, list);
  }
}

// Apply the rim fix BEFORE main.js constructs runtime pit geometry.
const originalAdd = THREE.Object3D.prototype.add;
THREE.Object3D.prototype.add = function (...objects) {
  const kept = [];
  for (const object of objects) {
    const name = object?.name || '';

    // v51.98: these decorative mobile bands overlapped the real walls/slab and
    // produced the doubled black/jagged border. Do not touch rebar layers.
    if (name.startsWith('PIT_') && name.includes('_LIP_')) {
      object.geometry?.dispose?.();
      continue;
    }

    if (name.startsWith('PIT_') && name.includes('_WALL_') && object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!material) continue;
        material.polygonOffset = true;
        material.polygonOffsetFactor = 1;
        material.polygonOffsetUnits = 2;
        material.needsUpdate = true;
      }
      object.renderOrder = Math.max(Number(object.renderOrder) || 0, 3);
    }

    registerRuntimeConcreteObject(object);
    applyLiquidConcreteLook(object, this?.name || '');
    kept.push(object);
  }
  return originalAdd.apply(this, kept);
};

// Rank badge: slightly zoom into each sprite cell to eliminate sampling from the
// neighbouring badge, clip the troublesome bottom few pixels, and replace the old
// unbounded shine with a narrow, fully clipped diagonal sheen.
const patchStyle = document.createElement('style');
patchStyle.id = 'v5199-rank-badge-fix';
patchStyle.textContent = `
.settlementRankBadge{
  overflow:hidden!important;
  isolation:isolate!important;
  background-size:306% 206%!important;
  background-repeat:no-repeat!important;
  clip-path:polygon(6% 1%,94% 1%,100% 15%,98% 91%,88% 98%,12% 98%,2% 91%,0 15%)!important;
}
.settlementRankCard[data-grade="S"] .settlementRankBadge{background-position:0 0!important}
.settlementRankCard[data-grade="A"] .settlementRankBadge{background-position:50% 0!important}
.settlementRankCard[data-grade="B"] .settlementRankBadge,
.settlementRankCard[data-grade="C"] .settlementRankBadge{background-position:100% 0!important}
.settlementRankCard[data-grade="D"] .settlementRankBadge{background-position:0 100%!important}
.settlementRankCard[data-grade="E"] .settlementRankBadge{background-position:50% 100%!important}
.settlementRankCard[data-grade="F"] .settlementRankBadge{background-position:100% 100%!important}

.settlementRankOverride{
  left:33%!important;
  top:32%!important;
  width:34%!important;
  height:38%!important;
  display:grid!important;
  place-items:center!important;
  clip-path:polygon(12% 5%,88% 5%,100% 22%,92% 92%,8% 92%,0 22%)!important;
  background:radial-gradient(circle at 50% 30%,rgba(48,57,63,.98),rgba(7,11,14,.98) 72%)!important;
  color:#f7fbff!important;
  border:1px solid rgba(255,255,255,.17)!important;
  box-shadow:inset 0 0 20px rgba(255,255,255,.05),0 3px 10px rgba(0,0,0,.42)!important;
  font:1000 clamp(66px,9vw,132px)/1 Impact,"Arial Black",system-ui,sans-serif!important;
  letter-spacing:-.06em!important;
  -webkit-text-stroke:clamp(3px,.42vw,6px) #05080a!important;
  text-shadow:0 4px 0 rgba(0,0,0,.18)!important;
  paint-order:stroke fill!important;
}

.settlementRankBadge::before{
  content:""!important;
  display:block!important;
  position:absolute!important;
  z-index:8!important;
  top:-18%!important;
  left:-42%!important;
  width:24%!important;
  height:136%!important;
  pointer-events:none!important;
  background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,247,205,.14) 22%,rgba(255,255,255,.88) 50%,rgba(255,247,205,.14) 78%,rgba(255,255,255,0))!important;
  filter:blur(1.2px)!important;
  mix-blend-mode:screen!important;
  transform:skewX(-17deg) translateX(0)!important;
  animation:v5199BadgeSheen 1.9s ease-in-out .35s infinite!important;
}
.settlementRankBadge::after{display:none!important;animation:none!important}
@keyframes v5199BadgeSheen{
  0%,12%{left:-42%;opacity:0}
  20%{opacity:.95}
  52%{left:118%;opacity:.9}
  60%,100%{left:118%;opacity:0}
}
@media(pointer:coarse),(max-width:820px){
  .settlementRankOverride{font-size:min(14vh,10vw)!important;-webkit-text-stroke:3px!important}
}

/* v51.104 event minigames */
.betonEventQte{position:fixed;inset:0;z-index:180;display:none;place-items:center;background:rgba(5,7,7,.54);backdrop-filter:blur(2px);font-family:Inter,system-ui,sans-serif;color:#fff;pointer-events:auto}
.betonEventQte.show{display:grid}
.betonEventPanel{width:min(620px,86vw);padding:20px 22px 18px;border-radius:20px;background:linear-gradient(180deg,rgba(27,30,30,.97),rgba(11,13,13,.97));border:1px solid rgba(255,210,91,.48);box-shadow:0 24px 80px rgba(0,0,0,.65)}
.betonEventPanel h3{margin:0 0 5px;font-size:22px;letter-spacing:.03em}.betonEventPanel p{margin:0 0 15px;color:#bfc5c2;font-size:12px}
.betonEventClose{position:absolute;right:10px;top:8px;border:0;background:rgba(0,0,0,.35);color:#d5dad7;font-size:26px;width:34px;height:34px;border-radius:10px;z-index:8}

/* Real-art hose recovery UI: frame + actual hose + improvised grip + blue-glove arm. */
#betonHoseControl{background:rgba(5,7,7,.26);backdrop-filter:blur(1.5px)}
.betonHoseControlCard{position:relative;width:min(430px,92vw);padding:12px 14px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(25,28,27,.97),rgba(8,10,10,.97));border:1px solid rgba(234,190,76,.42);box-shadow:0 22px 72px rgba(0,0,0,.68);user-select:none;-webkit-user-select:none;touch-action:none;overflow:visible}
.betonHoseControlTitle{text-align:center;margin:0 0 5px;font-weight:1000;font-size:15px;letter-spacing:.08em;color:#f0d16e}
.betonHoseRig{position:relative;margin:0 auto;width:min(250px,58vw);aspect-ratio:688/1536;overflow:visible}
.betonHoseFrame{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;z-index:1}
.betonHoseSlot{position:absolute;left:27.2%;top:12.8%;width:28.8%;height:75.2%;overflow:visible;z-index:3}
.betonHoseBody{position:absolute;left:50%;bottom:0;width:43%;min-height:12%;transform:translateX(-50%);overflow:hidden;will-change:height}
.betonHoseBody img{position:absolute;left:0;bottom:0;width:100%;height:100%;object-fit:fill;filter:drop-shadow(0 2px 3px rgba(0,0,0,.65))}
.betonHoseGrip{position:absolute;left:50%;bottom:62%;width:178%;height:auto;transform:translate(-50%,50%);z-index:5;pointer-events:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.9));will-change:bottom,filter}
.betonHoseGrip.hit{filter:drop-shadow(0 0 2px #ffe584) drop-shadow(0 0 7px rgba(242,193,64,.95)) drop-shadow(0 0 17px rgba(242,193,64,.55))}
.betonHoseArm{position:absolute;width:139%;left:-67%;bottom:42%;height:auto;z-index:7;pointer-events:none;transform:translateY(50%);filter:drop-shadow(0 4px 6px rgba(0,0,0,.6));will-change:bottom,filter}
.betonHoseArm.hit{filter:drop-shadow(0 0 5px rgba(255,222,117,.55)) drop-shadow(0 4px 6px rgba(0,0,0,.6))}
.betonHoseProgressSlot{position:absolute;left:60.5%;top:13.25%;width:6.65%;height:74.4%;border-radius:999px;overflow:hidden;z-index:4;background:#111413;box-shadow:inset 0 0 8px #000}
.betonHoseProgressSlot i{position:absolute;left:10%;right:10%;bottom:1%;height:18%;border-radius:999px;background:linear-gradient(0deg,#4d2c03 0%,#8a5208 28%,#c98417 62%,#ffd477 100%);box-shadow:0 -2px 10px rgba(239,198,77,.25);will-change:height}
.betonHoseControlHint{text-align:center;margin-top:4px;font-size:10px;font-weight:850;letter-spacing:.045em;color:#c8cecb;line-height:1.35}.betonHoseControlHint b{color:#efd06f}
.betonHoseControlState{text-align:center;margin-top:4px;min-height:15px;font-size:10px;font-weight:950;letter-spacing:.06em;color:#e7c65f}
#betonHoseControl.pressed .betonHoseControlCard{border-color:rgba(246,203,85,.72)}

/* Eye event uses the actual concrete splat art. */
#betonEyeWipe{background:transparent;backdrop-filter:none;pointer-events:auto;overflow:hidden}
.betonEyeBlob{position:absolute;left:7%;top:4%;width:86%;height:86%;object-fit:contain;filter:drop-shadow(0 10px 20px rgba(0,0,0,.62));opacity:.98;transform:rotate(-3deg);transition:opacity .16s,transform .08s;pointer-events:none}
.betonEyeTrack{position:absolute;left:18%;right:18%;top:53%;height:8px;border-radius:9px;background:rgba(255,255,255,.18);box-shadow:0 0 0 1px rgba(255,255,255,.17),0 3px 12px rgba(0,0,0,.45)}
.betonEyeTrack i{position:absolute;left:0;top:50%;width:42px;height:42px;border-radius:50%;transform:translate(-50%,-50%);background:#f4c858;box-shadow:0 0 22px rgba(244,200,88,.68)}
.betonEyeHint{position:absolute;left:50%;top:62%;transform:translateX(-50%);font-size:13px;font-weight:950;letter-spacing:.08em;text-shadow:0 2px 7px #000;white-space:nowrap}

/* Grid-snapped pump repair puzzle. */
#betonPumpPuzzle{background:rgba(4,5,5,.64);backdrop-filter:blur(3px)}
.betonPumpPuzzleWrap{position:relative;width:min(720px,92vw);text-align:center}
.betonPumpPuzzleTitle{margin:0 0 5px;font-size:20px;font-weight:1000;letter-spacing:.07em}.betonPumpPuzzleSub{margin:0 0 8px;color:#c6cbc8;font-size:11px;font-weight:750}
.betonPumpShell{position:relative;width:min(680px,90vw);aspect-ratio:1;margin:auto;background:url("./assets/ui/events/pump_panel.png") center/contain no-repeat;filter:drop-shadow(0 18px 36px rgba(0,0,0,.6))}
.betonWireCanvas{position:absolute;left:14.15%;top:13.9%;width:71.0%;height:70.7%;display:block;touch-action:none}
.betonWireStatus{margin-top:7px;min-height:18px;color:#e9c963;font-size:11px;font-weight:900;letter-spacing:.04em}

#eventAlarm[data-event="pressure"]::before,#eventAlarm[data-event="pump"]::before{content:"";display:block;width:42px;height:42px;flex:0 0 42px;background-position:center;background-repeat:no-repeat;background-size:contain;margin-right:9px}
#eventAlarm[data-event="pressure"]::before{background-image:url("./assets/ui/events/alarm_pressure.png")}
#eventAlarm[data-event="pump"]::before{background-image:url("./assets/ui/events/alarm_pump.png")}

.settlementStatsEvent{grid-column:1/-1!important}.settlementStatsEvent b[data-state="ИДЕАЛЬНО"]{color:#8cf0a6!important}.settlementStatsEvent b[data-state="ЧАСТИЧНО"]{color:#f4ce6c!important}.settlementStatsEvent b[data-state="ПРОВАЛ"]{color:#ff8b7f!important}

@media(max-width:820px){
  .betonHoseControlCard{width:min(360px,92vw);padding:9px 10px}.betonHoseRig{width:min(220px,54vw)}.betonHoseControlHint{font-size:9px}
  .betonPumpPuzzleWrap{width:94vw}.betonPumpPuzzleTitle{font-size:17px}.betonPumpPuzzleSub{font-size:10px}
  .betonEyeHint{top:67%;font-size:11px}
}
`;
document.head.appendChild(patchStyle);

function parsePercent(text) {
  const match = String(text || '').replace(',', '.').match(/(-?\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : NaN;
}

function scanPourCompletion() {
  const zoneText = document.querySelector('#zoneProgress')?.textContent || '';
  const fillText = document.querySelector('#fillPercent')?.textContent || '';
  const toastText = `${document.querySelector('#toast')?.textContent || ''} ${document.querySelector('#mobileToast')?.textContent || ''}`;

  // Strongest signal: the game itself announces the completed map.
  for (const match of toastText.matchAll(/КАРТА\s*№\s*(\d+)\s*ЗАЛИТА/gi)) {
    armCure(Number(match[1]));
  }

  // Start exactly when the currently displayed map first reaches 100%.
  const currentMatch = zoneText.match(/№\s*(\d+)/i);
  const currentId = currentMatch ? Number(currentMatch[1]) : NaN;
  const fill = parsePercent(fillText);
  if (Number.isFinite(currentId) && Number.isFinite(fill) && fill >= 100) {
    armCure(currentId);
  }

  // Saved sessions: maps already counted as completed are older than the current
  // map. If they predate v51.99 and have no timestamp, show them cured immediately.
  const doneMatch = zoneText.match(/готово\s*(\d+)\s*\/\s*6/i);
  const done = doneMatch ? Number(doneMatch[1]) : 0;
  if (Number.isFinite(done) && done > 0) {
    for (let id = 1; id <= done; id++) {
      if (!dryState[id]) {
        dryState[id] = { cured: true, cureAt: Date.now() };
        writeDryState();
        applyCuredLook(id);
      }
    }
  }
}

// v51.102 rewrites only the event subsystem inside the current game module at load time.
// This keeps the repository's main.js untouched while still allowing the event code to use
// the real hose/zone/pump state instead of trying to control it from outside the module.
const mainSourceResponse = await fetch('https://raw.githubusercontent.com/alexunderpetlya-del/betonshik/991cea6d05dd0a1355618669fcec98311248035d/main.js', { cache: 'no-store' });
if (!mainSourceResponse.ok) throw new Error(`base main.js HTTP ${mainSourceResponse.status}`);
let mainSource = await mainSourceResponse.text();

const eventBlockPattern = /const POUR_EVENT_TYPES = \['pressure', 'hose', 'pump', 'eye'\];[\s\S]*?\n}\n\n\/\/ Deliberately simple material ladder requested for settlement:/;
const eventBlockReplacement = String.raw`const POUR_EVENT_TYPES = ['pressure', 'hose', 'pump', 'eye'];
const POUR_EVENT_COPY = {
  pressure: { title: 'СКАЧОК ДАВЛЕНИЯ', text: '0,5 СЕК · ОТВЕДИ ШЛАНГ ИЛИ ВЫКЛЮЧИ ПОДАЧУ' },
  hose: { title: 'ШЛАНГ ВЫСКОЛЬЗНУЛ', text: 'ПЕРЕХВАТИ ЕГО' },
  pump: { title: 'ПОЛОМКА НАСОСА', text: 'ПОДАЧА ОСТАНОВЛЕНА' },
  eye: { title: 'БЕТОН В ГЛАЗ', text: 'СМАХНИ БЕТОН' },
};
const EVENT_ALARM_SECONDS = .50;
let pendingPourEvent = null;
let eventAlarmTimer = 0;
let pumpBroken = false;
let pressureSpikePending = false;
let pressureSpikeVolumeM3 = 0;
let blindnessTimer = 0;
let hoseRecoveryNeeded = false;
let hoseControlActive = false;
let hoseWhipClock = 0;
let hoseControlHeld = false;
let hoseControlPointer = null;
let hoseControlZoneY = .18;
let hoseControlZoneVel = 0;
let hoseControlTargetY = .64;
let hoseControlTargetVel = 0;
let hoseControlProgress = .18;
let hoseControlMissTime = 0;
let hoseControlChaosClock = 0;
let hoseControlKickTimer = .28;
let hoseControlHapticStep = 0;
let hoseControlFailures = 0;
let eyeWipeStartedAt = 0;
window.__betonEventResult = '—';
const HOSE_CONTROL_PROGRESS_GAIN = .72;
const HOSE_CONTROL_PROGRESS_LOSS = .31;
const HOSE_CONTROL_FAIL_AFTER = 2.35;
let pumpPuzzleOpen = false;
let eyeWipeActive = false;
let eyeWipePointer = null;
let eyeWipeStartX = 0;

// Pressure slug visibly travels through the hose during the common 0.5 s alarm.
// It uses the exact hose material, so it reads like a physical bulge inside the rubber line.
const pressurePulseGeom = new THREE.SphereGeometry(.17, TOUCH_DEVICE ? 10 : 16, TOUCH_DEVICE ? 7 : 10);
const pressurePulseMat = hoseMat.clone();
pressurePulseMat.roughness = Math.max(.78, pressurePulseMat.roughness || .9);
const pressurePulseMesh = new THREE.Mesh(pressurePulseGeom, pressurePulseMat);
pressurePulseMesh.name = 'PRESSURE_SLUG_INSIDE_HOSE';
pressurePulseMesh.visible = false;
pressurePulseMesh.castShadow = !TOUCH_DEVICE;
pressurePulseMesh.raycast = () => {};
scene.add(pressurePulseMesh);
const pressurePulsePos = new THREE.Vector3();
const pressurePulseTangent = new THREE.Vector3();

function updatePressureHosePulse() {
  const active = pendingPourEvent?.type === 'pressure' && eventAlarmTimer > 0 && hosePoints.length > 1;
  pressurePulseMesh.visible = active;
  if (!active) return;
  const t = THREE.MathUtils.clamp(1 - eventAlarmTimer / EVENT_ALARM_SECONDS, 0, 1);
  const f = t * (hosePoints.length - 1);
  const i0 = Math.min(hosePoints.length - 2, Math.floor(f));
  const i1 = i0 + 1;
  const lt = f - i0;
  pressurePulsePos.copy(hosePoints[i0]).lerp(hosePoints[i1], lt);
  pressurePulseMesh.position.copy(pressurePulsePos);
  pressurePulseTangent.copy(hosePoints[i1]).sub(hosePoints[i0]).normalize();
  pressurePulseMesh.quaternion.setFromUnitVectors(Y_AXIS, pressurePulseTangent);
  const swell = 1 + Math.sin(t * Math.PI) * .18;
  pressurePulseMesh.scale.set(.92 * swell, 1.45 * swell, .92 * swell);
}

function ensureHoseControlUi() {
  let root = document.querySelector('#betonHoseControl');
  if (root) return root;
  root = document.createElement('div');
  root.id = 'betonHoseControl';
  root.className = 'betonEventQte';
  root.innerHTML = '<div class="betonHoseControlCard"><div class="betonHoseControlTitle">ПЕРЕХВАТИ ШЛАНГ</div><div class="betonHoseRig"><img class="betonHoseFrame" src="./assets/ui/events/hose_frame.png" alt=""><div class="betonHoseSlot"><div class="betonHoseBody"><img src="./assets/ui/events/hose.png" alt=""></div><img class="betonHoseGrip" src="./assets/ui/events/grip.png" alt=""></div><img class="betonHoseArm" src="./assets/ui/events/arm.png" alt=""><div class="betonHoseProgressSlot"><i></i></div></div><div class="betonHoseControlHint"><b>ЗАЖМИ</b> — РУКА ВВЕРХ · <b>ОТПУСТИ</b> — ВНИЗ</div><div class="betonHoseControlState">ДЕРЖИ ЛАДОНЬ НА РУКОЯТКЕ</div></div>';
  document.body.appendChild(root);

  const press = e => {
    if (!hoseControlActive) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    hoseControlHeld = true;
    hoseControlPointer = e.pointerId;
    root.classList.add('pressed');
    try { root.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  };
  const release = e => {
    if (!hoseControlActive) return;
    if (hoseControlPointer !== null && e.pointerId !== hoseControlPointer) return;
    hoseControlHeld = false;
    hoseControlPointer = null;
    root.classList.remove('pressed');
    e.preventDefault?.();
  };
  root.addEventListener('pointerdown', press, { passive:false });
  root.addEventListener('pointerup', release, { passive:false });
  root.addEventListener('pointercancel', release, { passive:false });
  root.addEventListener('contextmenu', e => e.preventDefault());
  return root;
}

function updateHoseControlUi(hit = false) {
  const root = ensureHoseControlUi();
  const body = root.querySelector('.betonHoseBody');
  const grip = root.querySelector('.betonHoseGrip');
  const arm = root.querySelector('.betonHoseArm');
  const progress = root.querySelector('.betonHoseProgressSlot i');
  const state = root.querySelector('.betonHoseControlState');

  const slotBottom = 11.95;
  const slotRange = 75.0;
  const targetY = THREE.MathUtils.clamp(hoseControlTargetY, .24, .97);
  const handY = THREE.MathUtils.clamp(hoseControlZoneY, .03, .97);
  if (body) body.style.height = Math.max(12, targetY * 100) + '%';
  if (grip) {
    grip.style.bottom = (targetY * 100) + '%';
    grip.classList.toggle('hit', hit);
  }
  if (arm) {
    arm.style.bottom = (slotBottom + handY * slotRange) + '%';
    arm.classList.toggle('hit', hit);
  }
  if (progress) progress.style.height = Math.max(1, THREE.MathUtils.clamp(hoseControlProgress, 0, 1) * 98) + '%';
  if (state) state.textContent = hit ? 'ЗАХВАТ ЕСТЬ · УДЕРЖИВАЙ' : 'ПОЙМАЙ РУКОЯТКУ ЛАДОНЬЮ';
}

function startHoseControlQTE() {
  if (!hoseRecoveryNeeded || hoseHeld || hoseControlActive) return;
  hoseControlActive = true;
  hoseControlHeld = false;
  hoseControlPointer = null;
  hoseControlZoneY = .20;
  hoseControlZoneVel = 0;
  hoseControlTargetY = THREE.MathUtils.randFloat(.46, .76);
  hoseControlTargetVel = THREE.MathUtils.randFloat(-.18, .18);
  hoseControlProgress = .18;
  hoseControlMissTime = 0;
  hoseControlChaosClock = 0;
  hoseControlKickTimer = THREE.MathUtils.randFloat(.18, .34);
  hoseControlHapticStep = 0;
  hoseControlFailures = 0;
  const root = ensureHoseControlUi();
  root.classList.add('show');
  root.classList.remove('pressed');
  updateHoseControlUi(false);
  if (document.pointerLockElement) document.exitPointerLock();
}

function failHoseControlQTE() {
  if (!hoseControlActive) return;
  hoseControlFailures += 1;
  window.__betonEventResult = 'ПРОВАЛ';
  hoseControlActive = false;
  hoseControlHeld = false;
  hoseControlPointer = null;
  ensureHoseControlUi().classList.remove('show','pressed');
  if (hoseInteraction) hoseInteraction.text = 'E — удержать шланг · БЕТОН ЛЬЁТСЯ!';
  showToast('ШЛАНГ ВЫРВАЛСЯ — ПОДОЙДИ И ПОПРОБУЙ ЕЩЁ', 2.1);
  requestMouseLock();
}

function completeHoseControlQTE() {
  if (!hoseControlActive) return;
  hoseControlActive = false;
  hoseControlHeld = false;
  hoseControlPointer = null;
  hoseRecoveryNeeded = false;
  hoseControlProgress = 1;
  window.__betonEventResult = hoseControlFailures > 0 ? 'ЧАСТИЧНО' : 'ИДЕАЛЬНО';
  ensureHoseControlUi().classList.remove('show','pressed');
  hoseHeld = true;
  if (hoseInteraction) hoseInteraction.text = pouring ? 'E — бросить шланг · БЕТОН ЛЬЁТСЯ' : 'E — бросить шланг';
  showToast('ШЛАНГ СНОВА ПОД КОНТРОЛЕМ', 1.8);
  mobileHaptic(24);
  resetQTECooldown();
  requestMouseLock();
}

function updateHoseControlQTE(dt) {
  if (!hoseControlActive) return;
  dt = Math.min(dt, .05);
  hoseControlChaosClock += dt;

  // Stardew-like hand control: hold lifts the arm, release lets it fall.
  const playerAccel = hoseControlHeld ? 2.72 : -2.48;
  hoseControlZoneVel += playerAccel * dt;
  hoseControlZoneVel *= Math.exp(-2.62 * dt);
  hoseControlZoneVel = THREE.MathUtils.clamp(hoseControlZoneVel, -.96, .96);
  hoseControlZoneY += hoseControlZoneVel * dt;
  if (hoseControlZoneY < .035) { hoseControlZoneY = .035; hoseControlZoneVel *= -.16; }
  if (hoseControlZoneY > .965) { hoseControlZoneY = .965; hoseControlZoneVel *= -.16; }

  // The hose end/grip jumps up and down while its body remains anchored to the bottom of the gauge.
  const difficulty = THREE.MathUtils.clamp((activePourZoneIndex || 0) / Math.max(1, POUR_ZONES.length - 1), 0, 1);
  hoseControlKickTimer -= dt;
  if (hoseControlKickTimer <= 0) {
    hoseControlKickTimer = THREE.MathUtils.randFloat(.22, .46);
    hoseControlTargetVel += THREE.MathUtils.randFloatSpread(THREE.MathUtils.lerp(.40, .66, difficulty));
  }
  hoseControlTargetVel += Math.sin(hoseControlChaosClock * 5.55) * .20 * dt;
  hoseControlTargetVel *= Math.exp(-1.42 * dt);
  const maxTargetSpeed = THREE.MathUtils.lerp(.54, .76, difficulty);
  hoseControlTargetVel = THREE.MathUtils.clamp(hoseControlTargetVel, -maxTargetSpeed, maxTargetSpeed);
  hoseControlTargetY += hoseControlTargetVel * dt;
  if (hoseControlTargetY < .25) { hoseControlTargetY = .25; hoseControlTargetVel = Math.abs(hoseControlTargetVel) * .74; }
  if (hoseControlTargetY > .955) { hoseControlTargetY = .955; hoseControlTargetVel = -Math.abs(hoseControlTargetVel) * .74; }

  const catchTolerance = THREE.MathUtils.lerp(.090, .064, difficulty);
  const hit = Math.abs(hoseControlTargetY - hoseControlZoneY) <= catchTolerance;

  if (hit) {
    hoseControlProgress = Math.min(1, hoseControlProgress + dt * HOSE_CONTROL_PROGRESS_GAIN);
    hoseControlMissTime = Math.max(0, hoseControlMissTime - dt * 1.8);
  } else {
    hoseControlProgress = Math.max(0, hoseControlProgress - dt * HOSE_CONTROL_PROGRESS_LOSS);
    hoseControlMissTime += dt;
  }

  const hapticStep = Math.floor(hoseControlProgress * 4);
  if (hit && hapticStep > hoseControlHapticStep) { hoseControlHapticStep = hapticStep; mobileHaptic(7); }
  updateHoseControlUi(hit);

  if (hoseControlProgress >= .999) completeHoseControlQTE();
  else if (hoseControlProgress <= .001 && hoseControlMissTime >= HOSE_CONTROL_FAIL_AFTER) failHoseControlQTE();
}

window.addEventListener('keydown' , e => {
  if (!hoseControlActive || e.repeat) return;
  if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') {
    hoseControlHeld = true;
    ensureHoseControlUi().classList.add('pressed');
    e.preventDefault();
  }
}, true);
window.addEventListener('keyup', e => {
  if (!hoseControlActive) return;
  if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') {
    hoseControlHeld = false;
    ensureHoseControlUi().classList.remove('pressed');
    e.preventDefault();
  }
}, true);

function ensureEyeWipeUi() {
  let root = document.querySelector('#betonEyeWipe');
  if (root) return root;
  root = document.createElement('div');
  root.id = 'betonEyeWipe';
  root.className = 'betonEventQte';
  root.innerHTML = '<img class="betonEyeBlob" src="./assets/ui/events/eye_splat.png" alt=""><div class="betonEyeTrack"><i></i></div><div class="betonEyeHint">СМАХНИ БЕТОН СЛЕВА НАПРАВО</div>';
  document.body.appendChild(root);
  const track = root.querySelector('.betonEyeTrack i');
  root.addEventListener('pointerdown', e => {
    if (!eyeWipeActive) return;
    eyeWipePointer = e.pointerId; eyeWipeStartX = e.clientX;
    try { root.setPointerCapture(e.pointerId); } catch (_) {}
    if (track) track.style.left = THREE.MathUtils.clamp(e.clientX / innerWidth * 100, 0, 100)+'%';
    e.preventDefault();
  }, { passive:false });
  root.addEventListener('pointermove', e => {
    if (!eyeWipeActive || e.pointerId !== eyeWipePointer) return;
    const progress = THREE.MathUtils.clamp((e.clientX - eyeWipeStartX) / Math.max(180, innerWidth * .38), 0, 1);
    if (track) track.style.left = (progress * 100)+'%';
    const blob = root.querySelector('.betonEyeBlob');
    if (blob) blob.style.transform = 'translateX('+(progress*30)+'vw) rotate('+(progress*8-3)+'deg)';
    if (progress >= .92) finishEyeWipe(false);
    e.preventDefault();
  }, { passive:false });
  const end = e => { if (e.pointerId === eyeWipePointer) eyeWipePointer = null; };
  root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);
  return root;
}
function startEyeWipe() {
  eyeWipeActive = true;
  eyeWipeStartedAt = performance.now();
  blindnessTimer = 2.4;
  blindnessOverlayEl?.classList.remove('active');
  const root = ensureEyeWipeUi();
  root.classList.add('show');
  const blob = root.querySelector('.betonEyeBlob'); if (blob) { blob.style.opacity='.98'; blob.style.transform='rotate(-3deg)'; }
  const dot = root.querySelector('.betonEyeTrack i'); if (dot) dot.style.left='0%';
  if (document.pointerLockElement) document.exitPointerLock();
}
function finishEyeWipe(autoClear = false) {
  if (!eyeWipeActive) return;
  const elapsed = Math.max(0, (performance.now() - eyeWipeStartedAt) / 1000);
  window.__betonEventResult = autoClear ? 'ПРОВАЛ' : (elapsed <= 1.15 ? 'ИДЕАЛЬНО' : 'ЧАСТИЧНО');
  eyeWipeActive = false; blindnessTimer = 0; eyeWipePointer = null;
  const root = ensureEyeWipeUi();
  const blob = root.querySelector('.betonEyeBlob'); if (blob) blob.style.opacity='0';
  setTimeout(() => root.classList.remove('show'), 170);
  requestMouseLock();
}

const WIRE_COLORS = ['#ff554d','#47a7ff','#f7cb4b','#52d17f'];
const WIRE_GRID_COLS = 9;
const WIRE_GRID_ROWS = 9;
const WIRE_ENDPOINT_ROWS = [1,3,5,7];
const WIRE_BLOCK_TEMPLATES = [
  [[4,1],[3,3],[5,3],[4,5],[6,5],[4,7]],
  [[2,1],[6,1],[4,3],[3,5],[5,5],[4,7]],
  [[5,1],[3,3],[6,3],[4,5],[2,7],[6,7]],
];
let wirePuzzle = null;

function ensurePumpPuzzleUi() {
  let root = document.querySelector('#betonPumpPuzzle');
  if (root) return root;
  root = document.createElement('div');
  root.id='betonPumpPuzzle';
  root.className='betonEventQte';
  root.innerHTML='<div class="betonPumpPuzzleWrap"><button class="betonEventClose" type="button">×</button><div class="betonPumpPuzzleTitle">ЩИТОК НАСОСА</div><div class="betonPumpPuzzleSub">ПРОЛОЖИ ПРОВОДА ПО СЕТКЕ · НЕ ПЕРЕСЕКАЙ ЛИНИИ</div><div class="betonPumpShell"><canvas class="betonWireCanvas" width="720" height="720"></canvas></div><div class="betonWireStatus">ПРОВОДОВ: 0 / 4</div></div>';
  document.body.appendChild(root);
  root.querySelector('.betonEventClose')?.addEventListener('click',()=>closePumpWirePuzzle(false));
  const canvas=root.querySelector('canvas');
  canvas.addEventListener('pointerdown',pumpWireDown,{passive:false});
  canvas.addEventListener('pointermove',pumpWireMove,{passive:false});
  canvas.addEventListener('pointerup',pumpWireUp,{passive:false});
  canvas.addEventListener('pointercancel',pumpWireUp,{passive:false});
  return root;
}
function wireCanvasPoint(e, canvas) {
  const r=canvas.getBoundingClientRect();
  return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};
}
function wireCellFromPoint(p, canvas) {
  const pad=34, cellW=(canvas.width-pad*2)/(WIRE_GRID_COLS-1), cellH=(canvas.height-pad*2)/(WIRE_GRID_ROWS-1);
  const c=Math.round((p.x-pad)/cellW), r=Math.round((p.y-pad)/cellH);
  if(c<0||c>=WIRE_GRID_COLS||r<0||r>=WIRE_GRID_ROWS)return null;
  return {c,r};
}
function wirePointForCell(cell, canvas) {
  const pad=34, cellW=(canvas.width-pad*2)/(WIRE_GRID_COLS-1), cellH=(canvas.height-pad*2)/(WIRE_GRID_ROWS-1);
  return {x:pad+cell.c*cellW,y:pad+cell.r*cellH};
}
function wireKey(cell){return cell.c+','+cell.r;}
function isWireEndpoint(cell){
  if(!wirePuzzle)return null;
  for(let color=0;color<wirePuzzle.count;color++){
    const s=wirePuzzle.starts[color],t=wirePuzzle.targets[color];
    if(cell.c===s.c&&cell.r===s.r)return {color,side:'start'};
    if(cell.c===t.c&&cell.r===t.r)return {color,side:'target'};
  }
  return null;
}
function isWireCellBlocked(cell,color,path){
  if(!wirePuzzle)return true;
  if(wirePuzzle.blocked.has(wireKey(cell)))return true;
  const endpoint=isWireEndpoint(cell);
  if(endpoint&&endpoint.color!==color)return true;
  for(const [otherColor,otherPath] of wirePuzzle.paths){
    if(otherColor===color)continue;
    if(otherPath.some(p=>p.c===cell.c&&p.r===cell.r))return true;
  }
  return false;
}
function openPumpWirePuzzle() {
  if (!pumpBroken || pumpPuzzleOpen) return;
  pumpPuzzleOpen=true; pouring=false;
  const root=ensurePumpPuzzleUi(); root.classList.add('show');
  const starts=WIRE_ENDPOINT_ROWS.map((r,i)=>({c:0,r,color:i}));
  const targets=WIRE_ENDPOINT_ROWS.map((r,i)=>({c:WIRE_GRID_COLS-1,r,color:i}));
  const template=WIRE_BLOCK_TEMPLATES[Math.floor(Math.random()*WIRE_BLOCK_TEMPLATES.length)];
  wirePuzzle={starts,targets,paths:new Map(),drag:null,count:4,blocked:new Set(template.map(p=>p[0]+','+p[1])),mistakes:0};
  drawPumpPuzzle();
  if (document.pointerLockElement) document.exitPointerLock();
}
function closePumpWirePuzzle(success) {
  if(success && wirePuzzle) window.__betonEventResult = wirePuzzle.mistakes===0 ? 'ИДЕАЛЬНО' : 'ЧАСТИЧНО';
  pumpPuzzleOpen=false; wirePuzzle=null; ensurePumpPuzzleUi().classList.remove('show');
  if (success) {
    pumpBroken=false; markPourProgressDirty(); savePourProgress(true);
    if (hoseInteraction) hoseInteraction.text=hoseHeld?'E — бросить шланг · ЛКМ — включить бетон':'E — взять шланг';
    showToast('НАСОС ЗАПУЩЕН · ПОДАЧА ВОССТАНОВЛЕНА',3.0);
    dialogueCloseEl?.click();
  }
  requestMouseLock();
}
function drawPumpPuzzle(cursor=null) {
  if(!wirePuzzle)return;
  const root=ensurePumpPuzzleUi(),canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const pad=34,cellW=(canvas.width-pad*2)/(WIRE_GRID_COLS-1),cellH=(canvas.height-pad*2)/(WIRE_GRID_ROWS-1);
  ctx.strokeStyle='rgba(205,205,184,.23)';ctx.lineWidth=1.2;
  for(let c=0;c<WIRE_GRID_COLS;c++){const x=pad+c*cellW;ctx.beginPath();ctx.moveTo(x,pad);ctx.lineTo(x,canvas.height-pad);ctx.stroke();}
  for(let r=0;r<WIRE_GRID_ROWS;r++){const y=pad+r*cellH;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(canvas.width-pad,y);ctx.stroke();}
  for(const key of wirePuzzle.blocked){const parts=key.split(',').map(Number),pt=wirePointForCell({c:parts[0],r:parts[1]},canvas);ctx.fillStyle='rgba(40,43,42,.96)';ctx.strokeStyle='#807b6e';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(pt.x-cellW*.31,pt.y-cellH*.31,cellW*.62,cellH*.62,8);ctx.fill();ctx.stroke();ctx.fillStyle='#4d4b45';ctx.beginPath();ctx.arc(pt.x,pt.y,6,0,Math.PI*2);ctx.fill();}
  const drawPath=(path,color,alpha=1)=>{
    if(!path||path.length<1)return;
    const pts=path.map(c=>wirePointForCell(c,canvas));
    ctx.globalAlpha=alpha;ctx.lineJoin='round';ctx.lineCap='round';
    ctx.strokeStyle='rgba(0,0,0,.82)';ctx.lineWidth=16;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
    ctx.strokeStyle=WIRE_COLORS[color];ctx.lineWidth=10;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y-2):ctx.moveTo(p.x,p.y-2));ctx.stroke();ctx.globalAlpha=1;
  };
  for(const [color,path] of wirePuzzle.paths)drawPath(path,color,1);
  if(wirePuzzle.drag){const temp=[...wirePuzzle.drag.path]; if(cursor){const cell=wireCellFromPoint(cursor,canvas);if(cell&&!(temp[temp.length-1]?.c===cell.c&&temp[temp.length-1]?.r===cell.r))temp.push(cell);}drawPath(temp,wirePuzzle.drag.color,.78);}
  for(let color=0;color<wirePuzzle.count;color++)for(const cell of [wirePuzzle.starts[color],wirePuzzle.targets[color]]){const p=wirePointForCell(cell,canvas);ctx.fillStyle='#111';ctx.beginPath();ctx.arc(p.x,p.y,19,0,Math.PI*2);ctx.fill();ctx.strokeStyle=WIRE_COLORS[color];ctx.lineWidth=8;ctx.stroke();ctx.fillStyle=WIRE_COLORS[color];ctx.beginPath();ctx.arc(p.x,p.y,7,0,Math.PI*2);ctx.fill();}
  const status=root.querySelector('.betonWireStatus'); if(status)status.textContent='ПРОВОДОВ: '+wirePuzzle.paths.size+' / '+wirePuzzle.count+(wirePuzzle.mistakes?' · ОШИБОК: '+wirePuzzle.mistakes:'');
}
function pumpWireDown(e){
  if(!wirePuzzle)return;
  const c=e.currentTarget,cell=wireCellFromPoint(wireCanvasPoint(e,c),c);
  if(!cell)return;
  const endpoint=isWireEndpoint(cell);
  if(!endpoint||endpoint.side!=='start')return;
  if(wirePuzzle.paths.has(endpoint.color))wirePuzzle.paths.delete(endpoint.color);
  wirePuzzle.drag={color:endpoint.color,path:[{c:cell.c,r:cell.r}]};
  try{c.setPointerCapture(e.pointerId)}catch(_){}
  drawPumpPuzzle();e.preventDefault();
}
function pumpWireMove(e){
  if(!wirePuzzle?.drag)return;
  const c=e.currentTarget,cell=wireCellFromPoint(wireCanvasPoint(e,c),c);
  if(!cell)return;
  const path=wirePuzzle.drag.path,last=path[path.length-1];
  if(cell.c===last.c&&cell.r===last.r)return;
  const prev=path[path.length-2];
  if(prev&&cell.c===prev.c&&cell.r===prev.r){path.pop();drawPumpPuzzle();e.preventDefault();return;}
  if(Math.abs(cell.c-last.c)+Math.abs(cell.r-last.r)!==1)return;
  if(path.some(p=>p.c===cell.c&&p.r===cell.r))return;
  if(isWireCellBlocked(cell,wirePuzzle.drag.color,path))return;
  path.push({c:cell.c,r:cell.r});drawPumpPuzzle();e.preventDefault();
}
function pumpWireUp(e){
  if(!wirePuzzle?.drag)return;
  const c=e.currentTarget,drag=wirePuzzle.drag,cell=wireCellFromPoint(wireCanvasPoint(e,c),c);
  const target=wirePuzzle.targets[drag.color];
  const ok=cell&&cell.c===target.c&&cell.r===target.r&&drag.path.length>1;
  if(ok){
    if(!(drag.path[drag.path.length-1].c===target.c&&drag.path[drag.path.length-1].r===target.r)){
      const last=drag.path[drag.path.length-1];
      if(Math.abs(target.c-last.c)+Math.abs(target.r-last.r)===1)drag.path.push({c:target.c,r:target.r});
      else { wirePuzzle.mistakes++; wirePuzzle.drag=null; drawPumpPuzzle(); e.preventDefault(); return; }
    }
    wirePuzzle.paths.set(drag.color,drag.path.map(p=>({c:p.c,r:p.r})));mobileHaptic(12);
  }else wirePuzzle.mistakes++;
  wirePuzzle.drag=null;drawPumpPuzzle();
  if(wirePuzzle.paths.size>=wirePuzzle.count)setTimeout(()=>closePumpWirePuzzle(true),320);
  e.preventDefault();
}
POUR_ZONES.forEach((zone,index)=>prepareZoneRandomEvent(zone,index));

function cancelQTEWithoutPenalty(){if(!qteActive)return;qteActive=false;qteLayerEl.classList.remove('active');qteTargetEl.classList.remove('pulse','perfect','badclick');resetQTECooldown();}
function dropHoseFromEvent(message){hoseHeld=false;playHoseSlipAudio();if(hoseInteraction)hoseInteraction.text=pouring?'E — взять шланг · БЕТОН ЛЬЁТСЯ!':'E — взять шланг';showToast(message,4.2);}

function showPourEventAlarm(zone) {
  if (!zone || zone.eventTriggered || pendingPourEvent) return;
  zone.eventTriggered=true; pendingPourEvent={zone,type:zone.eventType}; eventAlarmTimer=EVENT_ALARM_SECONDS;
  const copy=POUR_EVENT_COPY[zone.eventType]||POUR_EVENT_COPY.pressure;
  if(eventAlarmEl){eventAlarmEl.dataset.event=zone.eventType;eventAlarmTitleEl.textContent=copy.title;eventAlarmTextEl.textContent=copy.text;eventAlarmEl.classList.remove('show');void eventAlarmEl.offsetWidth;eventAlarmEl.classList.add('show');}
  playQTEAppearAudio(); mobileHaptic(35); markPourProgressDirty();
}

function executePendingPourEvent() {
  const event=pendingPourEvent; pendingPourEvent=null; eventAlarmTimer=0; eventAlarmEl?.classList.remove('show'); pressurePulseMesh.visible=false;
  if(!event)return;
  if(event.type==='pressure'){
    // Turning the pump off during the 0.5 s warning is a full counter.
    if(!pouring){pressureSpikePending=false;pressureSpikeVolumeM3=0;window.__betonEventResult='ИДЕАЛЬНО';showToast('ДАВЛЕНИЕ СБРОШЕНО · ПОДАЧА БЫЛА ВЫКЛЮЧЕНА',2.2);return;}
    const ratio=zoneVolume(event.zone)/Math.max(.000001,event.zone.targetVolume);
    const currentPct=ratio*100;
    // Aim the uncontrolled slug at roughly 103-105% total. Therefore at 95%
    // it adds ~8-10%, while at 85% it adds ~18-20%. Minimum slug is 8%.
    const dangerTargetPct=THREE.MathUtils.randFloat(103,105);
    const spikePct=THREE.MathUtils.clamp(dangerTargetPct-currentPct,8,22);
    pressureSpikeVolumeM3=event.zone.targetVolume*(spikePct/100);
    pressureSpikePending=true;
    window.__betonEventResult='ЧАСТИЧНО';
    showToast('ПРОБКА ДОШЛА ДО КОНЦА — ОТВЕДИ ШЛАНГ!',2.2);
    return;
  }
  if(event.type==='hose'){
    cancelQTEWithoutPenalty(); hoseRecoveryNeeded=true; hoseWhipClock=0;
    dropHoseFromEvent('ШЛАНГ ВЫРВАЛО — ОН БЬЁТСЯ И ПРОДОЛЖАЕТ ЛИТЬ!');
    return;
  }
  if(event.type==='pump'){
    cancelQTEWithoutPenalty(); pumpBroken=true; pouring=false;
    if(hoseInteraction)hoseInteraction.text='НАСОС СЛОМАН · ИДИ К ДЖОРДЖУ';
    // Pump alert is a notification AFTER the failure, not a reaction countdown.
    if(eventAlarmEl){
      eventAlarmEl.dataset.event='pump';
      eventAlarmTitleEl.textContent=POUR_EVENT_COPY.pump.title;
      eventAlarmTextEl.textContent=POUR_EVENT_COPY.pump.text;
      eventAlarmEl.classList.remove('show'); void eventAlarmEl.offsetWidth; eventAlarmEl.classList.add('show');
      setTimeout(()=>eventAlarmEl?.classList.remove('show'),1450);
    }
    playQTEAppearAudio(); mobileHaptic(28);
    showToast('НАСОС ВСТАЛ · У ДЖОРДЖА ОТКРОЙ ЩИТОК',4.0); markPourProgressDirty(); return;
  }
  if(event.type==='eye'){startEyeWipe();showToast('БЕТОН В ГЛАЗ — СМАХНИ ЕГО СЛЕВА НАПРАВО',2.0);}
}

function updatePourEvents(dt) {
  if(eventAlarmTimer>0){eventAlarmTimer-=dt;updatePressureHosePulse();if(eventAlarmTimer<=0)executePendingPourEvent();}
  else pressurePulseMesh.visible=false;

  updateHoseControlQTE(dt);
  if(hoseRecoveryNeeded && !hoseHeld && pouring && hosePoints.length){
    hoseWhipClock+=dt;
    const tip=hosePoints[HOSE_SEGMENTS];
    const prev=hosePrev[HOSE_SEGMENTS];
    const amp=.055+Math.min(.10,hoseWhipClock*.012);
    tip.x+=Math.sin(hoseWhipClock*16.7)*amp;
    tip.z+=Math.cos(hoseWhipClock*13.1)*amp;
    if(prev){prev.x-=Math.sin(hoseWhipClock*11.3)*amp*.6;prev.z-=Math.cos(hoseWhipClock*15.1)*amp*.6;}
  }

  if(blindnessTimer>0){blindnessTimer=Math.max(0,blindnessTimer-dt);if(blindnessTimer<=0&&eyeWipeActive)finishEyeWipe(true);}
  if(pendingPourEvent||pumpBroken||qteActive||!pouring||jobState!=='active')return;
  const zone=activePourZone(); if(!zone||zone.eventTriggered)return;
  const ratio=zoneVolume(zone)/Math.max(.000001,zone.targetVolume);
  if(ratio>=zone.eventThreshold){
    if(zone.eventType==='pressure') showPourEventAlarm(zone);
    else {
      zone.eventTriggered=true;
      pendingPourEvent={zone,type:zone.eventType};
      markPourProgressDirty();
      executePendingPourEvent();
    }
  }
}

// Deliberately simple material ladder requested for settlement:`;

if (!eventBlockPattern.test(mainSource)) throw new Error('v51.102: event block signature not found');
mainSource = mainSource.replace(eventBlockPattern, eventBlockReplacement);

// Make pressure mass depend on the late-map danger calculation above instead of a fixed 1.85 s flow slug.
const pressurePourPattern = /\/\/ Pressure-spike event: one oversized, heavy concrete slug carries roughly[\s\S]*?\n  }\n\n  recordCareerStat\('concreteM3', volume\);/;
const pressurePourReplacement = String.raw`// Pressure spike: one dangerous mass-bearing slug. Its volume is precomputed from
  // the current map percentage so ignoring it nearly always threatens an overpour.
  const pressureSpike = pressureSpikePending;
  if (pressureSpike) {
    pressureSpikePending = false;
    const spikeVolume = Math.max(0, pressureSpikeVolumeM3);
    pressureSpikeVolumeM3 = 0;
    volume += spikeVolume;
    spawnBlob(end, true, pourVisualVelSafe, .52);
  }

  recordCareerStat('concreteM3', volume);`;
if (!pressurePourPattern.test(mainSource)) throw new Error('v51.102: pressure pour signature not found');
mainSource = mainSource.replace(pressurePourPattern, pressurePourReplacement);

// When the event has ripped the hose out, interacting starts the Stardew-like
// hold/release control minigame instead of instantly snapping it back into the hand.
const hoseInteractNeedle = "if (it.kind === 'hose') {\n    if (!hoseHeld && rakeEquipped) setRakeEquipped(false);";
const hoseInteractReplacement = "if (it.kind === 'hose') {\n    if (hoseRecoveryNeeded && !hoseHeld) { if (!hoseControlActive) startHoseControlQTE(); return; }\n    if (!hoseHeld && rakeEquipped) setRakeEquipped(false);";
if (!mainSource.includes(hoseInteractNeedle)) throw new Error('v51.102: hose interact signature not found');
mainSource = mainSource.replace(hoseInteractNeedle, hoseInteractReplacement);

// George no longer repairs the pump with one click: his dialogue opens the wire-routing puzzle.
const georgeRepairPattern = /label: 'Починить насос',\s*action: \(\) => \{\s*pumpBroken = false;/;
if (!georgeRepairPattern.test(mainSource)) throw new Error('v51.102: George repair signature not found');
mainSource = mainSource.replace(georgeRepairPattern, "label: 'Открыть щиток насоса',\n        action: () => {\n          openPumpWirePuzzle();\n          return;\n          pumpBroken = false;");

// Reset/next-job cleanup for the hose recovery minigame.
const eventResetNeedle = "  pumpBroken = false;\n  pressureSpikePending = false;\n  pendingPourEvent = null;";
const eventResetReplacement = "  pumpBroken = false;\n  pressureSpikePending = false;\n  hoseRecoveryNeeded = false;\n  hoseControlActive = false;\n  hoseControlHeld = false;\n  hoseControlFailures = 0;\n  window.__betonEventResult = '—';\n  document.querySelector('#betonHoseControl')?.classList.remove('show','pressed');\n  pendingPourEvent = null;";
if (mainSource.includes(eventResetNeedle)) mainSource = mainSource.replace(eventResetNeedle, eventResetReplacement);

const mainBlob = new Blob([mainSource + '\n//# sourceURL=betonshik-main-v51.104.js'], { type:'text/javascript' });
const mainBlobUrl = URL.createObjectURL(mainBlob);
try { await import(mainBlobUrl); }
finally { setTimeout(() => URL.revokeObjectURL(mainBlobUrl), 2000); }

// Catch any liquid meshes created before their async v3 maps finished loading.
liquidTexturesPromise.then(() => { for (const mesh of liquidRuntimeMeshes) applyLiquidConcreteLook(mesh); });

// Add the random-event outcome to the settlement statistics without changing index.html.
function syncEventSettlementStat() {
  const grid = document.querySelector('.settlementStatsGrid');
  if (!grid) return;
  let row = grid.querySelector('.settlementStatsEvent');
  if (!row) {
    row = document.createElement('div');
    row.className = 'settlementStatsEvent';
    row.innerHTML = '<span>СОБЫТИЕ</span><b id="settlementStatsEvent">—</b>';
    grid.appendChild(row);
  }
  const value = String(window.__betonEventResult || '—');
  const out = row.querySelector('b');
  if (out) { out.textContent = value; out.dataset.state = value; }
}
const settlementStatsNode = document.querySelector('#settlementStatsCard');
if (settlementStatsNode) {
  new MutationObserver(syncEventSettlementStat).observe(settlementStatsNode, { attributes:true, attributeFilter:['class','data-grade'], subtree:true, childList:true });
}
syncEventSettlementStat();

// Observe UI changes and keep a low-frequency fallback scan. No per-frame polling.
const completionObserver = new MutationObserver(scanPourCompletion);
completionObserver.observe(document.body, { subtree: true, childList: true, characterData: true });
setInterval(scanPourCompletion, 500);
scanPourCompletion();
