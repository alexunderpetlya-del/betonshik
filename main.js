import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBB } from 'three/addons/math/OBB.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const mount = document.querySelector('#game');
const start = document.querySelector('#start');
const startBtn = document.querySelector('#startBtn');
const loadState = document.querySelector('#loadState');

// v49.1: if any runtime exception stops scene initialization, show it directly
// on the loading screen instead of leaving the user with an endless "loading".
function showFatalRuntimeError(message) {
  console.error('[FATAL RUNTIME]', message);
  if (!loadState) return;
  loadState.textContent = 'ОШИБКА: ' + String(message);
  loadState.style.color = '#ff7777';
  loadState.style.whiteSpace = 'pre-wrap';
  loadState.style.maxWidth = '900px';
}
window.addEventListener('error', (e) => {
  const where = e.filename ? ` @ ${e.filename.split('/').pop()}:${e.lineno || '?'}:${e.colno || '?'}` : '';
  showFatalRuntimeError((e.message || 'runtime error') + where);
});
window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason?.stack || e.reason?.message || e.reason || 'unhandled promise rejection';
  showFatalRuntimeError(reason);
});
const zoneLabel = document.querySelector('#zoneLabel');
const promptEl = document.querySelector('#prompt');
const toastEl = document.querySelector('#toast');
const staminaBar = document.querySelector('#staminaBar');
const staminaText = document.querySelector('#staminaText');
const energyBar = document.querySelector('#energyBar');
const energyText = document.querySelector('#energyText');
const minimap = document.querySelector('#minimap');
const smokeCountEl = document.querySelector('#smokeCount');
const drinkCountEl = document.querySelector('#drinkCount');
const beerCountEl = document.querySelector('#beerCount');
const smokeStateEl = document.querySelector('#smokeState');
const drinkStateEl = document.querySelector('#drinkState');
const beerStateEl = document.querySelector('#beerState');
const hotbarSmokeSlotEl = document.querySelector('#hotbarSmokeSlot');
const hotbarDrinkSlotEl = document.querySelector('#hotbarDrinkSlot');
const hotbarBeerSlotEl = document.querySelector('#hotbarBeerSlot');
const hotbarRakeSlotEl = document.querySelector('#hotbarRakeSlot');
const rakeHotbarStateEl = document.querySelector('#rakeHotbarState');
const hotbarSmokePreviewEl = document.querySelector('#hotbarSmokePreview');
const hotbarDrinkPreviewEl = document.querySelector('#hotbarDrinkPreview');
const hotbarBeerPreviewEl = document.querySelector('#hotbarBeerPreview');
const hotbarRakePreviewEl = document.querySelector('#hotbarRakePreview');
const moneyTextEl = document.querySelector('#moneyText');
const pourHudEl = document.querySelector('#pourHud');
const fillBarEl = document.querySelector('#fillBar');
const fillPercentEl = document.querySelector('#fillPercent');
const fillRemainingEl = document.querySelector('#fillRemaining');
const fillLevelEl = document.querySelector('#fillLevel');
const zoneProgressEl = document.querySelector('#zoneProgress');
const spillVolumeEl = document.querySelector('#spillVolume');
const qteScoreEl = document.querySelector('#qteScore');
const qteLayerEl = document.querySelector('#qteLayer');
const qteTargetEl = document.querySelector('#qteTarget');
const qteCursorEl = document.querySelector('#qteCursor');
const shopEl = document.querySelector('#shop');
const shopMoneyEl = document.querySelector('#shopMoney');
const shopCloseEl = document.querySelector('#shopClose');
const shopPreviewCanvasEl = document.querySelector('#shopPreview');
const shopSelectedNameEl = document.querySelector('#shopSelectedName');
const shopSelectedDescEl = document.querySelector('#shopSelectedDesc');
const shopSelectedPriceEl = document.querySelector('#shopSelectedPrice');
const shopBuyEl = document.querySelector('#shopBuy');
const jobResultEl = document.querySelector('#jobResult');
const jobResultTitleEl = document.querySelector('#jobResultTitle');
const jobResultTextEl = document.querySelector('#jobResultText');
const jobResultBtnEl = document.querySelector('#jobResultBtn');
const tuneHudEl = document.querySelector('#tuneHud');
const tuneTitleEl = document.querySelector('#tuneTitle');
const tuneLinesEl = document.querySelector('#tuneLines');
const dialogueEl = document.querySelector('#dialogue');
const dialogueNameEl = document.querySelector('#dialogueName');
const dialogueTextEl = document.querySelector('#dialogueText');
const dialogueOptionsEl = document.querySelector('#dialogueOptions');
const dialogueCloseEl = document.querySelector('#dialogueClose');
const mapCtx = minimap.getContext('2d');
minimap.style.display = 'none';

// Mobile/browser profile. We keep the SAME scene, textures and geometry on mobile;
// only render resolution, shadow-map resolution and expensive post FX adapt to the GPU.
const TOUCH_DEVICE = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
const MOBILE_LANDSCAPE = () => TOUCH_DEVICE && innerWidth > innerHeight;
document.documentElement.classList.toggle('touchDevice', TOUCH_DEVICE);
THREE.Cache.enabled = true;

let started = false;
let locked = false;
let assetsLoaded = 0;
let assetsFailed = 0;
const TOTAL_ASSETS = 1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9aa7ad);
scene.fog = null;

const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.12, 450);
camera.layers.set(0);
camera.rotation.order = 'YXZ';
camera.position.set(0, 1.72, 15.5);

// Debug third-person camera (F3). It never replaces the FPS camera logic; it only changes what renderer uses.
const debugCamera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.08, 450);
debugCamera.rotation.order = 'YXZ';
let debugMode = false;
let debugYaw = 0;
let debugPitch = 0.28;
let debugDistance = 5.2;
const debugTarget = new THREE.Vector3();

const renderer = new THREE.WebGLRenderer({ antialias: !TOUCH_DEVICE, powerPreference: 'high-performance' });
// Full devicePixelRatio (2-4x on phones) is needlessly expensive in WebGL. 1 CSS pixel
// per rendered pixel stays crisp on a small display while avoiding 4-16x pixel cost.
let mobileRenderScale = TOUCH_DEVICE ? 0.82 : 1.0;
renderer.setPixelRatio(TOUCH_DEVICE ? Math.min(devicePixelRatio, mobileRenderScale) : Math.min(devicePixelRatio, 1.55));
renderer.setSize(innerWidth, innerHeight);
// Mobile Safari has a tight combined RAM/VRAM budget. A 2048² shadow map plus
// the large authored scene was enough to make iOS kill the tab outright.
renderer.shadowMap.enabled = !TOUCH_DEVICE;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.98;
mount.appendChild(renderer.domElement);

// v0.45: clean indie-grade post stack. No SSAO: it caused black halos on the huge
// joined GLB. Desktop gets very restrained high-threshold bloom for sun/bright highlights;
// touch devices render the same scene directly to save a full-screen HDR pass.
const composer = TOUCH_DEVICE ? null : new EffectComposer(renderer);
composer?.setPixelRatio(Math.min(devicePixelRatio, 1.15));
composer?.setSize(innerWidth, innerHeight);
const renderPass = TOUCH_DEVICE ? null : new RenderPass(scene, camera);
if (renderPass) composer.addPass(renderPass);
let bloomPass = null;
if (!TOUCH_DEVICE) {
  bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.075, 0.18, 1.08);
  composer.addPass(bloomPass);
}
const outputPass = TOUCH_DEVICE ? null : new OutputPass();
if (outputPass) composer.addPass(outputPass);

// Shop product preview: a separate small Three.js scene rendered only while the shop is open.
const shopPreviewRenderer = TOUCH_DEVICE ? null : new THREE.WebGLRenderer({
  canvas: shopPreviewCanvasEl,
  alpha: true,
  antialias: true,
  powerPreference: 'low-power',
});
if (shopPreviewRenderer) {
  shopPreviewRenderer.setPixelRatio(Math.min(devicePixelRatio, 1.35));
  shopPreviewRenderer.setSize(360, 300, false);
  shopPreviewRenderer.outputColorSpace = THREE.SRGBColorSpace;
  shopPreviewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  shopPreviewRenderer.toneMappingExposure = 1.15;
}

const shopPreviewScene = new THREE.Scene();
shopPreviewScene.background = null;
shopPreviewScene.add(new THREE.HemisphereLight(0xf3f0dc, 0x34372f, 2.0));
const shopPreviewKey = new THREE.DirectionalLight(0xffe3b5, 3.4);
shopPreviewKey.position.set(2.5, 3.8, 4.0);
shopPreviewScene.add(shopPreviewKey);
const shopPreviewRim = new THREE.DirectionalLight(0xa9cfe5, 1.2);
shopPreviewRim.position.set(-3.5, 2.0, -2.5);
shopPreviewScene.add(shopPreviewRim);
const shopPreviewCamera = new THREE.PerspectiveCamera(35, 360 / 300, 0.01, 50);
shopPreviewCamera.position.set(0, 0.15, 4.1);
shopPreviewCamera.lookAt(0, 0.05, 0);
const shopPreviewRoot = new THREE.Group();
shopPreviewScene.add(shopPreviewRoot);
let shopPreviewSpin = 0;
let shopPreviewRequestId = 0;

// v0.29 atmosphere: warm directional sun + cool skylight/bounce.
// Fog is deliberately subtle: it only softens the distant panel houses and gives depth
// without washing out the playable construction site.
scene.fog = new THREE.Fog(0xa7b0b4, 82, 220);
// Skylight establishes readable shadow colour; a tiny neutral fill prevents crushed blacks.
scene.add(new THREE.HemisphereLight(0xd7e4eb, 0x49443d, 0.66));
scene.add(new THREE.AmbientLight(0xdde2df, 0.035));

const SUN_OFFSET = new THREE.Vector3(-28, 42, 15);
const sun = new THREE.DirectionalLight(0xffd8a3, 2.38);
sun.position.copy(SUN_OFFSET);
sun.castShadow = true;

// Shadow-acne fix:
// keep a much tighter high-resolution shadow frustum around the player,
// and offset shadow comparison along surface normals.
sun.shadow.mapSize.set(TOUCH_DEVICE ? 2048 : 4096, TOUCH_DEVICE ? 2048 : 4096);
sun.shadow.camera.left = -32;
sun.shadow.camera.right = 32;
sun.shadow.camera.top = 32;
sun.shadow.camera.bottom = -32;
sun.shadow.camera.near = 8;
sun.shadow.camera.far = 150;
sun.shadow.bias = -0.00018;
sun.shadow.normalBias = 0.075;
sun.shadow.radius = TOUCH_DEVICE ? 1.25 : 2.0;

sun.target.position.set(0, 0, 0);
scene.add(sun.target);
scene.add(sun);

// Cool sky bounce from the opposite side. No shadow map: cheap, soft and atmospheric.
const skyBounce = new THREE.DirectionalLight(0xa9c5d6, 0.18);
skyBounce.position.set(24, 26, -18);
skyBounce.target.position.set(0, 1.5, -6);
scene.add(skyBounce.target);
scene.add(skyBounce);

const mats = {
  dirt: new THREE.MeshStandardMaterial({ color: 0x777267, roughness: 1 }),
  mud: new THREE.MeshStandardMaterial({ color: 0x655f54, roughness: 1 }),
  road: new THREE.MeshStandardMaterial({ color: 0x3d403e, roughness: .94 }),
  grass: new THREE.MeshStandardMaterial({ color: 0x616b55, roughness: 1 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0xa8a69f, roughness: .91 }),
  concreteDark: new THREE.MeshStandardMaterial({ color: 0x8c8b86, roughness: .93 }),
  fresh: new THREE.MeshStandardMaterial({ color: 0x737a79, roughness: .72 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xb9b6aa, roughness: .95 }),
  block: new THREE.MeshStandardMaterial({ color: 0xaea38c, roughness: .94 }),
  brick: new THREE.MeshStandardMaterial({ color: 0x8d6d5b, roughness: .97 }),
  fence: new THREE.MeshStandardMaterial({ color: 0x52605d, roughness: .78, metalness: .1 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x515a58, roughness: .56, metalness: .4 }),
  rebar: new THREE.MeshStandardMaterial({ color: 0x4e463f, roughness: .72, metalness: .55 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x252a28, roughness: .82 }),
  yellow: new THREE.MeshStandardMaterial({ color: 0xc3a94c, roughness: .76 }),
  red: new THREE.MeshStandardMaterial({ color: 0x924c3f, roughness: .82 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x657984, roughness: .86 }),
  white: new THREE.MeshStandardMaterial({ color: 0xd2d1c8, roughness: .87 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x60777a, roughness: .35, metalness: .04 }),
  garage: new THREE.MeshStandardMaterial({ color: 0x765f4c, roughness: .94 }),
  timber: new THREE.MeshStandardMaterial({ color: 0x79644d, roughness: .97 }),
};

const colliders = [];
const meshColliders = [];
const collisionSphereLow = new THREE.Sphere(new THREE.Vector3(), .24);
const collisionSphereMid = new THREE.Sphere(new THREE.Vector3(), .25);
const collisionSphereHigh = new THREE.Sphere(new THREE.Vector3(), .23);
let lastBlockedBy = '';
let lastBlockedAt = 0;
// Flat authored meshes close to ground (road, pavement, slabs outside the pour job)
// are walkable height patches, not obstacle walls.
const walkSurfaces = [];
const interactive = [];

// Authored spawn must always be a free place to stand. Some combined decorative
// meshes (notably the old bus-stop mesh) wrap large empty volumes in one OBB.
const authoredSpawnXZ = new THREE.Vector2();
let authoredSpawnReady = false;
function addColliderXZ(name, minX, maxX, minZ, maxZ, minY = -Infinity, maxY = Infinity) {
  colliders.push({ minX, maxX, minZ, maxZ, minY, maxY, name });
}

function addMeshOBBCollider(mesh, name) {
  if (!mesh?.geometry) return;
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
  if (!mesh.geometry.boundingBox) return;
  mesh.updateWorldMatrix(true, false);

  const obb = new OBB().fromBox3(mesh.geometry.boundingBox.clone());
  obb.applyMatrix4(mesh.matrixWorld);

  // Bounding boxes should be a broad approximation of the VISIBLE mesh, not an
  // extra invisible shell. Pull them in a couple of centimetres so the player's
  // capsule is what provides body clearance, instead of collider + capsule padding.
  obb.halfSize.x = Math.max(.01, obb.halfSize.x - .045);
  obb.halfSize.y = Math.max(.01, obb.halfSize.y - .020);
  obb.halfSize.z = Math.max(.01, obb.halfSize.z - .045);

  meshColliders.push({ obb, name: name || mesh.name || 'scene mesh' });
}
function addWalkSurface(name, minX, maxX, minZ, maxZ, topY) {
  if (![minX,maxX,minZ,maxZ,topY].every(Number.isFinite)) return;
  walkSurfaces.push({ name, minX, maxX, minZ, maxZ, topY });
}
function addObjectCollider(obj, name = obj?.name || 'model', pad = .06) {
  if (!obj) return;
  obj.updateWorldMatrix(true, true);
  const bb = new THREE.Box3().setFromObject(obj);
  if (!Number.isFinite(bb.min.x) || !Number.isFinite(bb.max.x)) return;
  addColliderXZ(
    name,
    bb.min.x - pad, bb.max.x + pad,
    bb.min.z - pad, bb.max.z + pad,
    bb.min.y - .03, bb.max.y + .03
  );
}
const zones = [
  { name: 'Плита под заливку', x: 0, z: 4, w: 30, d: 20 },
  { name: 'Бетононасос и миксер', x: -4.6, z: -22, w: 21, d: 35 },
  { name: 'Двор стройплощадки', x: 0, z: -12, w: 62, d: 24 },
];

function box(name, x, y, z, w, h, d, mat = mats.block, opt = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.name = name;
  m.position.set(x, y, z);
  m.castShadow = opt.cast ?? true;
  m.receiveShadow = opt.receive ?? true;
  scene.add(m);
  if (opt.collide) addColliderXZ(name, x - w / 2, x + w / 2, z - d / 2, z + d / 2);
  return m;
}
function cyl(name, x, y, z, r, h, mat = mats.metal, rotX = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), mat);
  m.name = name;
  m.position.set(x, y, z);
  m.rotation.x = rotX;
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
  return m;
}
function beam(a, b, thickness = .24, mat = mats.concrete) {
  const dir = b.clone().sub(a);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.BoxGeometry(thickness, thickness, len), mat);
  m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
  return m;
}
function labelSprite(text, pos, color = '#e8e3b4') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 96;
  const g = c.getContext('2d');
  g.font = '800 29px system-ui';
  g.textAlign = 'center';
  g.fillStyle = 'rgba(12,14,13,.72)';
  g.fillRect(20, 15, 472, 62);
  g.fillStyle = color;
  g.fillText(text, 256, 57);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false }));
  s.position.copy(pos); s.scale.set(8, 1.5, 1); scene.add(s); return s;
}

// FINAL BLENDER LAYOUT
// The old procedural courtyard was removed. Everything visible in the world now comes
// directly from BETONSHCHIK_SCENE.glb at the exact Blender export scale/position.

// GLTF ASSETS
const loader = new GLTFLoader();
function updateLoadState() {
  loadState.textContent = assetsLoaded + assetsFailed >= TOTAL_ASSETS
    ? (assetsFailed ? `Сцена готова · ${assetsFailed} ассет(а) не загрузились` : 'Сцена готова')
    : `Загрузка моделей ${assetsLoaded + assetsFailed}/${TOTAL_ASSETS}…`;
}
function prepModel(root) {
  root.traverse(o => {
    if (!o.isMesh) return;
    const n = String(o.name || '').toLowerCase();

    const panorama = n === 'sphere';
    const distantGround = n === 'sphere.001';
    const siteGround = n === 'site_ground';
    const thinFence = n.startsWith('fence_');

    // The panorama and huge background ground must never enter the shadow map.
    // Thin fences receive shadows but do not self-shadow; this removes diagonal acne.
    o.castShadow = !(panorama || distantGround || siteGround || thinFence);
    o.receiveShadow = !panorama;

    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const mat of ms) {
      if (!mat) continue;
      if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;

      // v0.23: restore double-sided scene materials.
      mat.side = THREE.DoubleSide;

      // Only actual glass stays blended. Cutout textures use alphaTest,
      // all other construction materials are forced solid.
      const mn = String(mat.name || '').toLowerCase();
      const isGlass = mn.includes('glass');
      const isCigButt = mn.includes('cigbutt');
      const isCutout = isCigButt || mn.includes('panelkamat') || mn.includes('tree_birch') || mat.alphaTest > 0;

      if (isCutout && !isGlass) {
        // Alpha cards must stay cut out. v0.27 accidentally forced all non-glass
        // materials opaque, which revealed the black RGB hidden under PNG alpha.
        mat.transparent = false;
        mat.opacity = 1;
        mat.alphaTest = isCigButt ? .06 : Math.max(mat.alphaTest || 0, .42);
        mat.depthWrite = true;
      } else if (!isGlass) {
        mat.transparent = false;
        mat.opacity = 1;
        mat.alphaTest = 0;
        mat.depthWrite = true;
      }

      mat.needsUpdate = true;
    }
  });
}
function placeModel(url, { x = 0, y = 0, z = 0, rotY = 0, targetXZ = 3, onReady = null } = {}) {
  loader.load(url, gltf => {
    const root = gltf.scene;
    prepModel(root);
    const wrap = new THREE.Group(); scene.add(wrap); wrap.add(root);
    root.updateMatrixWorld(true);
    let bb = new THREE.Box3().setFromObject(root), size = bb.getSize(new THREE.Vector3());
    const s = targetXZ / Math.max(size.x, size.z, .001);
    root.scale.multiplyScalar(s); root.updateMatrixWorld(true);
    bb = new THREE.Box3().setFromObject(root);
    const center = bb.getCenter(new THREE.Vector3());
    root.position.x -= center.x; root.position.z -= center.z; root.position.y -= bb.min.y;
    wrap.position.set(x, y, z); wrap.rotation.y = rotY;
    assetsLoaded++; updateLoadState();
    if (onReady) onReady(wrap, root);
  }, undefined, err => {
    console.warn('Asset failed', url, err); assetsFailed++; updateLoadState();
  });
}

// ---------------------------------------------------------------------------
// FINAL LAYOUT + PHYSICAL HOSE + POUR JOB v0.19
// ---------------------------------------------------------------------------
let layoutRoot = null;
let hoseAnchorObject = null;
let hoseProxy = null;
let hoseInteraction = null;
let shopProxy = null;
let shopInteraction = null;
let hoseHeld = false;
let pouring = false;
const hoseAnchorFallback = new THREE.Vector3();
let hoseAnchorFallbackValid = false;

// -----------------------------
// Physical hose
// -----------------------------
const hosePoints = [];
const hosePrev = [];
const hoseMeshes = [];
const HOSE_SEGMENTS = 24;
const HOSE_REST = 0.31;
// Textured procedural concrete-pump hose.
// The source texture is rotated offline so its grooves run across the hose,
// while the cylinder UV V axis follows hose length.
const hoseTextureLoader = new THREE.TextureLoader();
const hoseColorTex = hoseTextureLoader.load('./assets/hose_rubber_corrugated.jpg');
hoseColorTex.wrapS = THREE.RepeatWrapping;
hoseColorTex.wrapT = THREE.RepeatWrapping;
hoseColorTex.repeat.set(1.0, 1.0);
hoseColorTex.colorSpace = THREE.SRGBColorSpace;
hoseColorTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

const hoseNormalTex = hoseTextureLoader.load('./assets/hose_rubber_corrugated_normal.jpg');
hoseNormalTex.wrapS = THREE.RepeatWrapping;
hoseNormalTex.wrapT = THREE.RepeatWrapping;
hoseNormalTex.repeat.copy(hoseColorTex.repeat);
hoseNormalTex.anisotropy = hoseColorTex.anisotropy;

const hoseMat = new THREE.MeshStandardMaterial({
  map: hoseColorTex,
  normalMap: hoseNormalTex,
  normalScale: new THREE.Vector2(.72, .72),
  color: 0xd8d8d8,
  roughness: .94,
  metalness: 0.0,
  side: THREE.DoubleSide,
});
const hoseEndMat = new THREE.MeshStandardMaterial({
  color: 0x171918,
  roughness: .92,
  metalness: 0.0,
  side: THREE.DoubleSide,
});
const hoseGeom = new THREE.CylinderGeometry(.105, .105, 1, 18, 1, false);
const hoseGroup = new THREE.Group();
hoseGroup.name = 'PHYSICAL_HOSE_RUNTIME';
scene.add(hoseGroup);
const hoseTip = new THREE.Mesh(
  new THREE.SphereGeometry(.12, 14, 10),
  hoseEndMat
);
const hoseCoupler = new THREE.Mesh(
  new THREE.CylinderGeometry(.125, .125, .32, 16, 1, false),
  hoseEndMat
);
hoseCoupler.name = 'PHYSICAL_HOSE_COUPLER';
hoseCoupler.castShadow = true;
hoseCoupler.frustumCulled = false;
hoseGroup.add(hoseCoupler);
hoseTip.name = 'PHYSICAL_HOSE_TIP';
hoseTip.castShadow = true;
hoseTip.frustumCulled = false;
hoseGroup.add(hoseTip);

const hoseTmpDir = new THREE.Vector3();
const hoseTmpMid = new THREE.Vector3();
const hoseHandTarget = new THREE.Vector3();
const hoseFloorTarget = new THREE.Vector3();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

// -----------------------------
// SIX RECESSED POUR BAYS BETWEEN STRUCTURAL COLUMNS
// -----------------------------
// Column grid recovered directly from the exported layout:
// X = -13.5, -4.5, 4.5, 13.5
// Z =  -4.5,  4.0, 12.5
// This creates 3 x 2 independent concrete bays.
const SLAB = { minX: -15, maxX: 15, minZ: -6, maxZ: 14, floorY: .18 };
const COLUMN_X = [-13.5, -4.5, 4.5, 13.5];
const COLUMN_Z = [-4.5, 4.0, 12.5];
const BAY_MARGIN = .55;
const TARGET_H = .16;
const PIT_BOTTOM_Y = .02;
const SIM_CELL = .25;

const POUR_ZONES = [];
let zoneId = 1;

for (let rz = 0; rz < COLUMN_Z.length - 1; rz++) {
  for (let cx = 0; cx < COLUMN_X.length - 1; cx++) {
    const z = {
      id: zoneId++,
      minX: COLUMN_X[cx] + BAY_MARGIN,
      maxX: COLUMN_X[cx + 1] - BAY_MARGIN,
      minZ: COLUMN_Z[rz] + BAY_MARGIN,
      maxZ: COLUMN_Z[rz + 1] - BAY_MARGIN,
      bottomY: PIT_BOTTOM_Y,
      floorY: SLAB.floorY,
      targetH: TARGET_H,
      maxH: .38,
      // Arcade tolerances: filling is forgiving, finishing requires leveling.
      failRatio: 1.08,
      successRatio: .985,
      levelRequired: .86,
      levelPrompted: false,
      dirty: true,
      piles: [],
    };

    z.w = z.maxX - z.minX;
    z.d = z.maxZ - z.minZ;
    z.cols = Math.max(4, Math.round(z.w / SIM_CELL));
    z.rows = Math.max(4, Math.round(z.d / SIM_CELL));
    z.cellX = z.w / z.cols;
    z.cellZ = z.d / z.rows;
    z.cellArea = z.cellX * z.cellZ;
    z.targetVolume = z.w * z.d * z.targetH;
    const cellCount = z.cols * z.rows;
    z.fill = new Float32Array(cellCount);

    // v49.1 SAFE: extra state for a conservative viscous solver.
    // These arrays do not affect scene loading or asset loading.
    z.mobility = new Float32Array(cellCount); // 0..1: fresh/workable
    z.velX = new Float32Array(cellCount);     // horizontal impulse
    z.velZ = new Float32Array(cellCount);
    z.flowDelta = new Float32Array(cellCount);
    z.flowBudget = new Float32Array(cellCount);

    // Arcade leveling: tracks which parts of the bay were actually worked
    // with the rake. The player cannot finish a perfectly auto-settled slab
    // without touching enough of the surface.
    z.rakeTouched = new Uint8Array(cellCount);

    POUR_ZONES.push(z);
  }
}

let activePourZoneIndex = 0;
let wrongPourToastAt = 0;

function activePourZone() {
  return activePourZoneIndex >= 0 && activePourZoneIndex < POUR_ZONES.length
    ? POUR_ZONES[activePourZoneIndex]
    : null;
}

const TOTAL_TARGET_VOLUME = POUR_ZONES.reduce((s, z) => s + z.targetVolume, 0);

function zoneAt(x, z) {
  for (const zone of POUR_ZONES) {
    if (
      x >= zone.minX && x < zone.maxX &&
      z >= zone.minZ && z < zone.maxZ
    ) return zone;
  }
  return null;
}
function insidePit(x, z) { return zoneAt(x, z) !== null; }
function insideSlab(x, z) {
  return x >= SLAB.minX && x <= SLAB.maxX && z >= SLAB.minZ && z <= SLAB.maxZ;
}

const pitGroup = new THREE.Group();
pitGroup.name = 'RUNTIME_MULTI_BAY_POUR_SLAB';
scene.add(pitGroup);

// ---------------------------------------------------------
// ACTIVE POUR MAP OUTLINE
// ---------------------------------------------------------
// Only the map that must be poured next is highlighted, and only while the
// player is actually holding the hose.  Two additive strips create a cheap
// glowing perimeter without a heavy post-processing OutlinePass.
const activePourOutline = new THREE.Group();
activePourOutline.name = 'ACTIVE_POUR_MAP_OUTLINE';
scene.add(activePourOutline);

const activePourOutlineCoreMat = new THREE.MeshBasicMaterial({
  color: 0x39ff14, transparent: true, opacity: .96,
  blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false
});
const activePourOutlineGlowMat = new THREE.MeshBasicMaterial({
  color: 0x00ff66, transparent: true, opacity: .30,
  blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false
});

const activePourOutlineCore = [];
const activePourOutlineGlow = [];
for (let i = 0; i < 4; i++) {
  const core = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), activePourOutlineCoreMat);
  const glow = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), activePourOutlineGlowMat);
  core.frustumCulled = false; glow.frustumCulled = false;
  core.renderOrder = 8; glow.renderOrder = 7;
  activePourOutline.add(glow, core);
  activePourOutlineCore.push(core);
  activePourOutlineGlow.push(glow);
}
let outlinedPourZoneId = -1;
let activePourOutlineTime = 0;

function layoutActivePourOutline(zone) {
  if (!zone) return;
  const cx = (zone.minX + zone.maxX) * .5;
  const cz = (zone.minZ + zone.maxZ) * .5;
  const y = zone.floorY + .027;
  const coreW = .052, glowW = .24;
  const coreH = .024, glowH = .014;

  const setStrip = (mesh, x, z, sx, sy, sz) => {
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
  };

  // Front/back, then left/right.  Slightly extend corners so the rectangle
  // reads as one continuous glowing outline.
  setStrip(activePourOutlineCore[0], cx, zone.minZ, zone.w + coreW, coreH, coreW);
  setStrip(activePourOutlineCore[1], cx, zone.maxZ, zone.w + coreW, coreH, coreW);
  setStrip(activePourOutlineCore[2], zone.minX, cz, coreW, coreH, zone.d + coreW);
  setStrip(activePourOutlineCore[3], zone.maxX, cz, coreW, coreH, zone.d + coreW);

  setStrip(activePourOutlineGlow[0], cx, zone.minZ, zone.w + glowW, glowH, glowW);
  setStrip(activePourOutlineGlow[1], cx, zone.maxZ, zone.w + glowW, glowH, glowW);
  setStrip(activePourOutlineGlow[2], zone.minX, cz, glowW, glowH, zone.d + glowW);
  setStrip(activePourOutlineGlow[3], zone.maxX, cz, glowW, glowH, zone.d + glowW);

  outlinedPourZoneId = zone.id;
}

function updateActivePourOutline(dt) {
  const zone = activePourZone();
  const playerInsideActiveZone =
    !!zone && zoneAt(playerPos.x, playerPos.z) === zone;
  const visible = !!(
    zone &&
    hoseHeld &&
    jobState === 'active' &&
    !playerInsideActiveZone
  );
  activePourOutline.visible = visible;
  if (!visible) return;

  if (outlinedPourZoneId !== zone.id) layoutActivePourOutline(zone);
  activePourOutlineTime += dt;
  const pulse = .5 + .5 * Math.sin(activePourOutlineTime * 4.0);
  activePourOutlineCoreMat.opacity = .82 + pulse * .16;
  activePourOutlineGlowMat.opacity = .22 + pulse * .22;
}

const slabMat = new THREE.MeshStandardMaterial({
  color: 0xa7a8a2, roughness: .90, side: THREE.DoubleSide
});
const pitWallMat = new THREE.MeshStandardMaterial({
  color: 0x8d8f8a, roughness: .95, side: THREE.DoubleSide
});
const pitBottomMat = new THREE.MeshStandardMaterial({
  color: 0x696c68, roughness: 1.0, side: THREE.DoubleSide
});
const wetConcreteMat = new THREE.MeshStandardMaterial({
  color: 0x626a67, roughness: .34, metalness: 0.0, side: THREE.DoubleSide
});

function addPitBox(name, x, y, z, w, h, d, mat) {
  if (w <= .001 || h <= .001 || d <= .001) return null;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.name = name;
  m.position.set(x, y, z);
  m.castShadow = false;
  m.receiveShadow = true;
  pitGroup.add(m);
  return m;
}

// Build the structural top slab as a tiled grid.
// Any tile whose centre lies inside a pour bay is omitted, leaving a real recess.
// This keeps the strips under/around the column rows intact.
const slabThickness = .18;
const slabCenterY = SLAB.floorY - slabThickness * .5;

const xCuts = [
  SLAB.minX,
  ...COLUMN_X.flatMap(x => [x - BAY_MARGIN, x + BAY_MARGIN]),
  SLAB.maxX
].sort((a,b) => a-b);

const zCuts = [
  SLAB.minZ,
  ...COLUMN_Z.flatMap(z => [z - BAY_MARGIN, z + BAY_MARGIN]),
  SLAB.maxZ
].sort((a,b) => a-b);

for (let zi = 0; zi < zCuts.length - 1; zi++) {
  for (let xi = 0; xi < xCuts.length - 1; xi++) {
    const x0 = xCuts[xi], x1 = xCuts[xi + 1];
    const z0 = zCuts[zi], z1 = zCuts[zi + 1];
    const mx = (x0 + x1) * .5;
    const mz = (z0 + z1) * .5;

    if (zoneAt(mx, mz)) continue;

    const tile = new THREE.Mesh(
      new THREE.PlaneGeometry(x1 - x0, z1 - z0),
      slabMat
    );
    tile.name = `SLAB_TILE_${xi}_${zi}`;
    tile.rotation.x = -Math.PI * 0.5;
    tile.position.set(mx, SLAB.floorY, mz);
    tile.castShadow = false;
    tile.receiveShadow = true;
    pitGroup.add(tile);
  }
}

// Bottom + four vertical walls for every bay.
for (const zone of POUR_ZONES) {
  addPitBox(
    `PIT_${zone.id}_BOTTOM`,
    (zone.minX + zone.maxX) * .5,
    zone.bottomY - .025,
    (zone.minZ + zone.maxZ) * .5,
    zone.w, .05, zone.d,
    pitBottomMat
  );

  const wallH = zone.floorY - zone.bottomY;
  const wallY = zone.bottomY + wallH * .5;

  addPitBox(`PIT_${zone.id}_WALL_L`,
    zone.minX - .05, wallY, (zone.minZ + zone.maxZ) * .5,
    .10, wallH, zone.d, pitWallMat);
  addPitBox(`PIT_${zone.id}_WALL_R`,
    zone.maxX + .05, wallY, (zone.minZ + zone.maxZ) * .5,
    .10, wallH, zone.d, pitWallMat);
  addPitBox(`PIT_${zone.id}_WALL_F`,
    (zone.minX + zone.maxX) * .5, wallY, zone.minZ - .05,
    zone.w, wallH, .10, pitWallMat);
  addPitBox(`PIT_${zone.id}_WALL_B`,
    (zone.minX + zone.maxX) * .5, wallY, zone.maxZ + .05,
    zone.w, wallH, .10, pitWallMat);
}

// -----------------------------
// ONE CONTINUOUS WET SURFACE PER BAY
// -----------------------------
function zoneIndex(zone, c, r) { return r * zone.cols + c; }

function zoneCellAt(zone, x, z) {
  const c = THREE.MathUtils.clamp(
    Math.floor((x - zone.minX) / zone.cellX),
    0, zone.cols - 1
  );
  const r = THREE.MathUtils.clamp(
    Math.floor((z - zone.minZ) / zone.cellZ),
    0, zone.rows - 1
  );
  return { c, r, index: zoneIndex(zone, c, r) };
}

function getFillHeightAt(x, z) {
  const zone = zoneAt(x, z);
  if (!zone) return 0;
  return zone.fill[zoneCellAt(zone, x, z).index];
}

function zoneVertexHeight(zone, vc, vr) {
  let sum = 0, count = 0;
  for (const dc of [-1, 0]) {
    for (const dr of [-1, 0]) {
      const c = vc + dc, r = vr + dr;
      if (c < 0 || c >= zone.cols || r < 0 || r >= zone.rows) continue;
      sum += zone.fill[zoneIndex(zone, c, r)];
      count++;
    }
  }
  return count ? sum / count : 0;
}

for (const zone of POUR_ZONES) {
  zone.surfaceGeom = new THREE.PlaneGeometry(
    zone.w, zone.d,
    zone.cols, zone.rows
  );
  zone.surfaceGeom.rotateX(-Math.PI / 2);

  zone.surface = new THREE.Mesh(zone.surfaceGeom, wetConcreteMat);
  zone.surface.name = `FRESH_CONCRETE_ZONE_${zone.id}`;
  zone.surface.position.set(
    (zone.minX + zone.maxX) * .5,
    zone.bottomY + .002,
    (zone.minZ + zone.maxZ) * .5
  );
  zone.surface.castShadow = false;
  zone.surface.receiveShadow = true;
  zone.surface.visible = false;
  scene.add(zone.surface);
}

function markZoneDirty(zone) { if (zone) zone.dirty = true; }
function markConcreteDirty() {
  for (const zone of POUR_ZONES) zone.dirty = true;
}

function refreshConcreteSurfaces() {
  for (const zone of POUR_ZONES) {
    if (!zone.dirty) continue;
    zone.dirty = false;

    const pos = zone.surfaceGeom.attributes.position;
    let any = false;

    // Slight visual exaggeration of highs/lows makes the leveling task readable
    // from first person. Physics still uses the untouched zone.fill values.
    const physicalAvgH = zoneAverageHeight(zone);
    const visualExaggeration = physicalAvgH > .025 ? 1.42 : 1.18;

    for (let vr = 0; vr <= zone.rows; vr++) {
      for (let vc = 0; vc <= zone.cols; vc++) {
        const idx = vr * (zone.cols + 1) + vc;
        const rawH = zoneVertexHeight(zone, vc, vr);
        const h = THREE.MathUtils.clamp(
          physicalAvgH + (rawH - physicalAvgH) * visualExaggeration,
          0,
          zone.maxH
        );
        pos.setY(idx, h);
        if (h > .0005) any = true;
      }
    }

    pos.needsUpdate = true;
    zone.surfaceGeom.computeVertexNormals();
    zone.surfaceGeom.computeBoundingSphere();
    zone.surface.visible = any;
  }
}

function refreshAllConcreteCells() {
  markConcreteDirty();
  refreshConcreteSurfaces();
}

function zoneVolume(zone) {
  let sumH = 0;
  for (let i = 0; i < zone.fill.length; i++) sumH += zone.fill[i];
  return sumH * zone.cellArea;
}
function totalConcreteVolume() {
  let v = 0;
  for (const zone of POUR_ZONES) v += zoneVolume(zone);
  return v;
}
function zoneCoverage(zone) {
  let n = 0;
  const threshold = zone.targetH * .70;
  for (let i = 0; i < zone.fill.length; i++) {
    if (zone.fill[i] >= threshold) n++;
  }
  return n / zone.fill.length;
}
function zoneRakeCoverage(zone) {
  if (!zone?.rakeTouched?.length) return 0;
  let touched = 0;
  for (let i = 0; i < zone.rakeTouched.length; i++) {
    if (zone.rakeTouched[i]) touched++;
  }
  return touched / zone.rakeTouched.length;
}

function zoneLevelStats(zone) {
  if (!zone) return {
    score: 0,
    uniformity: 0,
    rakeCoverage: 0,
    coverage: 0,
    rmsError: zone?.targetH || TARGET_H,
  };

  const n = zone.fill.length;
  if (!n) return {
    score: 0,
    uniformity: 0,
    rakeCoverage: 0,
    coverage: 0,
    rmsError: zone.targetH,
  };

  let sq = 0;
  for (let i = 0; i < n; i++) {
    const err = zone.fill[i] - zone.targetH;
    sq += err * err;
  }

  const rmsError = Math.sqrt(sq / n);

  // 0% when the slab is wildly lumpy/empty, 100% when cell heights are close
  // to the desired finished layer. Deliberately generous: this is arcade.
  const uniformity = THREE.MathUtils.clamp(
    1 - rmsError / (zone.targetH * .68),
    0, 1
  );

  const rakeCoverage = zoneRakeCoverage(zone);
  const rakeWork = THREE.MathUtils.clamp(rakeCoverage / .68, 0, 1);
  const coverage = zoneCoverage(zone);

  // Real surface quality matters most, but the player must actually work a
  // meaningful part of the area with the rake.
  const score = THREE.MathUtils.clamp(
    uniformity * .58 + rakeWork * .42,
    0, 1
  );

  return { score, uniformity, rakeCoverage, coverage, rmsError };
}

function zoneReadyForSequence(zone) {
  if (!zone) return false;
  const ratio = zoneVolume(zone) / zone.targetVolume;
  const level = zoneLevelStats(zone);
  return (
    ratio >= zone.successRatio &&
    level.coverage >= .88 &&
    level.score >= zone.levelRequired
  );
}

function concreteCoverage() {
  let cells = 0, filled = 0;
  for (const zone of POUR_ZONES) {
    const threshold = zone.targetH * .70;
    cells += zone.fill.length;
    for (let i = 0; i < zone.fill.length; i++) {
      if (zone.fill[i] >= threshold) filled++;
    }
  }
  return cells ? filled / cells : 0;
}
function zoneAverageHeight(zone) {
  return zoneVolume(zone) / (zone.w * zone.d);
}

// Concrete physically slows the player.
// Empty recess = normal walking. Wet concrete progressively grabs the boots.
function concreteMovementFactor(x, z) {
  const zone = zoneAt(x, z);
  const bootFloor = [0.0, 0.50, 0.61, 0.73][bootTier] || 0.0;

  if (zone) {
    const h = getFillHeightAt(x, z);
    if (h < .006) return 1.0;

    const depth01 = THREE.MathUtils.clamp(h / zone.targetH, 0, 1.45);
    let factor = THREE.MathUtils.lerp(.78, .40, Math.min(1, Math.sqrt(depth01)));

    if (depth01 > 1.0) {
      factor = THREE.MathUtils.lerp(.40, .28, Math.min(1, depth01 - 1.0));
    }
    return Math.max(factor, bootFloor);
  }

  const spillH = spillHeightAt(x, z);
  if (spillH < .006) return 1.0;

  const wet01 = THREE.MathUtils.clamp(spillH / .14, 0, 1.35);
  const factor = THREE.MathUtils.lerp(.76, .43, Math.min(1, Math.sqrt(wet01)));
  return Math.max(factor, bootFloor);
}

let bootTier = Math.max(0, Math.min(3, Number.parseInt(localStorage.getItem('beton_boot_tier') || '0', 10) || 0));
let staminaLevel = Math.max(0, Math.min(3, Number.parseInt(localStorage.getItem('beton_stamina_level') || '0', 10) || 0));
let pumpLevel = Math.max(0, Math.min(3, Number.parseInt(localStorage.getItem('beton_pump_level') || '0', 10) || 0));
let jobsCompleted = Math.max(0, Number.parseInt(localStorage.getItem('beton_jobs_completed') || '0', 10) || 0);
let staminaMax = 100 + staminaLevel * 15;

function saveProgression() {
  localStorage.setItem('beton_boot_tier', String(bootTier));
  localStorage.setItem('beton_stamina_level', String(staminaLevel));
  localStorage.setItem('beton_pump_level', String(pumpLevel));
  localStorage.setItem('beton_jobs_completed', String(jobsCompleted));
}

let jobState = 'active';
let paidPourZoneCount = 0;
let qteHits = 0;
let qteMisses = 0;
let wastedVolume = 0;
let concreteRelaxTimer = 0;


// -----------------------------
// PERSISTENT SURFACE SPILLS / "ПЛЮХИ"
// -----------------------------
// Pouring onto the solid construction slab no longer deletes concrete.
// Outside the recessed bays it forms persistent wet clumps which can be
// pushed with the rake back into a bay.
const spillClumps = [];
const spillGroup = new THREE.Group();
spillGroup.name = 'PERSISTENT_SURFACE_CONCRETE_SPILLS';
scene.add(spillGroup);

// Shared cheap hemisphere. Each clump is scaled into a wide, low wet mound.
const spillGeom = new THREE.SphereGeometry(
  1, 18, 8,
  0, Math.PI * 2,
  0, Math.PI * .5
);
const spillMat = new THREE.MeshStandardMaterial({
  color: 0x6b726f,
  roughness: .40,
  metalness: 0.0,
  side: THREE.DoubleSide
});
let spillSerial = 1;

function spillShapeFromVolume(volume, spread = 1) {
  // Volume-preserving half ellipsoid. Fresh plops begin compact,
  // then spread wider while keeping approximately the same volume.
  const baseH = THREE.MathUtils.clamp(
    .032 + Math.sqrt(Math.max(0, volume)) * .11,
    .036, .18
  );
  const h = THREE.MathUtils.clamp(
    baseH / Math.pow(Math.max(.68, spread), 1.28),
    .020, .18
  );
  const r = THREE.MathUtils.clamp(
    Math.sqrt(
      Math.max(.0001, volume) /
      ((2 / 3) * Math.PI * Math.max(.018, h))
    ),
    .20, 2.45
  );
  return { radius: r, height: h };
}

function refreshSpillClump(p) {
  if (!p || !p.mesh) return;

  if (p.volume <= .001) {
    p.volume = 0;
    p.mesh.visible = false;
    return;
  }

  const shape = spillShapeFromVolume(p.volume, p.spread || 1);
  p.radius = shape.radius;
  p.height = shape.height;

  const speed = Math.hypot(p.vx || 0, p.vz || 0);
  const smear = THREE.MathUtils.clamp(speed * .28, 0, .28);

  p.mesh.visible = true;
  p.mesh.position.set(
    p.x,
    SLAB.floorY + .002,
    p.z
  );
  if (speed > .015) p.mesh.rotation.y = Math.atan2(p.vx, p.vz);
  p.mesh.scale.set(
    p.radius * (1 - smear * .18),
    p.height,
    p.radius * (1 + smear)
  );
}

function createSpillClump(x, z, volume, impactVX = 0, impactVZ = 0, impactSpeed = 0) {
  const mesh = new THREE.Mesh(spillGeom, spillMat);
  mesh.name = `SURFACE_SPILL_${spillSerial++}`;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  spillGroup.add(mesh);

  const p = {
    mesh,
    x, z,
    volume: Math.max(0, volume),
    radius: .2,
    height: .035,
    vx: THREE.MathUtils.clamp(impactVX * .11, -.75, .75),
    vz: THREE.MathUtils.clamp(impactVZ * .11, -.75, .75),
    mobility: THREE.MathUtils.clamp(.78 + impactSpeed * .02, .78, 1),
    spread: .72,
    age: 0,
  };
  spillClumps.push(p);
  refreshSpillClump(p);
  return p;
}

function deleteDeadSpills() {
  for (let i = spillClumps.length - 1; i >= 0; i--) {
    const p = spillClumps[i];
    if (p.volume > .001) continue;
    if (p.mesh) spillGroup.remove(p.mesh);
    spillClumps.splice(i, 1);
  }
}

function surfaceSpillVolume() {
  let v = 0;
  for (const p of spillClumps) v += Math.max(0, p.volume);
  return v;
}

function addSurfaceSpillVolumeAt(
  x, z, volumeM3,
  exclude = null,
  impactVX = 0,
  impactVZ = 0,
  impactSpeed = 0
) {
  if (volumeM3 <= 0) return false;
  if (!insideSlab(x, z) || zoneAt(x, z)) return false;

  let best = null;
  let bestD2 = Infinity;

  for (const p of spillClumps) {
    if (p === exclude || p.volume <= .001) continue;

    const dx = p.x - x;
    const dz = p.z - z;
    const d2 = dx * dx + dz * dz;

    // Don't let one infinite blob eat the entire slab.
    // Same-location pouring merges until it is a sizeable mound,
    // then additional nearby splats can remain visually distinct.
    const mergeR = THREE.MathUtils.clamp(
      .32 + p.radius * .32,
      .38, .72
    );

    if (
      d2 <= mergeR * mergeR &&
      p.volume < .72 &&
      d2 < bestD2
    ) {
      best = p;
      bestD2 = d2;
    }
  }

  if (!best) {
    createSpillClump(x, z, volumeM3, impactVX, impactVZ, impactSpeed);
    return true;
  }

  const oldV = best.volume;
  const newV = oldV + volumeM3;

  // Weighted centre lets a moving hose smear the spot instead of leaving
  // perfectly static circular decals.
  best.x = (best.x * oldV + x * volumeM3) / newV;
  best.z = (best.z * oldV + z * volumeM3) / newV;
  best.vx = (best.vx * oldV + impactVX * .11 * volumeM3) / newV;
  best.vz = (best.vz * oldV + impactVZ * .11 * volumeM3) / newV;
  best.mobility = Math.max(
    best.mobility || .6,
    THREE.MathUtils.clamp(.78 + impactSpeed * .02, .78, 1)
  );
  best.spread = Math.min(best.spread || 1, .82);
  best.volume = newV;
  refreshSpillClump(best);
  return true;
}

function spillHeightAt(x, z) {
  let h = 0;

  for (const p of spillClumps) {
    if (p.volume <= .001) continue;
    const dx = x - p.x;
    const dz = z - p.z;
    const d2 = dx * dx + dz * dz;
    const r2 = p.radius * p.radius;
    if (d2 >= r2) continue;

    // Hemisphere profile.
    const local = p.height * Math.sqrt(Math.max(0, 1 - d2 / r2));
    if (local > h) h = local;
  }
  return h;
}

function clearSurfaceSpills() {
  for (const p of spillClumps) {
    if (p.mesh) spillGroup.remove(p.mesh);
  }
  spillClumps.length = 0;
}


function relaxSurfaceSpills(dt) {
  if (jobState !== 'active' || !spillClumps.length) return;

  for (const p of spillClumps) {
    if (p.volume <= .001) continue;

    p.age = (p.age || 0) + dt;
    p.mobility = Math.max(.18, (p.mobility || .7) * Math.exp(-dt / 38));

    const drag = Math.exp(
      -THREE.MathUtils.lerp(3.2, 7.8, 1 - p.mobility) * dt
    );
    p.vx *= drag;
    p.vz *= drag;

    const nx = p.x + p.vx * dt;
    const nz = p.z + p.vz * dt;
    const targetZone = zoneAt(nx, nz);

    if (targetZone && targetZone === activePourZone()) {
      const moved = Math.min(
        p.volume,
        p.volume * (.30 + .50 * p.mobility) * dt
      );
      if (moved > 1e-6) {
        p.volume -= moved;
        addConcreteVolumeAt(
          nx, nz, moved,
          p.vx, p.vz,
          Math.hypot(p.vx, p.vz)
        );
      }
      p.vx *= .55;
      p.vz *= .55;
    } else if (insideSlab(nx, nz) && !targetZone) {
      p.x = nx;
      p.z = nz;
    } else {
      p.vx *= -.06;
      p.vz *= -.06;
    }

    // Fresh concrete quickly loses height and gains footprint.
    const targetSpread = THREE.MathUtils.clamp(
      1.05 + Math.sqrt(p.volume) * .18,
      1.04, 1.30
    );
    p.spread = THREE.MathUtils.lerp(
      p.spread || .8,
      targetSpread,
      1 - Math.exp(-THREE.MathUtils.lerp(.45, 1.65, p.mobility) * dt)
    );

    refreshSpillClump(p);
  }

  // Merge only strongly overlapping neighboring plops.
  for (let i = 0; i < spillClumps.length; i++) {
    const a = spillClumps[i];
    if (a.volume <= .001) continue;

    for (let j = i + 1; j < spillClumps.length; j++) {
      const b = spillClumps[j];
      if (b.volume <= .001) continue;

      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const d2 = dx * dx + dz * dz;
      const mergeD = (a.radius + b.radius) * .26;

      if (d2 > mergeD * mergeD) continue;

      const av = a.volume, bv = b.volume, total = av + bv;
      a.x = (a.x * av + b.x * bv) / total;
      a.z = (a.z * av + b.z * bv) / total;
      a.vx = (a.vx * av + b.vx * bv) / total;
      a.vz = (a.vz * av + b.vz * bv) / total;
      a.mobility = Math.max(a.mobility || .5, b.mobility || .5);
      a.spread = Math.max(a.spread || 1, b.spread || 1);
      a.volume = total;
      b.volume = 0;
      refreshSpillClump(a);
      refreshSpillClump(b);
    }
  }

  deleteDeadSpills();
}

// -----------------------------
// 3-LEVEL LOCAL POUR MOUNDS
// -----------------------------
const POUR_PILE_LAYERS = [
  { maxRadius: 3.10, height: .055 },
  { maxRadius: 2.55, height: .055 },
  { maxRadius: 2.05, height: .055 }
];
for (const L of POUR_PILE_LAYERS) {
  L.capacity = Math.PI * L.maxRadius * L.maxRadius * L.height * .90;
}

function getActivePourPile(zone, x, z) {
  const now = performance.now() * .001;
  let best = null;
  let bestD2 = .65 * .65;

  for (const p of zone.piles) {
    if (now - p.lastTime > 2.2) continue;
    const dx = p.x - x, dz = p.z - z;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestD2) {
      bestD2 = d2;
      best = p;
    }
  }

  if (!best) {
    best = { x, z, volume: 0, lastTime: now };
    zone.piles.push(best);
  } else {
    best.x = THREE.MathUtils.lerp(best.x, x, .05);
    best.z = THREE.MathUtils.lerp(best.z, z, .05);
    best.lastTime = now;
  }
  return best;
}

function depositDiskTowardLevel(zone, cx, cz, radius, targetLevel, amountM3) {
  const candidates = [];
  const r2 = radius * radius;

  const minC = Math.max(0, Math.floor((cx - radius - zone.minX) / zone.cellX));
  const maxC = Math.min(zone.cols - 1, Math.floor((cx + radius - zone.minX) / zone.cellX));
  const minR = Math.max(0, Math.floor((cz - radius - zone.minZ) / zone.cellZ));
  const maxR = Math.min(zone.rows - 1, Math.floor((cz + radius - zone.minZ) / zone.cellZ));

  let deficitVolume = 0;

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const x = zone.minX + (c + .5) * zone.cellX;
      const z = zone.minZ + (r + .5) * zone.cellZ;
      const dx = x - cx, dz = z - cz;
      if (dx * dx + dz * dz > r2) continue;

      const idx = zoneIndex(zone, c, r);
      const deficitH = Math.max(0, targetLevel - zone.fill[idx]);
      if (deficitH <= 1e-7) continue;

      candidates.push([idx, deficitH]);
      deficitVolume += deficitH * zone.cellArea;
    }
  }

  if (!candidates.length || deficitVolume <= 1e-9) return 0;

  const used = Math.min(amountM3, deficitVolume);
  const fraction = used / deficitVolume;

  for (const [idx, deficitH] of candidates) {
    zone.fill[idx] = Math.min(
      zone.maxH,
      zone.fill[idx] + deficitH * fraction
    );
  }
  return used;
}

function depositConcreteImpact(
  zone,
  cx, cz,
  amountM3,
  impactVX = 0,
  impactVZ = 0,
  impactSpeed = 0
) {
  if (amountM3 <= 0) return false;

  const radius = THREE.MathUtils.clamp(
    .20 + Math.cbrt(Math.max(.00001, amountM3)) * .30 + impactSpeed * .008,
    .20, .40
  );
  const r2 = radius * radius;

  const minC = Math.max(0, Math.floor((cx - radius - zone.minX) / zone.cellX));
  const maxC = Math.min(zone.cols - 1, Math.floor((cx + radius - zone.minX) / zone.cellX));
  const minR = Math.max(0, Math.floor((cz - radius - zone.minZ) / zone.cellZ));
  const maxR = Math.min(zone.rows - 1, Math.floor((cz + radius - zone.minZ) / zone.cellZ));

  const cells = [];
  let weightSum = 0;

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const x = zone.minX + (c + .5) * zone.cellX;
      const z = zone.minZ + (r + .5) * zone.cellZ;
      const dx = x - cx, dz = z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 > r2) continue;

      const q = 1 - d2 / r2;
      const w = .10 + q * q * 2.25;
      const idx = zoneIndex(zone, c, r);
      cells.push([idx, w]);
      weightSum += w;
    }
  }

  if (!cells.length) {
    cells.push([zoneCellAt(zone, cx, cz).index, 1]);
    weightSum = 1;
  }

  for (const [idx, w] of cells) {
    const cellVolume = amountM3 * (w / weightSum);
    zone.fill[idx] += cellVolume / zone.cellArea;

    zone.mobility[idx] = Math.max(
      zone.mobility[idx],
      THREE.MathUtils.clamp(.86 + impactSpeed * .018, .86, 1)
    );

    zone.velX[idx] += THREE.MathUtils.clamp(impactVX * .045, -.28, .28);
    zone.velZ[idx] += THREE.MathUtils.clamp(impactVZ * .045, -.28, .28);
  }

  markZoneDirty(zone);
  return true;
}

function addConcreteVolumeAt(
  x, z, volumeM3,
  impactVX = 0,
  impactVZ = 0,
  impactSpeed = 0
) {
  if (jobState !== 'active' || volumeM3 <= 0) return false;

  const zone = zoneAt(x, z);

  // Keep the existing sequential job design.
  if (zone) {
    const targetZone = activePourZone();
    if (!targetZone) return false;
    if (zone !== targetZone) {
      const now = performance.now();
      if (now - wrongPourToastAt > 1200) {
        wrongPourToastAt = now;
        showToast(`СНАЧАЛА КАРТА №${targetZone.id}`);
      }
      return false;
    }
  }

  if (!zone) {
    if (insideSlab(x, z)) {
      return addSurfaceSpillVolumeAt(
        x, z, volumeM3, null,
        impactVX, impactVZ, impactSpeed
      );
    }
    wastedVolume += volumeM3;
    return false;
  }

  const changed = depositConcreteImpact(
    zone,
    x, z,
    volumeM3,
    impactVX,
    impactVZ,
    impactSpeed
  );

  if (changed) evaluateJob();
  return changed;
}

// -----------------------------
// VISCOUS SHALLOW-FLOW PHYSICS
// -----------------------------
// Concrete has a yield stress: small slopes stay put.
// Larger differences slowly transfer mass to lower neighbours.
// Eight-neighbour flow removes the old square-grid look while preserving volume.
function relaxZoneConcrete(zone, step) {
  const fill = zone.fill;
  const mob = zone.mobility;
  const vx = zone.velX;
  const vz = zone.velZ;
  const delta = zone.flowDelta;
  const budget = zone.flowBudget;

  delta.fill(0);

  // A) gravity slope -> persistent horizontal momentum.
  for (let r = 0; r < zone.rows; r++) {
    for (let c = 0; c < zone.cols; c++) {
      const i = zoneIndex(zone, c, r);
      const h = fill[i];

      if (h <= .00035) {
        vx[i] *= .35;
        vz[i] *= .35;
        mob[i] = 0;
        budget[i] = 0;
        continue;
      }

      mob[i] = Math.max(.14, mob[i] * Math.exp(-step / 46));

      const iL = c > 0 ? zoneIndex(zone, c - 1, r) : i;
      const iR = c + 1 < zone.cols ? zoneIndex(zone, c + 1, r) : i;
      const iD = r > 0 ? zoneIndex(zone, c, r - 1) : i;
      const iU = r + 1 < zone.rows ? zoneIndex(zone, c, r + 1) : i;

      const gx = (fill[iR] - fill[iL]) /
        ((c > 0 && c + 1 < zone.cols ? 2 : 1) * zone.cellX);
      const gz = (fill[iU] - fill[iD]) /
        ((r > 0 && r + 1 < zone.rows ? 2 : 1) * zone.cellZ);

      const slope = Math.hypot(gx, gz);
      const yieldSlope = THREE.MathUtils.lerp(.125, .045, mob[i]);

      if (slope > yieldSlope) {
        const yieldFactor = (slope - yieldSlope) / Math.max(slope, 1e-6);
        const accel = THREE.MathUtils.lerp(1.0, 2.55, mob[i]);
        vx[i] += -gx * accel * yieldFactor * step;
        vz[i] += -gz * accel * yieldFactor * step;
      }

      const viscosity = THREE.MathUtils.lerp(16.0, 6.0, mob[i]);
      const damp = Math.exp(-viscosity * step);
      vx[i] *= damp;
      vz[i] *= damp;

      const maxSpeed = THREE.MathUtils.lerp(.08, .35, mob[i]);
      const speed = Math.hypot(vx[i], vz[i]);
      if (speed > maxSpeed) {
        const s = maxSpeed / speed;
        vx[i] *= s;
        vz[i] *= s;
      }

      budget[i] = h * .32;
    }
  }

  // B) directional advection. Mass is conserved.
  for (let r = 0; r < zone.rows; r++) {
    for (let c = 0; c < zone.cols; c++) {
      const i = zoneIndex(zone, c, r);
      const h = fill[i];
      if (h <= .00035 || budget[i] <= 0) continue;

      let fx = Math.abs(vx[i]) * step / zone.cellX;
      let fz = Math.abs(vz[i]) * step / zone.cellZ;

      if ((vx[i] < 0 && c === 0) || (vx[i] > 0 && c === zone.cols - 1)) fx = 0;
      if ((vz[i] < 0 && r === 0) || (vz[i] > 0 && r === zone.rows - 1)) fz = 0;

      const raw = fx + fz;
      if (raw <= 1e-7) continue;

      const moveH = Math.min(
        budget[i],
        h * Math.min(.24, raw)
      );
      if (moveH <= 1e-8) continue;

      budget[i] -= moveH;
      delta[i] -= moveH;

      if (fx > 0) {
        const ni = zoneIndex(zone, c + Math.sign(vx[i]), r);
        delta[ni] += moveH * (fx / raw);
        mob[ni] = Math.max(mob[ni], mob[i] * .985);
      }
      if (fz > 0) {
        const ni = zoneIndex(zone, c, r + Math.sign(vz[i]));
        delta[ni] += moveH * (fz / raw);
        mob[ni] = Math.max(mob[ni], mob[i] * .985);
      }
    }
  }

  // C) yield-limited creep between unique neighbour pairs.
  const dirs = [
    [1, 0, 1.0],
    [0, 1, 1.0],
    [1, 1, .707],
    [-1, 1, .707],
  ];

  for (let r = 0; r < zone.rows; r++) {
    for (let c = 0; c < zone.cols; c++) {
      const i = zoneIndex(zone, c, r);

      for (const [dc, dr, diag] of dirs) {
        const cc = c + dc, rr = r + dr;
        if (cc < 0 || cc >= zone.cols || rr < 0 || rr >= zone.rows) continue;

        const j = zoneIndex(zone, cc, rr);
        const hi = fill[i] + delta[i];
        const hj = fill[j] + delta[j];
        const diff = hi - hj;
        const absDiff = Math.abs(diff);
        if (absDiff <= 1e-7) continue;

        const pairMob = Math.max(.12, (mob[i] + mob[j]) * .5);
        const yieldH = THREE.MathUtils.lerp(.032, .012, pairMob) / diag;
        const excess = absDiff - yieldH;
        if (excess <= 0) continue;

        const donor = diff > 0 ? i : j;
        const recv = diff > 0 ? j : i;
        if (budget[donor] <= 1e-8) continue;

        const moveH = Math.min(
          budget[donor],
          excess * THREE.MathUtils.lerp(.16, .52, pairMob) * diag * step
        );
        if (moveH <= 1e-8) continue;

        budget[donor] -= moveH;
        delta[donor] -= moveH;
        delta[recv] += moveH;
        mob[recv] = Math.max(mob[recv], mob[donor] * .99);
      }
    }
  }

  let changed = false;
  for (let i = 0; i < fill.length; i++) {
    if (Math.abs(delta[i]) <= 1e-9) continue;
    fill[i] = Math.max(0, fill[i] + delta[i]);
    changed = true;
  }

  if (changed) markZoneDirty(zone);
}

const CONCRETE_SOLVER_DT = 1 / 30;

function relaxConcrete(dt) {
  if (jobState !== 'active') return;

  concreteRelaxTimer += Math.min(dt, .10);
  let loops = 0;

  while (concreteRelaxTimer >= CONCRETE_SOLVER_DT && loops < 4) {
    concreteRelaxTimer -= CONCRETE_SOLVER_DT;

    for (const zone of POUR_ZONES) {
      relaxZoneConcrete(zone, CONCRETE_SOLVER_DT);
    }
    relaxSurfaceSpills(CONCRETE_SOLVER_DT);

    loops++;
  }
}

// Falling blobs are short-lived stream visuals. Persistent volume lives either in a bay heightfield or in surface spill clumps.
const BLOB_MAX = 120;
const blobGeom = new THREE.SphereGeometry(.15, 14, 10);
const blobMat = new THREE.MeshStandardMaterial({ color: 0x707774, roughness: .40 });
const blobs = [];
const blobGroup = new THREE.Group();
blobGroup.name = 'CONCRETE_PHYSICS_BLOBS';
scene.add(blobGroup);

for (let i = 0; i < BLOB_MAX; i++) {
  const mesh = new THREE.Mesh(blobGeom, blobMat);
  mesh.visible = false;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  blobGroup.add(mesh);
  blobs.push({
    mesh, active: false,
    vel: new THREE.Vector3(),
    age: 0,
    radius: .12,
    settled: false
  });
}
let blobCursor = 0;
let blobSpawnAccumulator = 0;

const pourTipPrevSafe = new THREE.Vector3();
const pourTipVelSafe = new THREE.Vector3();
const pourOutletDirSafe = new THREE.Vector3();
const pourVisualVelSafe = new THREE.Vector3();
let pourTipPrevSafeValid = false;

function spawnBlob(pos, burst = false, inheritedVel = null) {
  const b = blobs[blobCursor++ % BLOB_MAX];
  b.active = true;
  b.age = 0;
  b.settled = false;
  b.radius = .145;
  b.mesh.visible = true;
  b.mesh.position.copy(pos);
  b.mesh.scale.setScalar(b.radius / .15);
  b.vel.set(
    THREE.MathUtils.randFloatSpread(burst ? .6 : .14),
    THREE.MathUtils.randFloat(burst ? -.12 : -.04, .06),
    THREE.MathUtils.randFloatSpread(burst ? .6 : .14)
  );
  if (inheritedVel) b.vel.add(inheritedVel);
}
function updateBlobs(dt) {
  const g = 7.25;

  for (const b of blobs) {
    if (!b.active) continue;
    b.age += dt;

    const x = b.mesh.position.x;
    const z = b.mesh.position.z;
    const blobZone = zoneAt(x, z);
    const surfaceY = blobZone
      ? blobZone.bottomY + getFillHeightAt(x, z)
      : groundHeightAt(x, z);

    if (!b.settled) {
      b.vel.y -= g * dt;
      b.mesh.position.addScaledVector(b.vel, dt);

      // Slight penetration on impact already makes the blob feel heavy/wet.
      const impactY = surfaceY + b.radius * .54;

      if (b.mesh.position.y <= impactY) {
        b.mesh.position.y = impactY;
        b.vel.y *= -.015;
        b.vel.x *= .10;
        b.vel.z *= .10;
        b.settled = true;
        b.age = Math.max(b.age, .01);
      }
    }

    if (b.settled) {
      // 0.25-0.35 sec wet splat: widen rapidly while being swallowed by the
      // continuous surface. It never remains as a marble sitting on top.
      const settleAge = Math.max(0, b.age);
      const mergeT = THREE.MathUtils.clamp((settleAge - .05) / .32, 0, 1);

      const targetXZ = (b.radius / .15) * THREE.MathUtils.lerp(1.0, 1.75, mergeT);
      b.mesh.scale.x = THREE.MathUtils.damp(b.mesh.scale.x, targetXZ, 14, dt);
      b.mesh.scale.z = THREE.MathUtils.damp(b.mesh.scale.z, targetXZ, 14, dt);
      b.mesh.scale.y = THREE.MathUtils.damp(b.mesh.scale.y, .10, 16, dt);

      // Track the live heightfield and sink below it during the merge.
      const targetY = surfaceY - b.radius * THREE.MathUtils.lerp(.05, .55, mergeT);
      b.mesh.position.y = THREE.MathUtils.damp(
        b.mesh.position.y,
        targetY,
        18,
        dt
      );

      if (mergeT >= .98 || b.age > .55) {
        b.active = false;
        b.mesh.visible = false;
      }
    }

    // Safety cleanup for blobs that miss the pour area.
    if (b.age > 2.8) {
      b.active = false;
      b.mesh.visible = false;
    }
  }
}

function setCylinderBetween(mesh, a, b) {
  hoseTmpDir.copy(b).sub(a);
  const len = hoseTmpDir.length();
  if (len < .0001) return;
  hoseTmpMid.copy(a).add(b).multiplyScalar(.5);
  mesh.position.copy(hoseTmpMid);
  mesh.quaternion.setFromUnitVectors(Y_AXIS, hoseTmpDir.normalize());
  mesh.scale.set(1, len, 1);
}


// -----------------------------
// Concrete rake / come-along — SCENE MODEL, no procedural geometry
// -----------------------------
let rakeEquipped = false;
let rakeHiddenBySpecial = false;
let rakeOwned = false;
let rakeWorld = null;
let rakePickupProxy = null;
let rakePickupInteraction = null;
let rakeSceneSource = null;
let raking = false;
let rakeStrokeTimer = 0;
let rakeBob = 0;
let rakeAnimClock = 0;

// Continuous sweep state. Holding LMB engages the tool; movement of the
// work point across the bay determines what is actually levelled.
let rakeSweepAccumulator = 0;
let rakeSweepPrevValid = false;
let rakeSweepWorkBlend = 0;
let rakeSweepTravel = 0;
const rakeSweepPrevPoint = new THREE.Vector3();
const rakeSweepNowPoint = new THREE.Vector3();
const rakeSweepDir = new THREE.Vector3();

// v51.3: stable lower-right FPS framing.
// v51.5: rake head stays forward over the work surface; handle returns
// toward the player in the lower-right corner.
const RAKE_VM_BASE_POS = new THREE.Vector3(.70, -.60, -1.62);
const RAKE_VM_BASE_ROT = new THREE.Euler(-.20, -1.615, -.50, 'XYZ');

const RAKE_VIEWMODEL_LAYER = 2;

const rakeVM = new THREE.Group();
rakeVM.name = 'SCENE_CONCRETE_RAKE_VM';
rakeVM.visible = false;
rakeVM.layers.set(RAKE_VIEWMODEL_LAYER);
camera.add(rakeVM);

function enableRakeViewmodelLighting() {
  scene.traverse?.(o => {
    if (o?.isLight) o.layers.enable(RAKE_VIEWMODEL_LAYER);
  });
}

function setRakeViewmodelLayer(root) {
  if (!root) return;
  root.layers.set(RAKE_VIEWMODEL_LAYER);
  root.traverse?.(o => o.layers.set(RAKE_VIEWMODEL_LAYER));
}

function objectIsInside(root, obj) {
  let p = obj;
  while (p) {
    if (p === root) return true;
    p = p.parent;
  }
  return false;
}

function sceneRakeCandidates(root) {
  // In SCENE3 the exported parent `grably...` contains TWO actual rakes near x~4.5
  // plus an unrelated third prop far away. Using the whole parent made the pickup
  // proxy appear in the middle of nowhere. Treat the two authored rake roots separately.
  const out = [];
  // SCENE22 authored rake meshes.
  for (const name of ['GRABLI1', 'GRABLI2', 'GRABLI3', 'Object_4.003', 'Object_4.004']) {
    const o = root.getObjectByName(name);
    if (o && !out.includes(o)) out.push(o);
  }

  // Future-safe fallback: if names change, use direct children of the known rake group
  // that are tall/slender enough to look like a rake.
  if (!out.length) {
    const group = root.getObjectByName('grably.obj.cleaner.materialmerger.gles');
    if (group) {
      for (const c of group.children) {
        const bb = new THREE.Box3().setFromObject(c);
        const size = bb.getSize(new THREE.Vector3());
        if (size.y > .9 && Math.max(size.x, size.z) < 1.2) out.push(c);
      }
    }
  }
  return out;
}

const rakePickupInteractions = [];
const rakeCandidateRoots = [];


function cloneOpaqueRakeMaterial(sourceMat) {
  if (!sourceMat) {
    return new THREE.MeshStandardMaterial({
      color: 0x34322f,
      roughness: .72,
      metalness: .06
    });
  }

  const m = sourceMat.clone();

  if (m.map) {
    m.map.colorSpace = THREE.SRGBColorSpace;
    m.map.needsUpdate = true;
  }

  // Kill every common transparency path.
  m.transparent = false;
  m.opacity = 1.0;
  m.alphaTest = 0.0;
  m.alphaHash = false;
  m.premultipliedAlpha = false;
  m.blending = THREE.NormalBlending;

  // Important difference from generic FPS props:
  // rake must depth-test against ITSELF.
  m.depthTest = true;
  m.depthWrite = true;
  m.colorWrite = true;

  if ('transmission' in m) m.transmission = 0;
  if ('transmissionMap' in m) m.transmissionMap = null;

  // Rake source has thin metal geometry; DoubleSide prevents missing reverse
  // faces while still remaining fully opaque.
  m.side = THREE.DoubleSide;
  m.forceSinglePass = false;
  m.needsUpdate = true;

  return m;
}

function makeRakeGeometryOpaque(root) {
  if (!root) return;

  root.traverse?.(o => {
    if (!o.isMesh) return;

    if (Array.isArray(o.material)) {
      o.material = o.material.map(cloneOpaqueRakeMaterial);
    } else {
      o.material = cloneOpaqueRakeMaterial(o.material);
    }

    o.renderOrder = 0;
    o.castShadow = false;
    o.receiveShadow = false;
    o.frustumCulled = false;
  });
}

function buildRakeViewModelFromScene(source) {
  rakeVM.clear();
  source.updateWorldMatrix(true, true);

  const sourceBox = new THREE.Box3().setFromObject(source);
  const center = sourceBox.getCenter(new THREE.Vector3());
  const size = sourceBox.getSize(new THREE.Vector3());
  const baked = new THREE.Group();
  baked.name = 'RAKE_SCENE_MODEL_BAKED';

  source.traverse(o => {
    if (!o.isMesh || !o.geometry) return;
    const geom = o.geometry.clone();
    geom.applyMatrix4(o.matrixWorld);
    geom.translate(-center.x, -center.y, -center.z);
    const material = Array.isArray(o.material)
      ? o.material.map(cloneOpaqueRakeMaterial)
      : cloneOpaqueRakeMaterial(o.material);
    const mesh = new THREE.Mesh(geom, material);
    mesh.name = `VM_${o.name}`;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    baked.add(mesh);
  });

  const holder = new THREE.Group();
  holder.name = 'RAKE_VM_HOLDER';
  holder.add(baked);
  // Authoring mesh is vertical in the world. Rotate the handle into FPS depth.
  holder.rotation.set(Math.PI * .5, 0, -.02);
  const modelLength = Math.max(size.x, size.y, size.z, .001);
  holder.scale.setScalar(2.025 / modelLength);
  holder.position.set(0, 0, 0);
  rakeVM.add(holder);

  rakeVM.position.copy(RAKE_VM_BASE_POS);
  rakeVM.rotation.copy(RAKE_VM_BASE_ROT);
  enableRakeViewmodelLighting();

  // Do NOT run generic prepViewModel() here: it disables depth testing and
  // makes complex rake geometry appear transparent.
  makeRakeGeometryOpaque(rakeVM);
  setRakeViewmodelLayer(rakeVM);
}

function setupSceneRake(root) {
  rakeCandidateRoots.length = 0;
  rakePickupInteractions.length = 0;

  const candidates = sceneRakeCandidates(root);
  if (!candidates.length) {
    console.warn('Scene rake model not found; rake pickup disabled');
    return;
  }

  for (const source of candidates) {
    source.visible = true;
    makeRakeGeometryOpaque(source);
    source.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
    rakeCandidateRoots.push(source);

    const bb = new THREE.Box3().setFromObject(source);
    const center = bb.getCenter(new THREE.Vector3());
    // Put the interaction point around hand height but keep X/Z at this rake only.
    center.y = Math.min(bb.max.y, Math.max(bb.min.y + .75, .9));

    const proxy = new THREE.Object3D();
    proxy.name = `RAKE_PICKUP_${source.name}`;
    proxy.position.copy(center);
    scene.add(proxy);

    const it = {
      obj: proxy,
      kind: 'rakePickup',
      radius: 3.35,
      text: 'E — подобрать грабли',
      rakeSource: source,
      source,
      requiresLook: true,
      // Horizontal bounds make pickup robust even when the handle is tall.
      bounds: bb.clone(),
    };
    rakePickupInteractions.push(it);
    interactive.push(it);
    console.log('Scene rake pickup ready:', source.name, center, bb.min, bb.max);
  }

  // Legacy vars kept for other code paths.
  rakeSceneSource=candidates[0];
  rakeWorld=candidates[0];
  setHotbar3DModel('rake',candidates[0]);
}

function pickupRake(source = null) {
  if (rakeOwned) return;
  rakeOwned = true;

  rakeWorld = source || rakeWorld || rakeCandidateRoots[0] || null;
  if (rakeWorld) {
    buildRakeViewModelFromScene(rakeWorld);
    rakeWorld.visible = false;
  }

  for (const it of rakePickupInteractions) {
    const i = interactive.indexOf(it);
    if (i >= 0) interactive.splice(i, 1);
    if (it.obj?.parent) it.obj.parent.remove(it.obj);
  }
  rakePickupInteractions.length = 0;
  rakePickupInteraction = null;

  showToast('ГРАБЛИ ПОДОБРАНЫ · 4 — ДОСТАТЬ / УБРАТЬ');
  setRakeEquipped(true);
}


function stowRakeForSpecial() {
  rakeHiddenBySpecial = !!rakeEquipped;

  // Do not unequip logically: just remove the viewmodel/contact while hands
  // are busy with cigarette/cans.
  raking = false;
  rakeSweepPrevValid = false;
  rakeSweepAccumulator = 0;

  if (rakeVM) rakeVM.visible = false;
}

function restoreRakeAfterSpecial() {
  if (rakeHiddenBySpecial && rakeEquipped && rakeVM) {
    rakeVM.visible = true;
    rakeSweepPrevValid = false;
    rakeSweepAccumulator = 0;
    rakeSweepWorkBlend = 0;
    rakeSweepTravel = 0;
  }
  rakeHiddenBySpecial = false;
}

function setRakeEquipped(on) {
  if (on && !rakeOwned) {
    showToast('СНАЧАЛА НАЙДИ И ПОДБЕРИ ГРАБЛИ');
    return;
  }
  rakeEquipped = !!on;
  raking = false;
  rakeAnimClock = 0;
  rakeSweepPrevValid = false;
  rakeSweepAccumulator = 0;
  rakeSweepWorkBlend = 0;
  rakeSweepTravel = 0;
  rakeVM.visible = rakeEquipped && !specialMode;
  if (rakeEquipped) {
    rakeVM.position.copy(RAKE_VM_BASE_POS);
    rakeVM.rotation.copy(RAKE_VM_BASE_ROT);
    if (hoseHeld) {
      hoseHeld = false;
      pouring = false;
      if (hoseInteraction) hoseInteraction.text = 'E — взять шланг';
    }
    finishSpecial();
    showToast('ГРАБЛИ · ЛКМ — РАЗРАВНИВАТЬ / СДВИГАТЬ БЕТОН');
  } else {
    showToast('Грабли убраны');
  }
}

const rakeAimOrigin = new THREE.Vector3();
const rakeAimDir = new THREE.Vector3();
const rakeAimPoint = new THREE.Vector3();

function getRakeWorkPoint(out) {
  camera.getWorldDirection(rakeAimDir);
  rakeAimDir.y = 0;
  if (rakeAimDir.lengthSq() < .001) return false;
  rakeAimDir.normalize();

  // Slightly farther than before because the rake head now visually sits
  // forward over the concrete instead of in the middle of the screen.
  out.set(
    playerPos.x + rakeAimDir.x * 2.05,
    0,
    playerPos.z + rakeAimDir.z * 2.05
  );
  return true;
}

function levelConcreteAtPoint(px, pz, step, moveDirX, moveDirZ) {
  let didSomething = false;

  // ------------------------------------------------
  // A) CONTINUOUSLY PUSH SURFACE SPILLS
  // ------------------------------------------------
  // Small transfer every 30 Hz instead of a huge chunk per click.
  const spillBrushR = 1.224;

  for (const p of spillClumps) {
    if (p.volume <= .001) continue;

    const dx = p.x - px;
    const dz = p.z - pz;
    const reach = spillBrushR + Math.min(.35, p.radius * .20);
    if (dx * dx + dz * dz > reach * reach) continue;

    const fraction = THREE.MathUtils.clamp(step * 1.15, 0, .045);
    const movedVolume = Math.min(
      p.volume,
      Math.max(.00035, p.volume * fraction)
    );
    if (movedVolume <= .0001) continue;

    const pushDist = .15;
    const dstX = p.x + moveDirX * pushDist;
    const dstZ = p.z + moveDirZ * pushDist;
    if (!insideSlab(dstX, dstZ)) continue;

    p.volume -= movedVolume;
    refreshSpillClump(p);

    const dstZone = zoneAt(dstX, dstZ);
    if (dstZone) {
      addConcreteVolumeAt(
        dstX, dstZ,
        movedVolume,
        moveDirX * .55,
        moveDirZ * .55,
        .55
      );
    } else {
      addSurfaceSpillVolumeAt(
        dstX, dstZ,
        movedVolume,
        p,
        moveDirX * .75,
        moveDirZ * .75,
        .75
      );
    }

    didSomething = true;
  }

  // ------------------------------------------------
  // B) CONTINUOUS ARCADE LEVELING INSIDE A BAY
  // ------------------------------------------------
  const zone = zoneAt(px, pz);
  if (!zone) return didSomething;

  const brushRadius = 1.272;
  const brushR2 = brushRadius * brushRadius;
  const cells = [];
  let localSum = 0;
  let weightSum = 0;

  for (let r = 0; r < zone.rows; r++) {
    for (let c = 0; c < zone.cols; c++) {
      const x = zone.minX + (c + .5) * zone.cellX;
      const z = zone.minZ + (r + .5) * zone.cellZ;
      const dx = x - px;
      const dz = z - pz;
      const d2 = dx * dx + dz * dz;
      if (d2 > brushR2) continue;

      const idx = zoneIndex(zone, c, r);
      const radial = 1 - THREE.MathUtils.clamp(
        Math.sqrt(d2) / brushRadius,
        0, 1
      );
      const weight = .24 + radial * .76;

      cells.push([idx, weight, c, r]);
      localSum += zone.fill[idx] * weight;
      weightSum += weight;
    }
  }

  if (cells.length < 2 || weightSum <= 0) return didSomething;

  const localMean = localSum / weightSum;

  // Continuous strength: roughly 12–15% correction per 30 Hz tick at the
  // center. A patch becomes visibly flatter while the player sweeps over it,
  // but one stationary hold cannot finish the whole bay.
  const centerStrength = 1 - Math.exp(-5.95 * step);

  let before = 0;
  let after = 0;

  for (const [idx, weight] of cells) {
    before += zone.fill[idx];

    const s = centerStrength * (.38 + weight * .62);
    zone.fill[idx] += (localMean - zone.fill[idx]) * s;

    zone.rakeTouched[idx] = 1;
    zone.mobility[idx] = Math.max(zone.mobility[idx], .94);

    // Finishing kills chaotic flow locally.
    zone.velX[idx] *= .72;
    zone.velZ[idx] *= .72;

    after += zone.fill[idx];
  }

  // Exact local mass correction.
  const correction = (before - after) / cells.length;
  for (const [idx] of cells) {
    zone.fill[idx] = Math.max(0, zone.fill[idx] + correction);
  }

  // A tiny directional comb effect. It gives a sense that the rake is being
  // pulled through the material rather than acting as a magic blur tool.
  const combDepth = .00022;
  for (const [idx, weight, c, r] of cells) {
    if (weight < .55 || zone.fill[idx] <= combDepth) continue;

    let dc = 0, dr = 0;
    if (Math.abs(moveDirX) > Math.abs(moveDirZ)) {
      dc = Math.sign(moveDirX);
    } else {
      dr = Math.sign(moveDirZ);
    }

    const tc = c + dc;
    const tr = r + dr;
    if (tc < 0 || tc >= zone.cols || tr < 0 || tr >= zone.rows) continue;

    const dst = zoneIndex(zone, tc, tr);
    const moved = Math.min(
      combDepth * weight * (step * 30),
      zone.fill[idx]
    );

    zone.fill[idx] -= moved;
    zone.fill[dst] += moved;
    zone.rakeTouched[dst] = 1;
  }

  markZoneDirty(zone);
  return true;
}

function rakeContinuousSweepStep(step) {
  if (!rakeEquipped || !raking || jobState !== 'active') {
    rakeSweepPrevValid = false;
    return;
  }

  if (!getRakeWorkPoint(rakeSweepNowPoint)) return;

  // First sample starts at the current work point.
  if (!rakeSweepPrevValid) {
    rakeSweepPrevPoint.copy(rakeSweepNowPoint);
    rakeSweepPrevValid = true;
  }

  rakeSweepDir
    .copy(rakeSweepNowPoint)
    .sub(rakeSweepPrevPoint);

  const travel = rakeSweepDir.length();
  rakeSweepTravel = THREE.MathUtils.damp(
    rakeSweepTravel,
    Math.min(1, travel / .18),
    14,
    step
  );

  // Direction of material pull follows actual sweep movement. If the player
  // is almost stationary, use the camera-forward direction.
  let dirX = rakeAimDir.x;
  let dirZ = rakeAimDir.z;

  if (travel > .012) {
    rakeSweepDir.multiplyScalar(1 / travel);
    dirX = rakeSweepDir.x;
    dirZ = rakeSweepDir.z;
  }

  // Interpolate along the path so fast camera/player motion cannot skip cells.
  const spacing = .28;
  const samples = Math.max(1, Math.ceil(travel / spacing));
  let changed = false;

  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const x = THREE.MathUtils.lerp(
      rakeSweepPrevPoint.x,
      rakeSweepNowPoint.x,
      t
    );
    const z = THREE.MathUtils.lerp(
      rakeSweepPrevPoint.z,
      rakeSweepNowPoint.z,
      t
    );

    changed = levelConcreteAtPoint(
      x, z,
      step / samples,
      dirX,
      dirZ
    ) || changed;
  }

  rakeSweepPrevPoint.copy(rakeSweepNowPoint);

  if (changed) {
    // The supplied rake sample is ~0.6 s. Re-trigger only while the tool is
    // genuinely travelling through concrete, with enough spacing to avoid a
    // machine-gun repetition.
    if (travel > .018 && rakeDragCooldown <= 0) {
      const intensity = THREE.MathUtils.clamp(travel / .16, .25, 1);
      playRakeDragAudio(intensity);
      rakeDragCooldown = THREE.MathUtils.randFloat(.38, .52);
    }

    evaluateJob();
  }
}


function updateRake(dt) {
  rakeDragCooldown = Math.max(0, rakeDragCooldown - dt);

  if (!rakeEquipped) {
    rakeSweepPrevValid = false;
    return;
  }

  applyProceduralRakePose(dt);
  rakeBob = THREE.MathUtils.damp(rakeBob, raking ? 1 : 0, 12, dt);

  if (!raking) {
    rakeSweepPrevValid = false;
    rakeSweepAccumulator = 0;
    return;
  }

  // Physics/tool contact at a stable 30 Hz, independent of rendering FPS.
  rakeSweepAccumulator += Math.min(dt, .10);
  let loops = 0;
  const step = 1 / 30;

  while (rakeSweepAccumulator >= step && loops < 4) {
    rakeSweepAccumulator -= step;
    rakeContinuousSweepStep(step);
    loops++;
  }
}

// -----------------------------
// OSU-like pressure QTE
// -----------------------------
let qteActive = false;
let qteCooldown = 12.0;
let qteStartTime = 0;
let qteDeadline = 0;
const QTE_DURATION_MS = 950;
const QTE_PERFECT_AT = 0.76;       // visual approach ring coincides with target here
const QTE_PERFECT_WINDOW_MS = 90;  // rhythm-game perfect window
let qtePerfectBoostUntil = 0;
let qtePerfects = 0;
let qteX = innerWidth * .5, qteY = innerHeight * .5;
let qteCursorX = innerWidth * .5, qteCursorY = innerHeight * .5;

function resetQTECooldown() {
  qteCooldown = THREE.MathUtils.randFloat(10.0, 15.0);
}
function startQTE() {
  if (qteActive || jobState !== 'active' || !hoseHeld || !pouring) return;
  qteActive = true;

  // Central 50% x 50% only. Never near screen corners.
  const minX = innerWidth * .25;
  const maxX = innerWidth * .75;
  const minY = innerHeight * .25;
  const maxY = innerHeight * .75;

  qteX = THREE.MathUtils.randFloat(minX, maxX);
  qteY = THREE.MathUtils.randFloat(minY, maxY);

  qteTargetEl.style.left = `${qteX}px`;
  qteTargetEl.style.top = `${qteY}px`;
  qteCursorEl.style.left = `${qteCursorX}px`;
  qteCursorEl.style.top = `${qteCursorY}px`;
  qteLayerEl.classList.add('active');

  qteTargetEl.classList.remove('pulse');
  void qteTargetEl.offsetWidth;
  qteTargetEl.classList.add('pulse');

  qteStartTime = performance.now();
  qteDeadline = qteStartTime + QTE_DURATION_MS;

  playQTEAppearAudio();
}

function endQTE(success, perfect = false) {
  if (!qteActive) return;
  qteActive = false;
  qteLayerEl.classList.remove('active');
  qteTargetEl.classList.remove('pulse');
  qteTargetEl.classList.remove('perfect');

  if (success) {
    qteHits++;
    if (perfect) {
      qtePerfects++;
      qtePerfectBoostUntil = performance.now() + 5000;
      qteTargetEl.classList.add('perfect');
      setTimeout(() => qteTargetEl.classList.remove('perfect'), 180);
      showToast('ИДЕАЛЬНО! ПОДАЧА БЕТОНА +35% · 5 СЕК');
    } else {
      showToast('ДАВЛЕНИЕ СТАБИЛЬНО · QTE OK');
    }
  } else {
    qteMisses++;
    playHoseSlipAudio();

    // The pump does NOT magically switch off when the hose is ripped out of
    // the worker's hands.  If concrete was flowing, it keeps flowing on the
    // floor until the player grabs the hose again and switches the pump off.
    hoseHeld = false;
    if (hoseInteraction) hoseInteraction.text = pouring
      ? 'E — взять шланг · БЕТОН ЛЬЁТСЯ!'
      : 'E — взять шланг';
    showToast(pouring
      ? 'QTE ПРОВАЛЕН — ШЛАНГ ВЫРВАЛО! БЕТОН ПРОДОЛЖАЕТ ЛИТЬСЯ'
      : 'QTE ПРОВАЛЕН — ШЛАНГ ВЫРВАЛО ИЗ РУК');
  }

  resetQTECooldown();
}
function clickQTE() {
  if (!qteActive) return false;
  const dx = qteCursorX - qteX;
  const dy = qteCursorY - qteY;
  const inside = dx * dx + dy * dy <= 68 * 68; // +~30% target size
  if (inside) {
    playQTEHitAudio();

    const now = performance.now();
    const perfectTime = qteStartTime + QTE_DURATION_MS * QTE_PERFECT_AT;
    const perfect = Math.abs(now - perfectTime) <= QTE_PERFECT_WINDOW_MS;
    endQTE(true, perfect);
    return true;
  }
  qteTargetEl.classList.add('badclick');
  setTimeout(() => qteTargetEl.classList.remove('badclick'), 100);
  return false;
}
function updateQTE(dt) {
  if (qteActive) {
    if (performance.now() > qteDeadline) endQTE(false);
    return;
  }
  if (pouring && hoseHeld && jobState === 'active') {
    qteCooldown -= dt;
    if (qteCooldown <= 0) startQTE();
  }
}

// -----------------------------
// Hose physics
// -----------------------------
function initializeHose(anchorPos) {
  hosePoints.length = 0;
  hosePrev.length = 0;
  for (const m of hoseMeshes) hoseGroup.remove(m);
  hoseMeshes.length = 0;
  if (hoseTip.parent !== hoseGroup) hoseGroup.add(hoseTip);

  for (let i = 0; i <= HOSE_SEGMENTS; i++) {
    const p = anchorPos.clone();
    const vertical = Math.min(i, 5);
    p.y -= vertical * .30;
    if (i > 5) p.z += (i - 5) * .305;
    p.y = Math.max(p.y, groundHeightAt(p.x, p.z) + .07);
    hosePoints.push(p);
    hosePrev.push(p.clone());

    if (i < HOSE_SEGMENTS) {
      const seg = new THREE.Mesh(hoseGeom, hoseMat);
      seg.castShadow = true;
      seg.receiveShadow = true;
      seg.frustumCulled = false;
      seg.renderOrder = 2;
      hoseGroup.add(seg);
      hoseMeshes.push(seg);
    }
  }

  hoseGroup.visible = true;
  hoseCoupler.position.copy(anchorPos);
  hoseCoupler.position.y -= .16;
  hoseCoupler.rotation.set(0, 0, 0);
  for (let i = 0; i < HOSE_SEGMENTS; i++) {
    setCylinderBetween(hoseMeshes[i], hosePoints[i], hosePoints[i + 1]);
  }

  hoseProxy = new THREE.Object3D();
  hoseProxy.name = 'HOSE_GRAB_END';
  scene.add(hoseProxy);
  hoseProxy.position.copy(hosePoints[hosePoints.length - 1]);
  hoseTip.position.copy(hosePoints[hosePoints.length - 1]);

  hoseInteraction = {
    obj: hoseProxy,
    kind: 'hose',
    radius: 2.1,
    text: 'E — взять шланг'
  };
  interactive.push(hoseInteraction);
}
function hoseGroundY(x, z) {
  return groundHeightAt(x, z) + .055;
}
function constrainHose() {
  if (hoseAnchorObject) {
    const liveAnchor = hoseAnchorObject.getWorldPosition(hoseTmpMid);
    if (liveAnchor.lengthSq() > .25) hosePoints[0].copy(liveAnchor);
    else if (hoseAnchorFallbackValid) hosePoints[0].copy(hoseAnchorFallback);
  } else if (hoseAnchorFallbackValid) {
    hosePoints[0].copy(hoseAnchorFallback);
  }
  if (hosePoints.length) {
    hoseCoupler.position.copy(hosePoints[0]);
    hoseCoupler.position.y -= .16;
  }

  if (hoseHeld) {
    camera.updateWorldMatrix(true, false);
    hoseHandTarget.set(.34, -.31, -1.32).applyQuaternion(camera.quaternion).add(camera.position);
    hosePoints[HOSE_SEGMENTS].copy(hoseHandTarget);
  }

  for (let i = 0; i < HOSE_SEGMENTS; i++) {
    const a = hosePoints[i];
    const b = hosePoints[i + 1];
    hoseTmpDir.copy(b).sub(a);
    const len = Math.max(hoseTmpDir.length(), .00001);
    const diff = (len - HOSE_REST) / len;

    if (i === 0) {
      b.addScaledVector(hoseTmpDir, -diff);
    } else if (i + 1 === HOSE_SEGMENTS && hoseHeld) {
      a.addScaledVector(hoseTmpDir, diff);
    } else {
      a.addScaledVector(hoseTmpDir, diff * .5);
      b.addScaledVector(hoseTmpDir, -diff * .5);
    }
  }

  for (let i = 1; i <= HOSE_SEGMENTS; i++) {
    if (i === HOSE_SEGMENTS && hoseHeld) continue;
    const p = hosePoints[i];
    const gy = hoseGroundY(p.x, p.z);
    if (p.y < gy) p.y = gy;
  }
}
function updatePhysicalHose(dt) {
  if (!hosePoints.length) return;
  const subDt = Math.min(dt, .033);
  const gravity = 9.81 * subDt * subDt;

  for (let i = 1; i <= HOSE_SEGMENTS; i++) {
    if (i === HOSE_SEGMENTS && hoseHeld) continue;
    const p = hosePoints[i];
    const prev = hosePrev[i];
    const vx = (p.x - prev.x) * .985;
    const vy = (p.y - prev.y) * .985;
    const vz = (p.z - prev.z) * .985;
    prev.copy(p);
    p.x += vx;
    p.y += vy - gravity;
    p.z += vz;
  }

  for (let k = 0; k < 9; k++) constrainHose();
  hosePrev[0].copy(hosePoints[0]);
  if (hoseHeld) hosePrev[HOSE_SEGMENTS].copy(hosePoints[HOSE_SEGMENTS]);

  for (let i = 0; i < HOSE_SEGMENTS; i++) setCylinderBetween(hoseMeshes[i], hosePoints[i], hosePoints[i + 1]);
  if (hoseProxy) hoseProxy.position.copy(hosePoints[HOSE_SEGMENTS]);
  hoseTip.position.copy(hosePoints[HOSE_SEGMENTS]);

  updatePouring(dt);
  relaxConcrete(dt);
  refreshConcreteSurfaces();
  updateBlobs(dt);
  updateQTE(dt);
}

const BASE_POUR_RATE_M3 = 0.175; // ~53 s base fill time per bay at pump level 0
const PUMP_RATE_MULT = [1.0, 1.18, 1.40, 1.66];
function currentPumpRateMultiplier() { return PUMP_RATE_MULT[pumpLevel] || 1.0; }
function currentPerfectQTEBoost() {
  return performance.now() < qtePerfectBoostUntil ? 1.35 : 1.0;
}
function currentPourRateM3() {
  return BASE_POUR_RATE_M3 * currentPumpRateMultiplier() * currentPerfectQTEBoost();
}

function updatePouring(dt) {
  // Pump state and hand state are separate. A dropped hose can keep dumping
  // concrete until the player recovers it and turns the pump off.
  if (!pouring || !hosePoints.length || jobState !== 'active') {
    pourTipPrevSafeValid = false;
    return;
  }

  const end = hosePoints[HOSE_SEGMENTS];

  // Actual hose-tip motion influences the stream and the impacted concrete.
  if (pourTipPrevSafeValid && dt > 1e-5) {
    pourTipVelSafe.copy(end).sub(pourTipPrevSafe).multiplyScalar(1 / dt);
    const tipSpeed = pourTipVelSafe.length();
    if (tipSpeed > 3.8) pourTipVelSafe.multiplyScalar(3.8 / tipSpeed);
  } else {
    pourTipVelSafe.set(0, 0, 0);
    pourTipPrevSafeValid = true;
  }
  pourTipPrevSafe.copy(end);

  pourOutletDirSafe
    .copy(end)
    .sub(hosePoints[Math.max(0, HOSE_SEGMENTS - 1)]);
  if (pourOutletDirSafe.lengthSq() < 1e-7) {
    pourOutletDirSafe.set(0, -1, 0);
  } else {
    pourOutletDirSafe.normalize();
  }
  pourOutletDirSafe.y -= .35;
  pourOutletDirSafe.normalize();

  const rateMult = currentPumpRateMultiplier() * currentPerfectQTEBoost();

  pourVisualVelSafe
    .copy(pourOutletDirSafe)
    .multiplyScalar(1.35 * rateMult)
    .addScaledVector(pourTipVelSafe, .42);

  // Predict a short fall from the hose end to the work surface.
  // This keeps numerical mass near where the visible stream actually lands,
  // without making scene loading dependent on a new particle/mass architecture.
  const ground = groundHeightAt(end.x, end.z);
  const fallH = Math.max(.08, end.y - ground);
  const fallTime = THREE.MathUtils.clamp(
    Math.sqrt(2 * fallH / 7.25),
    .05, .55
  );

  const impactX = end.x + pourVisualVelSafe.x * fallTime * .72;
  const impactZ = end.z + pourVisualVelSafe.z * fallTime * .72;
  const volume = currentPourRateM3() * dt;

  addConcreteVolumeAt(
    impactX,
    impactZ,
    volume,
    pourVisualVelSafe.x,
    pourVisualVelSafe.z,
    pourVisualVelSafe.length()
  );

  // Denser stream at higher pump levels.
  const blobInterval = .065 / Math.pow(rateMult, .30);
  blobSpawnAccumulator += dt;
  while (blobSpawnAccumulator >= blobInterval) {
    blobSpawnAccumulator -= blobInterval;
    spawnBlob(end, false, pourVisualVelSafe);
  }
}
// -----------------------------
// Job evaluation / reset
// -----------------------------
function evaluateJob() {
  if (jobState !== 'active') return;

  // Any individual bay can be overfilled even if the overall site average looks fine.
  for (const zone of POUR_ZONES) {
    const ratio = zoneVolume(zone) / zone.targetVolume;
    if (ratio > zone.failRatio) {
      finishJob(false, zone);
      return;
    }
  }

  // Arcade phase transition: once enough volume is in the current bay,
  // stop the pump and clearly ask for leveling instead of auto-completing.
  const currentZone = activePourZone();
  if (currentZone) {
    const currentRatio = zoneVolume(currentZone) / currentZone.targetVolume;
    const currentLevel = zoneLevelStats(currentZone);

    if (
      currentRatio >= .995 &&
      currentLevel.score < currentZone.levelRequired
    ) {
      if (pouring) pouring = false;

      if (!currentZone.levelPrompted) {
        currentZone.levelPrompted = true;
        showToast(
          `ОБЪЁМ НАБРАН · БЕРИ ГРАБЛИ · РОВНОСТЬ ${Math.round(currentLevel.score * 100)}%`
        );
      }
    }
  }

  // Advance the authored sequence only after the current highlighted map is
  // both deep enough and sufficiently covered. Future maps cannot be prefilled.
  const beforeAdvance = activePourZoneIndex;
  while (activePourZoneIndex < POUR_ZONES.length && zoneReadyForSequence(POUR_ZONES[activePourZoneIndex])) {
    activePourZoneIndex++;
  }
  if (activePourZoneIndex !== beforeAdvance) {
    outlinedPourZoneId = -1;
    if (activePourZoneIndex < POUR_ZONES.length) {
      showToast(`КАРТА №${beforeAdvance + 1} ВЫРОВНЕНА · ТЕПЕРЬ №${activePourZoneIndex + 1}`);
    } else {
      showToast('ВСЕ 6 КАРТ ВЫРОВНЕНЫ · УБЕРИ ПРОЛИВЫ И СДАВАЙ');
    }
  }

  const allReady =
    activePourZoneIndex >= POUR_ZONES.length &&
    POUR_ZONES.every(zone => zoneReadyForSequence(zone));

  // Surface concrete is recoverable, not "waste".
  // The foreman won't accept the slab while visible plops are still lying around.
  const spillLeft = surfaceSpillVolume();
  if (allReady && spillLeft <= .015) {
    jobState = 'ready';
    pouring = false;
    hoseHeld = false;
    if (hoseInteraction) hoseInteraction.text = 'E — взять шланг';
    if (qteActive) {
      qteActive = false;
      qteLayerEl.classList.remove('active');
    }
    showToast('ЗАЛИВКА ГОТОВА. ИДИ СДАВАЙ ПАВЛУ ПЕТРОВИЧУ.');
  }
}

function finishJob(success, failedZone = null) {
  if (jobState !== 'active') return;

  pouring = false;
  if (qteActive) {
    qteActive = false;
    qteLayerEl.classList.remove('active');
  }

  if (success) {
    jobState = 'ready';
    showToast('ЗАЛИВКА ГОТОВА. СДАЙ ОБЪЕКТ ПАВЛУ ПЕТРОВИЧУ.');
    return;
  }

  jobState = 'failed';
  openJobResult(
    'ПЕРЕЛИВ',
    `Сектор ${failedZone ? failedZone.id : '?'} перелит выше допуска. Переделываешь весь объект.`,
    'ПЕРЕДЕЛАТЬ'
  );
}

function resetPourJob() {
  for (const zone of POUR_ZONES) {
    zone.fill.fill(0);
    zone.mobility.fill(0);
    zone.velX.fill(0);
    zone.velZ.fill(0);
    zone.flowDelta.fill(0);
    zone.flowBudget.fill(0);
    zone.rakeTouched.fill(0);
    zone.levelPrompted = false;
    zone.piles.length = 0;
    zone.dirty = true;
  }
  refreshConcreteSurfaces();
  clearSurfaceSpills();

  for (const b of blobs) {
    b.active = false;
    b.mesh.visible = false;
  }

  jobState = 'active';
  paidPourZoneCount = 0;
  activePourZoneIndex = 0;
  outlinedPourZoneId = -1;
  activePourOutline.visible = false;
  qteHits = 0;
  qteMisses = 0;
  qtePerfects = 0;
  qtePerfectBoostUntil = 0;
  wastedVolume = 0;
  pouring = false;
  blobSpawnAccumulator = 0;
  pourTipPrevSafeValid = false;
  concreteRelaxTimer = 0;
  resetQTECooldown();
  updatePourHUD();
}

function bestHUDZone() {
  const target = activePourZone();
  if (target && jobState === 'active') return target;

  if (hosePoints.length) {
    const hp = hosePoints[HOSE_SEGMENTS];
    const hz = zoneAt(hp.x, hp.z);
    if (hz) return hz;
  }

  const pz = zoneAt(playerPos.x, playerPos.z);
  if (pz) return pz;

  // Otherwise show the least-complete bay, which is usually the next useful target.
  let best = POUR_ZONES[0];
  let bestRatio = Infinity;
  for (const zone of POUR_ZONES) {
    const ratio = zoneVolume(zone) / zone.targetVolume;
    if (ratio < bestRatio) {
      bestRatio = ratio;
      best = zone;
    }
  }
  return best;
}

function updatePourHUD() {
  const volume = totalConcreteVolume();
  const zone = bestHUDZone();
  const zoneVol = zoneVolume(zone);
  const zoneRatio = THREE.MathUtils.clamp(zoneVol / Math.max(.000001, zone.targetVolume), 0, 9.99);
  const zonePct = Math.max(0, zoneRatio * 100);
  const zoneRemaining = Math.max(0, zone.targetVolume - zoneVol);
  const avgH = zoneAverageHeight(zone);

  const completed = POUR_ZONES.filter(z => zoneReadyForSequence(z)).length;

  fillBarEl.style.width = `${Math.min(100, zonePct)}%`;
  fillBarEl.classList.toggle(
    'danger',
    POUR_ZONES.some(z => zoneVolume(z) / z.targetVolume > 1.0)
  );

  fillPercentEl.textContent = `${zonePct.toFixed(1)}%`;
  fillRemainingEl.textContent = `${zoneRemaining.toFixed(2)} м³`;
  const levelStats = zoneLevelStats(zone);
  const levelPct = Math.round(levelStats.score * 100);
  fillLevelEl.textContent = `${levelPct}%`;
  fillLevelEl.style.color =
    levelPct >= Math.round(zone.levelRequired * 100)
      ? '#91e68b'
      : levelPct >= 65
        ? '#eee790'
        : '#e4b18d';
  const active = activePourZone();
  if (active && jobState === 'active') {
    const activeRatio = zoneVolume(active) / active.targetVolume;
    const activeLevel = zoneLevelStats(active);
    zoneProgressEl.textContent = activeRatio >= .985
      ? `РОВНЯЙ №${active.id}: ${Math.round(activeLevel.score * 100)}% · готово ${completed}/6`
      : `ЛИТЬ №${active.id}: ${zonePct.toFixed(0)}% · готово ${completed}/6`;
  } else {
    zoneProgressEl.textContent = `№${zone.id}: ${zonePct.toFixed(0)}% · готово ${completed}/6`;
  }

  const spillV = surfaceSpillVolume();
  spillVolumeEl.textContent =
    spillV > .015 ? `${spillV.toFixed(2)} м³ · УБРАТЬ` : '0.00 м³';

  const boostLeft = Math.max(0, (qtePerfectBoostUntil - performance.now()) / 1000);
  qteScoreEl.textContent = boostLeft > 0
    ? `${qteHits} OK · ${qtePerfects} PERFECT · BOOST ${boostLeft.toFixed(1)}с`
    : `${qteHits} OK · ${qtePerfects} PERFECT · ${qteMisses} MISS`;

  pourHudEl.classList.toggle(
    'visible',
    hoseHeld || volume > .01 || spillV > .005 || jobState !== 'active'
  );
}


// -----------------------------
// Final-layout colliders and interactions
// -----------------------------
function addFinalLayoutColliders(root) {
  root.updateWorldMatrix(true, true);
  let added = 0;
  let walkable = 0;
  let skippedHuge = 0;

  root.traverse(o => {
    if (!o.isMesh || !o.visible) return;
    if (o.isSkinnedMesh) return; // animated NPCs get stable root colliders below
    if (rakeCandidateRoots.some(r => objectIsInside(r, o))) return;
    if (rakeSceneSource && objectIsInside(rakeSceneSource, o)) return;

    const n = String(o.name || '');
    const low = n.toLowerCase();
    if (
      low === 'sphere' || low === 'sphere.001' ||
      low === 'pour_slab' ||
      low === 'spawn' ||
      low === 'shlanganchor' ||
      low === 'litenergy' || low === 'litenergy2' ||
      low === 'camec' || low === 'camec2' ||
      low === 'cig_butts_scatter' || low.startsWith('cig_butts_scatter_') ||
      low.startsWith('vm_') ||
      // MONETKA is an open walk-in shop. Its authored GLB is only a couple of
      // combined meshes, so an OBB around either mesh fills the doorway/interior
      // with an invisible solid box. Keep the rendered geometry, but do NOT feed
      // these combined shop meshes into automatic collision.
      low === 'monetka' || low.startsWith('monetka')
    ) return;

    // FOLIAGE: never collide with leaf cards/crowns.  Tree_Birch is exported as
    // foliage-heavy combined meshes, so its geometry would otherwise create huge
    // invisible blockers around the canopy. Trunk interaction is intentionally
    // sacrificed here in favour of freely walking through foliage.
    const materialNames = (Array.isArray(o.material) ? o.material : [o.material])
      .filter(Boolean).map(m => String(m.name || '').toLowerCase());
    const isFoliage =
      low.includes('cannabis plant_leaf') || low.includes('leaf_') ||
      low.includes('foliage') || low.includes('tree_birch') ||
      materialNames.some(m => m === 'leaf' || m.includes('foliage') || m.includes('tree_birch'));
    if (isFoliage) return;

    // Also reject any mesh living anywhere under the MONETKA hierarchy, even if
    // Blender changes the child mesh name on the next export.
    let shopAncestor = o.parent;
    while (shopAncestor) {
      if (String(shopAncestor.name || '').toLowerCase() === 'monetka') return;
      shopAncestor = shopAncestor.parent;
    }

    const bb = new THREE.Box3().setFromObject(o);
    if (!Number.isFinite(bb.min.x) || !Number.isFinite(bb.max.x)) return;
    const size = bb.getSize(new THREE.Vector3());
    const footprintMax = Math.max(size.x, size.z);
    const footprintMin = Math.min(size.x, size.z);

    // ROAD / PAVEMENT / GROUND FIX:
    // A low, broad mesh whose top is around walking height is a floor patch.
    // Previously meshes such as Plane.001/Plane.002 had ~10 cm thickness and their
    // world AABB was registered as a blocking wall.
    // Low authored slabs/roads/curbs are walkable even when their mesh has
    // 30-70 cm of thickness. Treating those AABBs as obstacles created the
    // invisible "wall across the road" effect.
    const nearGround = bb.min.y >= -1.0 && bb.min.y <= .65 && bb.max.y <= 1.05;
    const flatEnough = size.y <= .78;
    const broadEnough = footprintMax >= .85 && footprintMin >= .35;
    if (nearGround && flatEnough && broadEnough) {
      addWalkSurface(n || 'walk surface', bb.min.x, bb.max.x, bb.min.z, bb.max.z, bb.max.y);
      walkable++;
      return;
    }

    // The main authored site ground is also explicitly walkable.
    if (low === 'site_ground') {
      addWalkSurface(n, bb.min.x, bb.max.x, bb.min.z, bb.max.z, bb.max.y);
      walkable++;
      return;
    }

    // The authored bus-stop asset is a single combined mesh with open space inside.
    // An OBB around the whole thing becomes a solid invisible room. It is decorative,
    // so do not give that combined mesh collision.
    if (low.includes('busstop') || low.includes('bus_stop') || low.includes('buss')) {
      console.log('[COLLISION] decorative bus stop skipped:', n);
      return;
    }

    // Any combined mesh whose box encloses the authored spawn is also unsafe:
    // by definition the player must be able to stand and leave this marker.
    if (authoredSpawnReady) {
      const spawnInsideXZ =
        authoredSpawnXZ.x >= bb.min.x - .45 && authoredSpawnXZ.x <= bb.max.x + .45 &&
        authoredSpawnXZ.y >= bb.min.z - .45 && authoredSpawnXZ.y <= bb.max.z + .45;
      const overlapsBodyY = bb.max.y > .20 && bb.min.y < 1.80;
      if (spawnInsideXZ && overlapsBodyY) {
        console.warn('[COLLISION] spawn-overlap mesh skipped:', n, bb.min, bb.max);
        return;
      }
    }

    // SCENE3 HOTFIX: these exported joined strips have geometry scattered along a
    // ~64 m box. A single OBB turns the empty gaps/openings into a continuous
    // invisible wall. They are visual boundary/fence aggregates, not valid boxes.
    if (low === 'object_5.001' || low === 'object_5.002' || low === 'object_69.001') {
      skippedHuge++;
      console.warn('[COLLISION] known joined strip skipped:', n, size);
      return;
    }

    // Generic protection against the same authoring pattern: a very long, thin,
    // ground-level joined mesh must never become one solid collision bar.
    const longThinJoinedStrip = footprintMax > 14.0 && footprintMin < 2.6 && bb.min.y < 1.4 && bb.max.y > .35;
    if (longThinJoinedStrip) {
      skippedHuge++;
      console.warn('[COLLISION] long/thin joined strip skipped:', n, size);
      return;
    }

    // NEVER use one OBB for a broad joined asset. This was the source of the
    // huge invisible wall between the two site zones: meshes such as Object_5
    // span ~65 x 46 m but contain geometry only around parts of that footprint.
    // Their OBB fills all the empty space in the middle. Individual columns,
    // fence panels, curbs, vehicle parts, etc. are still collidable below.
    const broadJoinedAsset = footprintMin > 4.8 && footprintMax > 7.5;
    const enormousFootprint = footprintMin > 3.5 && (size.x * size.z) > 115;
    if (broadJoinedAsset || enormousFootprint) {
      skippedHuge++;
      console.warn('[COLLISION] broad/combined mesh skipped:', n, size);
      return;
    }

    // Never turn an enormous environment card/group into one invisible rectangular wall.
    if (size.x > 26 && size.z > 26) {
      skippedHuge++;
      return;
    }

    // Degenerate helpers/lines have no useful player collision.
    if (size.x < .035 && size.z < .035) return;

    // Everything else uses an oriented box from the mesh's OWN local bounds.
    // This fixes the old invisible walls caused by world-axis AABBs around
    // rotated road props, rails, truck parts and diagonal geometry.
    addMeshOBBCollider(o, n || 'scene mesh');
    added++;
  });

  // Prefer higher overlapping walk surfaces (e.g. pavement over SITE_GROUND).
  walkSurfaces.sort((a, b) => b.topY - a.topY);
  console.log(`Scene collision: ${added} compact OBB obstacles · ${walkable} walk surfaces · ${skippedHuge} broad/combined meshes skipped`);
}
function addEmbeddedNPCCollider(root, label) {
  if (!root) return;
  // Hips is the most stable point for a skinned Mixamo character.
  const hips = findBone(root, 'Hips');
  const p = hips ? hips.getWorldPosition(new THREE.Vector3()) : root.getWorldPosition(new THREE.Vector3());
  const r = .50;
  addColliderXZ(label, p.x-r, p.x+r, p.z-r, p.z+r, -Infinity, Infinity);
}


// ---------------------------------------------------------------------------
// Authored spawn + authored world pickups + Baba Kapa shop interaction
// ---------------------------------------------------------------------------
const worldPickupInteractions = [];

function setupPlayerSpawn(root) {
  const spawn = root.getObjectByName('spawn') || root.getObjectByName('Spawn');
  if (!spawn) {
    console.warn('spawn plane not found — keeping fallback player position');
    return;
  }
  spawn.updateWorldMatrix(true, true);

  // The plane pivot is authored at the intended feet position.
  // Blender +Y is glTF/Three -Z, and yaw=0 in this FPS looks down Three -Z.
  const p = spawn.getWorldPosition(new THREE.Vector3());
  playerPos.set(p.x, 0, p.z);
  authoredSpawnXZ.set(p.x, p.z);
  authoredSpawnReady = true;
  yaw = 0;
  pitch = 0;
  spawn.visible = false;
  syncCameraToPlayer();
  console.log('PLAYER SPAWN FROM BLENDER:', p, 'yaw=0 => Blender +Y');
}

function removeInteraction(it) {
  const i = interactive.indexOf(it);
  if (i >= 0) interactive.splice(i, 1);
  const wi = worldPickupInteractions.indexOf(it);
  if (wi >= 0) worldPickupInteractions.splice(wi, 1);
  if (it.obj?.parent) it.obj.parent.remove(it.obj);
}

function setupWorldPickup(root, spec) {
  const source = root.getObjectByName(spec.node);
  if (!source) {
    console.warn('World pickup node not found:', spec.node);
    return;
  }

  // LitEnergy2 was already marked as collected in some test-build saves while its
  // authored position changed. Give that one pickup a fresh persistence slot once.
  const storageKey = spec.node === 'LitEnergy2'
    ? 'beton_worldpickup_scene4_v41_LitEnergy2'
    : `beton_worldpickup_${spec.node}`;
  if (localStorage.getItem(storageKey) === '1') {
    source.visible = false;
    return;
  }

  source.visible = true;
  source.traverse?.(o => {
    o.visible = true;
    if (o.isMesh) o.frustumCulled = false;
  });
  source.updateWorldMatrix(true, true);

  const bb = new THREE.Box3().setFromObject(source);
  const center = bb.getCenter(new THREE.Vector3());
  const proxy = new THREE.Object3D();
  proxy.name = `WORLD_PICKUP_${spec.node}`;
  proxy.position.copy(center);
  scene.add(proxy);

  const it = {
    obj: proxy,
    source,
    bounds: bb.clone(),
    kind: 'worldPickup',
    radius: 2.0,
    text: spec.prompt,
    pickupType: spec.type,
    pickupAmount: spec.amount,
    requiresLook: true,
    storageKey,
    toast: spec.toast,
  };
  worldPickupInteractions.push(it);
  interactive.push(it);
  console.log('World pickup ready:', spec.node, center);
}

function setupWorldPickups(root) {
  setupWorldPickup(root, {
    node: 'camec',
    type: 'samec',
    amount: 20,
    prompt: 'E — подобрать сигареты «Самец»',
    toast: 'САМЕЦ · +20 СИГАРЕТ',
  });
  setupWorldPickup(root, {
    node: 'camec2',
    type: 'samec',
    amount: 20,
    prompt: 'E — подобрать сигареты «Самец»',
    toast: 'САМЕЦ · +20 СИГАРЕТ',
  });
  setupWorldPickup(root, {
    node: 'LitEnergy',
    type: 'rewind',
    amount: 1,
    prompt: 'E — подобрать «Перемотку»',
    toast: 'ПЕРЕМОТКА · +1',
  });
  setupWorldPickup(root, {
    node: 'LitEnergy2',
    type: 'rewind',
    amount: 1,
    prompt: 'E — подобрать «Перемотку»',
    toast: 'ПЕРЕМОТКА · +1',
  });
}

function pickupWorldItem(it) {
  if (!it || it.kind !== 'worldPickup') return;
  if (it.pickupType === 'samec') cigarettes += it.pickupAmount;
  if (it.pickupType === 'rewind') energyCans += it.pickupAmount;

  localStorage.setItem(it.storageKey, '1');
  if (it.source) it.source.visible = false;
  removeInteraction(it);
  saveEconomy();
  updateEconomyUI();
  showToast(it.toast || 'ПОДОБРАНО');
}

function addBabaInteraction(baba) {
  if (!baba) return;
  baba.updateWorldMatrix(true, true);
  const bb = new THREE.Box3().setFromObject(baba);
  const center = bb.getCenter(new THREE.Vector3());
  center.y = Math.max(bb.min.y + .95, Math.min(bb.max.y, center.y));

  const proxy = new THREE.Object3D();
  proxy.name = 'NPC_INTERACTION_baba';
  proxy.position.copy(center);
  scene.add(proxy);
  interactive.push({
    obj: proxy,
    kind: 'npc',
    npcKey: 'baba',
    radius: 2.65,
    text: 'E — поговорить · Баба Капа',
  });
}

function addShopInteraction(root) {
  const shop = root.getObjectByName('MONETKA');
  if (!shop) {
    console.warn('MONETKA not found');
    return;
  }
  const bb = new THREE.Box3().setFromObject(shop);
  const center = bb.getCenter(new THREE.Vector3());
  center.y = Math.max(1.0, bb.min.y + 1.0);

  shopProxy = new THREE.Object3D();
  shopProxy.name = 'MONETKA_SHOP_INTERACTION';
  shopProxy.position.copy(center);
  scene.add(shopProxy);

  shopInteraction = {
    obj: shopProxy,
    kind: 'shop',
    radius: 3.3,
    text: 'E — магазин «Монетка»'
  };
  interactive.push(shopInteraction);
}

loader.load('./assets/BETONSHCHIK_SCENE.gltf', gltf => {
  layoutRoot = gltf.scene;
  layoutRoot.name = 'BETONSHCHIK_FINAL_LAYOUT';
  prepModel(layoutRoot);
  scene.add(layoutRoot);
  layoutRoot.updateWorldMatrix(true, true);

  // Spawn point is authored in Blender. The marker itself is hidden in runtime.
  setupPlayerSpawn(layoutRoot);

  // The panorama dome is intentionally PBR in the Blender export. Give it a
  // low emissive contribution so the zenith does not turn almost black under
  // the roof while still keeping the original sky texture and contrast.
  const skyDome = layoutRoot.getObjectByName('Sphere');
  if (skyDome) {
    skyDome.traverse(o => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const mat of mats) {
        if (!mat || !mat.isMeshStandardMaterial) continue;
        if (mat.map) mat.emissiveMap = mat.map;
        mat.emissive = new THREE.Color(0x8ea9bd);
        mat.emissiveIntensity = 0.80;
        mat.roughness = 1.0;
        mat.needsUpdate = true;
      }
    });
  }

  // Replace flat Blender slab with the actual runtime recess.
  const originalSlab = layoutRoot.getObjectByName('POUR_SLAB');
  if (originalSlab) originalSlab.visible = false;

  // HOSE ANCHOR
  // Blender Empty nodes have repeatedly disappeared or exported as identity in our GLB.
  // Preferred authoring method: a tiny mesh named `ShlangAnchor` at the exact hose outlet.
  // The game hides that marker immediately after reading its world position.
  let anchorPos = null;
  hoseAnchorObject = null;

  const anchorMarker =
    layoutRoot.getObjectByName('ShlangAnchor') ||
    layoutRoot.getObjectByName('SHLANG_ANCHOR') ||
    layoutRoot.getObjectByName('Shlang_Anchor');

  if (anchorMarker) {
    anchorMarker.updateWorldMatrix(true, true);
    // Use the exact authored marker pivot — it was generated directly from the Blender Empty.
    anchorPos = anchorMarker.getWorldPosition(new THREE.Vector3());
    anchorMarker.visible = false;
    console.log('Runtime hose anchor from ShlangAnchor:', anchorMarker.name, anchorPos);
  }

  // Keep legacy Empty support if it ever exports with a real transform.
  if (!anchorPos) {
    hoseAnchorObject = layoutRoot.getObjectByName('Shlang');
    if (hoseAnchorObject) {
      const p = hoseAnchorObject.getWorldPosition(new THREE.Vector3());
      if (p.lengthSq() > .25) anchorPos = p;
      else hoseAnchorObject = null;
    }
  }

  if (!anchorPos) {
    // Current SCENE3 fallback: Geom3D.022 is the authored hanging boom-end piece.
    // Attach to the CENTER OF ITS LOWEST FACE, then extend the runtime rubber hose down.
    const hangingHose = layoutRoot.getObjectByName('Geom3D.022');
    if (hangingHose) {
      hangingHose.visible = true;
      hangingHose.traverse?.(o => { if (o.isMesh) o.frustumCulled = false; });
      const hb = new THREE.Box3().setFromObject(hangingHose);
      anchorPos = new THREE.Vector3(
        (hb.min.x + hb.max.x) * .5,
        hb.min.y + .01,
        (hb.min.z + hb.max.z) * .5,
      );
      console.warn('No ShlangAnchor mesh in GLB; using Geom3D.022 bottom:', anchorPos);
    }
  }

  if (anchorPos) {
    hoseAnchorFallback.copy(anchorPos);
    hoseAnchorFallbackValid = true;
    initializeHose(anchorPos);
    // Force visibility after scene material/setup passes.
    hoseGroup.visible = true;
    hoseGroup.traverse(o => {
      o.visible = true;
      if (o.isMesh) {
        o.frustumCulled = false;
        o.renderOrder = 20;
      }
    });
    console.log('PHYSICAL HOSE INITIALIZED', anchorPos, 'segments', hoseMeshes.length);
  } else {
    console.error('NO VALID HOSE ANCHOR FOUND — add a tiny mesh named ShlangAnchor in Blender');
  }

  // Rake is authored/positioned in Blender now. Use that exact scene model.
  setupSceneRake(layoutRoot);

  // Make Baba Kapa robust against skinned-mesh frustum culling and accidental visibility flags.
  const baba = layoutRoot.getObjectByName('BabaKapa');
  if (baba) {
    baba.visible = true;
    baba.updateWorldMatrix(true, true);

    // In SCENE3(1) Baba's skinned geometry exported below ground
    // (bbox bottom about -2.27 m). Keep the authored X/Z, but put her feet on y=0.
    let babaBox = new THREE.Box3().setFromObject(baba);
    if (Number.isFinite(babaBox.min.y) && babaBox.min.y < -0.12) {
      const lift = 0.025 - babaBox.min.y;
      baba.position.y += lift;
      baba.updateWorldMatrix(true, true);
      babaBox = new THREE.Box3().setFromObject(baba);
      console.warn('[BABA KAPA] lifted to ground by', lift.toFixed(3), 'm', babaBox);
    }

    baba.traverse(o => {
      o.visible = true;
      if (o.isMesh || o.isSkinnedMesh) {
        o.frustumCulled = false;
        o.castShadow = true;
        o.receiveShadow = true;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const mat of mats) {
          if (!mat) continue;
          // Baba's source materials are opaque. Never inherit accidental scene alpha.
          mat.transparent = false;
          mat.opacity = 1;
          mat.alphaTest = 0;
          mat.depthWrite = true;
          mat.needsUpdate = true;
        }
      }
    });
    addEmbeddedNPCCollider(baba, 'BabaKapa');
    addBabaInteraction(baba);
  } else {
    console.warn('BabaKapa node not found in scene');
  }

  // Pickups are authored scene meshes. Register them before collision generation so
  // they never leave invisible blockers after being collected.
  setupWorldPickups(layoutRoot);

  addFinalLayoutColliders(layoutRoot);
  // MONETKA is no longer an invisible E-zone: shopping starts only via Baba Kapa dialogue.
  startSceneNPCs();

  assetsLoaded++;
  updateLoadState();
}, undefined, err => {
  console.error('Final layout failed', err);
  assetsFailed++;
  updateLoadState();
});

// FIRST-PERSON PLAYER / CONTROLS
// FPS character body stays loaded; F3 only adds a debug observer camera.
// Movement is deterministic: no acceleration, no velocity carry-over, no camera orbit smoothing.
const keys = Object.create(null);
let yaw = 0;
let pitch = 0;
// Standard FPS-style vertical look limit: yaw remains unrestricted, while pitch
// stops before the camera can flip upside down.
const FPS_PITCH_LIMIT = THREE.MathUtils.degToRad(85);
let stamina = staminaMax, energyBoost = 0, toastTimer = 0, mapVisible = false;

function savedInt(key, fallback) {
  const raw = localStorage.getItem(key);
  const n = raw === null ? fallback : Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}
// v0.32 inventory seed: do this once so old test-build localStorage does not keep
// the previous 20 cigarettes / 3 energy cans. Money/progression are preserved.
if (localStorage.getItem('beton_inventory_seed_v32') !== '1') {
  localStorage.setItem('beton_cigarettes', '3');
  localStorage.setItem('beton_energy', '0');
  localStorage.setItem('beton_inventory_seed_v32', '1');
}
let money = savedInt('beton_money', 0);
let cigarettes = savedInt('beton_cigarettes', 3);
let energyCans = savedInt('beton_energy', 0);
let beerCans = savedInt('beton_beer', 4);

function saveEconomy() {
  localStorage.setItem('beton_money', String(money));
  localStorage.setItem('beton_cigarettes', String(cigarettes));
  localStorage.setItem('beton_energy', String(energyCans));
  localStorage.setItem('beton_beer', String(beerCans));
}
function addMoney(amount) {
  money += Math.max(0, Math.round(amount));
  saveEconomy();
}

let specialMode = null;
let specialTimer = 0;
const PLAYER_R = .21;
let calibratedEyeHeight = 1.66; // automatic eye line from the character head
let cameraHeightOffset = Number.parseFloat(localStorage.getItem('betonshchik_camera_height_offset') || '0');
if (!Number.isFinite(cameraHeightOffset)) cameraHeightOffset = 0;
let cameraForwardOffset = Number.parseFloat(localStorage.getItem('betonshchik_camera_forward_offset') || '0');
if (!Number.isFinite(cameraForwardOffset)) cameraForwardOffset = 0;
// FPS body framing: unlike cameraForwardOffset (world/collision space), this shifts
// the camera relative to the camera-attached player body and is what F5 adjusts now.
let playerCameraDepthOffset = Number.parseFloat(localStorage.getItem('betonshchik_player_camera_depth_offset') || '0');
if (!Number.isFinite(playerCameraDepthOffset)) playerCameraDepthOffset = 0;
// v0.48: local camera is forced in front of the severed neck opening.
if (localStorage.getItem('beton_camera_safe_v48') !== '1') {
  playerCameraDepthOffset = 0.27;
  localStorage.setItem('betonshchik_player_camera_depth_offset', String(playerCameraDepthOffset));
  localStorage.setItem('beton_camera_safe_v48', '1');
}
playerCameraDepthOffset = THREE.MathUtils.clamp(playerCameraDepthOffset, .18, .48);
const PLAYER_BODY_BASE_Z = 0;
function syncPlayerViewModelDepth() {
  // F5 now moves the CAMERA relative to the world-space body, never the body itself.
  syncCameraToPlayer();
}
function syncPlayerBodyToWorld() {
  if (!armsReady) return;
  const gy = groundHeightAt(playerPos.x, playerPos.z);
  armsRig.position.set(playerPos.x, gy, playerPos.z);
  armsRig.rotation.set(0, yaw + Math.PI, 0);
}
let eyeHeight = calibratedEyeHeight + cameraHeightOffset;
const SITE = { minX: -31.7, maxX: 31.7, minZ: -49.9, maxZ: 22.9 };
const playerPos = new THREE.Vector3(0, 0, 18.0); // fallback until Blender `spawn` is loaded

function updateSunShadowFollow() {
  // Keep the same sun direction while moving the shadow camera with the player.
  // This lets us use a small frustum instead of wasting 2048px over ~160m.
  const gy = groundHeightAt(playerPos.x, playerPos.z);
  sun.target.position.set(playerPos.x, gy, playerPos.z);
  sun.position.set(
    playerPos.x + SUN_OFFSET.x,
    gy + SUN_OFFSET.y,
    playerPos.z + SUN_OFFSET.z
  );
  sun.target.updateMatrixWorld();
  sun.updateMatrixWorld();
}

const moveForward = new THREE.Vector3();
const moveRight = new THREE.Vector3();
const moveWorld = new THREE.Vector3();

// Camera is the player in FPS mode. Adding it to the scene lets us attach first-person props.
scene.add(camera);
camera.rotation.order = 'YXZ';

function groundHeightAt(x, z) {
  // Start with authored low horizontal scene surfaces. This lets roads and pavements
  // behave as floors instead of invisible walls. Highest overlapping patch wins.
  let y = 0.0;
  for (const surf of walkSurfaces) {
    if (x >= surf.minX && x <= surf.maxX && z >= surf.minZ && z <= surf.maxZ) {
      if (surf.topY > y && surf.topY <= .60) y = surf.topY;
    }
  }

  if (insideSlab(x, z)) {
    const zone = zoneAt(x, z);
    if (zone) {
      // Feet follow the real wet surface inside the specific structural bay.
      return zone.bottomY + getFillHeightAt(x, z);
    }

    // Persistent accidental spill has real surface height too.
    return SLAB.floorY + spillHeightAt(x, z);
  }
  return y;
}

let walkBobPhase = 0;
let walkBobX = 0;
let walkBobY = 0;
let walkBobRoll = 0;
let walkBobPitch = 0;

function syncCameraToPlayer() {
  const groundY = groundHeightAt(playerPos.x, playerPos.z);
  // Forward offset moves the camera relative to the body without moving collisions.
  const fx = -Math.sin(yaw);
  const fz = -Math.cos(yaw);
  const bodyCameraOffset = cameraForwardOffset + playerCameraDepthOffset;
  camera.position.set(
    playerPos.x + walkBobX + fx * bodyCameraOffset,
    groundY + eyeHeight + walkBobY,
    playerPos.z + fz * bodyCameraOffset
  );
  camera.rotation.set(pitch + walkBobPitch, yaw, walkBobRoll);
}
syncCameraToPlayer();

// DEBUG PLAYER MARKER -------------------------------------------------------
// Visible only in F3 mode: body capsule substitute + head/eye marker + facing arrow.
const debugPlayer = new THREE.Group();
debugPlayer.visible = false;
scene.add(debugPlayer);
const dbgBodyMat = new THREE.MeshBasicMaterial({ color: 0x2e8cff, transparent: true, opacity: .28, depthTest: true });
const dbgHeadMat = new THREE.MeshBasicMaterial({ color: 0xffd84d, transparent: true, opacity: .78, depthTest: true });
const dbgBody = new THREE.Mesh(new THREE.CylinderGeometry(PLAYER_R, PLAYER_R, 1.22, 12), dbgBodyMat);
dbgBody.position.y = .73;
debugPlayer.add(dbgBody);
const dbgHead = new THREE.Mesh(new THREE.SphereGeometry(.18, 12, 8), dbgHeadMat);
debugPlayer.add(dbgHead);
const dbgEyeBar = new THREE.Mesh(new THREE.BoxGeometry(.9, .025, .025), dbgHeadMat);
debugPlayer.add(dbgEyeBar);
const dbgForward = new THREE.Mesh(new THREE.BoxGeometry(.06, .06, .85), dbgHeadMat);
dbgForward.position.z = -.44;
debugPlayer.add(dbgForward);

function syncDebugCamera() {
  const groundY = groundHeightAt(playerPos.x, playerPos.z);
  debugPlayer.position.set(playerPos.x, groundY, playerPos.z);
  debugPlayer.rotation.y = yaw;
  dbgHead.position.y = eyeHeight;
  dbgEyeBar.position.y = eyeHeight;
  dbgForward.position.y = eyeHeight;

  debugTarget.set(playerPos.x, groundY + Math.min(eyeHeight * .72, 1.25), playerPos.z);
  const cp = Math.cos(debugPitch);
  debugCamera.position.set(
    debugTarget.x + Math.sin(debugYaw) * cp * debugDistance,
    debugTarget.y + Math.sin(debugPitch) * debugDistance + .35,
    debugTarget.z + Math.cos(debugYaw) * cp * debugDistance
  );
  debugCamera.lookAt(debugTarget);
}

function setDebugMode(on) {
  debugMode = !!on;
  debugPlayer.visible = debugMode;
  if (debugMode) {
    debugYaw = yaw;
    debugPitch = .28;
    syncDebugCamera();
    showToast('DEBUG 3RD PERSON · F3 вернуться · колесо — дистанция');
  } else {
    // Keep the direction you were orbiting toward when returning to FPS.
    yaw = debugYaw;
    syncCameraToPlayer();
    showToast('FPS CAMERA');
  }
}

// FIRST-PERSON ARMS / PROPS --------------------------------------------------
// Full Mixamo skeleton stays alive for animation, but only shoulder/arm/hand vertices are rendered.
// This avoids the classic "camera inside the head/body" FPS problem while preserving Smoking/Drinking.
let armsCharacter = null;
let armsMixer = null;
let armsAction = null;
let armsIdleAction = null;
let armsWalkAction = null;
let armsRunAction = null;
let playerLocomotionState = 'idle';
let playerMovingNow = false;
let playerSprintingNow = false;

// ================================================================
// v51.7 GAME AUDIO
// ================================================================
let gameAudioCtx = null;
let gameAudioMaster = null;
let gameAudioReady = false;
let gameAudioInitPromise = null;

// v51.14 — central audio mix. Tuned from the actual supplied source levels.
// Dialogue sits above music; local SFX sit below dialogue; machinery is ambience.
const AUDIO_MIX = Object.freeze({
  master: .88,

  footstepWalkMin: .34,
  footstepWalkMax: .44,
  footstepRunMin: .44,
  footstepRunMax: .54,

  pour: .38,
  rakeMin: .20,
  rakeMax: .34,

  pumpNear: .55,
  mixerNear: .16,
  ambienceDuckWhileVoice: .58,

  seryogaGreeting: 1.05,
  seryogaFarewell: 1.55,
  pavelGreeting: .82,
  pavelFarewell: 1.50,

  // The success voice source is much quieter than the music source.
  // These values put the voice ~1.2 dB above the success music by RMS.
  pavelSuccessVoice: 1.18,
  pavelSuccessMusic: .34,

  georgeGreeting: .98,
  georgeUpgrade1: .92,
  georgeUpgrade2: .96,
  georgeUpgrade3: 1.10,
  georgeNoMoney: 1.28,

  cigarettePuff: .42,

  wetFootstep: .48,

  qteAppear: .34,
  qteHit: .72,
  hoseSlip: .56,

  babaGreeting: 1.12,
  babaFarewell: .84,
  babaPurchase: .84
});

const PAVEL_SUCCESS_DANCE_SECONDS = 6.0;

const stepBuffers = [];
let footstepDistanceAcc = 0;
let footstepSide = 1;
const footstepPrevPos = new THREE.Vector3();
let footstepPrevValid = false;

let pourBuffer = null;
let pourSource = null;
let pourGain = null;
let pourAudioActive = false;

let pumpBuffer = null;
let mixerBuffer = null;
let rakeDragBuffer = null;
let seryogaGreetingBuffer = null;
let seryogaGreetingSource = null;
let seryogaFarewellBuffer = null;
let seryogaFarewellSource = null;
let pavelGreetingBuffer = null;
let pavelGreetingSource = null;
let pavelFarewellBuffer = null;
let pavelFarewellSource = null;
let pavelFarewellAllowedThisDialogue = false;
let pavelSuccessDanceBuffer = null;
let pavelSuccessDanceSource = null;
let pavelSuccessMusicBuffer = null;
let pavelSuccessMusicSource = null;
let pavelSuccessMusicGain = null;
let georgeGreetingBuffer = null;
let georgeUpgrade1Buffer = null;
let georgeUpgrade2Buffer = null;
let georgeUpgrade3Buffer = null;
let georgeNoMoneyBuffer = null;
let georgeVoiceSource = null;
let cigarettePuffBuffer = null;
let cigarettePuffSource = null;
let cigarettePuffLastDrag = -1;
let wetFootstepBuffer = null;

let qteAppearBuffer = null;
let qteHitBuffer = null;
let hoseSlipBuffer = null;

let babaGreetingBuffer = null;
let babaFarewellBuffer = null;
let babaPurchaseBuffer = null;
let babaVoiceSource = null;

let shopOpenedFromBaba = false;

let pumpLoopSource = null;
let mixerLoopSource = null;
let pumpSpatialGain = null;
let mixerSpatialGain = null;

let rakeDragCooldown = 0;

// World positions for spatial machine audio.
// They are resolved from scene objects when available and otherwise fall back
// near the pump/hose area.
const pumpAudioWorld = new THREE.Vector3();
const mixerAudioWorld = new THREE.Vector3();
let pumpAudioWorldValid = false;
let mixerAudioWorldValid = false;

async function decodeGameAudio(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Audio HTTP ${res.status}: ${url}`);
  const data = await res.arrayBuffer();
  return await gameAudioCtx.decodeAudioData(data.slice(0));
}

async function initGameAudio() {
  if (gameAudioInitPromise) {
    if (gameAudioCtx?.state === 'suspended') {
      try { await gameAudioCtx.resume(); } catch (_) {}
    }
    return gameAudioInitPromise;
  }

  gameAudioInitPromise = (async () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      console.warn('[AUDIO] WebAudio unavailable');
      return;
    }

    gameAudioCtx = new AC();
    gameAudioMaster = gameAudioCtx.createGain();
    gameAudioMaster.gain.value = AUDIO_MIX.master;
    gameAudioMaster.connect(gameAudioCtx.destination);

    try {
      const [
        s1, s2, pour, pump, mixer, rakeDrag,
        seryogaGreeting, seryogaFarewell,
        pavelGreeting, pavelFarewell, pavelSuccessDance, pavelSuccessMusic,
        georgeGreeting, georgeUpgrade1, georgeUpgrade2, georgeUpgrade3, georgeNoMoney,
        cigarettePuff,
        wetFootstep,
        qteAppear, qteHit, hoseSlip,
        babaGreeting, babaFarewell, babaPurchase
      ] = await Promise.all([
        decodeGameAudio('./assets/audio/footsteps/concrete_001.ogg'),
        decodeGameAudio('./assets/audio/footsteps/concrete_002.ogg'),
        decodeGameAudio('./assets/audio/pour/concrete_pour_loop.wav'),
        decodeGameAudio('./assets/audio/machines/pump_loop.wav'),
        decodeGameAudio('./assets/audio/machines/mixer_loop.wav'),
        decodeGameAudio('./assets/audio/rake/rake_drag_01.mp3'),
        decodeGameAudio('./assets/audio/voices/seryoga/greeting_zdarova_truten.wav'),
        decodeGameAudio('./assets/audio/voices/seryoga/farewell.mp3'),
        decodeGameAudio('./assets/audio/voices/pavel/greeting.mp3'),
        decodeGameAudio('./assets/audio/voices/pavel/farewell_non_success.mp3'),
        decodeGameAudio('./assets/audio/voices/pavel/success_dance.mp3'),
        decodeGameAudio('./assets/audio/music/pavel_success.mp3'),
        decodeGameAudio('./assets/audio/voices/george/greeting.mp3'),
        decodeGameAudio('./assets/audio/voices/george/upgrade_01.mp3'),
        decodeGameAudio('./assets/audio/voices/george/upgrade_02.mp3'),
        decodeGameAudio('./assets/audio/voices/george/upgrade_03.mp3'),
        decodeGameAudio('./assets/audio/voices/george/no_money.mp3'),
        decodeGameAudio('./assets/audio/smoking/cigarette_puff.mp3'),
        decodeGameAudio('./assets/audio/footsteps/wet_concrete.mp3'),
        decodeGameAudio('./assets/audio/qte/qte_appear.mp3'),
        decodeGameAudio('./assets/audio/qte/qte_hit.mp3'),
        decodeGameAudio('./assets/audio/hose/hose_slip.mp3'),
        decodeGameAudio('./assets/audio/voices/baba/greeting.mp3'),
        decodeGameAudio('./assets/audio/voices/baba/farewell.mp3'),
        decodeGameAudio('./assets/audio/voices/baba/purchase.mp3')
      ]);

      stepBuffers.push(s1, s2);
      pourBuffer = pour;
      pumpBuffer = pump;
      mixerBuffer = mixer;
      rakeDragBuffer = rakeDrag;
      seryogaGreetingBuffer = seryogaGreeting;
      seryogaFarewellBuffer = seryogaFarewell;
      pavelGreetingBuffer = pavelGreeting;
      pavelFarewellBuffer = pavelFarewell;
      pavelSuccessDanceBuffer = pavelSuccessDance;
      pavelSuccessMusicBuffer = pavelSuccessMusic;
      georgeGreetingBuffer = georgeGreeting;
      georgeUpgrade1Buffer = georgeUpgrade1;
      georgeUpgrade2Buffer = georgeUpgrade2;
      georgeUpgrade3Buffer = georgeUpgrade3;
      georgeNoMoneyBuffer = georgeNoMoney;
      cigarettePuffBuffer = cigarettePuff;

      wetFootstepBuffer = wetFootstep;
      qteAppearBuffer = qteAppear;
      qteHitBuffer = qteHit;
      hoseSlipBuffer = hoseSlip;

      babaGreetingBuffer = babaGreeting;
      babaFarewellBuffer = babaFarewell;
      babaPurchaseBuffer = babaPurchase;
      gameAudioReady = true;

      if (gameAudioCtx.state === 'suspended') {
        try { await gameAudioCtx.resume(); } catch (_) {}
      }

      console.log('[AUDIO] footsteps + concrete pour ready');
    } catch (e) {
      console.warn('[AUDIO] init failed', e);
    }
  })();

  return gameAudioInitPromise;
}

function playConcreteFootstep(sprinting = false) {
  if (!gameAudioReady || !gameAudioCtx || !stepBuffers.length) return;
  if (gameAudioCtx.state !== 'running') return;

  const buffer = stepBuffers[Math.floor(Math.random() * stepBuffers.length)];
  const source = gameAudioCtx.createBufferSource();
  source.buffer = buffer;

  // Tiny randomization turns two samples into a much larger perceived set.
  source.playbackRate.value =
    (sprinting ? 1.055 : 1.0) *
    THREE.MathUtils.randFloat(.93, 1.07);

  const gain = gameAudioCtx.createGain();
  gain.gain.value = THREE.MathUtils.randFloat(
    sprinting ? AUDIO_MIX.footstepRunMin : AUDIO_MIX.footstepWalkMin,
    sprinting ? AUDIO_MIX.footstepRunMax : AUDIO_MIX.footstepWalkMax
  );

  let tail = gain;

  // Very subtle L/R alternation. Still feels centered in first person.
  if (gameAudioCtx.createStereoPanner) {
    const pan = gameAudioCtx.createStereoPanner();
    pan.pan.value = footstepSide * .075;
    footstepSide *= -1;
    source.connect(gain);
    gain.connect(pan);
    pan.connect(gameAudioMaster);
  } else {
    source.connect(gain);
    gain.connect(gameAudioMaster);
  }

  source.start();
}

function updateFootstepAudio(dt, moving, sprinting) {
  if (!started || !moving || !locked) {
    footstepDistanceAcc = 0;
    footstepPrevValid = false;
    return;
  }

  if (!gameAudioReady) return;

  if (!footstepPrevValid) {
    footstepPrevPos.copy(playerPos);
    footstepPrevValid = true;
    return;
  }

  const dx = playerPos.x - footstepPrevPos.x;
  const dz = playerPos.z - footstepPrevPos.z;
  const dist = Math.hypot(dx, dz);
  footstepPrevPos.copy(playerPos);

  const movementFactor = concreteMovementFactor(playerPos.x, playerPos.z);
  const onWetConcrete = movementFactor <= .985;

  footstepDistanceAcc += dist;

  if (onWetConcrete) {
    // One supplied wet-concrete step is varied in pitch/volume.
    // Distance-based timing automatically slows down because the player
    // physically travels less distance while bogged down in fresh concrete.
    const wetStride = sprinting ? 1.34 : 1.18;
    while (footstepDistanceAcc >= wetStride) {
      footstepDistanceAcc -= wetStride;
      playWetConcreteFootstep(sprinting);
    }
    return;
  }

  const dryStride = sprinting ? 1.62 : 1.44;
  while (footstepDistanceAcc >= dryStride) {
    footstepDistanceAcc -= dryStride;
    playConcreteFootstep(sprinting);
  }
}


function objectVisualCenter(obj, out) {
  if (!obj) return false;

  obj.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(obj);

  if (!box.isEmpty()) {
    const c = box.getCenter(out);
    if (
      Number.isFinite(c.x) &&
      Number.isFinite(c.y) &&
      Number.isFinite(c.z)
    ) return true;
  }

  obj.getWorldPosition(out);
  return (
    Number.isFinite(out.x) &&
    Number.isFinite(out.y) &&
    Number.isFinite(out.z)
  );
}

function resolveMachineAudioWorldPositions() {
  pumpAudioWorldValid = false;
  mixerAudioWorldValid = false;

  // IMPORTANT:
  // ShlangAnchor is at the end of the boom/hose, so using it made both
  // machine loops sound like they were coming from the hose tip.
  //
  // Use the actual truck geometry instead.
  const pumpTruck =
    scene.getObjectByName('Geom3D_Hoze Truck') ||
    scene.getObjectByName('Hoze Truck');

  const mixerTruck =
    scene.getObjectByName('Concrete Mixer Truck');

  if (pumpTruck) {
    pumpAudioWorldValid = objectVisualCenter(pumpTruck, pumpAudioWorld);
  }

  if (mixerTruck) {
    mixerAudioWorldValid = objectVisualCenter(mixerTruck, mixerAudioWorld);
  }

  // Last-resort fallbacks only.
  if (!pumpAudioWorldValid) {
    const fallback =
      scene.getObjectByName('camec') ||
      scene.getObjectByName('camec2') ||
      scene.getObjectByName('ShlangAnchor');

    if (fallback) {
      pumpAudioWorldValid = objectVisualCenter(fallback, pumpAudioWorld);
    }
  }

  if (!mixerAudioWorldValid && pumpAudioWorldValid) {
    mixerAudioWorld.copy(pumpAudioWorld).add(new THREE.Vector3(-4.0, 0, 1.0));
    mixerAudioWorldValid = true;
  }

  console.log(
    '[AUDIO] machine emitters',
    'pump=', pumpAudioWorld.toArray(),
    'mixer=', mixerAudioWorld.toArray()
  );
}

function startMachineLoop(buffer, gainValue = .25) {
  if (!gameAudioCtx || !gameAudioMaster || !buffer) return null;

  const source = gameAudioCtx.createBufferSource();
  const gain = gameAudioCtx.createGain();

  source.buffer = buffer;
  source.loop = true;
  gain.gain.value = gainValue;

  source.connect(gain);
  gain.connect(gameAudioMaster);
  source.start();

  return { source, gain };
}

function ensureMachineLoops() {
  if (!gameAudioReady || !gameAudioCtx || gameAudioCtx.state !== 'running') return;

  if (!pumpLoopSource && pumpBuffer) {
    const node = startMachineLoop(pumpBuffer, .0001);
    if (node) {
      pumpLoopSource = node.source;
      pumpSpatialGain = node.gain;
    }
  }

  if (!mixerLoopSource && mixerBuffer) {
    const node = startMachineLoop(mixerBuffer, .0001);
    if (node) {
      mixerLoopSource = node.source;
      mixerSpatialGain = node.gain;
    }
  }
}

function distanceGain3D(listenerPos, sourcePos, nearDist, farDist, maxGain) {
  const d = listenerPos.distanceTo(sourcePos);
  if (d <= nearDist) return maxGain;
  if (d >= farDist) return .0001;

  const t = THREE.MathUtils.clamp(
    (d - nearDist) / Math.max(.001, farDist - nearDist),
    0, 1
  );

  // smoother than linear, but dies off clearly with distance
  const k = (1 - t);
  return Math.max(.0001, maxGain * k * k);
}

function updateMachineAudio() {
  if (!started || !gameAudioReady || !gameAudioCtx) return;

  ensureMachineLoops();

  if (!pumpAudioWorldValid || !mixerAudioWorldValid) {
    resolveMachineAudioWorldPositions();
  }

  const now = gameAudioCtx.currentTime;

  if (pumpSpatialGain && pumpAudioWorldValid) {
    const voiceDuck = isVoiceOrSuccessMomentActive()
      ? AUDIO_MIX.ambienceDuckWhileVoice
      : 1;

    const g = distanceGain3D(
      camera.position,
      pumpAudioWorld,
      2.6,
      23.0,
      AUDIO_MIX.pumpNear
    ) * voiceDuck;
    pumpSpatialGain.gain.setTargetAtTime(g, now, .08);
  }

  if (mixerSpatialGain && mixerAudioWorldValid) {
    const voiceDuck = isVoiceOrSuccessMomentActive()
      ? AUDIO_MIX.ambienceDuckWhileVoice
      : 1;

    const g = distanceGain3D(
      camera.position,
      mixerAudioWorld,
      2.8,
      25.0,
      AUDIO_MIX.mixerNear
    ) * voiceDuck;
    mixerSpatialGain.gain.setTargetAtTime(g, now, .09);
  }
}






function stopPavelSuccessMusic(fadeSeconds = .12) {
  const src = pavelSuccessMusicSource;
  const gain = pavelSuccessMusicGain;

  pavelSuccessMusicSource = null;
  pavelSuccessMusicGain = null;

  if (!src || !gameAudioCtx) return;

  const now = gameAudioCtx.currentTime;
  try {
    if (gain) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(.0001, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(.0001, now + fadeSeconds);
    }
    src.stop(now + fadeSeconds + .02);
  } catch (_) {
    try { src.stop(); } catch (_) {}
  }
}

function playPavelSuccessMusic() {
  if (
    !gameAudioReady ||
    !gameAudioCtx ||
    !pavelSuccessMusicBuffer ||
    gameAudioCtx.state !== 'running'
  ) return;

  stopPavelSuccessMusic(.04);

  const source = gameAudioCtx.createBufferSource();
  const gain = gameAudioCtx.createGain();
  const now = gameAudioCtx.currentTime;

  source.buffer = pavelSuccessMusicBuffer;
  source.loop = false;
  source.playbackRate.value = 1.0;

  gain.gain.setValueAtTime(AUDIO_MIX.pavelSuccessMusic, now);

  // The supplied music is 6.88 s, but almost all meaningful energy ends by 6 s.
  // Fade its tail so the musical moment ends exactly with Pavel's dance.
  const fadeStart = now + Math.max(.1, PAVEL_SUCCESS_DANCE_SECONDS - .38);
  gain.gain.setValueAtTime(AUDIO_MIX.pavelSuccessMusic, fadeStart);
  gain.gain.exponentialRampToValueAtTime(
    .0001,
    now + PAVEL_SUCCESS_DANCE_SECONDS
  );

  source.connect(gain);
  gain.connect(gameAudioMaster);

  pavelSuccessMusicSource = source;
  pavelSuccessMusicGain = gain;

  source.onended = () => {
    if (pavelSuccessMusicSource === source) {
      pavelSuccessMusicSource = null;
      pavelSuccessMusicGain = null;
    }
  };

  source.start(now);
  source.stop(now + PAVEL_SUCCESS_DANCE_SECONDS + .03);
}

function isVoiceOrSuccessMomentActive() {
  return !!(
    seryogaGreetingSource ||
    seryogaFarewellSource ||
    pavelGreetingSource ||
    pavelFarewellSource ||
    pavelSuccessDanceSource ||
    pavelSuccessMusicSource ||
    georgeVoiceSource ||
    babaVoiceSource
  );
}


function playGeorgeVoice(buffer, gainValue) {
  if (!gameAudioReady || !gameAudioCtx || !buffer || gameAudioCtx.state !== 'running') return;

  if (georgeVoiceSource) {
    try { georgeVoiceSource.stop(); } catch (_) {}
    georgeVoiceSource = null;
  }

  const source = gameAudioCtx.createBufferSource();
  const gain = gameAudioCtx.createGain();
  source.buffer = buffer;
  source.loop = false;
  source.playbackRate.value = 1.0;
  gain.gain.value = gainValue;
  source.connect(gain);
  gain.connect(gameAudioMaster);

  georgeVoiceSource = source;
  source.onended = () => {
    if (georgeVoiceSource === source) georgeVoiceSource = null;
  };
  source.start();
}

function playGeorgeGreetingVoice() {
  playGeorgeVoice(georgeGreetingBuffer, AUDIO_MIX.georgeGreeting);
}

function playGeorgeUpgradeVoice(level) {
  if (level === 1) playGeorgeVoice(georgeUpgrade1Buffer, AUDIO_MIX.georgeUpgrade1);
  else if (level === 2) playGeorgeVoice(georgeUpgrade2Buffer, AUDIO_MIX.georgeUpgrade2);
  else if (level === 3) playGeorgeVoice(georgeUpgrade3Buffer, AUDIO_MIX.georgeUpgrade3);
}



function playSimpleGameOneShot(buffer, gainValue, playbackRate = 1.0) {
  if (
    !gameAudioReady ||
    !gameAudioCtx ||
    !buffer ||
    gameAudioCtx.state !== 'running'
  ) return null;

  const source = gameAudioCtx.createBufferSource();
  const gain = gameAudioCtx.createGain();

  source.buffer = buffer;
  source.loop = false;
  source.playbackRate.value = playbackRate;
  gain.gain.value = gainValue;

  source.connect(gain);
  gain.connect(gameAudioMaster);
  source.start();

  return source;
}

function playQTEAppearAudio() {
  playSimpleGameOneShot(qteAppearBuffer, AUDIO_MIX.qteAppear);
}

function playQTEHitAudio() {
  playSimpleGameOneShot(qteHitBuffer, AUDIO_MIX.qteHit);
}

function playHoseSlipAudio() {
  playSimpleGameOneShot(hoseSlipBuffer, AUDIO_MIX.hoseSlip);
}

function playWetConcreteFootstep(sprinting = false) {
  playSimpleGameOneShot(
    wetFootstepBuffer,
    AUDIO_MIX.wetFootstep * THREE.MathUtils.randFloat(.92, 1.07),
    (sprinting ? 1.035 : 1.0) * THREE.MathUtils.randFloat(.92, 1.08)
  );
}

function playBabaVoice(buffer, gainValue) {
  if (
    !gameAudioReady ||
    !gameAudioCtx ||
    !buffer ||
    gameAudioCtx.state !== 'running'
  ) return;

  if (babaVoiceSource) {
    try { babaVoiceSource.stop(); } catch (_) {}
    babaVoiceSource = null;
  }

  const source = gameAudioCtx.createBufferSource();
  const gain = gameAudioCtx.createGain();

  source.buffer = buffer;
  source.loop = false;
  source.playbackRate.value = 1.0;
  gain.gain.value = gainValue;

  source.connect(gain);
  gain.connect(gameAudioMaster);

  babaVoiceSource = source;
  source.onended = () => {
    if (babaVoiceSource === source) babaVoiceSource = null;
  };

  source.start();
}

function playBabaGreetingVoice() {
  playBabaVoice(babaGreetingBuffer, AUDIO_MIX.babaGreeting);
}

function playBabaFarewellVoice() {
  playBabaVoice(babaFarewellBuffer, AUDIO_MIX.babaFarewell);
}

function playBabaPurchaseVoice() {
  playBabaVoice(babaPurchaseBuffer, AUDIO_MIX.babaPurchase);
}

function playCigarettePuffAudio() {
  if (
    !gameAudioReady ||
    !gameAudioCtx ||
    !cigarettePuffBuffer ||
    gameAudioCtx.state !== 'running'
  ) return;

  // Never stack multiple close-up inhale samples.
  if (cigarettePuffSource) {
    try { cigarettePuffSource.stop(); } catch (_) {}
    cigarettePuffSource = null;
  }

  const source = gameAudioCtx.createBufferSource();
  const gain = gameAudioCtx.createGain();

  source.buffer = cigarettePuffBuffer;
  source.loop = false;
  source.playbackRate.value = THREE.MathUtils.randFloat(.98, 1.02);
  gain.gain.value = AUDIO_MIX.cigarettePuff;

  source.connect(gain);
  gain.connect(gameAudioMaster);

  cigarettePuffSource = source;
  source.onended = () => {
    if (cigarettePuffSource === source) cigarettePuffSource = null;
  };

  source.start();
}

function playGeorgeNoMoneyVoice() {
  playGeorgeVoice(georgeNoMoneyBuffer, AUDIO_MIX.georgeNoMoney);
}

function playPavelSuccessDanceVoice() {
  if (
    !gameAudioReady ||
    !gameAudioCtx ||
    !pavelSuccessDanceBuffer ||
    gameAudioCtx.state !== 'running'
  ) return;

  // Pavel should not talk over one of his own previous lines.
  for (const src of [pavelGreetingSource, pavelFarewellSource, pavelSuccessDanceSource]) {
    if (!src) continue;
    try { src.stop(); } catch (_) {}
  }
  pavelGreetingSource = null;
  pavelFarewellSource = null;
  pavelSuccessDanceSource = null;

  const source = gameAudioCtx.createBufferSource();
  const gain = gameAudioCtx.createGain();

  source.buffer = pavelSuccessDanceBuffer;
  source.loop = false;
  source.playbackRate.value = 1.0;
  gain.gain.value = AUDIO_MIX.pavelSuccessVoice;

  source.connect(gain);
  gain.connect(gameAudioMaster);

  pavelSuccessDanceSource = source;
  source.onended = () => {
    if (pavelSuccessDanceSource === source) pavelSuccessDanceSource = null;
  };

  source.start();
}

function playPavelFarewellVoice() {
  if (
    !gameAudioReady ||
    !gameAudioCtx ||
    !pavelFarewellBuffer ||
    gameAudioCtx.state !== 'running'
  ) return;

  if (pavelGreetingSource) {
    try { pavelGreetingSource.stop(); } catch (_) {}
    pavelGreetingSource = null;
  }

  if (pavelFarewellSource) {
    try { pavelFarewellSource.stop(); } catch (_) {}
    pavelFarewellSource = null;
  }

  const source = gameAudioCtx.createBufferSource();
  const gain = gameAudioCtx.createGain();

  source.buffer = pavelFarewellBuffer;
  source.loop = false;
  source.playbackRate.value = 1.0;
  gain.gain.value = AUDIO_MIX.pavelFarewell;

  source.connect(gain);
  gain.connect(gameAudioMaster);

  pavelFarewellSource = source;
  source.onended = () => {
    if (pavelFarewellSource === source) pavelFarewellSource = null;
  };

  source.start();
}

function playPavelGreetingVoice() {
  if (
    !gameAudioReady ||
    !gameAudioCtx ||
    !pavelGreetingBuffer ||
    gameAudioCtx.state !== 'running'
  ) return;

  if (pavelGreetingSource) {
    try { pavelGreetingSource.stop(); } catch (_) {}
    pavelGreetingSource = null;
  }

  const source = gameAudioCtx.createBufferSource();
  const gain = gameAudioCtx.createGain();

  source.buffer = pavelGreetingBuffer;
  source.loop = false;
  source.playbackRate.value = 1.0;
  gain.gain.value = AUDIO_MIX.pavelGreeting;

  source.connect(gain);
  gain.connect(gameAudioMaster);

  pavelGreetingSource = source;
  source.onended = () => {
    if (pavelGreetingSource === source) pavelGreetingSource = null;
  };

  source.start();
}

function playSeryogaFarewellVoice() {
  if (
    !gameAudioReady ||
    !gameAudioCtx ||
    !seryogaFarewellBuffer ||
    gameAudioCtx.state !== 'running'
  ) return;

  // Don't let greeting/farewell talk over one another.
  if (seryogaGreetingSource) {
    try { seryogaGreetingSource.stop(); } catch (_) {}
    seryogaGreetingSource = null;
  }

  if (seryogaFarewellSource) {
    try { seryogaFarewellSource.stop(); } catch (_) {}
    seryogaFarewellSource = null;
  }

  const source = gameAudioCtx.createBufferSource();
  const gain = gameAudioCtx.createGain();

  source.buffer = seryogaFarewellBuffer;
  source.loop = false;
  source.playbackRate.value = 1.0;
  gain.gain.value = AUDIO_MIX.seryogaFarewell;

  source.connect(gain);
  gain.connect(gameAudioMaster);

  seryogaFarewellSource = source;
  source.onended = () => {
    if (seryogaFarewellSource === source) seryogaFarewellSource = null;
  };

  source.start();
}

function playSeryogaGreetingVoice() {
  if (
    !gameAudioReady ||
    !gameAudioCtx ||
    !seryogaGreetingBuffer ||
    gameAudioCtx.state !== 'running'
  ) return;

  // Prevent accidental overlap if interact is spammed.
  if (seryogaGreetingSource) {
    try { seryogaGreetingSource.stop(); } catch (_) {}
    seryogaGreetingSource = null;
  }

  const source = gameAudioCtx.createBufferSource();
  const gain = gameAudioCtx.createGain();

  source.buffer = seryogaGreetingBuffer;
  source.loop = false;
  source.playbackRate.value = 1.0;

  // Dialogue is intentionally clearer/louder than ambient machinery.
  gain.gain.value = AUDIO_MIX.seryogaGreeting;

  source.connect(gain);
  gain.connect(gameAudioMaster);

  seryogaGreetingSource = source;
  source.onended = () => {
    if (seryogaGreetingSource === source) seryogaGreetingSource = null;
  };

  source.start();
}

function playRakeDragAudio(intensity = 1) {
  if (
    !gameAudioReady ||
    !gameAudioCtx ||
    !rakeDragBuffer ||
    gameAudioCtx.state !== 'running'
  ) return;

  const source = gameAudioCtx.createBufferSource();
  source.buffer = rakeDragBuffer;
  source.playbackRate.value = THREE.MathUtils.randFloat(.94, 1.06);

  const gain = gameAudioCtx.createGain();
  gain.gain.value = THREE.MathUtils.lerp(
    AUDIO_MIX.rakeMin,
    AUDIO_MIX.rakeMax,
    THREE.MathUtils.clamp(intensity, 0, 1)
  ) * THREE.MathUtils.randFloat(.90, 1.08);

  source.connect(gain);
  gain.connect(gameAudioMaster);
  source.start();
}

function startPourAudio() {
  if (
    !gameAudioReady ||
    !gameAudioCtx ||
    !pourBuffer ||
    pourAudioActive ||
    gameAudioCtx.state !== 'running'
  ) return;

  pourSource = gameAudioCtx.createBufferSource();
  pourSource.buffer = pourBuffer;
  pourSource.loop = true;

  pourGain = gameAudioCtx.createGain();
  pourGain.gain.setValueAtTime(.0001, gameAudioCtx.currentTime);
  pourGain.gain.exponentialRampToValueAtTime(
    AUDIO_MIX.pour,
    gameAudioCtx.currentTime + .18
  );

  pourSource.connect(pourGain);
  pourGain.connect(gameAudioMaster);
  pourSource.start();

  pourAudioActive = true;
}

function stopPourAudio() {
  if (!pourAudioActive) return;
  pourAudioActive = false;

  const src = pourSource;
  const gain = pourGain;
  pourSource = null;
  pourGain = null;

  if (!gameAudioCtx || !gain || !src) return;

  const now = gameAudioCtx.currentTime;
  try {
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(Math.max(.0001, gain.gain.value), now);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .16);
    src.stop(now + .18);
  } catch (_) {
    try { src.stop(); } catch (_) {}
  }
}

function updatePourAudio() {
  const shouldPlay =
    started &&
    pouring &&
    jobState === 'active' &&
    gameAudioReady;

  if (shouldPlay) startPourAudio();
  else stopPourAudio();
}
let rightHandBone = null;
let leftHandBone = null;
let rightIndexBone = null;

// Procedural upper-body animation bones.
// Locomotion remains authored FBX; smoking/drinking/raking are applied AFTER
// the locomotion mixer updates, so they cannot replace/break movement clips.
let rightUpperArmBone = null;
let rightForeArmBone = null;
let leftUpperArmBone = null;
let leftForeArmBone = null;

let proceduralSpecialElapsed = 0;
let proceduralSpecialDuration = 0;
// rakeAnimClock is declared once in the rake runtime state above

const procTargetA = new THREE.Vector3();
const procTargetB = new THREE.Vector3();
const procTargetC = new THREE.Vector3();
const procWorldQ = new THREE.Quaternion();
const procParentQ = new THREE.Quaternion();
const procDeltaQ = new THREE.Quaternion();
const procLocalQ = new THREE.Quaternion();
const procDirNow = new THREE.Vector3();
const procDirTarget = new THREE.Vector3();
const procEuler = new THREE.Euler();
const procTiltQ = new THREE.Quaternion();

let cigaretteProp = null;

const cigaretteSmokeGroup = new THREE.Group();
scene.add(cigaretteSmokeGroup);
const cigaretteSmokeParticles = [];
let cigaretteSmokeSpawnTimer = 0;

function makeCigaretteSmokeTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32,32,2,32,32,30);
  g.addColorStop(0,'rgba(235,238,235,.58)');
  g.addColorStop(.32,'rgba(205,212,207,.34)');
  g.addColorStop(.70,'rgba(170,178,174,.12)');
  g.addColorStop(1,'rgba(150,158,154,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,64,64);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}
const cigaretteSmokeTexture=makeCigaretteSmokeTexture();

for(let i=0;i<30;i++){
  const mat=new THREE.SpriteMaterial({
    map:cigaretteSmokeTexture,transparent:true,opacity:0,
    depthWrite:false,depthTest:true,color:0xe5e8e4
  });
  const sprite=new THREE.Sprite(mat);
  sprite.visible=false;
  cigaretteSmokeGroup.add(sprite);
  cigaretteSmokeParticles.push({sprite,vel:new THREE.Vector3(),age:0,life:0});
}

const smokeTipWorld=new THREE.Vector3();
const smokeBox=new THREE.Box3();
const smokeCorner=new THREE.Vector3();
const smokeBest=new THREE.Vector3();
const smokeCenter=new THREE.Vector3();

function getCigaretteBurnTipWorld(out){
  if(!cigaretteProp)return false;
  cigaretteProp.updateWorldMatrix(true,true);
  smokeBox.setFromObject(cigaretteProp);
  let bestD2=-1;
  for(let xi=0;xi<2;xi++)for(let yi=0;yi<2;yi++)for(let zi=0;zi<2;zi++){
    smokeCorner.set(
      xi?smokeBox.max.x:smokeBox.min.x,
      yi?smokeBox.max.y:smokeBox.min.y,
      zi?smokeBox.max.z:smokeBox.min.z
    );
    const d2=smokeCorner.distanceToSquared(camera.position);
    if(d2>bestD2){bestD2=d2;smokeBest.copy(smokeCorner);}
  }
  smokeBox.getCenter(smokeCenter);
  out.copy(smokeBest).lerp(smokeCenter,.18);
  return true;
}

function spawnCigaretteSmoke(strength=1){
  if(!getCigaretteBurnTipWorld(smokeTipWorld))return;
  let p=cigaretteSmokeParticles.find(x=>!x.sprite.visible);
  if(!p)p=cigaretteSmokeParticles[0];
  p.age=0;p.life=THREE.MathUtils.randFloat(1.15,1.85);
  p.sprite.visible=true;p.sprite.position.copy(smokeTipWorld);
  p.sprite.position.x+=THREE.MathUtils.randFloatSpread(.008);
  p.sprite.position.y+=THREE.MathUtils.randFloatSpread(.006);
  p.sprite.position.z+=THREE.MathUtils.randFloatSpread(.008);
  p.vel.set(
    THREE.MathUtils.randFloatSpread(.025),
    THREE.MathUtils.randFloat(.08,.14),
    THREE.MathUtils.randFloatSpread(.025)
  );
  const s=THREE.MathUtils.randFloat(.018,.032)*(0.85+strength*.25);
  p.sprite.scale.set(s,s,s);
  p.sprite.material.opacity=.38+strength*.16;
  p.sprite.material.rotation=Math.random()*Math.PI*2;
}

function updateCigaretteSmoke(dt){
  for(const p of cigaretteSmokeParticles){
    if(!p.sprite.visible)continue;
    p.age+=dt;
    if(p.age>=p.life){p.sprite.visible=false;p.sprite.material.opacity=0;continue;}
    const k=p.age/p.life;
    p.vel.x+=Math.sin((p.age+p.life)*5.1)*dt*.006;
    p.vel.z+=Math.cos((p.age+p.life)*4.2)*dt*.006;
    p.sprite.position.addScaledVector(p.vel,dt);
    p.sprite.scale.multiplyScalar(1+dt*.72);
    p.sprite.material.opacity=Math.max(0,(1-k)*.42);
  }
  if(specialMode!=='smoke'||!cigaretteProp||!cigaretteVM.visible){
    cigaretteSmokeSpawnTimer=0;
    cigarettePuffLastDrag=-1;
    return;
  }
  const t=proceduralSpecialDuration>0
    ?THREE.MathUtils.clamp(proceduralSpecialElapsed/proceduralSpecialDuration,0,1):0;
  const dragStrength=Math.max(
    procPulse(t,.18,.115),procPulse(t,.50,.115),procPulse(t,.79,.115)
  );

  // Three discrete inhalations, synchronized to the same drag timing that
  // drives the cigarette smoke animation.
  let dragIndex = -1;
  if (Math.abs(t - .18) <= .055) dragIndex = 0;
  else if (Math.abs(t - .50) <= .055) dragIndex = 1;
  else if (Math.abs(t - .79) <= .055) dragIndex = 2;

  if (dragIndex >= 0 && dragIndex !== cigarettePuffLastDrag) {
    cigarettePuffLastDrag = dragIndex;
    playCigarettePuffAudio();
  }

  cigaretteSmokeSpawnTimer-=dt;
  if(cigaretteSmokeSpawnTimer<=0){
    cigaretteSmokeSpawnTimer=THREE.MathUtils.lerp(.16,.065,dragStrength);
    spawnCigaretteSmoke(dragStrength);
  }
}
let energyProp = null;
let beerProp = null;
let lighterProp = null;
let armsReady = false;

const armsRig = new THREE.Group();
armsRig.name = 'PLAYER_WORLD_BODY';
armsRig.visible = false;
armsRig.position.set(0, 0, 0);
armsRig.rotation.order = 'YXZ';
// IMPORTANT: body is a world object, not a camera child. It follows player X/Z + yaw only,
// so looking up/down can never tilt the entire worker.
scene.add(armsRig);

const cigaretteVM = new THREE.Group();
cigaretteVM.visible = false;
camera.add(cigaretteVM);
const energyVM = new THREE.Group();
energyVM.visible = false;
camera.add(energyVM);
const beerVM = new THREE.Group();
beerVM.visible = false;
camera.add(beerVM);
const lighterVM = new THREE.Group();
lighterVM.visible = false;
camera.add(lighterVM);

const fbxManager = new THREE.LoadingManager();
function basenameURL(url) {
  const clean = decodeURIComponent(url).replace(/\\/g, '/').split('?')[0];
  return clean.substring(clean.lastIndexOf('/') + 1);
}
fbxManager.setURLModifier(url => {
  const n = basenameURL(url).toLowerCase();
  if (n === 'base.jpg') return './assets/cigarette/base.jpg';
  if (n === 'emission.jpg') return './assets/cigarette/emission.jpg';
  if (n === 'b-24024.jpg' || n === 'b-24024.jpeg') return './assets/beer/b-24024.jpg';
  return url;
});
const fbxLoader = new FBXLoader(fbxManager);
function loadFBX(url) { return new Promise((resolve, reject) => fbxLoader.load(url, resolve, undefined, reject)); }

const shopPreviewSourceCache = new Map();

function makeBootPreview(tier = 1) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: tier === 1 ? 0x263129 : tier === 2 ? 0x413b30 : 0x25221d,
    roughness: .9,
  });
  const sole = new THREE.Mesh(new THREE.BoxGeometry(.72, .16, 1.05), mat);
  sole.position.set(0, -.62, .13);
  const toe = new THREE.Mesh(new THREE.BoxGeometry(.72, .34, .70), mat);
  toe.position.set(0, -.43, .27);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.34, .31, 1.18, 12), mat);
  shaft.position.set(0, .17, -.13);
  g.add(sole, toe, shaft);
  if (tier >= 2) {
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(.37, .37, .12, 12), mat);
    cuff.position.set(0, .78, -.13);
    g.add(cuff);
  }
  return g;
}

function cloneForShopPreview(source) {
  // Scene-authored products live tens of metres away from world origin. Scaling and
  // recentering that same transformed object leaves it off-camera. Put a detached
  // clone under a neutral wrapper, preserve its world transform, then normalize the
  // WRAPPER around the product's actual bounds.
  source.updateWorldMatrix?.(true, true);
  const cloned = source.clone(true);
  cloned.matrixAutoUpdate = false;
  cloned.matrix.copy(source.matrixWorld || new THREE.Matrix4());
  cloned.matrixWorldNeedsUpdate = true;

  cloned.traverse(o => {
    o.visible = true;
    o.frustumCulled = false;
    if (o.isMesh) {
      o.castShadow = false;
      o.receiveShadow = false;
      if (Array.isArray(o.material)) {
        o.material = o.material.map(m => {
          const c = m?.clone?.() || m;
          if (c) { c.opacity = 1; c.depthWrite = true; c.needsUpdate = true; }
          return c;
        });
      } else if (o.material?.clone) {
        o.material = o.material.clone();
        o.material.opacity = 1;
        o.material.depthWrite = true;
        o.material.needsUpdate = true;
      }
    }
  });

  const wrapper = new THREE.Group();
  wrapper.add(cloned);
  wrapper.updateWorldMatrix(true, true);

  const bb = new THREE.Box3().setFromObject(wrapper);
  const size = bb.getSize(new THREE.Vector3());
  const center = bb.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, .001);
  const scale = 1.75 / maxDim;

  wrapper.scale.setScalar(scale);
  wrapper.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  wrapper.rotation.x = -0.08;
  wrapper.updateWorldMatrix(true, true);
  return wrapper;
}

function bakeSceneObjectForShopPreview(source) {
  if (!source) throw new Error('shop preview source missing');
  source.updateWorldMatrix?.(true, true);

  const baked = new THREE.Group();
  baked.name = `SHOP_BAKED_${source.name || 'PRODUCT'}`;
  source.traverse(o => {
    if (!o.isMesh || !o.geometry) return;
    const geom = o.geometry.clone();
    geom.applyMatrix4(o.matrixWorld);
    const material = Array.isArray(o.material)
      ? o.material.map(m => m?.clone?.() || m)
      : (o.material?.clone?.() || o.material);
    const m = new THREE.Mesh(geom, material);
    m.castShadow = false;
    m.receiveShadow = false;
    m.frustumCulled = false;
    baked.add(m);
  });

  if (!baked.children.length) throw new Error(`${source.name}: no preview meshes`);
  const bb = new THREE.Box3().setFromObject(baked);
  const center = bb.getCenter(new THREE.Vector3());
  const size = bb.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, .001);
  baked.position.copy(center).multiplyScalar(-1);

  const wrapper = new THREE.Group();
  wrapper.add(baked);
  wrapper.scale.setScalar(1.78 / maxDim);
  wrapper.rotation.x = -0.08;
  wrapper.updateWorldMatrix(true, true);
  return wrapper;
}

async function getShopPreviewSource(productKey) {
  if (shopPreviewSourceCache.has(productKey)) {
    return (await shopPreviewSourceCache.get(productKey)).clone(true);
  }

  const p = (async () => {
    if (productKey === 'rewind') {
      const gltf = await new Promise((resolve, reject) =>
        loader.load('./assets/energy/litenergy_classic.gltf', resolve, undefined, reject)
      );
      return cloneForShopPreview(gltf.scene);
    }

    if (productKey === 'samec') {
      // The authored pack has its transforms baked into child geometry. Cloning
      // the scene node preserved those world offsets and could leave the pack
      // outside the preview camera. Bake its visible mesh vertices first.
      const sceneObj = layoutRoot?.getObjectByName('camec') || layoutRoot?.getObjectByName('camec2');
      if (!sceneObj) throw new Error('camec scene model not found');
      const model = bakeSceneObjectForShopPreview(sceneObj);
      model.rotation.x = Math.PI * 0.5 - 0.08;
      model.rotation.y = 0.18;
      return model;
    }

    if (productKey === 'beer') {
      const fbx = await loadFBX('./assets/beer/Baltika.fbx');
      return cloneForShopPreview(fbx);
    }

    if (productKey === 'belomor') {
      const gltf = await new Promise((resolve, reject) =>
        loader.load('./assets/shop/belomor.glb', resolve, undefined, reject)
      );
      return cloneForShopPreview(gltf.scene);
    }

    if (productKey === 'boots1') {
      const gltf = await new Promise((resolve, reject) =>
        loader.load('./assets/shop/rubberbootstier1.glb', resolve, undefined, reject)
      );
      const model = cloneForShopPreview(gltf.scene);
      model.rotation.x = -0.12;
      model.rotation.y = 0.20;
      return model;
    }

    if (productKey === 'boots2') {
      const gltf = await new Promise((resolve, reject) =>
        loader.load('./assets/shop/rubberbootstier2.glb', resolve, undefined, reject)
      );
      const model = cloneForShopPreview(gltf.scene);
      model.rotation.x = -0.10;
      model.rotation.y = 0.24;
      return model;
    }

    if (productKey === 'boots3') {
      const gltf = await new Promise((resolve, reject) =>
        loader.load('./assets/shop/Muddy-Mouse-Boots-01a0137d.glb', resolve, undefined, reject)
      );
      const model = cloneForShopPreview(gltf.scene);
      model.rotation.x = -0.08;
      model.rotation.y = 0.28;
      return model;
    }

    throw new Error(`Unknown shop preview: ${productKey}`);
  })();

  shopPreviewSourceCache.set(productKey, p);
  return (await p).clone(true);
}

async function setShopPreviewModel(productKey) {
  const requestId = ++shopPreviewRequestId;
  while (shopPreviewRoot.children.length) shopPreviewRoot.remove(shopPreviewRoot.children[0]);

  try {
    const model = await getShopPreviewSource(productKey);
    if (requestId !== shopPreviewRequestId) return;
    shopPreviewRoot.add(model);
    shopPreviewRoot.rotation.set(0, 0, 0);
    shopPreviewSpin = 0;
  } catch (e) {
    console.warn('Shop 3D preview failed:', productKey, e);
  }
}


function prepViewModelMaterial(mat) {
  if (!mat) return;
  if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
  mat.depthTest = false;
  mat.depthWrite = false;
  mat.transparent = false;
  mat.opacity = 1.0;
  mat.alphaTest = 0.0;
  mat.blending = THREE.NormalBlending;
  mat.premultipliedAlpha = false;
  if ('transmission' in mat) mat.transmission = 0;
  mat.needsUpdate = true;
}
function forceOpaqueProp(root, keepDepthOverlay = false) {
  if (!root) return;
  root.traverse?.(o => {
    if (!(o.isMesh || o.isSkinnedMesh)) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (!m) continue;
      if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
      m.transparent = false;
      m.opacity = 1.0;
      m.alphaTest = 0.0;
      m.blending = THREE.NormalBlending;
      m.premultipliedAlpha = false;
      m.colorWrite = true;
      m.depthTest = !keepDepthOverlay;
      m.depthWrite = !keepDepthOverlay;
      if ('transmission' in m) m.transmission = 0;
      m.needsUpdate = true;
    }
    o.renderOrder = keepDepthOverlay ? 999 : 0;
  });
}

function prepViewModel(root) {
  root.traverse(o => {
    if (o.isMesh || o.isSkinnedMesh) {
      o.castShadow = false;
      o.receiveShadow = false;
      o.frustumCulled = false;
      o.renderOrder = 999;
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      ms.forEach(prepViewModelMaterial);
    }
  });
}

function prepPlayerWorldBody(root) {
  root.traverse(o => {
    if (!(o.isMesh || o.isSkinnedMesh)) return;
    o.frustumCulled = false;
    o.renderOrder = 0;
    o.castShadow = !TOUCH_DEVICE;
    o.receiveShadow = true;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms) {
      if (!m) continue;
      m.depthTest = true;
      m.depthWrite = true;
      m.colorWrite = true;
      m.transparent = false;
      m.opacity = 1;
      m.alphaTest = 0;
      m.blending = THREE.NormalBlending;
      m.premultipliedAlpha = false;
      m.side = THREE.FrontSide;
      m.forceSinglePass = true;
      m.needsUpdate = true;
    }
  });
}
function normalizeCharacter(root, targetHeight = 1.78) {
  root.updateMatrixWorld(true);
  let bb = new THREE.Box3().setFromObject(root);
  const size = bb.getSize(new THREE.Vector3());
  const sc = targetHeight / Math.max(size.y, .001);
  root.scale.multiplyScalar(sc);
  root.updateMatrixWorld(true);
  bb = new THREE.Box3().setFromObject(root);
  const center = bb.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= bb.min.y;
}

const hotbar3D=new Map();

function cloneForHotbarPreview(source){
  if(!source)return null;
  const clone=source.clone(true);
  clone.traverse(o=>{
    if(!(o.isMesh||o.isSkinnedMesh))return;
    const src=Array.isArray(o.material)?o.material:[o.material];
    const mats=src.map(m=>m?.clone?.()||m);
    for(const m of mats){
      if(!m)continue;
      if(m.map)m.map.colorSpace=THREE.SRGBColorSpace;
      m.transparent=false;m.opacity=1;m.alphaTest=0;
      m.depthTest=true;m.depthWrite=true;m.blending=THREE.NormalBlending;
      if('transmission' in m)m.transmission=0;
      m.needsUpdate=true;
    }
    o.material=Array.isArray(o.material)?mats:mats[0];
    o.visible=true;o.renderOrder=0;o.castShadow=false;o.receiveShadow=false;o.frustumCulled=false;
  });
  clone.visible=true;
  return clone;
}

function createHotbar3DPreview(kind,canvas){
  if(!canvas||TOUCH_DEVICE)return null;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setSize(72,46,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.18;
  renderer.setClearColor(0x000000,0);

  const s=new THREE.Scene();
  const c=new THREE.PerspectiveCamera(28,72/46,.01,10);
  c.position.set(0,0,2.8);c.lookAt(0,0,0);
  s.add(new THREE.HemisphereLight(0xffffff,0x3c413a,2.2));
  const key=new THREE.DirectionalLight(0xfff1cf,3.2);key.position.set(2.5,3,4);s.add(key);
  const rim=new THREE.DirectionalLight(0xaec9ff,1.2);rim.position.set(-3,1,1);s.add(rim);
  const pivot=new THREE.Group();s.add(pivot);
  const entry={kind,renderer,scene:s,camera:c,pivot,model:null,spin:Math.random()*Math.PI*2};
  hotbar3D.set(kind,entry);return entry;
}

createHotbar3DPreview('smoke',hotbarSmokePreviewEl);
createHotbar3DPreview('energy',hotbarDrinkPreviewEl);
createHotbar3DPreview('beer',hotbarBeerPreviewEl);
createHotbar3DPreview('rake',hotbarRakePreviewEl);

function setHotbar3DModel(kind,source){
  const entry=hotbar3D.get(kind);
  if(!entry||!source)return;
  if(entry.model)entry.pivot.remove(entry.model);
  const model=cloneForHotbarPreview(source);
  if(!model)return;
  entry.pivot.add(model);
  model.position.set(0,0,0);model.rotation.set(0,0,0);model.scale.setScalar(1);
  model.updateWorldMatrix(true,true);

  const box=new THREE.Box3().setFromObject(model);
  const center=box.getCenter(new THREE.Vector3());
  const size=box.getSize(new THREE.Vector3());
  const longest=Math.max(size.x,size.y,size.z,.0001);
  model.position.sub(center);
  model.scale.setScalar(1.18/longest);

  if(kind==='smoke'){model.rotation.set(.18,-.55,-.15);model.scale.multiplyScalar(1.28);}
  else if(kind==='energy'){model.rotation.set(.12,-.50,.03);}
  else if(kind==='beer'){model.rotation.set(.10,-.55,.03);}
  else if(kind==='rake'){model.rotation.set(.18,-.25,-.68);model.scale.multiplyScalar(.92);}
  entry.model=model;
}

function renderHotbar3DPreviews(dt){
  if(TOUCH_DEVICE)return;
  for(const entry of hotbar3D.values()){
    if(!entry.model)continue;
    entry.spin+=dt*.42;
    entry.pivot.rotation.y=Math.sin(entry.spin)*.20;
    entry.renderer.render(entry.scene,entry.camera);
  }
}

function normalizeProp(root, targetLongest) {
  root.updateMatrixWorld(true);
  let bb = new THREE.Box3().setFromObject(root);
  const size = bb.getSize(new THREE.Vector3());
  const sc = targetLongest / Math.max(size.x, size.y, size.z, .001);
  root.scale.multiplyScalar(sc);
  root.updateMatrixWorld(true);
  bb = new THREE.Box3().setFromObject(root);
  root.position.sub(bb.getCenter(new THREE.Vector3()));
}
function canonicalBoneCore(name) {
  // Three.js sanitizes FBX node names (":" may disappear/change), and different Mixamo exports
  // can use mixamorig, mixamorig1, mixamorig12, etc. Strip all of that and match by anatomy.
  let n = String(name || '').replace(/^.*[|]/, '');
  n = n.replace(/[^a-zA-Z0-9]/g, '');
  n = n.replace(/^mixamorig\d*/i, '');
  return n.toLowerCase();
}
function buildBoneMap(root) {
  const map = new Map();
  root.traverse(o => {
    if (!o.isBone) return;
    const core = canonicalBoneCore(o.name);
    if (core && !map.has(core)) map.set(core, o);
  });
  return map;
}
function findBone(root, suffix) {
  return buildBoneMap(root).get(canonicalBoneCore(suffix)) || null;
}

function isHiddenViewMeshName(name) {
  const n = String(name || '').toLowerCase();
  return n.includes('head') || n.includes('hair') || n.includes('eye') || n.includes('lash') ||
    n.includes('teeth') || n.includes('tongue') || n.includes('brow');
}
function groupMaterialAt(groups, vertexOffset) {
  for (const g of groups) if (vertexOffset >= g.start && vertexOffset < g.start + g.count) return g.materialIndex || 0;
  return 0;
}
function rebuildSkinnedMeshWithoutHeadWeights(mesh) {
  if (!mesh.isSkinnedMesh || !mesh.geometry?.attributes?.position) return false;
  const skinIndex = mesh.geometry.attributes.skinIndex;
  const skinWeight = mesh.geometry.attributes.skinWeight;
  const bones = mesh.skeleton?.bones || [];
  if (!skinIndex || !skinWeight || !bones.length) return false;

  const headBoneIndices = new Set();
  bones.forEach((b, i) => {
    const core = canonicalBoneCore(b.name);
    if (
      core === 'neck' ||
      core === 'head' ||
      core.startsWith('headtop') ||
      core.includes('headend')
    ) headBoneIndices.add(i);
  });
  if (!headBoneIndices.size) return false;

  const src = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  const si = src.attributes.skinIndex;
  const sw = src.attributes.skinWeight;
  const pos = src.attributes.position;
  if (!si || !sw || !pos) { src.dispose(); return false; }

  const srcGroups = src.groups.length ? src.groups : [{ start: 0, count: pos.count, materialIndex: 0 }];
  const attrNames = Object.keys(src.attributes);
  const out = Object.fromEntries(attrNames.map(n => [n, []]));
  const keptMaterials = [];

  function headWeight(v) {
    let total = 0;
    for (let c = 0; c < Math.min(si.itemSize, sw.itemSize); c++) {
      const bi = si.array[v * si.itemSize + c];
      const w = sw.array[v * sw.itemSize + c];
      if (headBoneIndices.has(bi)) total += w;
    }
    return total;
  }

  const triCount = Math.floor(pos.count / 3);
  for (let t = 0; t < triCount; t++) {
    const base = t * 3;
    const h0 = headWeight(base), h1 = headWeight(base + 1), h2 = headWeight(base + 2);
    const maxHead = Math.max(h0, h1, h2);
    const avgHead = (h0 + h1 + h2) / 3;
    // Remove face/head triangles reliably regardless of FBX local axis/scale.
    if (maxHead > .12 || avgHead > .055) continue;

    const matIndex = groupMaterialAt(srcGroups, base);
    keptMaterials.push(matIndex);
    for (let j = 0; j < 3; j++) {
      const vi = base + j;
      for (const name of attrNames) {
        const at = src.attributes[name];
        const off = vi * at.itemSize;
        for (let q = 0; q < at.itemSize; q++) out[name].push(at.array[off + q]);
      }
    }
  }

  if (!keptMaterials.length) { src.dispose(); return false; }
  const ng = new THREE.BufferGeometry();
  for (const name of attrNames) {
    const at = src.attributes[name];
    const Arr = at.array.constructor;
    ng.setAttribute(name, new THREE.BufferAttribute(new Arr(out[name]), at.itemSize, at.normalized));
  }
  let groupStart = 0, currentMat = keptMaterials[0], groupCount = 0;
  for (let i = 0; i < keptMaterials.length; i++) {
    const m = keptMaterials[i];
    if (m !== currentMat) {
      ng.addGroup(groupStart, groupCount, currentMat);
      groupStart += groupCount; groupCount = 0; currentMat = m;
    }
    groupCount += 3;
  }
  ng.addGroup(groupStart, groupCount, currentMat);
  ng.computeBoundingBox(); ng.computeBoundingSphere();
  mesh.geometry = ng;
  src.dispose();
  return true;
}

function trimSkinnedMeshToHeadlessBody(mesh, cutY = 1.46) {
  // Coordinate fallback for unusual rigs with no skin weights / no Head bone.
  if (!mesh.isSkinnedMesh || !mesh.geometry.attributes.position) return;
  const src = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  const pos = src.attributes.position;
  const triCount = Math.floor(pos.count / 3);
  const srcGroups = src.groups.length ? src.groups : [{ start: 0, count: pos.count, materialIndex: 0 }];
  const attrNames = Object.keys(src.attributes);
  const out = Object.fromEntries(attrNames.map(n => [n, []]));
  const keptMaterials = [];
  for (let t = 0; t < triCount; t++) {
    const base = t * 3;
    if (pos.getY(base) > cutY || pos.getY(base+1) > cutY || pos.getY(base+2) > cutY) continue;
    const matIndex = groupMaterialAt(srcGroups, base);
    keptMaterials.push(matIndex);
    for (let j=0;j<3;j++) {
      const vi=base+j;
      for (const name of attrNames) {
        const at=src.attributes[name], off=vi*at.itemSize;
        for (let q=0;q<at.itemSize;q++) out[name].push(at.array[off+q]);
      }
    }
  }
  if (!keptMaterials.length) { src.dispose(); return; }
  const ng=new THREE.BufferGeometry();
  for (const name of attrNames) {
    const at=src.attributes[name], Arr=at.array.constructor;
    ng.setAttribute(name,new THREE.BufferAttribute(new Arr(out[name]),at.itemSize,at.normalized));
  }
  let gs=0,cm=keptMaterials[0],gc=0;
  for (let i=0;i<keptMaterials.length;i++) {
    const m=keptMaterials[i];
    if (m!==cm) { ng.addGroup(gs,gc,cm); gs+=gc; gc=0; cm=m; }
    gc+=3;
  }
  ng.addGroup(gs,gc,cm); ng.computeBoundingBox(); ng.computeBoundingSphere();
  mesh.geometry=ng; src.dispose();
}

function trimGeometryAboveWorldY(mesh, cutWorldY) {
  if (!mesh?.geometry?.attributes?.position) return;
  const src = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  const pos = src.attributes.position;
  const attrNames = Object.keys(src.attributes);
  const groups = src.groups.length ? src.groups : [{ start:0, count:pos.count, materialIndex:0 }];
  const out = Object.fromEntries(attrNames.map(n => [n, []]));
  const keptMaterials = [];
  const v = new THREE.Vector3();
  const triCount = Math.floor(pos.count / 3);
  for (let t=0;t<triCount;t++) {
    const base=t*3;
    let above=false;
    for (let j=0;j<3;j++) {
      v.fromBufferAttribute(pos,base+j).applyMatrix4(mesh.matrixWorld);
      if (v.y > cutWorldY) { above=true; break; }
    }
    if (above) continue;
    keptMaterials.push(groupMaterialAt(groups,base));
    for (let j=0;j<3;j++) {
      const vi=base+j;
      for (const name of attrNames) {
        const a=src.attributes[name], off=vi*a.itemSize;
        for (let q=0;q<a.itemSize;q++) out[name].push(a.array[off+q]);
      }
    }
  }
  if (!keptMaterials.length) { mesh.visible=false; src.dispose(); return; }
  const ng=new THREE.BufferGeometry();
  for (const name of attrNames) {
    const a=src.attributes[name], Arr=a.array.constructor;
    ng.setAttribute(name,new THREE.BufferAttribute(new Arr(out[name]),a.itemSize,a.normalized));
  }
  let gs=0, cm=keptMaterials[0], gc=0;
  for (const m of keptMaterials) {
    if (m!==cm) { ng.addGroup(gs,gc,cm); gs+=gc; gc=0; cm=m; }
    gc+=3;
  }
  ng.addGroup(gs,gc,cm);
  ng.computeBoundingBox(); ng.computeBoundingSphere();
  mesh.geometry=ng; src.dispose();
}

function forceHeadlessWorldCut(root, referenceBox = null) {
  root.updateWorldMatrix(true,true);
  const bb = referenceBox ? referenceBox.clone() : new THREE.Box3().setFromObject(root);
  const h=Math.max(.001,bb.max.y-bb.min.y);
  // FPS cut below the throat so looking down can never expose the neck hole.
  const cutY=bb.min.y+h*.842;
  root.traverse(o => {
    if (o.isMesh || o.isSkinnedMesh) trimGeometryAboveWorldY(o,cutY);
  });
}

function trimCharacterToArms(root) {
  // Keep the full FPS body, but surgically remove the head.  The old local-Y
  // cutoff failed on this FBX because its skinned mesh coordinates use a different
  // local basis.  Skin weights are invariant to that, so prefer them.
  root.traverse(o => {
    if (!(o.isMesh || o.isSkinnedMesh)) return;
    if (isHiddenViewMeshName(o.name)) { o.visible = false; return; }
    if (!o.isSkinnedMesh) return; // keep non-head static accessories/clothes
    const removedByWeights = rebuildSkinnedMeshWithoutHeadWeights(o);
    if (!removedByWeights && o.geometry?.attributes?.position) {
      o.geometry.computeBoundingBox();
      const bb=o.geometry.boundingBox;
      const h=Math.max(.001,bb.max.y-bb.min.y);
      trimSkinnedMeshToHeadlessBody(o,bb.min.y+h*.825);
    }
  });
}
function retargetClip(root, clip, name, options = {}) {
  const targetBones = buildBoneMap(root);
  const excluded = options.excludeBones || null;
  const tracks = [];
  for (const tr of clip.tracks) {
    const dot = tr.name.indexOf('.');
    if (dot < 0) continue;
    const sourceNode = tr.name.slice(0, dot);
    const prop = tr.name.slice(dot);
    const core = canonicalBoneCore(sourceNode);
    if (excluded && excluded.has(core)) continue;
    const targetBone = targetBones.get(core);
    if (!targetBone) continue;
    // Root translation from Mixamo would move the FPS viewmodel around the camera.
    if (core === 'hips' && prop.startsWith('.position')) continue;
    const nt = tr.clone();
    nt.name = `${targetBone.name}${prop}`;
    tracks.push(nt);
  }
  const out = new THREE.AnimationClip(name, clip.duration, tracks);
  out.userData = { boundTracks: tracks.length, sourceTracks: clip.tracks.length };
  return out;
}


// ---------------------------------------------------------------------------
// SCENE NPCs — latest Blender scene placeholders -> rigged Mixamo characters
// ---------------------------------------------------------------------------
const npcMixers = [];
let npcSpawnStarted = false;
let npcIdlePromise = null;
const npcTextureLoader = new THREE.TextureLoader();
const npcRuntime = new Map();
const npcDanceCache = new Map();

const PAVEL_DANCES = [
  './assets/npcs/dances/Snake_Hip_Hop_Dance.fbx',
  './assets/npcs/dances/Dancing_Maraschino_Step.fbx',
  './assets/npcs/dances/Flair.fbx',
  './assets/npcs/dances/Gangnam_Style.fbx',
  './assets/npcs/dances/Hip_Hop_Dancing.fbx',
];

const NPC_SPECS = [
  {
    label: 'Павел Петрович',
    npcKey: 'pavel',
    placeholder: 'PavelPetrovich',
    fbx: './assets/npcs/pavel_rigged.fbx',
    base: './assets/npcs/pavel_0.jpg',
    mr: './assets/npcs/pavel_1.jpg',
    normal: './assets/npcs/pavel_2.jpg',
    metalness: 1.0,
    sceneYawDeg: 323.44731,
  },
  {
    label: 'Серёга',
    npcKey: 'mandarin',
    placeholder: 'tripo_node_dcf4e696-9b1f-4ad2-bc5d-02bd8af0150a',
    fbx: './assets/npcs/mandarin_rigged.fbx',
    base: './assets/npcs/mandarin_0.jpg',
    normal: './assets/npcs/mandarin_1.jpg',
    mr: './assets/npcs/mandarin_2.png',
    metalness: 0.0,
    sceneYawDeg: 270.00001,
    lockHead: true,
  },
  {
    label: 'George',
    npcKey: 'george',
    placeholder: 'George',
    fbx: './assets/npcs/george_rigged.fbx',
    base: './assets/npcs/george_0.jpg',
    mr: './assets/npcs/george_1.jpg',
    normal: './assets/npcs/george_2.jpg',
    metalness: 1.0,
    sceneYawDeg: 11.53999,
  },
];

function loadNPCTexture(url, srgb = false) {
  return new Promise((resolve, reject) => {
    npcTextureLoader.load(url, tex => {
      if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      resolve(tex);
    }, undefined, reject);
  });
}

async function buildNPCMaterialSet(spec) {
  const [base, mr, normal] = await Promise.all([
    loadNPCTexture(spec.base, true),
    loadNPCTexture(spec.mr, false),
    loadNPCTexture(spec.normal, false),
  ]);
  return { base, mr, normal };
}

function applyNPCPBR(root, maps, spec) {
  root.traverse(o => {
    if (!(o.isMesh || o.isSkinnedMesh)) return;
    const old = Array.isArray(o.material) ? o.material[0] : o.material;
    const mat = new THREE.MeshStandardMaterial({
      name: `NPC_${spec.label}`,
      map: maps.base,
      normalMap: maps.normal,
      roughnessMap: maps.mr,
      metalnessMap: maps.mr,
      roughness: 1.0,
      metalness: spec.metalness,
      side: THREE.DoubleSide,
    });
    // Preserve obvious alpha/cutout behavior if the FBX material had any.
    if (old && (old.transparent || old.alphaTest > 0)) {
      mat.transparent = !!old.transparent;
      mat.alphaTest = old.alphaTest || 0;
    }
    o.material = mat;
    o.castShadow = true;
    o.receiveShadow = true;
    o.frustumCulled = true;
  });
}

function placeholderPose(obj) {
  obj.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const q = obj.getWorldQuaternion(new THREE.Quaternion());
  return {
    position: new THREE.Vector3(center.x, box.min.y, center.z),
    quaternion: q,
    height: Math.max(size.y, .5),
  };
}

async function spawnRiggedNPC(spec, idleSource) {
  if (!layoutRoot) return;
  const placeholder = layoutRoot.getObjectByName(spec.placeholder);
  if (!placeholder) {
    console.warn(`NPC placeholder not found: ${spec.placeholder}`);
    return;
  }

  const pose = placeholderPose(placeholder);
  // Small gameplay collider around the character's feet; do not use the full donor
  // bbox because arms/coat silhouettes would make an unnecessarily huge wall.
  const npcR = .48;
  addColliderXZ(spec.label, pose.position.x - npcR, pose.position.x + npcR, pose.position.z - npcR, pose.position.z + npcR);
  // Latest Blender scene is the single source of truth for NPC placement.
  // Hide only the static donor mesh; its bbox/rotation above determine runtime placement.
  placeholder.visible = false;

  const [character, maps] = await Promise.all([
    loadFBX(spec.fbx),
    buildNPCMaterialSet(spec),
  ]);
  applyNPCPBR(character, maps, spec);
  normalizeCharacter(character, pose.height);

  const wrap = new THREE.Group();
  wrap.name = `NPC_${spec.label}`;
  wrap.position.copy(pose.position);
  // Object transforms were applied before the latest GLB export, so the donor
  // placeholder nodes themselves are identity-rotated and their heading lives
  // in baked vertex coordinates. These yaws are recovered from the actual
  // latest-scene geometry, not guessed from the node quaternion.
  wrap.rotation.y = THREE.MathUtils.degToRad(spec.sceneYawDeg || 0);
  wrap.add(character);
  scene.add(wrap);
  wrap.updateMatrixWorld(true);

  const idleClip = retargetClip(
    character,
    idleSource.animations[0],
    `${spec.label}_Idle`,
    spec.lockHead ? { excludeBones: new Set(['neck', 'head', 'headtopend']) } : {}
  );
  let mixer = null;
  let idleAction = null;
  if (idleClip.tracks.length) {
    mixer = new THREE.AnimationMixer(character);
    idleAction = mixer.clipAction(idleClip);
    idleAction.setLoop(THREE.LoopRepeat, Infinity);
    idleAction.play();
    npcMixers.push(mixer);
    console.log(`${spec.label}: Neutral Idle, ${idleClip.tracks.length} tracks`);
  } else {
    console.warn(`${spec.label}: idle retarget produced 0 tracks`);
  }

  const runtime = { spec, character, wrap, mixer, idleAction, pose, busyAction: null };
  npcRuntime.set(spec.npcKey, runtime);

  const proxy = new THREE.Object3D();
  proxy.name = `NPC_INTERACTION_${spec.npcKey}`;
  proxy.position.set(pose.position.x, pose.position.y + 1.0, pose.position.z);
  scene.add(proxy);
  interactive.push({
    obj: proxy,
    kind: 'npc',
    npcKey: spec.npcKey,
    radius: 2.45,
    text: `E — поговорить · ${spec.label}`
  });
}

function idleEmbeddedRig(root, idleSource, label) {
  if (!root) return;
  const clip = retargetClip(root, idleSource.animations[0], `${label}_Idle`);
  if (!clip.tracks.length) return;
  const mixer = new THREE.AnimationMixer(root);
  mixer.clipAction(clip).setLoop(THREE.LoopRepeat, Infinity).play();
  npcMixers.push(mixer);
  console.log(`${label}: Neutral Idle, ${clip.tracks.length} tracks`);
}

async function startSceneNPCs() {
  if (npcSpawnStarted || !layoutRoot) return;
  npcSpawnStarted = true;
  try {
    npcIdlePromise ||= loadFBX('./assets/npcs/Neutral_Idle.fbx');
    const idleSource = await npcIdlePromise;
    if (!idleSource.animations?.length) throw new Error('Neutral Idle.fbx has no animation');

    // Characters already rigged inside the latest scene also get Neutral Idle.
    idleEmbeddedRig(layoutRoot.getObjectByName('BabaKapa'), idleSource, 'BabaKapa');
    idleEmbeddedRig(layoutRoot.getObjectByName('Armature.001'), idleSource, 'SceneCharacter');

    await Promise.all(NPC_SPECS.map(spec => spawnRiggedNPC(spec, idleSource)));
    console.log(`Scene NPC idle setup complete: ${npcMixers.length} mixers`);
  } catch (e) {
    console.error('NPC idle setup failed', e);
  }
}

const handWorldPos = new THREE.Vector3();
const handWorldQuat = new THREE.Quaternion();
const cameraWorldQuatInv = new THREE.Quaternion();
const localHandQuat = new THREE.Quaternion();
function followBoneWithProp(holder, bone, offset, rotOffset) {
  if (!holder || !bone) return;
  bone.getWorldPosition(handWorldPos);
  bone.getWorldQuaternion(handWorldQuat);
  camera.worldToLocal(handWorldPos);
  camera.getWorldQuaternion(cameraWorldQuatInv).invert();
  localHandQuat.copy(cameraWorldQuatInv).multiply(handWorldQuat);
  holder.position.copy(handWorldPos).add(offset.clone().applyQuaternion(localHandQuat));
  holder.quaternion.copy(localHandQuat).multiply(rotOffset);
}

const PROP_DEFAULTS = {
  cigarette: { pos:[.006,.010,.016], rot:[0,-Math.PI/3,0] },
  lighter:   { pos:[-.012,.012,.030], rot:[0,Math.PI/2,-Math.PI/2] },
  energy:    { pos:[.000,-.010,.016], rot:[0,0,-Math.PI/2] },
  beer:      { pos:[.000,-.012,.018], rot:[0,0,-Math.PI/2] },
  rake:      { pos:[.70,-.60,-1.62], rot:[-.20,-1.615,-.50] }
};

function loadPropConfig(name) {
  const d = PROP_DEFAULTS[name];
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(`beton_prop_${name}`) || 'null'); } catch (_) {}
  const pos = raw?.pos?.length === 3 ? raw.pos : d.pos;
  const rot = raw?.rot?.length === 3 ? raw.rot : d.rot;
  return {
    pos: new THREE.Vector3(...pos),
    euler: new THREE.Euler(...rot, 'XYZ'),
    quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot, 'XYZ'))
  };
}
const propConfigs = {
  cigarette: loadPropConfig('cigarette'),
  lighter: loadPropConfig('lighter'),
  energy: loadPropConfig('energy'),
  beer: loadPropConfig('beer'),
  rake: loadPropConfig('rake')
};

if (localStorage.getItem('beton_prop_grip_fix_v512') !== '1') {
  for (const name of ['cigarette','lighter','energy','beer']) {
    localStorage.removeItem(`beton_prop_${name}`);
    const d = PROP_DEFAULTS[name];
    propConfigs[name].pos.set(...d.pos);
    propConfigs[name].euler.set(...d.rot);
    propConfigs[name].quat.setFromEuler(propConfigs[name].euler);
  }
  localStorage.setItem('beton_prop_grip_fix_v512','1');
}

// v51.28: force only the cigarette's new +30° grip once.
if (localStorage.getItem('beton_cigarette_grip_v528') !== '1') {
  localStorage.removeItem('beton_prop_cigarette');
  const d = PROP_DEFAULTS.cigarette;
  propConfigs.cigarette.pos.set(...d.pos);
  propConfigs.cigarette.euler.set(...d.rot);
  propConfigs.cigarette.quat.setFromEuler(propConfigs.cigarette.euler);
  localStorage.setItem('beton_cigarette_grip_v528','1');
}

// v0.48: discard stale broken rake transforms from older localStorage.
if (localStorage.getItem('beton_rake_vm_safe_v528') !== '1') {
  localStorage.removeItem('beton_prop_rake');
  propConfigs.rake.pos.copy(RAKE_VM_BASE_POS);
  propConfigs.rake.euler.copy(RAKE_VM_BASE_ROT);
  propConfigs.rake.quat.setFromEuler(propConfigs.rake.euler);
  localStorage.setItem('beton_rake_vm_safe_v528', '1');
}
function savePropConfig(name) {
  const c = propConfigs[name];
  localStorage.setItem(`beton_prop_${name}`, JSON.stringify({
    pos:[c.pos.x,c.pos.y,c.pos.z],
    rot:[c.euler.x,c.euler.y,c.euler.z]
  }));
}
function syncPropQuat(name) {
  propConfigs[name].quat.setFromEuler(propConfigs[name].euler);
}


const playerTextureLoader = new THREE.TextureLoader();
async function applyNewPlayerMaterials(root) {
  const [baseMap, normalMap, roughnessMap] = await Promise.all([
    playerTextureLoader.loadAsync('./assets/player/player_base.webp'),
    playerTextureLoader.loadAsync('./assets/player/player_normal.webp'),
    playerTextureLoader.loadAsync('./assets/player/player_roughness.webp'),
  ]);
  baseMap.colorSpace = THREE.SRGBColorSpace;
  normalMap.colorSpace = THREE.NoColorSpace;
  roughnessMap.colorSpace = THREE.NoColorSpace;
  baseMap.flipY = normalMap.flipY = roughnessMap.flipY = false;
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  baseMap.anisotropy = normalMap.anisotropy = roughnessMap.anisotropy = aniso;

  const mat = new THREE.MeshStandardMaterial({
    name: 'PLAYER_NEW_PBR',
    map: baseMap,
    normalMap,
    normalScale: new THREE.Vector2(.72, .72),
    roughnessMap,
    roughness: 1.0,
    metalness: 0.0,
    side: THREE.FrontSide,
    transparent: false,
    opacity: 1,
    depthTest: true,
    depthWrite: true,
  });
  root.traverse(o => {
    if (o.isMesh || o.isSkinnedMesh) {
      o.material = mat;
      o.castShadow = !TOUCH_DEVICE;
      o.receiveShadow = true;
      o.renderOrder = 0;
    }
  });
}

function setPlayerLocomotion(moving, sprinting) {
  if (!armsReady || !armsMixer || specialMode || propTuneMode) return;
  const desired = !moving ? 'idle' : (sprinting ? 'run' : 'walk');
  if (playerLocomotionState === desired) return;

  const current = playerLocomotionState === 'run' ? armsRunAction :
                  playerLocomotionState === 'walk' ? armsWalkAction : armsIdleAction;
  const next = desired === 'run' ? armsRunAction : desired === 'walk' ? armsWalkAction : armsIdleAction;
  if (!next) return;

  if (current?.isRunning()) current.fadeOut(.14);
  next.reset();
  next.enabled = true;
  next.setLoop(THREE.LoopRepeat, Infinity);
  // Authored clips are already close to the game's target pace.
  next.setEffectiveTimeScale(desired === 'run' ? 1.0 : desired === 'walk' ? .96 : 1.0);
  next.fadeIn(.14).play();
  playerLocomotionState = desired;
}


async function loadArmsViewModel() {
  loadState.textContent = 'Загрузка FPS-тела и анимаций…';
  try {
    const character = await loadFBX('./assets/player/rabochka_rigged.fbx');
    await applyNewPlayerMaterials(character);
    normalizeCharacter(character, 1.78);
    character.updateMatrixWorld(true);
    // Calibrate FPS eye line from THIS character instead of a hard-coded generic height.
    // Eye level is estimated from the top of the normalized head (~11.5 cm below the crown).
    // We also verify that a Mixamo Head bone exists so a broken import cannot produce nonsense.
    const fullCharacterBox = new THREE.Box3().setFromObject(character);
    const fullCharacterHeight = fullCharacterBox.max.y - fullCharacterBox.min.y;
    const headBoneForCamera = findBone(character, 'Head');
    if (headBoneForCamera && fullCharacterHeight > 1.2) {
      const estimatedEyeY = fullCharacterBox.max.y - fullCharacterHeight * .0645;
      calibratedEyeHeight = THREE.MathUtils.clamp(estimatedEyeY - fullCharacterBox.min.y, 1.58, 1.70);
      eyeHeight = THREE.MathUtils.clamp(calibratedEyeHeight + cameraHeightOffset, 1.35, 1.95);
      cameraHeightOffset = eyeHeight - calibratedEyeHeight;
      syncCameraToPlayer();
    }
    // Crop using the ORIGINAL full-body bounds before any skin-weight deletion can shrink them.
    forceHeadlessWorldCut(character, fullCharacterBox);
    trimCharacterToArms(character);
    character.updateWorldMatrix(true,true);
    prepPlayerWorldBody(character);
    // In headless full-body FPS mode, keep the body slightly behind the camera so the chest/shoulders read naturally
    // without aggressively filling the frame.
    // Keep the headless full body slightly in front of the camera pivot so the
    // chest/arms/legs are actually visible when looking down, without showing the head.
    syncPlayerViewModelDepth();
    armsCharacter = character;
    armsRig.add(character);
    rightHandBone = findBone(character, 'RightHand');
    leftHandBone = findBone(character, 'LeftHand');
    rightIndexBone = findBone(character, 'RightHandIndex2') || findBone(character, 'RightHandIndex1') || rightHandBone;
    rightUpperArmBone = findBone(character, 'RightArm');
    rightForeArmBone = findBone(character, 'RightForeArm');
    leftUpperArmBone = findBone(character, 'LeftArm');
    leftForeArmBone = findBone(character, 'LeftForeArm');
    armsMixer = new THREE.AnimationMixer(character);

    // IMPORTANT v0.47:
    // only locomotion comes from FBX. Smoking/drinking/rake are procedural JS poses.
    const [idleFbx, walkFbx, runFbx] = await Promise.all([
      loadFBX('./assets/anims/Player_Idle.fbx'),
      loadFBX('./assets/anims/Player_Walk.fbx'),
      loadFBX('./assets/anims/Slow_Run.fbx')
    ]);
    const idleClip = retargetClip(character, idleFbx.animations[0], 'Player Idle');
    const walkClip = retargetClip(character, walkFbx.animations[0], 'Player Walk');
    const runClip = retargetClip(character, runFbx.animations[0], 'Player Slow Run');
    character.userData.idleClip = idleClip;
    character.userData.walkClip = walkClip;
    character.userData.runClip = runClip;

    try {
      const cigRoot = await loadFBX('./assets/cigarette/cigarette.fbx');
      prepViewModel(cigRoot);
      forceOpaqueProp(cigRoot,true);
      normalizeProp(cigRoot,.085);
      cigaretteProp=cigRoot;cigaretteVM.add(cigRoot);
      setHotbar3DModel('smoke',cigRoot);
    } catch (e) { console.warn('Cigarette failed', e); }

    try {
      const energyGLTF = await new Promise((resolve, reject) => loader.load('./assets/energy/litenergy_classic.gltf', resolve, undefined, reject));
      const eroot=energyGLTF.scene;
      prepViewModel(eroot);forceOpaqueProp(eroot,true);normalizeProp(eroot,.165);
      energyProp=eroot;energyVM.add(eroot);setHotbar3DModel('energy',eroot);
    } catch (e) { console.warn('Energy failed', e); }

    try {
      const broot = await loadFBX('./assets/beer/Baltika.fbx');
      prepViewModel(broot);forceOpaqueProp(broot,true);normalizeProp(broot,.19);
      beerProp=broot;beerVM.add(broot);setHotbar3DModel('beer',broot);
    } catch (e) { console.warn('Beer failed', e); }

    try {
      const lighterGLTF = await new Promise((resolve, reject) => loader.load('./assets/lighter.glb', resolve, undefined, reject));
      const lroot = lighterGLTF.scene;
      prepViewModel(lroot);forceOpaqueProp(lroot,true);normalizeProp(lroot,.105);
      lighterProp=lroot;lighterVM.add(lroot);
    } catch (e) { console.warn('Lighter failed', e); }

    if (!rightHandBone || !leftHandBone ||
        !rightUpperArmBone || !rightForeArmBone ||
        !leftUpperArmBone || !leftForeArmBone) {
      throw new Error(
        `Rig binding failed: RH=${!!rightHandBone}, LH=${!!leftHandBone}, ` +
        `RArm=${!!rightUpperArmBone}/${!!rightForeArmBone}, ` +
        `LArm=${!!leftUpperArmBone}/${!!leftForeArmBone}`
      );
    }
    armsReady = true;
    armsIdleAction = armsMixer.clipAction(idleClip);
    armsIdleAction.reset();
    armsIdleAction.enabled = true;
    armsIdleAction.setLoop(THREE.LoopRepeat, Infinity);
    armsIdleAction.play();
    armsWalkAction = armsMixer.clipAction(walkClip);
    armsWalkAction.enabled = true;
    armsWalkAction.setLoop(THREE.LoopRepeat, Infinity);
    armsWalkAction.setEffectiveTimeScale(.96);
    armsRunAction = armsMixer.clipAction(runClip);
    armsRunAction.enabled = true;
    armsRunAction.setLoop(THREE.LoopRepeat, Infinity);
    armsRunAction.setEffectiveTimeScale(1.0);
    playerLocomotionState = 'idle';

    // Persistent headless player model: body/hands stay visible in normal FPS.
    armsRig.visible = true;
    loadState.textContent = `SCENE22 готова · игрок · Idle ${idleClip.userData?.boundTracks || 0} · Walk ${walkClip.userData?.boundTracks || 0} · Run ${runClip.userData?.boundTracks || 0} · спец-анимации процедурные`;
  } catch (e) {
    console.error('FPS arms failed', e);
    loadState.textContent = 'Сцена готова · руки не загрузились';
  }
}
loadArmsViewModel();

function resumePlayerIdle() {
  if (!armsReady || !armsMixer || !armsCharacter) return;
  const clip = armsCharacter.userData.idleClip;
  if (!clip) return;
  if (!armsIdleAction) armsIdleAction = armsMixer.clipAction(clip);
  if (armsWalkAction) armsWalkAction.stop();
  if (armsRunAction) armsRunAction.stop();
  armsIdleAction.reset();
  armsIdleAction.enabled = true;
  armsIdleAction.setLoop(THREE.LoopRepeat, Infinity);
  armsIdleAction.play();
  playerLocomotionState = 'idle';
}

function stopPlayerIdle() {
  if (armsIdleAction) armsIdleAction.stop();
  if (armsWalkAction) armsWalkAction.stop();
  if (armsRunAction) armsRunAction.stop();
  playerLocomotionState = 'special';
}

function prepareProceduralBaseline() {
  if (!armsReady || !armsMixer) return;
  if (armsWalkAction) armsWalkAction.stop();
  if (armsRunAction) armsRunAction.stop();
  if (armsIdleAction) {
    armsIdleAction.reset();
    armsIdleAction.enabled = true;
    armsIdleAction.setLoop(THREE.LoopRepeat, Infinity);
    armsIdleAction.play();
  }
  playerLocomotionState = 'special';
  armsRig.visible = true;
}

function startProceduralSpecial(kind) {
  stowRakeForSpecial();
  if (!armsReady) return 0;
  prepareProceduralBaseline();
  proceduralSpecialElapsed = 0;
  proceduralSpecialDuration =
    kind === 'smoke' ? 6.2 :
    kind === 'beer' ? 3.1 :
    2.65;
  return proceduralSpecialDuration;
}

function procSmooth01(x) {
  x = THREE.MathUtils.clamp(x, 0, 1);
  return x * x * (3 - 2 * x);
}

function procPulse(t, center, halfWidth) {
  const d = Math.abs(t - center) / Math.max(halfWidth, .0001);
  return d >= 1 ? 0 : procSmooth01(1 - d);
}

function cameraLocalToWorld(x, y, z, out) {
  out.set(x, y, z);
  out.applyQuaternion(camera.quaternion);
  out.add(camera.position);
  return out;
}

function rotateBoneWorldToward(bone, effector, target, strength = 1) {
  if (!bone || !effector) return;
  bone.updateWorldMatrix(true, true);
  effector.updateWorldMatrix(true, true);

  bone.getWorldPosition(procTargetA);
  effector.getWorldPosition(procTargetB);

  procDirNow.copy(procTargetB).sub(procTargetA);
  procDirTarget.copy(target).sub(procTargetA);
  if (procDirNow.lengthSq() < 1e-8 || procDirTarget.lengthSq() < 1e-8) return;

  procDirNow.normalize();
  procDirTarget.normalize();
  procDeltaQ.setFromUnitVectors(procDirNow, procDirTarget);

  if (strength < .999) {
    procDeltaQ.slerp(new THREE.Quaternion(), 1 - strength);
  }

  bone.getWorldQuaternion(procWorldQ);
  procWorldQ.premultiply(procDeltaQ);

  if (bone.parent) {
    bone.parent.getWorldQuaternion(procParentQ).invert();
    procLocalQ.copy(procParentQ).multiply(procWorldQ);
  } else {
    procLocalQ.copy(procWorldQ);
  }

  bone.quaternion.copy(procLocalQ);
  bone.updateWorldMatrix(true, true);
}

function solveArmCCD(upper, fore, hand, target, strength = 1) {
  if (!upper || !fore || !hand) return;

  // A few CCD passes are enough for a two-joint Mixamo arm.
  for (let i = 0; i < 3; i++) {
    rotateBoneWorldToward(fore, hand, target, strength);
    rotateBoneWorldToward(upper, hand, target, strength);
  }
}

function applyHandLocalTilt(hand, x, y, z, weight = 1) {
  if (!hand || weight <= 0) return;
  procEuler.set(x * weight, y * weight, z * weight, 'XYZ');
  procTiltQ.setFromEuler(procEuler);
  hand.quaternion.multiply(procTiltQ);
  hand.updateWorldMatrix(true, true);
}

function applyProceduralSmokePose(t) {
  // Three distinct drags. The hand drops between them instead of staying glued
  // to the mouth for the whole animation.
  const drag =
    Math.max(
      procPulse(t, .18, .115),
      procPulse(t, .50, .115),
      procPulse(t, .79, .115)
    );

  cameraLocalToWorld(.32, -.50, -.43, procTargetA);   // relaxed right hand
  cameraLocalToWorld(.16, -.084, -.31, procTargetB);  // lips · +30% higher smoking hand
  procTargetC.copy(procTargetA).lerp(procTargetB, drag);
  solveArmCCD(
    rightUpperArmBone,
    rightForeArmBone,
    rightHandBone,
    procTargetC,
    .92
  );

  // Small wrist curl toward the face.
  applyHandLocalTilt(rightHandBone, -.06, .04, -.18, drag);

  // Lighter only comes up during the first drag.
  const light = procPulse(t, .115, .115);
  cameraLocalToWorld(-.29, -.60, -.48, procTargetA);
  cameraLocalToWorld(-.05, -.18, -.31, procTargetB);
  procTargetC.copy(procTargetA).lerp(procTargetB, light);
  solveArmCCD(
    leftUpperArmBone,
    leftForeArmBone,
    leftHandBone,
    procTargetC,
    .88
  );
  applyHandLocalTilt(leftHandBone, .05, -.08, .25, light);

  lighterVM.visible = !!lighterProp && t < .27;
}

function applyProceduralDrinkPose(t, beer = false) {
  // Lift -> hold at lips -> lower.
  const raise = procSmooth01(THREE.MathUtils.clamp(t / .24, 0, 1));
  const lower = procSmooth01(THREE.MathUtils.clamp((t - .76) / .24, 0, 1));
  const hold = raise * (1 - lower);

  cameraLocalToWorld(-.32, -.50, -.43, procTargetA);
  cameraLocalToWorld(-.15, -.19, -.31, procTargetB);
  procTargetC.copy(procTargetA).lerp(procTargetB, hold);

  solveArmCCD(
    leftUpperArmBone,
    leftForeArmBone,
    leftHandBone,
    procTargetC,
    .94
  );

  // Slightly stronger tilt for Baltika.
  applyHandLocalTilt(
    leftHandBone,
    -.05,
    beer ? -.06 : -.04,
    beer ? .30 : .24,
    hold
  );
}

function applyProceduralRakePose(dt) {
  if (!rakeEquipped) return;

  rakeSweepWorkBlend = THREE.MathUtils.damp(
    rakeSweepWorkBlend,
    raking ? 1 : 0,
    13,
    dt
  );

  rakeSweepTravel = THREE.MathUtils.damp(
    rakeSweepTravel,
    0,
    5.5,
    dt
  );

  // Rest: lower-right with the handle returning toward the player.
  // Work: rake head is pushed farther forward/down toward the slab.
  const work = rakeSweepWorkBlend;
  const motion = rakeSweepTravel;

  rakeVM.position.set(
    RAKE_VM_BASE_POS.x - work * .030 + motion * .010,
    RAKE_VM_BASE_POS.y - work * .058 - motion * .009,
    RAKE_VM_BASE_POS.z - work * .18
  );

  rakeVM.rotation.set(
    RAKE_VM_BASE_ROT.x - work * .070,
    RAKE_VM_BASE_ROT.y + motion * .024,
    RAKE_VM_BASE_ROT.z + work * .032 - motion * .026
  );
}


// -----------------------------
// Manual tuning modes
// -----------------------------
let propTuneMode = false;
let cameraTuneMode = false;
const tunePropOrder = ['cigarette','lighter','energy','beer','rake'];
let tunePropIndex = 0;
let tuneAnimTime = 0;
let tuneClipDuration = 1;

function currentTuneProp() { return tunePropOrder[tunePropIndex]; }

function setTuneHUD(title, lines) {
  tuneTitleEl.textContent = title;
  tuneLinesEl.innerHTML = lines.join('<br>');
  tuneHudEl.classList.remove('hidden');
}
function closeTuneHUD() {
  tuneHudEl.classList.add('hidden');
}

function tuneHolderFor(name) {
  if (name === 'cigarette') return cigaretteVM;
  if (name === 'lighter') return lighterVM;
  if (name === 'energy') return energyVM;
  if (name === 'beer') return beerVM;
  if (name === 'rake') return rakeVM;
  return null;
}
function hideAllTuneProps() {
  cigaretteVM.visible = false;
  lighterVM.visible = false;
  energyVM.visible = false;
  beerVM.visible = false;
  rakeVM.visible = false;
}

function startTuneAnimationFor(name) {
  if (!armsReady || !armsMixer || !armsCharacter || name === 'rake') {
    armsRig.visible = name !== 'rake' ? armsRig.visible : false;
    return;
  }
  const clip = (name === 'cigarette' || name === 'lighter')
    ? armsCharacter.userData.smokeClip
    : armsCharacter.userData.drinkClip;
  if (!clip) return;

  if (armsAction) { armsAction.stop(); armsAction = null; }
  stopPlayerIdle();
  armsRig.visible = true;
  armsAction = armsMixer.clipAction(clip);
  armsAction.reset();
  armsAction.enabled = true;
  armsAction.setLoop(THREE.LoopOnce, 1);
  armsAction.clampWhenFinished = true;
  armsAction.play();
  armsAction.paused = true;
  tuneClipDuration = clip.duration;
  tuneAnimTime = Math.min(tuneAnimTime, tuneClipDuration);
  armsAction.time = tuneAnimTime;
  armsMixer.update(0);
}

function refreshPropTunePreview() {
  hideAllTuneProps();
  const name = currentTuneProp();
  const holder = tuneHolderFor(name);
  if (holder) holder.visible = true;

  if (name === 'rake') {
    rakeVM.visible = true;
    rakeVM.position.copy(propConfigs.rake.pos);
    rakeVM.rotation.copy(propConfigs.rake.euler);
    armsRig.visible = false;
  } else {
    startTuneAnimationFor(name);
  }
  updateTuneHUD();
}

function updateTuneHUD() {
  if (cameraTuneMode) {
    setTuneHUD('F5 · CAMERA TUNE', [
      `КАМЕРА ВПЕРЁД/НАЗАД: ${playerCameraDepthOffset >= 0 ? '+' : ''}${playerCameraDepthOffset.toFixed(3)} м`,
      `ВЫСОТА: ${eyeHeight.toFixed(3)} м`,
      '↑ / ↓ — камера относительно тела вперёд / назад',
      '[ / ] — выше / ниже',
      'Backspace — сброс · F5 — выйти'
    ]);
    return;
  }
  if (!propTuneMode) { closeTuneHUD(); return; }

  const name = currentTuneProp();
  const c = propConfigs[name];
  const deg = v => (THREE.MathUtils.radToDeg(v)).toFixed(1);
  setTuneHUD(`F4 · PROP TUNE · ${name.toUpperCase()}`, [
    `POS X ${c.pos.x.toFixed(3)} · Y ${c.pos.y.toFixed(3)} · Z ${c.pos.z.toFixed(3)}`,
    `ROT X ${deg(c.euler.x)}° · Y ${deg(c.euler.y)}° · Z ${deg(c.euler.z)}°`,
    name === 'rake' ? 'Без анимации' : `АНИМАЦИЯ ${tuneAnimTime.toFixed(2)} / ${tuneClipDuration.toFixed(2)} сек`,
    'Tab — следующий предмет',
    'W/S = Z · A/D = X · Q/E = Y',
    'I/K = rot X · J/L = rot Y · U/O = rot Z',
    '[ / ] — скраб анимации',
    'Shift = крупный шаг · Backspace = reset · F4 = сохранить/выйти'
  ]);
}

function enterPropTune() {
  if (cameraTuneMode) cameraTuneMode = false;
  propTuneMode = !propTuneMode;
  pouring = false;
  raking = false;

  if (propTuneMode) {
    finishSpecial();
    rakeEquipped = false;
    tuneAnimTime = .55;
    refreshPropTunePreview();
    showToast('PROP TUNE · F4 выход');
  } else {
    hideAllTuneProps();
    if (armsAction) { armsAction.stop(); armsAction = null; }
    armsRig.visible = armsReady;
    resumePlayerIdle();
    closeTuneHUD();
    showToast('Позиции предметов сохранены');
  }
}
function enterCameraTune() {
  if (propTuneMode) {
    propTuneMode = false;
    hideAllTuneProps();
    if (armsAction) { armsAction.stop(); armsAction = null; }
    armsRig.visible = armsReady;
    resumePlayerIdle();
  }
  cameraTuneMode = !cameraTuneMode;
  if (cameraTuneMode) {
    updateTuneHUD();
    showToast('CAMERA TUNE · стрелки ↑↓');
  } else {
    closeTuneHUD();
    showToast('Положение камеры сохранено');
  }
}

function resetCurrentPropTune() {
  const name = currentTuneProp();
  const d = PROP_DEFAULTS[name];
  propConfigs[name].pos.set(...d.pos);
  propConfigs[name].euler.set(...d.rot);
  syncPropQuat(name);
  savePropConfig(name);
  refreshPropTunePreview();
}

function adjustPropTune(code, shift) {
  const name = currentTuneProp();
  const c = propConfigs[name];
  const move = shift ? .010 : .002;
  const rot = THREE.MathUtils.degToRad(shift ? 2.0 : .5);
  let changed = true;

  if (code === 'KeyA') c.pos.x -= move;
  else if (code === 'KeyD') c.pos.x += move;
  else if (code === 'KeyQ') c.pos.y += move;
  else if (code === 'KeyE') c.pos.y -= move;
  else if (code === 'KeyW') c.pos.z -= move;
  else if (code === 'KeyS') c.pos.z += move;
  else if (code === 'KeyI') c.euler.x += rot;
  else if (code === 'KeyK') c.euler.x -= rot;
  else if (code === 'KeyJ') c.euler.y += rot;
  else if (code === 'KeyL') c.euler.y -= rot;
  else if (code === 'KeyU') c.euler.z += rot;
  else if (code === 'KeyO') c.euler.z -= rot;
  else changed = false;

  if (changed) {
    syncPropQuat(name);
    savePropConfig(name);
    if (name === 'rake') {
      rakeVM.position.copy(c.pos);
      rakeVM.rotation.copy(c.euler);
    }
    updateTuneHUD();
  }
  return changed;
}

function scrubTuneAnimation(delta) {
  const name = currentTuneProp();
  if (name === 'rake' || !armsAction) return;
  tuneAnimTime = THREE.MathUtils.clamp(tuneAnimTime + delta, 0, tuneClipDuration);
  armsAction.time = tuneAnimTime;
  armsMixer.update(0);
  updateTuneHUD();
}

const mainThemeAudio = new Audio('./assets/audio/music/main_theme_v528.wav');
mainThemeAudio.loop = true;
mainThemeAudio.preload = 'auto';
mainThemeAudio.volume = 0.14;

function startMainTheme() {
  if (!mainThemeAudio.paused) return;
  const p = mainThemeAudio.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}

function requestMouseLock() {
  if (TOUCH_DEVICE) { locked = true; return; }
  if (!renderer.domElement.requestPointerLock) return;
  try { renderer.domElement.requestPointerLock(); } catch (_) {}
}
function enterSite() {
  resolveMachineAudioWorldPositions();
  if (loadState) loadState.style.opacity = '0';
  startMainTheme();
  initGameAudio();
  started = true;
  start.classList.add('hidden');
  document.body.classList.add('gameStarted');
  if (TOUCH_DEVICE) {
    locked = true;
    screen.orientation?.lock?.('landscape').catch(() => {});
  } else requestMouseLock();
}
startBtn.addEventListener('click', enterSite);
renderer.domElement.addEventListener('click', () => { if (!TOUCH_DEVICE && started && !locked && !shopOpen && !resultOpen && !dialogueOpen) requestMouseLock(); });
document.addEventListener('pointerlockchange', () => {
  if (TOUCH_DEVICE) { locked = started; return; }
  locked = document.pointerLockElement === renderer.domElement;
  if (!locked) for (const k in keys) keys[k] = false;
});
document.addEventListener('mousemove', e => {
  if (!locked) return;

  // During QTE the mouse becomes an osu-style software cursor instead of moving the camera.
  if (qteActive) {
    qteCursorX = THREE.MathUtils.clamp(qteCursorX + e.movementX, 8, innerWidth - 8);
    qteCursorY = THREE.MathUtils.clamp(qteCursorY + e.movementY, 8, innerHeight - 8);
    qteCursorEl.style.left = `${qteCursorX}px`;
    qteCursorEl.style.top = `${qteCursorY}px`;
    return;
  }

  if (debugMode) {
    debugYaw -= e.movementX * .00175;
    debugPitch -= e.movementY * .00155;
    debugPitch = THREE.MathUtils.clamp(debugPitch, -0.12, 1.05);
    return;
  }
  yaw -= e.movementX * .00155;
  pitch -= e.movementY * .00145;
  pitch = THREE.MathUtils.clamp(pitch, -FPS_PITCH_LIMIT, FPS_PITCH_LIMIT);
});
renderer.domElement.addEventListener('wheel', e => {
  if (!debugMode) return;
  e.preventDefault();
  debugDistance = THREE.MathUtils.clamp(debugDistance + Math.sign(e.deltaY) * .45, 2.3, 11.0);
}, { passive: false });

function primaryActionDown() {
  if (!started || !locked || shopOpen || resultOpen || dialogueOpen) return;
  if (qteActive) { clickQTE(); return; }
  if (rakeEquipped && jobState === 'active') {
    raking = true;
    rakeSweepPrevValid = false;
    rakeSweepAccumulator = 0;
    return;
  }
  if (hoseHeld && jobState === 'active') {
    pouring = !pouring;
    if (hoseInteraction) hoseInteraction.text = pouring
      ? 'E — бросить шланг · ЛКМ — выключить бетон'
      : 'E — бросить шланг · ЛКМ — включить бетон';
    showToast(pouring ? 'ПОДАЧА БЕТОНА ВКЛ' : 'ПОДАЧА БЕТОНА ВЫКЛ');
  }
}
function primaryActionUp() {
  raking = false;
  rakeSweepPrevValid = false;
  rakeSweepAccumulator = 0;
}
renderer.domElement.addEventListener('mousedown', e => {
  if (e.button !== 0 || TOUCH_DEVICE) return;
  primaryActionDown();
  e.preventDefault();
});
window.addEventListener('mouseup', e => { if (e.button === 0) primaryActionUp(); });

function setCameraHeightOffset(nextOffset, save = true) {
  cameraHeightOffset = THREE.MathUtils.clamp(nextOffset, -0.30, 0.30);
  eyeHeight = THREE.MathUtils.clamp(calibratedEyeHeight + cameraHeightOffset, 1.35, 1.95);
  cameraHeightOffset = eyeHeight - calibratedEyeHeight;
  syncCameraToPlayer();
  if (save) localStorage.setItem('betonshchik_camera_height_offset', cameraHeightOffset.toFixed(3));
  const sign = cameraHeightOffset >= 0 ? '+' : '';
  showToast(`Высота глаз: ${eyeHeight.toFixed(2)} м (${sign}${cameraHeightOffset.toFixed(2)} м)`);
}
document.addEventListener('keydown', e => {
  keys[e.code] = true;

  const handledCodes = [
    'KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','KeyI','KeyK','KeyJ','KeyL','KeyU','KeyO',
    'ShiftLeft','ShiftRight','Digit1','Digit2','Digit3','Digit4','KeyM',
    'BracketLeft','BracketRight','Backslash','F3','F4','F5',
    'ArrowUp','ArrowDown','Tab','Backspace'
  ];
  if (handledCodes.includes(e.code)) e.preventDefault();

  if (e.code === 'F4' && !e.repeat) { enterPropTune(); return; }
  if (e.code === 'F5' && !e.repeat) { enterCameraTune(); return; }

  if (propTuneMode) {
    if (e.code === 'Tab' && !e.repeat) {
      tunePropIndex = (tunePropIndex + 1) % tunePropOrder.length;
      tuneAnimTime = .55;
      refreshPropTunePreview();
      return;
    }
    if (e.code === 'BracketLeft' && !e.repeat) { scrubTuneAnimation(-.05); return; }
    if (e.code === 'BracketRight' && !e.repeat) { scrubTuneAnimation(.05); return; }
    if (e.code === 'Backspace' && !e.repeat) { resetCurrentPropTune(); return; }
    if (adjustPropTune(e.code, e.shiftKey)) return;
    return;
  }

  if (cameraTuneMode) {
    if (e.code === 'ArrowUp') {
      playerCameraDepthOffset = THREE.MathUtils.clamp(playerCameraDepthOffset + (e.shiftKey ? .03 : .008), .18, .48);
      localStorage.setItem('betonshchik_player_camera_depth_offset', playerCameraDepthOffset.toFixed(3));
      syncPlayerViewModelDepth();
      updateTuneHUD();
      return;
    }
    if (e.code === 'ArrowDown') {
      playerCameraDepthOffset = THREE.MathUtils.clamp(playerCameraDepthOffset - (e.shiftKey ? .03 : .008), .18, .48);
      localStorage.setItem('betonshchik_player_camera_depth_offset', playerCameraDepthOffset.toFixed(3));
      syncPlayerViewModelDepth();
      updateTuneHUD();
      return;
    }
    if (e.code === 'BracketLeft') {
      setCameraHeightOffset(cameraHeightOffset - .005);
      updateTuneHUD();
      return;
    }
    if (e.code === 'BracketRight') {
      setCameraHeightOffset(cameraHeightOffset + .005);
      updateTuneHUD();
      return;
    }
    if (e.code === 'Backspace' && !e.repeat) {
      playerCameraDepthOffset = 0.27;
      localStorage.setItem('betonshchik_player_camera_depth_offset', '0.27');
      syncPlayerViewModelDepth();
      setCameraHeightOffset(0);
      updateTuneHUD();
      return;
    }
    return;
  }

  if (e.code === 'KeyE' && !e.repeat) interact();
  if (e.code === 'Digit1' && !e.repeat) smokeCigarette();
  if (e.code === 'Digit2' && !e.repeat) drinkEnergy();
  if (e.code === 'Digit3' && !e.repeat) drinkBeer();
  if (e.code === 'Digit4' && !e.repeat) {
    if (!rakeOwned) showToast('ГРАБЛИ ЛЕЖАТ РЯДОМ С ПЛИТОЙ — СНАЧАЛА ПОДБЕРИ ИХ');
    else setRakeEquipped(!rakeEquipped);
  }
  if (e.code === 'KeyM' && !e.repeat) {
    mapVisible = !mapVisible;
    minimap.style.display = mapVisible ? 'block' : 'none';
  }
  if (e.code === 'BracketLeft' && !e.repeat) setCameraHeightOffset(cameraHeightOffset - .01);
  if (e.code === 'BracketRight' && !e.repeat) setCameraHeightOffset(cameraHeightOffset + .01);
  if (e.code === 'Backslash' && !e.repeat) setCameraHeightOffset(0);
  if (e.code === 'F3' && !e.repeat) setDebugMode(!debugMode);
});
document.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

// ---------------------------------------------------------------------------
// MOBILE LANDSCAPE CONTROLS — two analogue sticks + gameplay buttons
// ---------------------------------------------------------------------------
let mobileMoveX=0, mobileMoveY=0, mobileLookX=0, mobileLookY=0;
function setupMobileStick(el, knob, onValue) {
  if (!el || !knob) return;
  let pid=null;
  const set=(e) => {
    const r=el.getBoundingClientRect();
    const cx=r.left+r.width*.5, cy=r.top+r.height*.5;
    const radius=r.width*.34;
    let dx=e.clientX-cx, dy=e.clientY-cy;
    const len=Math.hypot(dx,dy);
    if (len>radius) { dx*=radius/len; dy*=radius/len; }
    knob.style.transform=`translate(${dx}px,${dy}px)`;
    onValue(dx/radius,dy/radius);
  };
  el.addEventListener('pointerdown',e=>{ pid=e.pointerId; el.setPointerCapture(pid); set(e); e.preventDefault(); });
  el.addEventListener('pointermove',e=>{ if(e.pointerId===pid){ set(e); e.preventDefault(); } });
  const end=e=>{ if(e.pointerId!==pid)return; pid=null; knob.style.transform='translate(0,0)'; onValue(0,0); e.preventDefault(); };
  el.addEventListener('pointerup',end); el.addEventListener('pointercancel',end);
}
function mobileInputAllowed(){ return TOUCH_DEVICE && started && !shopOpen && !resultOpen && !dialogueOpen; }
if (TOUCH_DEVICE) {
  const moveStick=document.querySelector('#moveStick'), moveKnob=document.querySelector('#moveKnob');
  const lookStick=document.querySelector('#lookStick'), lookKnob=document.querySelector('#lookKnob');
  setupMobileStick(moveStick,moveKnob,(x,y)=>{ mobileMoveX=x; mobileMoveY=y; });
  setupMobileStick(lookStick,lookKnob,(x,y)=>{ mobileLookX=x; mobileLookY=y; });
  const bindTap=(id,fn)=>document.querySelector(id)?.addEventListener('pointerdown',e=>{ e.preventDefault(); if(mobileInputAllowed())fn(); });
  bindTap('#mobileInteract',interact);
  bindTap('#mobileSmoke',smokeCigarette);
  bindTap('#mobileRewind',drinkEnergy);
  bindTap('#mobileBeer',drinkBeer);
  bindTap('#mobileRake',()=>{ if(!rakeOwned) showToast('СНАЧАЛА ПОДБЕРИ ГРАБЛИ'); else setRakeEquipped(!rakeEquipped); });
  const action=document.querySelector('#mobileAction');
  action?.addEventListener('pointerdown',e=>{ e.preventDefault(); if(mobileInputAllowed()) primaryActionDown(); });
  action?.addEventListener('pointerup',e=>{ e.preventDefault(); primaryActionUp(); });
  action?.addEventListener('pointercancel',()=>primaryActionUp());
  // On touch, QTE is a rhythm tap: tap the visible circle itself. Timing still decides PERFECT.
  qteLayerEl.addEventListener('pointerdown',e=>{
    if(!qteActive)return;
    qteCursorX=e.clientX; qteCursorY=e.clientY;
    qteCursorEl.style.left=`${qteCursorX}px`; qteCursorEl.style.top=`${qteCursorY}px`;
    clickQTE(); e.preventDefault();
  });
}

// Gracefully recover from mobile GPU/context eviction instead of leaving a black canvas.
renderer.domElement.addEventListener('webglcontextlost',e=>{ e.preventDefault(); showToast('ВИДЕОПАМЯТЬ ОСВОБОЖДАЕТСЯ…'); });
renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());

function refreshMobileOrientationUI(){
  document.documentElement.classList.toggle('mobileLandscape', MOBILE_LANDSCAPE());
  document.documentElement.classList.toggle('mobilePortrait', TOUCH_DEVICE && !MOBILE_LANDSCAPE());
}
refreshMobileOrientationUI();
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  debugCamera.aspect = camera.aspect; debugCamera.updateProjectionMatrix();
  renderer.setPixelRatio(TOUCH_DEVICE ? Math.min(devicePixelRatio,mobileRenderScale) : Math.min(devicePixelRatio,1.55));
  renderer.setSize(innerWidth, innerHeight);
  composer?.setPixelRatio(Math.min(devicePixelRatio,1.15));
  composer?.setSize(innerWidth, innerHeight);
  bloomPass?.setSize(innerWidth,innerHeight);
  refreshMobileOrientationUI();
});

function blocked(x, z) {
  const feetY = groundHeightAt(x, z) + .04;
  const headY = feetY + 1.72;

  // Stable simple colliders: NPCs and explicit gameplay volumes.
  for (const c of colliders) {
    if (Number.isFinite(c.minY) && Number.isFinite(c.maxY)) {
      if (c.maxY <= feetY + .055 || c.minY >= headY) continue;
    }
    if (x + PLAYER_R > c.minX && x - PLAYER_R < c.maxX && z + PLAYER_R > c.minZ && z - PLAYER_R < c.maxZ) {
      const now = performance.now();
      if (c.name !== lastBlockedBy || now - lastBlockedAt > 1200) {
        lastBlockedBy = c.name;
        lastBlockedAt = now;
        console.debug('[COLLISION:AABB] blocked by:', c.name);
      }
      return true;
    }
  }

  // Real scene meshes use oriented boxes instead of world AABBs. Three small
  // spheres approximate the player's capsule and don't create invisible
  // rectangular walls around rotated/diagonal meshes.
  collisionSphereLow.center.set(x, feetY + .31, z);
  collisionSphereMid.center.set(x, feetY + .88, z);
  collisionSphereHigh.center.set(x, feetY + 1.38, z);

  for (const c of meshColliders) {
    if (
      c.obb.intersectsSphere(collisionSphereLow) ||
      c.obb.intersectsSphere(collisionSphereMid) ||
      c.obb.intersectsSphere(collisionSphereHigh)
    ) {
      const now = performance.now();
      if (c.name !== lastBlockedBy || now - lastBlockedAt > 1200) {
        lastBlockedBy = c.name;
        lastBlockedAt = now;
        console.debug('[COLLISION:OBB] blocked by:', c.name);
      }
      return true;
    }
  }
  return false;
}
function moveAxis(dx, dz) {
  const nx = playerPos.x + dx;
  if (!blocked(nx, playerPos.z)) playerPos.x = nx;
  const nz = playerPos.z + dz;
  if (!blocked(playerPos.x, nz)) playerPos.z = nz;
}
function showToast(t) {
  toastEl.textContent = t;
  toastEl.classList.add('show');
  toastTimer = 2.2;
}

let dialogueOpen = false;
let dialogueNpcKey = null;
let shopOpen = false;
let resultOpen = false;

function setDialogue(name, text, options = []) {
  dialogueNameEl.textContent = name;
  dialogueTextEl.textContent = text;
  dialogueOptionsEl.innerHTML = '';
  for (const opt of options) {
    const btn = document.createElement('button');
    btn.className = 'dialogueOption';
    btn.textContent = opt.label;
    btn.addEventListener('click', opt.action);
    dialogueOptionsEl.appendChild(btn);
  }
}

function openDialogue(npcKey) {
  if (dialogueOpen || shopOpen || resultOpen) return;
  dialogueOpen = true;
  dialogueNpcKey = npcKey;
  pouring = false;
  if (document.pointerLockElement) document.exitPointerLock();
  dialogueEl.classList.remove('hidden');

  // NPC greeting voice: once per dialogue opening.
  if (npcKey === 'mandarin') playSeryogaGreetingVoice();
  if (npcKey === 'george') playGeorgeGreetingVoice();
  if (npcKey === 'baba') playBabaGreetingVoice();
  if (npcKey === 'pavel') {
    playPavelGreetingVoice();
    pavelFarewellAllowedThisDialogue = jobState !== 'accepted';
  }

  refreshDialogue();
}

function closeDialogue() {
  if (!dialogueOpen) return;

  const closingNpcKey = dialogueNpcKey;

  dialogueOpen = false;
  dialogueNpcKey = null;
  dialogueEl.classList.add('hidden');

  // `mandarin` is Серёга internally.
  if (closingNpcKey === 'mandarin') {
    playSeryogaFarewellVoice();
  }

  if (closingNpcKey === 'pavel' && pavelFarewellAllowedThisDialogue) {
    playPavelFarewellVoice();
  }

  if (closingNpcKey === 'baba') {
    playBabaFarewellVoice();
  }

  pavelFarewellAllowedThisDialogue = false;

  requestMouseLock();
}

function completedPourZoneCount() {
  return POUR_ZONES.filter(zone => zoneReadyForSequence(zone)).length;
}

function unpaidPourZoneCount() {
  return Math.max(0, completedPourZoneCount() - paidPourZoneCount);
}

function jobReadyForHandover() {
  // Pavel can now settle every completed map, not only the whole six-map object.
  return unpaidPourZoneCount() > 0;
}

function currentJobReward() {
  return Math.max(
    1200,
    1850 + qteHits * 25 - qteMisses * 70 - Math.round(wastedVolume * 40)
  );
}

async function loadDanceSource(url) {
  if (!npcDanceCache.has(url)) npcDanceCache.set(url, loadFBX(url));
  return npcDanceCache.get(url);
}

async function playPavelDance() {
  const rt = npcRuntime.get('pavel');
  if (!rt?.mixer || !rt.character) return;

  try {
    const url = PAVEL_DANCES[Math.floor(Math.random() * PAVEL_DANCES.length)];
    const source = await loadDanceSource(url);
    if (!source.animations?.length) return;

    const clip = retargetClip(rt.character, source.animations[0], `Pavel_Dance_${Date.now()}`);
    if (!clip.tracks.length) return;

    if (rt.busyAction) {
      rt.busyAction.stop();
      rt.busyAction = null;
    }
    rt.idleAction?.fadeOut(.15);

    const action = rt.mixer.clipAction(clip);
    rt.busyAction = action;
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = false;

    // Whatever random source dance was chosen, make the visible celebration
    // last the same ~6 seconds every time.
    action.setDuration(PAVEL_SUCCESS_DANCE_SECONDS);

    action.fadeIn(.12);
    action.play();

    // Voice and music belong to this exact success moment.
    playPavelSuccessMusic();
    playPavelSuccessDanceVoice();

    const onFinished = e => {
      if (e.action !== action) return;
      rt.mixer.removeEventListener('finished', onFinished);
      action.stop();
      stopPavelSuccessMusic(.10);
      rt.busyAction = null;
      rt.idleAction?.reset().fadeIn(.18).play();
    };
    rt.mixer.addEventListener('finished', onFinished);
  } catch (e) {
    console.warn('Pavel dance failed', e);
  }
}

function pavelDialogue() {
  if (jobState === 'accepted') {
    setDialogue(
      'ПАВЕЛ ПЕТРОВИЧ',
      'Нормально. Деньги получил? Если готов дальше — бери следующий квадрат.',
      [
        {
          label: 'Давай следующий.',
          action: () => {
            resetPourJob();
            setDialogue('ПАВЕЛ ПЕТРОВИЧ', 'Давай. Только без перелива.', [
              { label: 'Понял.', action: closeDialogue }
            ]);
          }
        },
        { label: 'Потом.', action: closeDialogue }
      ]
    );
    return;
  }

  setDialogue(
    'ПАВЕЛ ПЕТРОВИЧ',
    jobReadyForHandover() ? `Готовая карта есть. Сдаёшь? (+${unpaidPourZoneCount() * 500} ₽)` : 'Ну? Как там квадрат?',
    [
      {
        label: 'Я залился.',
        action: () => {
          if (!jobReadyForHandover()) {
            const done = POUR_ZONES.filter(z => zoneReadyForSequence(z)).length;
            const spill = surfaceSpillVolume();

            let worstZone = null;
            let worstScore = 2;
            for (const z of POUR_ZONES) {
              if (zoneReadyForSequence(z)) continue;
              const ratio = zoneVolume(z) / z.targetVolume;
              const level = zoneLevelStats(z);
              // Filled-but-unlevel zones are the most useful feedback.
              const score = ratio >= .985 ? level.score : -ratio;
              if (score < worstScore) {
                worstScore = score;
                worstZone = z;
              }
            }

            let note;
            if (spill > .015) {
              note = `Ещё бетон на плите лежит — ${spill.toFixed(2)} куба. Собери граблями.`;
            } else if (worstZone) {
              const ratio = zoneVolume(worstZone) / worstZone.targetVolume;
              const level = zoneLevelStats(worstZone);
              note = ratio < .985
                ? `Карта №${worstZone.id}: мало бетона — ${Math.round(ratio * 100)}%.`
                : `Карта №${worstZone.id}: слой кривой — ровность ${Math.round(level.score * 100)}%. Нужно ${Math.round(worstZone.levelRequired * 100)}%.`;
            } else {
              note = `Не гони. Готово ${done} из 6 карт.`;
            }
            setDialogue('ПАВЕЛ ПЕТРОВИЧ', note, [
              { label: 'Ладно.', action: closeDialogue }
            ]);
            return;
          }

          const completed = completedPourZoneCount();
          const unpaid = Math.max(0, completed - paidPourZoneCount);

          if (unpaid <= 0) {
            setDialogue('ПАВЕЛ ПЕТРОВИЧ', 'За готовые карты я уже рассчитался. Доделывай следующую.', [
              { label: 'Понял.', action: closeDialogue }
            ]);
            return;
          }

          const reward = unpaid * 500;
          addMoney(reward);
          paidPourZoneCount += unpaid;
          saveProgression();

          // A successful map settlement should not trigger Pavel's ordinary farewell.
          pavelFarewellAllowedThisDialogue = false;

          const allSixReady = completed >= POUR_ZONES.length;
          const spillsClean = surfaceSpillVolume() <= .015;

          if (allSixReady && spillsClean) {
            jobState = 'accepted';
            jobsCompleted++;
            saveProgression();
            playPavelDance();

            setDialogue(
              'ПАВЕЛ ПЕТРОВИЧ',
              `Все шесть принял. За ${unpaid} ${unpaid === 1 ? 'карту' : 'карты'} — ${reward.toLocaleString('ru-RU')} ₽. Объект закрыт.`,
              [
                { label: 'Спасибо.', action: closeDialogue },
                {
                  label: 'Давай следующий объект.',
                  action: () => {
                    resetPourJob();
                    setDialogue('ПАВЕЛ ПЕТРОВИЧ', 'Следующий такой же. Работай.', [
                      { label: 'Понял.', action: closeDialogue }
                    ]);
                  }
                }
              ]
            );
          } else {
            const lastPaid = paidPourZoneCount;
            setDialogue(
              'ПАВЕЛ ПЕТРОВИЧ',
              `Карту принял. +${reward.toLocaleString('ru-RU')} ₽. Рассчитано карт: ${lastPaid}/6.`,
              [
                { label: 'Дальше работаю.', action: closeDialogue }
              ]
            );
          }
        }
      },
      { label: 'Пойду доделаю.', action: closeDialogue }
    ]
  );
}

function mandarinDialogue() {
  const levels = [
    { cost: 700,  text: 'Чуть легче держать темп.' },
    { cost: 1600, text: 'Уже нормальная рабочая выносливость.' },
    { cost: 3200, text: 'Будешь почти без остановки работать.' },
  ];

  if (staminaLevel >= 3) {
    setDialogue('СЕРЁГА', 'Здарова трутень, ну что? По выносливости я тебе уже всё сделал.', [
      { label: 'Выход', action: closeDialogue }
    ]);
    return;
  }

  const next = levels[staminaLevel];
  setDialogue(
    'СЕРЁГА',
    'Здарова трутень, ну что?',
    [
      {
        label: `Прокачать выносливость — ${next.cost.toLocaleString('ru-RU')} ₽`,
        action: () => {
          if (money < next.cost) {
            setDialogue('СЕРЁГА', 'Бабок не хватает. Потом подойдёшь.', [
              { label: 'Выход', action: closeDialogue }
            ]);
            return;
          }
          money -= next.cost;
          staminaLevel++;
          staminaMax = 100 + staminaLevel * 15;
          stamina = staminaMax;
          saveEconomy();
          saveProgression();
          updateEconomyUI();

          setDialogue('СЕРЁГА', next.text, [
            { label: 'Выход', action: closeDialogue }
          ]);
        }
      },
      { label: 'Выход', action: closeDialogue }
    ]
  );
}

function georgeDialogue() {
  const levels = [
    { cost: 900,  mult: PUMP_RATE_MULT[1], text: 'Чуть подкрутил насос. Бетон пойдёт бодрее.' },
    { cost: 2200, mult: PUMP_RATE_MULT[2], text: 'Теперь подача уже серьёзная. Следи за переливом.' },
    { cost: 4800, mult: PUMP_RATE_MULT[3], text: 'Это максимум. Шланг теперь льёт очень быстро.' },
  ];

  if (pumpLevel >= 3) {
    setDialogue('GEORGE', 'Насос уже выкручен как надо. Быстрее — только проблемы искать.', [
      { label: 'Выход', action: closeDialogue }
    ]);
    return;
  }

  const next = levels[pumpLevel];
  const percent = Math.round((next.mult - 1) * 100);
  setDialogue('GEORGE', 'Могу разбавить бетон, но не просто так.', [
    {
      label: `Ускорить подачу +${percent}% — ${next.cost.toLocaleString('ru-RU')} ₽`,
      action: () => {
        if (money < next.cost) {
          playGeorgeNoMoneyVoice();

          setDialogue('GEORGE', 'Не хватает денег. Подкопи и приходи.', [
            { label: 'Выход', action: closeDialogue }
          ]);
          return;
        }
        money -= next.cost;
        pumpLevel++;

        // Resulting level 1/2/3 selects the matching recorded line.
        playGeorgeUpgradeVoice(pumpLevel);

        saveEconomy();
        saveProgression();
        updateEconomyUI();
        setDialogue('GEORGE', next.text, [
          { label: 'Выход', action: closeDialogue }
        ]);
      }
    },
    { label: 'Выход', action: closeDialogue }
  ]);
}

function openShopFromBaba() {
  dialogueOpen = false;
  dialogueNpcKey = null;
  dialogueEl.classList.add('hidden');

  openShop(true);
}

function babaDialogue() {
  setDialogue(
    'БАБА КАПА',
    'Ну? Чего тебе?',
    [
      { label: 'Покажи, что есть.', action: openShopFromBaba },
      { label: 'Ничего, я пошёл.', action: closeDialogue },
    ]
  );
}

function refreshDialogue() {
  if (!dialogueOpen) return;
  if (dialogueNpcKey === 'pavel') pavelDialogue();
  else if (dialogueNpcKey === 'mandarin') mandarinDialogue();
  else if (dialogueNpcKey === 'george') georgeDialogue();
  else if (dialogueNpcKey === 'baba') babaDialogue();
  else closeDialogue();
}

dialogueCloseEl.addEventListener('click', closeDialogue);

function updateEconomyUI() {
  moneyTextEl.textContent = `${money.toLocaleString('ru-RU')} ₽`;
  shopMoneyEl.textContent = `${money.toLocaleString('ru-RU')} ₽`;
}

const SHOP_CATALOG = {
  rewind: {
    name: 'Перемотка',
    desc: 'Напиток «Перемотка». Временно усиливает спринт.',
    kind: 'energy', price: 180, amount: 1,
  },
  beer: {
    name: 'Балтика 9',
    desc: 'Крепкая банка после тяжёлой смены.',
    kind: 'beer', price: 140, amount: 1,
  },
  samec: {
    name: 'Сигареты «Самец»',
    desc: 'Пачка · 20 сигарет.',
    kind: 'samec', price: 120, amount: 20,
  },
  belomor: {
    name: 'Сигареты «Беломор»',
    desc: 'Пачка · 20 сигарет.',
    kind: 'belomor', price: 150, amount: 20,
  },
  boots1: {
    name: 'Сапоги новичка',
    desc: 'Меньше вязнешь в свежем бетоне.',
    kind: 'boots1', price: 450, amount: 1,
  },
  boots2: {
    name: 'Сапоги бетонщика',
    desc: 'Увереннее ходишь по мокрой смеси.',
    kind: 'boots2', price: 1100, amount: 1,
  },
  boots3: {
    name: 'Мышеходы',
    desc: 'Легендарные сапоги Паши.',
    kind: 'boots3', price: 2400, amount: 1,
  },
};
let selectedShopProduct = 'rewind';

function selectShopProduct(productKey) {
  if (!SHOP_CATALOG[productKey]) return;
  selectedShopProduct = productKey;
  const p = SHOP_CATALOG[productKey];

  shopSelectedNameEl.textContent = p.name;
  shopSelectedDescEl.textContent = p.desc;
  shopSelectedPriceEl.textContent = `${p.price.toLocaleString('ru-RU')} ₽`;
  shopEl.querySelectorAll('[data-product]').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.product === productKey);
  });
  setShopPreviewModel(productKey);
}

function openShop(fromBaba = false) {
  if (shopOpen || resultOpen || dialogueOpen) return;

  shopOpenedFromBaba = !!fromBaba;
  shopOpen = true;
  pouring = false;
  if (document.pointerLockElement) document.exitPointerLock();
  shopEl.classList.remove('hidden');
  updateEconomyUI();
  selectShopProduct(selectedShopProduct || 'rewind');
}
function closeShop() {
  if (!shopOpen) return;

  const wasBabaShop = shopOpenedFromBaba;

  shopOpen = false;
  shopOpenedFromBaba = false;
  shopEl.classList.add('hidden');

  if (wasBabaShop) {
    playBabaFarewellVoice();
  }

  requestMouseLock();
}
function buyItem(kind, price, amount) {
  if (kind.startsWith('boots')) {
    const tier = Number.parseInt(kind.replace('boots', ''), 10);
    if (bootTier >= tier) {
      showToast('ЭТИ САПОГИ УЖЕ ЕСТЬ');
      return;
    }
    if (money < price) {
      const prev = shopMoneyEl.textContent;
      shopMoneyEl.textContent = 'НЕ ХВАТАЕТ ДЕНЕГ';
      setTimeout(() => updateEconomyUI(), 800);
      return;
    }
    money -= price;
    bootTier = tier;
    saveEconomy();
    saveProgression();
    updateEconomyUI();

    if (shopOpenedFromBaba) playBabaPurchaseVoice();

    showToast(['', 'САПОГИ НОВИЧКА', 'САПОГИ БЕТОНЩИКА', 'МЫШЕХОДЫ'][tier]);
    return;
  }

  if (money < price) {
    shopMoneyEl.textContent = 'НЕ ХВАТАЕТ ДЕНЕГ';
    setTimeout(() => updateEconomyUI(), 800);
    return;
  }
  money -= price;
  if (kind === 'samec' || kind === 'belomor' || kind === 'cigarettes') cigarettes += amount;
  if (kind === 'energy') energyCans += amount;
  if (kind === 'beer') beerCans += amount;
  saveEconomy();
  updateEconomyUI();

  if (shopOpenedFromBaba) playBabaPurchaseVoice();

  showToast('ПОКУПКА');
}
function openJobResult(title, text, buttonText) {
  resultOpen = true;
  if (document.pointerLockElement) document.exitPointerLock();
  jobResultTitleEl.textContent = title;
  jobResultTextEl.textContent = text;
  jobResultBtnEl.textContent = buttonText;
  jobResultEl.classList.remove('hidden');
  updateEconomyUI();
}
function closeJobResultAndReset() {
  resultOpen = false;
  jobResultEl.classList.add('hidden');
  resetPourJob();
  requestMouseLock();
}

shopCloseEl.addEventListener('click', closeShop);
shopEl.querySelectorAll('[data-product]').forEach(btn => {
  btn.addEventListener('click', () => selectShopProduct(btn.dataset.product));
});
shopBuyEl.addEventListener('click', () => {
  const p = SHOP_CATALOG[selectedShopProduct];
  if (p) buyItem(p.kind, p.price, p.amount);
});
jobResultBtnEl.addEventListener('click', closeJobResultAndReset);
updateEconomyUI();

function worldPos(obj) { return obj.getWorldPosition(new THREE.Vector3()); }

const interactionRaycaster = new THREE.Raycaster();
const interactionNDC = new THREE.Vector2(0, 0);
const interactionCamPos = new THREE.Vector3();
const interactionCamDir = new THREE.Vector3();
const interactionAimPoint = new THREE.Vector3();
const interactionAimVec = new THREE.Vector3();

function rakePickupAimOK(it) {
  if (!it?.bounds) return false;
  camera.getWorldPosition(interactionCamPos);
  camera.getWorldDirection(interactionCamDir).normalize();
  // Aim at the closest point of the real rake bbox, not at the base or pivot.
  interactionAimPoint.copy(interactionCamPos);
  interactionAimPoint.x = THREE.MathUtils.clamp(interactionCamPos.x, it.bounds.min.x, it.bounds.max.x);
  interactionAimPoint.y = THREE.MathUtils.clamp(interactionCamPos.y, it.bounds.min.y, it.bounds.max.y);
  interactionAimPoint.z = THREE.MathUtils.clamp(interactionCamPos.z, it.bounds.min.z, it.bounds.max.z);
  // If the camera is outside the box, use its centre when the closest point collapses onto us.
  if (interactionAimPoint.distanceToSquared(interactionCamPos) < 1e-5) it.bounds.getCenter(interactionAimPoint);
  interactionAimVec.copy(interactionAimPoint).sub(interactionCamPos);
  const dist = interactionAimVec.length();
  if (dist > (it.radius || 3.35) + .45 || dist < .01) return false;
  interactionAimVec.multiplyScalar(1 / dist);
  // ~18 degree cone: still requires looking at the rake, but does not demand a pixel-perfect
  // hit on the 4 cm handle.
  return interactionCamDir.dot(interactionAimVec) >= 0.951;
}

function pickupIsUnderCrosshair(it) {
  if (!it || !it.requiresLook) return true;
  const target = it.source || it.rakeSource || null;
  if (!target || !target.visible) return false;

  interactionRaycaster.setFromCamera(interactionNDC, camera);
  interactionRaycaster.near = 0;
  interactionRaycaster.far = Math.max(0.5, (it.radius || 2.0) + .55);

  // Thin props (especially the rake handle/head) can be one-sided. A raycast from
  // the back then returns no triangle hit even though the crosshair is visually on
  // the object. First test a very slightly padded *actual world bbox*; this still
  // requires looking directly at the object, but is robust from either side.
  if (it.bounds) {
    const pad = it.kind === 'rakePickup' ? 0.22 : 0.07;
    const aimBox = it.bounds.clone().expandByScalar(pad);
    const hitPoint = new THREE.Vector3();
    if (interactionRaycaster.ray.intersectBox(aimBox, hitPoint)) {
      const camPos = camera.getWorldPosition(new THREE.Vector3());
      if (camPos.distanceTo(hitPoint) <= interactionRaycaster.far) return true;
    }
    if (it.kind === 'rakePickup' && rakePickupAimOK(it)) return true;
  }

  const hits = interactionRaycaster.intersectObject(target, true);
  if (hits.some(hit => hit.distance <= interactionRaycaster.far)) return true;
  return it.kind === 'rakePickup' ? rakePickupAimOK(it) : false;
}

function nearestInteractive() {
  let best = null, bd = Infinity;
  const pp = new THREE.Vector3(playerPos.x, groundHeightAt(playerPos.x, playerPos.z) + 1.0, playerPos.z);
  for (const it of interactive) {
    let d;
    if (it.bounds) {
      // Distance to authored item's actual horizontal footprint, not its tall/low centre.
      const cx = THREE.MathUtils.clamp(pp.x, it.bounds.min.x, it.bounds.max.x);
      const cz = THREE.MathUtils.clamp(pp.z, it.bounds.min.z, it.bounds.max.z);
      const dx = pp.x - cx;
      const dz = pp.z - cz;
      d = Math.hypot(dx, dz);
    } else {
      d = worldPos(it.obj).distanceTo(pp);
    }
    if (d < it.radius && d < bd) {
      // Physical pickups only become available when the crosshair is actually
      // over their authored mesh. Being merely nearby is not enough.
      if (!pickupIsUnderCrosshair(it)) continue;
      best = it;
      bd = d;
    }
  }
  return best;
}

function smokeCigarette() {
  if (!started || specialMode) return;
  if (cigarettes <= 0) { showToast('Сигареты закончились.'); return; }
  if (!armsReady) { showToast('FPS-руки ещё загружаются…'); return; }
  cigarettes--;
  saveEconomy();
  specialMode = 'smoke';
  specialTimer = startProceduralSpecial('smoke');
  cigaretteVM.visible = !!cigaretteProp;
  lighterVM.visible = !!lighterProp;
  stamina = Math.min(staminaMax, stamina + 8);
  showToast('Закурил.');
}
function drinkEnergy() {
  if (!started || specialMode) return;
  if (energyCans <= 0) { showToast('«Перемотка» закончилась.'); return; }
  if (!armsReady) { showToast('FPS-руки ещё загружаются…'); return; }
  energyCans--;
  saveEconomy();
  specialMode = 'drink';
  specialTimer = startProceduralSpecial('drink');
  energyVM.visible = !!energyProp;
  energyBoost = 100;
  showToast('Перемотка: спринт усилен.');
}
function drinkBeer() {
  if (!started || specialMode) return;
  if (beerCans <= 0) { showToast('Пиво закончилось.'); return; }
  if (!armsReady) { showToast('FPS-руки ещё загружаются…'); return; }
  beerCans--;
  saveEconomy();
  specialMode = 'beer';
  specialTimer = startProceduralSpecial('beer');
  beerVM.visible = !!beerProp;
  showToast('Балтика 9.');
}
function finishSpecial() {
  specialMode = null;
  specialTimer = 0;
  cigaretteVM.visible = false;
  energyVM.visible = false;
  beerVM.visible = false;
  lighterVM.visible = false;
  proceduralSpecialElapsed = 0;
  proceduralSpecialDuration = 0;
  // Never make the normal FPS player model disappear.
  armsRig.visible = armsReady;
  resumePlayerIdle();

  restoreRakeAfterSpecial();
}
function updateFirstPersonProps(dt) {
  if (armsMixer && !propTuneMode) armsMixer.update(dt);

  // Persistent first-person hands/body outside the explicit rake preview in F4.
  if (!propTuneMode && armsReady && !armsRig.visible) {
    armsRig.visible = true;
  }
  if (!propTuneMode && !specialMode && armsReady) {
    setPlayerLocomotion(playerMovingNow, playerSprintingNow);
  }

  if (propTuneMode) {
    const name = currentTuneProp();
    if (name === 'cigarette' && cigaretteProp) {
      followBoneWithProp(cigaretteVM, rightIndexBone || rightHandBone, propConfigs.cigarette.pos, propConfigs.cigarette.quat);
    } else if (name === 'lighter' && lighterProp) {
      followBoneWithProp(lighterVM, leftHandBone, propConfigs.lighter.pos, propConfigs.lighter.quat);
    } else if (name === 'energy' && energyProp) {
      followBoneWithProp(energyVM, leftHandBone, propConfigs.energy.pos, propConfigs.energy.quat);
    } else if (name === 'beer' && beerProp) {
      followBoneWithProp(beerVM, leftHandBone, propConfigs.beer.pos, propConfigs.beer.quat);
    }
    return;
  }

  if (!specialMode) return;
  specialTimer -= dt;
  proceduralSpecialElapsed += dt;
  if (specialTimer <= 0) { finishSpecial(); return; }

  const procT = proceduralSpecialDuration > 0
    ? THREE.MathUtils.clamp(proceduralSpecialElapsed / proceduralSpecialDuration, 0, 1)
    : 0;

  // Apply the body pose AFTER AnimationMixer.update(). No FBX special Action exists.
  if (specialMode === 'smoke') {
    applyProceduralSmokePose(procT);
  } else if (specialMode === 'drink') {
    applyProceduralDrinkPose(procT, false);
  } else if (specialMode === 'beer') {
    applyProceduralDrinkPose(procT, true);
  }

  // Props follow the procedurally posed hands/fingers.
  if (specialMode === 'smoke' && cigaretteProp) {
    followBoneWithProp(cigaretteVM, rightIndexBone || rightHandBone, propConfigs.cigarette.pos, propConfigs.cigarette.quat);
    if (lighterProp && lighterVM.visible) {
      followBoneWithProp(lighterVM, leftHandBone, propConfigs.lighter.pos, propConfigs.lighter.quat);
    }
  } else if (specialMode === 'drink' && energyProp) {
    followBoneWithProp(energyVM, leftHandBone, propConfigs.energy.pos, propConfigs.energy.quat);
    procTiltQ.setFromEuler(new THREE.Euler(0, 0, .35 * procPulse(procT, .52, .32)));
    energyVM.quaternion.multiply(procTiltQ);
  } else if (specialMode === 'beer' && beerProp) {
    followBoneWithProp(beerVM, leftHandBone, propConfigs.beer.pos, propConfigs.beer.quat);
    procTiltQ.setFromEuler(new THREE.Euler(0, 0, .48 * procPulse(procT, .52, .34)));
    beerVM.quaternion.multiply(procTiltQ);
  }
}

function interact() {
  let it = nearestInteractive();
  if (!it && !rakeOwned) {
    // Last-resort authored-rake check. This intentionally ignores triangle sidedness/pivots:
    // close + looking toward its real world bbox is enough.
    let bestRake = null;
    let bestDist = Infinity;
    for (const r of rakePickupInteractions) {
      if (!rakePickupAimOK(r)) continue;
      const cx = THREE.MathUtils.clamp(playerPos.x, r.bounds.min.x, r.bounds.max.x);
      const cz = THREE.MathUtils.clamp(playerPos.z, r.bounds.min.z, r.bounds.max.z);
      const d = Math.hypot(playerPos.x - cx, playerPos.z - cz);
      if (d < 3.0 && d < bestDist) { bestRake = r; bestDist = d; }
    }
    it = bestRake;
  }
  if (!it) return;

  if (it.kind === 'hose') {
    if (!hoseHeld && rakeEquipped) setRakeEquipped(false);

    if (hoseHeld) {
      // Dropping the hose does not touch the pump switch. If it was ON, the
      // hose keeps pouring on the ground until recovered.
      hoseHeld = false;
      if (hoseInteraction) hoseInteraction.text = pouring
        ? 'E — взять шланг · БЕТОН ЛЬЁТСЯ!'
        : 'E — взять шланг';
      showToast(pouring
        ? 'ШЛАНГ ОТПУЩЕН — БЕТОН ПРОДОЛЖАЕТ ЛИТЬСЯ'
        : 'Шланг отпущен.');
    } else {
      hoseHeld = true;
      if (hoseInteraction) hoseInteraction.text = pouring
        ? 'E — бросить шланг · ЛКМ — выключить бетон'
        : 'E — бросить шланг · ЛКМ — включить бетон';
      showToast(pouring
        ? 'ШЛАНГ ПОДОБРАН · ПОДАЧА БЕТОНА УЖЕ ВКЛ'
        : 'Шланг в руках. ЛКМ — подача бетона.');
    }
    return;
  }

  if (it.kind === 'rakePickup') {
    pickupRake(it.rakeSource || null);
    return;
  }

  if (it.kind === 'worldPickup') {
    pickupWorldItem(it);
    return;
  }

  if (it.kind === 'shop') {
    openShop();
    return;
  }

  if (it.kind === 'npc') {
    openDialogue(it.npcKey);
  }
}
function currentZone() {
  for (const z of zones) if (Math.abs(playerPos.x - z.x) < z.w / 2 && Math.abs(playerPos.z - z.z) < z.d / 2) return z.name;
  return 'Двор стройплощадки';
}

function drawMap() {
  if (!mapVisible) return;
  const g = mapCtx, W = minimap.width, H = minimap.height;
  g.clearRect(0, 0, W, H);
  g.fillStyle = '#151714dd';
  g.fillRect(0, 0, W, H);

  const minX = -36, maxX = 36, minZ = -53, maxZ = 26;
  const tx = x => (x - minX) / (maxX - minX) * W;
  const tz = z => H - (z - minZ) / (maxZ - minZ) * H;

  // Site ground
  g.fillStyle = '#686a63';
  g.fillRect(tx(-32), tz(23.36), tx(32) - tx(-32), tz(-50.45) - tz(23.36));
  g.strokeStyle = '#8d958f';
  g.lineWidth = 2;
  g.strokeRect(tx(-32), tz(23.36), tx(32) - tx(-32), tz(-50.45) - tz(23.36));

  // Pour slab + six recessed bays between column rows.
  g.fillStyle = '#a3a59e';
  g.fillRect(
    tx(SLAB.minX), tz(SLAB.maxZ),
    tx(SLAB.maxX) - tx(SLAB.minX),
    tz(SLAB.minZ) - tz(SLAB.maxZ)
  );

  for (const zone of POUR_ZONES) {
    const zr = zoneVolume(zone) / zone.targetVolume;
    g.fillStyle = zr >= zone.successRatio ? '#777d72' : '#4d514f';
    g.fillRect(
      tx(zone.minX), tz(zone.maxZ),
      tx(zone.maxX) - tx(zone.minX),
      tz(zone.minZ) - tz(zone.maxZ)
    );
    g.strokeStyle = '#b0b3aa';
    g.lineWidth = 1;
    g.strokeRect(
      tx(zone.minX), tz(zone.maxZ),
      tx(zone.maxX) - tx(zone.minX),
      tz(zone.minZ) - tz(zone.maxZ)
    );
  }

  // Recoverable accidental concrete on the solid slab.
  g.fillStyle = '#69726d';
  for (const p of spillClumps) {
    if (p.volume <= .001) continue;
    g.beginPath();
    g.arc(
      tx(p.x),
      tz(p.z),
      THREE.MathUtils.clamp(p.radius * .65, 2, 7),
      0, Math.PI * 2
    );
    g.fill();
  }

  // Pump footprint
  g.fillStyle = '#d1b85c';
  g.fillRect(tx(-14), tz(-4.6), tx(4.7) - tx(-14), tz(-38.9) - tz(-4.6));

  // Hose end
  if (hosePoints.length) {
    const hp = hosePoints[HOSE_SEGMENTS];
    g.fillStyle = hoseHeld ? '#f1dd5b' : '#262927';
    g.beginPath();
    g.arc(tx(hp.x), tz(hp.z), 3, 0, Math.PI * 2);
    g.fill();
  }

  // Player
  g.fillStyle = '#e8db68';
  g.beginPath();
  g.arc(tx(playerPos.x), tz(playerPos.z), 4, 0, Math.PI * 2);
  g.fill();
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
  g.strokeStyle = '#e8db68';
  g.beginPath();
  g.moveTo(tx(playerPos.x), tz(playerPos.z));
  g.lineTo(tx(playerPos.x + fx * 3), tz(playerPos.z + fz * 3));
  g.stroke();

  g.fillStyle = '#d9dbd2';
  g.font = '10px system-ui';
  g.fillText('ОБЪЕКТ №17', 8, 14);
}

const clock = new THREE.Clock();
let mobilePerfTimer=0, mobileFrameCounter=0, mobileFpsFrames=0, mobileFpsAccum=0;
function updateMobileRenderBudget(dt){
  if(!TOUCH_DEVICE)return;
  mobilePerfTimer+=dt; mobileFpsFrames++; mobileFpsAccum+=dt;
  if(mobilePerfTimer<3.0)return;
  const fps=mobileFpsFrames/Math.max(.001,mobileFpsAccum);
  let next=mobileRenderScale;
  if(fps<42) next=Math.max(.68,mobileRenderScale-.08);
  else if(fps>56) next=Math.min(.88,mobileRenderScale+.04);
  if(Math.abs(next-mobileRenderScale)>.001){
    mobileRenderScale=next;
    renderer.setPixelRatio(Math.min(devicePixelRatio,mobileRenderScale));
    renderer.setSize(innerWidth,innerHeight,false);
  }
  mobilePerfTimer=0; mobileFpsFrames=0; mobileFpsAccum=0;
}
function loop() {
  const dt = Math.min(clock.getDelta(), .05);
  updateMobileRenderBudget(dt);
  for (const mixer of npcMixers) mixer.update(dt);

  if (started) {
    const inputBlocked = shopOpen || resultOpen || dialogueOpen;
    const kbForward = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
    const kbStrafe = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    const forwardInput = inputBlocked ? 0 : THREE.MathUtils.clamp(kbForward - mobileMoveY, -1, 1);
    const strafeInput = inputBlocked ? 0 : THREE.MathUtils.clamp(kbStrafe + mobileMoveX, -1, 1);
    if (TOUCH_DEVICE && !inputBlocked && !qteActive) {
      yaw -= mobileLookX * dt * 2.35;
      pitch -= mobileLookY * dt * 1.95;
      pitch = THREE.MathUtils.clamp(pitch, -FPS_PITCH_LIMIT, FPS_PITCH_LIMIT);
    }

    // Direct yaw-based vectors. This does not depend on camera interpolation and cannot flip
    // direction as the previous third-person implementation did.
    const moveYaw = debugMode ? debugYaw : yaw;
    moveForward.set(-Math.sin(moveYaw), 0, -Math.cos(moveYaw));
    moveRight.set(Math.cos(moveYaw), 0, -Math.sin(moveYaw));
    moveWorld.set(0, 0, 0)
      .addScaledVector(moveForward, forwardInput)
      .addScaledVector(moveRight, strafeInput);
    if (moveWorld.lengthSq() > 1) moveWorld.normalize();

    const moving = moveWorld.lengthSq() > .0001;
    const sprint = !!(keys.ShiftLeft || keys.ShiftRight) || (TOUCH_DEVICE && Math.hypot(mobileMoveX,mobileMoveY) > .82);
    playerMovingNow = moving;
    playerSprintingNow = sprint;
    let speed = 3.35;
    if (sprint && stamina > 1 && moving) {
      speed = energyBoost > 0 ? 6.7 : 5.25;
      stamina = Math.max(0, stamina - dt * (energyBoost > 0 ? 8 : 13));
    } else {
      stamina = Math.min(staminaMax, stamina + dt * (9.5 + staminaLevel * .75));
    }

    // Wet concrete grips the boots. Near finished depth movement falls to ~40%;
    // through an over-height mound it can drop to ~28%.
    const concreteSlow = concreteMovementFactor(playerPos.x, playerPos.z);
    speed *= concreteSlow;

    if (moving) moveAxis(moveWorld.x * speed * dt, moveWorld.z * speed * dt);
    updateFootstepAudio(dt, moving, sprint);
    if (energyBoost > 0) energyBoost = Math.max(0, energyBoost - dt * 9.2);

    if (moving) {
      const bobSpeed = (sprint ? 12.5 : 9.0) * Math.max(.55, concreteMovementFactor(playerPos.x, playerPos.z));
      walkBobPhase += dt * bobSpeed;
      const bobAmpY = sprint ? 0.042 : 0.028;
      const bobAmpX = sprint ? 0.018 : 0.012;
      const bobRollAmp = sprint ? 0.013 : 0.008;
      const bobPitchAmp = sprint ? 0.007 : 0.0045;
      walkBobY = Math.abs(Math.sin(walkBobPhase)) * bobAmpY;
      walkBobX = Math.sin(walkBobPhase * 0.5) * bobAmpX;
      walkBobRoll = Math.sin(walkBobPhase * 0.5) * bobRollAmp;
      walkBobPitch = Math.cos(walkBobPhase) * bobPitchAmp;
    } else {
      walkBobPhase = 0;
      walkBobX = THREE.MathUtils.damp(walkBobX, 0, 10, dt);
      walkBobY = THREE.MathUtils.damp(walkBobY, 0, 10, dt);
      walkBobRoll = THREE.MathUtils.damp(walkBobRoll, 0, 12, dt);
      walkBobPitch = THREE.MathUtils.damp(walkBobPitch, 0, 12, dt);
    }

    syncCameraToPlayer();
    syncPlayerBodyToWorld();
    if (debugMode) syncDebugCamera();
    updateFirstPersonProps(dt);
    updateCigaretteSmoke(dt);
    updateRake(dt);
    updatePourAudio();
    updateMachineAudio();
    updatePhysicalHose(dt);
    updateActivePourOutline(dt);

    const it = nearestInteractive();
    promptEl.textContent = it ? it.text : '';
    zoneLabel.textContent = currentZone();
  } else {
    syncCameraToPlayer();
    syncPlayerBodyToWorld();
    updateCigaretteSmoke(dt);
    stopPourAudio();
  }

  renderHotbar3DPreviews(dt);

  staminaBar.style.width = `${Math.min(100, stamina / staminaMax * 100)}%`; staminaText.textContent = Math.round(stamina);
  energyBar.style.width = `${energyBoost}%`; energyText.textContent = Math.round(energyBoost);
  smokeCountEl.textContent = `${cigarettes}`;
  drinkCountEl.textContent = `${energyCans}`;
  beerCountEl.textContent = `${beerCans}`;
  smokeStateEl.textContent = specialMode === 'smoke' ? 'КУРИШЬ' : 'ЗАКУРИТЬ';
  drinkStateEl.textContent = specialMode === 'drink' ? 'ПЬЁШЬ' : 'ПЕРЕМОТКА';
  beerStateEl.textContent = specialMode === 'beer' ? 'ПЬЁШЬ' : 'БАЛТИКА 9';
  const staminaPctSafe = Math.min(100, stamina / staminaMax * 100);
  document.body.classList.toggle('showStamina', staminaPctSafe < 99.4);
  document.body.classList.toggle('showBoost', energyBoost > .5);
  hotbarSmokeSlotEl.classList.toggle('active', specialMode === 'smoke');
  hotbarDrinkSlotEl.classList.toggle('active', specialMode === 'drink');
  hotbarBeerSlotEl.classList.toggle('active', specialMode === 'beer');
  hotbarRakeSlotEl.classList.toggle('active', rakeEquipped);
  hotbarSmokeSlotEl.classList.toggle('empty', cigarettes <= 0);
  hotbarDrinkSlotEl.classList.toggle('empty', energyCans <= 0);
  hotbarBeerSlotEl.classList.toggle('empty', beerCans <= 0);
  hotbarRakeSlotEl.classList.toggle('locked', !rakeOwned);
  rakeHotbarStateEl.textContent = !rakeOwned ? '—' : (rakeEquipped ? '●' : '✓');
  updateEconomyUI();
  updatePourHUD();
  if (toastTimer > 0) {
    toastTimer -= dt;
    if (toastTimer <= 0) toastEl.classList.remove('show');
  }
  drawMap();
  updateSunShadowFollow();
  if (TOUCH_DEVICE) {
    // Update soft sun shadows every other frame on mobile; direction is unchanged and this
    // halves the most expensive extra scene render while keeping visible quality stable.
    mobileFrameCounter++;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = (mobileFrameCounter & 1) === 0;
  }
  if (debugMode) {
    renderer.render(scene, debugCamera);
  } else if (TOUCH_DEVICE) {
    camera.layers.set(0);
    renderer.render(scene, camera);
  } else {
    camera.layers.set(0);
    renderPass.camera = camera;
    composer.render(dt);
  }

  // Dedicated FPS rake pass.
  // World depth is cleared so the tool always stays visible, but the rake has
  // its own depthTest/depthWrite, so its rear faces can no longer overdraw its
  // front faces and fake transparency.
  if (!debugMode && rakeEquipped && !rakeHiddenBySpecial && rakeVM.visible) {
    // IMPORTANT:
    // The world/composer has already rendered the color buffer.
    // A normal renderer.render() with autoClear=true would wipe that color
    // buffer again and leave only the gray background + rake.
    //
    // For the FPS rake pass we keep the existing color, clear DEPTH only,
    // then render layer 2 with autoClear temporarily disabled.
    const prevAutoClear = renderer.autoClear;
    const prevBackground = scene.background;

    // Even with autoClear disabled, Three's scene background can still take
    // part in the second pass. Remove it temporarily so the already-rendered
    // world color buffer can never be replaced by the gray scene background.
    renderer.autoClear = false;
    scene.background = null;
    renderer.clearDepth();

    camera.layers.set(RAKE_VIEWMODEL_LAYER);
    renderer.render(scene, camera);
    camera.layers.set(0);

    scene.background = prevBackground;
    renderer.autoClear = prevAutoClear;
  }

  if (shopOpen) {
    shopPreviewSpin += dt * .78;
    shopPreviewRoot.rotation.y = shopPreviewSpin;
    shopPreviewRenderer?.render(shopPreviewScene, shopPreviewCamera);
  }
  requestAnimationFrame(loop);
}
loop();
