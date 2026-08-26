import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBB } from 'three/addons/math/OBB.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';




const mount = document.querySelector('#game');
const start = document.querySelector('#start');
const startBtn = document.querySelector('#startBtn');
const loadState = document.querySelector('#loadState');
const menuLoadingSpinner = document.querySelector('#menuLoadingSpinner');
const bootRetryBtn = document.querySelector('#bootRetryBtn');




// v49.1: if any runtime exception stops scene initialization, show it directly
// on the loading screen instead of leaving the user with an endless "loading".
function showFatalRuntimeError(message) {
  console.error('[FATAL RUNTIME]', message);
  if (!loadState) return;
  loadState.textContent = 'ОШИБКА: ' + String(message);
  menuLoadingSpinner?.classList.add('isError');
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
const qtePerfectFeedbackEl = document.querySelector('#qtePerfectFeedback');
const eventAlarmEl = document.querySelector('#eventAlarm');
const eventAlarmTitleEl = document.querySelector('#eventAlarmTitle');
const eventAlarmTextEl = document.querySelector('#eventAlarmText');
const blindnessOverlayEl = document.querySelector('#blindnessOverlay');
const settlementCutsceneEl = document.querySelector('#settlementCutscene');
const settlementRankCardEl = document.querySelector('#settlementRankCard');
const settlementRankTextEl = document.querySelector('#settlementRankText');
const settlementRankCaptionEl = document.querySelector('#settlementRankCaption');
const settlementRankRewardEl = document.querySelector('#settlementRankReward');
const settlementRankOverrideEl = document.querySelector('#settlementRankOverride');
const settlementStatsCardEl = document.querySelector('#settlementStatsCard');
const settlementStatsGradeEl = document.querySelector('#settlementStatsGrade');
const settlementStatsMapsEl = document.querySelector('#settlementStatsMaps');
const settlementStatsFillEl = document.querySelector('#settlementStatsFill');
const settlementStatsLevelEl = document.querySelector('#settlementStatsLevel');
const settlementStatsOverpourEl = document.querySelector('#settlementStatsOverpour');
const settlementStatsQteEl = document.querySelector('#settlementStatsQte');
const settlementStatsRewardEl = document.querySelector('#settlementStatsReward');
const taskTrackerEl = document.querySelector('#taskTracker');
const taskTrackerStepEl = document.querySelector('#taskTrackerStep');
const taskTrackerIconEl = document.querySelector('#taskTrackerIcon');
const taskTrackerTitleEl = document.querySelector('#taskTrackerTitle');
const taskTrackerDetailEl = document.querySelector('#taskTrackerDetail');
const taskTrackerFillEl = document.querySelector('#taskTrackerFill');
let settlementRankSheetPreload = null;
function preloadSettlementRankSheet() {
  if (settlementRankSheetPreload) return settlementRankSheetPreload;
  settlementRankSheetPreload = new Image();
  settlementRankSheetPreload.decoding = 'async';
  settlementRankSheetPreload.src = './assets/ui/pour_rank_sheet.png';
  return settlementRankSheetPreload;
}
const shopEl = document.querySelector('#shop');
const shopMoneyEl = document.querySelector('#shopMoney');
const mobileInteractBtn = document.querySelector('#mobileInteract');
const mobileActionBtn = document.querySelector('#mobileAction');
const mobileWorldActionsEl = document.querySelector('#mobileWorldActions');
const mobileHudEl = document.querySelector('#mobileHud');
const mobileFillPercentEl = document.querySelector('#mobileFillPercent');
const mobileLevelPercentEl = document.querySelector('#mobileLevelPercent');
const mobileStaminaFillEl = document.querySelector('#mobileStaminaFill');
const mobileStaminaTextEl = document.querySelector('#mobileStaminaText');
const mobileMoneyEl = document.querySelector('#mobileMoney');
const mobileMoneyTextEl = document.querySelector('#mobileMoneyText');
const mobileSmokeCountEl = document.querySelector('#mobileSmokeCount');
const mobileDrinkCountEl = document.querySelector('#mobileDrinkCount');
const mobileBeerCountEl = document.querySelector('#mobileBeerCount');
const mobileRakeStateEl = document.querySelector('#mobileRakeState');
const mobileSmokeSlotEl = document.querySelector('#mobileSmokeSlot');
const mobileDrinkSlotEl = document.querySelector('#mobileDrinkSlot');
const mobileBeerSlotEl = document.querySelector('#mobileBeerSlot');
const mobileRakeSlotEl = document.querySelector('#mobileRakeSlot');
const mobileToastEl = document.querySelector('#mobileToast');
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
const characterStatsEl = document.querySelector('#characterStats');
const characterStatsButtonEl = document.querySelector('#characterStatsButton');
const mobileCharacterStatsButtonEl = document.querySelector('#mobileCharacterStatsButton');
const characterStatsCloseEl = document.querySelector('#characterStatsClose');
const statJobsEl = document.querySelector('#statJobs');
const statConcreteEl = document.querySelector('#statConcrete');
const statFloorEl = document.querySelector('#statFloor');
const statRakeEl = document.querySelector('#statRake');
const statMoneyEl = document.querySelector('#statMoney');
const statEnergyEl = document.querySelector('#statEnergy');
const statBeerEl = document.querySelector('#statBeer');
const statCigarettesEl = document.querySelector('#statCigarettes');
const statPerfectQteEl = document.querySelector('#statPerfectQte');
const statBootsEl = document.querySelector('#statBoots');
const statStaminaLevelEl = document.querySelector('#statStaminaLevel');
const statConcreteGradeEl = document.querySelector('#statConcreteGrade');
const dialogueEl = document.querySelector('#dialogue');
const dialoguePortraitEl = document.querySelector('#dialoguePortrait');
const dialogueNameEl = document.querySelector('#dialogueName');
const dialogueTextEl = document.querySelector('#dialogueText');
const dialogueOptionsEl = document.querySelector('#dialogueOptions');
const dialogueCloseEl = document.querySelector('#dialogueClose');
const economyEl = document.querySelector('#economy');
const mapCtx = minimap.getContext('2d');
minimap.style.display = 'none';




// Mobile/browser profile. Desktop loads the exact FINAL export without texture downscaling.
// Mobile uses a separate memory profile; weak devices automatically retry with SAFE textures.
const TOUCH_DEVICE = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
const MOBILE_BOOT_STAGE_KEY = 'beton_mobile_boot_stage_v5120';
const MOBILE_BOOT_TIME_KEY = 'beton_mobile_boot_time_v5120';
const MOBILE_DEBUG_LOG_KEY = 'beton_mobile_debug_log_v5120';
const mobileUrlParams = new URLSearchParams(location.search);
const forceFullMobile = mobileUrlParams.has('fullmobile');
// Default phone build is the LITE glTF.  ?fullmobile is kept only as an explicit
// visual QA switch; recovery strips it so a weak iPhone cannot reload-crash forever.
const MOBILE_LITE_MODE = TOUCH_DEVICE && !forceFullMobile;
const MOBILE_SAFE_MODE = MOBILE_LITE_MODE; // compatibility alias for older gameplay branches
const FINAL_SCENE_URL = TOUCH_DEVICE
  ? (MOBILE_LITE_MODE ? './assets/FINAL_MOBILE_LITE.gltf?v=51.127' : './assets/FINAL_MOBILE.gltf?v=51.127')
  : './assets/FINAL.gltf?v=51.127';
function getViewportSize() {
  const helper = window.__betonViewport;
  if (helper?.size) return helper.size();
  const vv = window.visualViewport;
  const width = Math.max(1, Math.round(vv?.width || innerWidth || document.documentElement.clientWidth || 1));
  const height = Math.max(1, Math.round(vv?.height || innerHeight || document.documentElement.clientHeight || 1));
  return { width, height };
}
const MOBILE_LANDSCAPE = () => {
  const v = getViewportSize();
  return TOUCH_DEVICE && v.width > v.height;
};
document.documentElement.classList.toggle('touchDevice', TOUCH_DEVICE);
document.documentElement.classList.toggle('mobileSafeMode', MOBILE_LITE_MODE);
// Do not retain huge .bin/image payloads in the Three.js global file cache on phones.
THREE.Cache.enabled = !TOUCH_DEVICE;




const mobileDebugLines = [];
function mobileDebugLog(message) {
  if (!TOUCH_DEVICE) return;
  const line = `${new Date().toISOString().slice(11,19)} ${String(message)}`;
  mobileDebugLines.push(line);
  if (mobileDebugLines.length > 80) mobileDebugLines.splice(0, mobileDebugLines.length - 80);
  try { localStorage.setItem(MOBILE_DEBUG_LOG_KEY, mobileDebugLines.join('\n')); } catch (_) {}
  const panel = document.querySelector('#mobileDebugPanel');
  if (panel) panel.textContent = mobileDebugLines.join('\n');
}
function mobileDebugStage(stage) {
  if (!TOUCH_DEVICE) return;
  try {
    localStorage.setItem(MOBILE_BOOT_STAGE_KEY, stage);
    localStorage.setItem(MOBILE_BOOT_TIME_KEY, String(Date.now()));
  } catch (_) {}
  mobileDebugLog(`stage: ${stage}`);
}
function buildMobileDebugReport() {
  let glInfo = 'webgl: pending';
  try {
    const gl = renderer?.getContext?.();
    const ext = gl?.getExtension?.('WEBGL_debug_renderer_info');
    if (gl && ext) glInfo = `gpu: ${gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)}`;
    else if (gl) glInfo = `webgl: ${gl.getParameter(gl.VERSION)}`;
  } catch (_) {}
  return [
    'BETONSHCHIK MOBILE DEBUG v51.130',
    `safe=${MOBILE_SAFE_MODE} scene=${FINAL_SCENE_URL}`,
    `screen=${innerWidth}x${innerHeight} dpr=${devicePixelRatio}`,
    `staticGeomCPUReleased=${(mobileStaticGeometryReleasedBytes / (1024 * 1024)).toFixed(1)} MiB`,
    `ua=${navigator.userAgent}`,
    glInfo,
    '',
    ...mobileDebugLines,
  ].join('\n');
}
if (TOUCH_DEVICE) {
  try {
    const old = localStorage.getItem(MOBILE_DEBUG_LOG_KEY);
    if (old) mobileDebugLines.push(...old.split('\n').slice(-20));
  } catch (_) {}
  mobileDebugStage('boot');
  window.addEventListener('error', e => mobileDebugLog(`ERROR ${e.message || e.type} @${e.filename || ''}:${e.lineno || ''}`));
  window.addEventListener('unhandledrejection', e => mobileDebugLog(`PROMISE ${e.reason?.message || e.reason || 'rejected'}`));
}




let started = false;
let locked = false;
let assetsLoaded = 0;
let assetsFailed = 0;
const TOTAL_ASSETS = 1;
if (startBtn) { startBtn.disabled = true; startBtn.setAttribute('aria-disabled','true'); }
let sceneReady = false;
let sceneRecoveryPending = false;
let sceneMissingTimer = 0;
const SCENE_RETRY_KEY = 'beton_scene_retry_v536';




const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d0e); // dark fallback: grey screen must never masquerade as a loaded scene
scene.fog = null;




const initialViewport = getViewportSize();
const camera = new THREE.PerspectiveCamera(72, initialViewport.width / initialViewport.height, 0.12, 450);
camera.layers.set(0);
camera.rotation.order = 'YXZ';
camera.position.set(0, 1.72, 15.5);




const renderer = new THREE.WebGLRenderer({
  antialias: !TOUCH_DEVICE,
  stencil: false,
  depth: true,
  alpha: false,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: false,
});
// Mobile DPR is intentionally conservative and, once gameplay starts, can only move DOWN.
// The previous governor raised/lowered DPR every 2.5 s. Each change reallocates Safari's
// drawing buffers; repeated reallocations eventually evicted the WebGL context on iPhone.
// 1.08 stays visibly sharper than the old emergency profile without building a GPU-memory sawtooth.
const MOBILE_DPR_MIN = 0.84;
const MOBILE_DPR_START = 1.08;
let mobileRenderScale = TOUCH_DEVICE ? Math.min(devicePixelRatio, MOBILE_DPR_START) : 1.0;
let appliedMainRendererDpr = TOUCH_DEVICE
  ? Math.min(devicePixelRatio, mobileRenderScale)
  : Math.min(devicePixelRatio, 1.55);
let appliedMainRendererWidth = initialViewport.width;
let appliedMainRendererHeight = initialViewport.height;
renderer.setPixelRatio(appliedMainRendererDpr);
renderer.setSize(initialViewport.width, initialViewport.height);
renderer.shadowMap.enabled = !TOUCH_DEVICE;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
mount.appendChild(renderer.domElement);




function applyMainRendererSize(width = innerWidth, height = innerHeight, force = false) {
  const nextWidth = Math.max(1, Math.round(width));
  const nextHeight = Math.max(1, Math.round(height));
  const nextDpr = TOUCH_DEVICE
    ? Math.min(devicePixelRatio, mobileRenderScale)
    : Math.min(devicePixelRatio, 1.55);
  if (
    !force &&
    nextWidth === appliedMainRendererWidth &&
    nextHeight === appliedMainRendererHeight &&
    Math.abs(nextDpr - appliedMainRendererDpr) < .001
  ) return false;
  appliedMainRendererWidth = nextWidth;
  appliedMainRendererHeight = nextHeight;
  appliedMainRendererDpr = nextDpr;
  renderer.setPixelRatio(nextDpr);
  renderer.setSize(nextWidth, nextHeight, false);
  return true;
}




// v0.45: clean indie-grade post stack. No SSAO: it caused black halos on the huge
// joined GLB. Desktop gets very restrained high-threshold bloom for sun/bright highlights;
// touch devices render the same scene directly to save a full-screen HDR pass.
let composer = null;
let renderPass = null;
let bloomPass = null;
const subtleColorGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: 0.96 },
    greenSuppression: { value: 0.16 },
    warmth: { value: 0.035 },
    highlightCompression: { value: 0.085 },
  },
  vertexShader: `varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `uniform sampler2D tDiffuse;
    uniform float saturation;
    uniform float greenSuppression;
    uniform float warmth;
    uniform float highlightCompression;
    varying vec2 vUv;
    void main() {
      vec3 color = texture2D(tDiffuse, vUv).rgb;
      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(vec3(luma), color, saturation);
      float dominantGreen = max(color.g - max(color.r, color.b), 0.0);
      color.g -= dominantGreen * greenSuppression;
      color.r += dominantGreen * greenSuppression * 0.16;
      color.b += dominantGreen * greenSuppression * 0.05;
      color *= vec3(1.0 + warmth, 1.0 + warmth * 0.25, 1.0 - warmth * 0.45);
      color = color / (1.0 + color * highlightCompression);
      gl_FragColor = vec4(color, 1.0);
    }`
};
let subtleColorGradePass = null;
let outputPass = null;
if (!TOUCH_DEVICE) {
  composer = new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(devicePixelRatio, 1.15));
  composer.setSize(initialViewport.width, initialViewport.height);
  renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  bloomPass = new UnrealBloomPass(new THREE.Vector2(initialViewport.width, initialViewport.height), 0.055, 0.16, 1.12);
  composer.addPass(bloomPass);
  subtleColorGradePass = new ShaderPass(subtleColorGradeShader);
  composer.addPass(subtleColorGradePass);
  outputPass = new OutputPass();
  composer.addPass(outputPass);
}




// Shop product preview: a separate small Three.js scene rendered only while the shop is open.
let shopPreviewRenderer = null;
function ensureShopPreviewRenderer() {
  if (shopPreviewRenderer) return shopPreviewRenderer;
  shopPreviewRenderer = new THREE.WebGLRenderer({
    canvas: shopPreviewCanvasEl,
    alpha: true,
    antialias: !TOUCH_DEVICE,
    stencil: false,
    powerPreference: 'low-power',
  });
  shopPreviewRenderer.setPixelRatio(TOUCH_DEVICE ? 0.85 : Math.min(devicePixelRatio, 1.35));
  shopPreviewRenderer.setSize(360, 300, false);
  shopPreviewRenderer.outputColorSpace = THREE.SRGBColorSpace;
  shopPreviewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  shopPreviewRenderer.toneMappingExposure = 1.15;
  mobileDebugLog('shop preview WebGL context created');
  return shopPreviewRenderer;
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
scene.fog = new THREE.Fog(0xb8c3ca, 58, 205);
// Skylight establishes readable shadow colour; a tiny neutral fill prevents crushed blacks.
scene.add(new THREE.HemisphereLight(0xe6edf0, 0x6f675e, 1.18));
scene.add(new THREE.AmbientLight(0xeee7db, 0.22));




const SUN_OFFSET = new THREE.Vector3(-28, 42, 15);
const sun = new THREE.DirectionalLight(0xffdeb7, 2.42);
sun.position.copy(SUN_OFFSET);
sun.castShadow = true;




// Shadow-acne fix:
// keep a much tighter high-resolution shadow frustum around the player,
// and offset shadow comparison along surface normals.
sun.shadow.mapSize.set(TOUCH_DEVICE ? 1024 : 4096, TOUCH_DEVICE ? 1024 : 4096);
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
const skyBounce = new THREE.DirectionalLight(0xc3d5de, 0.52);
skyBounce.position.set(24, 26, -18);
skyBounce.target.position.set(0, 1.5, -6);
scene.add(skyBounce.target);
scene.add(skyBounce);




// v51.29 — extra overhead work light aimed directly at the construction slab.
const siteTopLight = new THREE.SpotLight(0xf2efde, 28.0, 62, THREE.MathUtils.degToRad(34), .62, 1.15);
siteTopLight.position.set(0, 28, 4);
siteTopLight.target.position.set(0, .18, 4);
siteTopLight.castShadow = false;
scene.add(siteTopLight.target);
scene.add(siteTopLight);




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
const MESH_COLLIDER_CELL = 8;
const meshColliderGrid = new Map();
let meshColliderQueryId = 0;
function meshColliderCellKey(x, z) { return `${x},${z}`; }
function rebuildMeshColliderGrid() {
  meshColliderGrid.clear();
  for (const c of meshColliders) {
    const b = c.bounds;
    if (!b) continue;
    const x0 = Math.floor(b.minX / MESH_COLLIDER_CELL), x1 = Math.floor(b.maxX / MESH_COLLIDER_CELL);
    const z0 = Math.floor(b.minZ / MESH_COLLIDER_CELL), z1 = Math.floor(b.maxZ / MESH_COLLIDER_CELL);
    for (let gx=x0; gx<=x1; gx++) for (let gz=z0; gz<=z1; gz++) {
      const key=meshColliderCellKey(gx,gz);
      let bucket=meshColliderGrid.get(key);
      if (!bucket) meshColliderGrid.set(key,bucket=[]);
      bucket.push(c);
    }
  }
  mobileDebugLog(`collider grid: ${meshColliders.length} OBB -> ${meshColliderGrid.size} cells`);
}
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




  const broad = new THREE.Box3().setFromObject(mesh);
  meshColliders.push({
    obb,
    name: name || mesh.name || 'scene mesh',
    bounds: {
      minX: broad.min.x, maxX: broad.max.x,
      minZ: broad.min.z, maxZ: broad.max.z,
    },
    _queryId: 0,
  });
}
function addWalkSurface(name, minX, maxX, minZ, maxZ, topY) {
  if (![minX,maxX,minZ,maxZ,topY].every(Number.isFinite)) return;
  walkSurfaces.push({ name, minX, maxX, minZ, maxZ, topY });
}




const MONETKA_PARKING_ZONE = Object.freeze({
  minX: -24.0,
  maxX: 8.0,
  minZ: -39.5,
  maxZ: -22.4,
});
function boxCenterXZ(bb) {
  return new THREE.Vector2((bb.min.x + bb.max.x) * .5, (bb.min.z + bb.max.z) * .5);
}
function inMonetkaParkingZone(bb, padX = 0, padZ = 0) {
  if (!bb) return false;
  const c = boxCenterXZ(bb);
  return (
    c.x >= MONETKA_PARKING_ZONE.minX - padX &&
    c.x <= MONETKA_PARKING_ZONE.maxX + padX &&
    c.y >= MONETKA_PARKING_ZONE.minZ - padZ &&
    c.y <= MONETKA_PARKING_ZONE.maxZ + padZ
  );
}
function isVehicleName(name) {
  const low = String(name || '').toLowerCase();
  return low.includes('zhiguli') || low.includes('vehicle') || low.includes('car') || low.includes('<auto>') || low.includes('lada') || low.includes('vaz');
}
function applyParkingTransparencyHack(mat, threshold = 0.16) {
  if (!mat || mat.userData?.parkingTransparencyHack) return;
  mat.transparent = false;
  mat.opacity = 1;
  mat.alphaTest = Math.max(mat.alphaTest || 0, 0.02);
  mat.depthWrite = true;
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = shader => {
    if (typeof prev === 'function') prev(shader);
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
float __betonParkingLuma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
if (__betonParkingLuma < ${threshold.toFixed(3)}) discard;`
    );
  };
  mat.userData = mat.userData || {};
  mat.userData.parkingTransparencyHack = true;
  mat.needsUpdate = true;
}
function forceMonetka5Visible(root) {
  if (!root) return;




  // IMPORTANT: FINAL was exported while the real `monetka5-material` object was hidden.
  // The export therefore contains only the sibling `monetka5-material.003` floor plane.
  // A visibility toggle cannot bring missing geometry back, so v51.67 restores the omitted
  // storefront from a tiny standalone glTF extracted from the previous authored scene.
  const realStore = root.getObjectByName('monetka5-material');
  if (realStore) {
    realStore.visible = true;
    realStore.frustumCulled = false;
    realStore.traverse(o => {
      o.visible = true;
      if (!o.isMesh || !o.material) return;
      o.frustumCulled = false;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const mat of mats) {
        if (!mat) continue;
        mat.visible = true;
        mat.opacity = 1;
        mat.transparent = false;
        mat.depthTest = true;
        mat.depthWrite = true;
        mat.needsUpdate = true;
      }
    });
    console.log('[MONETKA] real storefront already present');
    return;
  }




  if (root.userData?.monetkaRestoreRequested) return;
  root.userData = root.userData || {};
  root.userData.monetkaRestoreRequested = true;
  mobileDebugLog('MONETKA: restoring omitted storefront mesh');




  loader.load('./assets/monetka_restore/monetka_restore.gltf', restoredGltf => {
    const restored =
      restoredGltf.scene.getObjectByName('monetka5-material_RESTORED') ||
      restoredGltf.scene.children[0];
    if (!restored) {
      console.error('[MONETKA] restore glTF loaded but storefront mesh is empty');
      mobileDebugLog('MONETKA restore failed: empty glTF');
      return;
    }




    restored.name = 'monetka5-material';
    restored.visible = true;
    restored.frustumCulled = false;
    restored.traverse(o => {
      o.visible = true;
      if (!o.isMesh) return;
      o.frustumCulled = false;
      o.castShadow = true;
      o.receiveShadow = true;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const mat of mats) {
        if (!mat) continue;
        mat.visible = true;
        mat.opacity = 1;
        mat.transparent = false;
        mat.depthTest = true;
        mat.depthWrite = true;
        mat.needsUpdate = true;
      }
    });




    // The extracted Monetka vertices are already authored in FINAL world coordinates.
    // Its original parent chain in Blender is identity, so attaching to MONETKA keeps
    // the exact placement while preserving the semantic hierarchy.
    const host = root.getObjectByName('monetka') || root.getObjectByName('MONETKA') || root;
    host.add(restored);
    restored.updateWorldMatrix(true, true);
    console.log('[MONETKA] restored missing storefront from standalone asset');
    mobileDebugLog('MONETKA storefront restored');
  }, undefined, err => {
    console.error('[MONETKA] failed to load restore asset', err);
    mobileDebugLog(`MONETKA restore error: ${err?.message || err}`);
  });
}




function fixMonetkaParking(root) {
  if (!root) return;
  let decalsFixed = 0;
  root.updateWorldMatrix(true, true);
  root.traverse(o => {
    if (!o.isMesh || !o.visible) return;
    const bb = new THREE.Box3().setFromObject(o);
    if (!Number.isFinite(bb.min.x) || !inMonetkaParkingZone(bb, 1.0, 1.0)) return;
    const size = bb.getSize(new THREE.Vector3());
    const footprintMax = Math.max(size.x, size.z);
    const footprintMin = Math.min(size.x, size.z);
    const low = String(o.name || '').toLowerCase();




    // White parking-space markings exported as flat planes were rendering with a solid
    // black fill. Make only those decal-like meshes punch out their dark background.
    const looksLikeParkingDecal =
      low.startsWith('plane') &&
      size.y <= 0.35 &&
      bb.max.y <= 0.35 &&
      footprintMax >= 3.0 && footprintMax <= 13.5 &&
      footprintMin >= 2.5 && footprintMin <= 5.5;
    if (!looksLikeParkingDecal) return;




    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const mat of mats) {
      applyParkingTransparencyHack(mat);
    }
    // Treat the marking plane as walkable, never as an obstacle.
    o.userData = o.userData || {};
    o.userData.walkOnly = true;
    decalsFixed++;
  });
  if (decalsFixed) console.log(`[MONETKA] parking decals fixed: ${decalsFixed}`);
}
function carveMonetkaParkingPassage() {
  let removedBoxes = 0;
  let removedObbs = 0;
  for (let i = colliders.length - 1; i >= 0; i--) {
    const c = colliders[i];
    if (
      c.maxX > MONETKA_PARKING_ZONE.minX && c.minX < MONETKA_PARKING_ZONE.maxX &&
      c.maxZ > MONETKA_PARKING_ZONE.minZ && c.minZ < MONETKA_PARKING_ZONE.maxZ &&
      (c.maxY ?? Infinity) <= 1.20
    ) {
      const low = String(c.name || '').toLowerCase();
      if (!isVehicleName(low)) {
        colliders.splice(i, 1);
        removedBoxes++;
      }
    }
  }
  for (let i = meshColliders.length - 1; i >= 0; i--) {
    const m = meshColliders[i];
    const low = String(m.name || '').toLowerCase();
    if (isVehicleName(low)) continue;
    const c = m.obb?.center;
    if (!c) continue;
    if (
      c.x >= MONETKA_PARKING_ZONE.minX && c.x <= MONETKA_PARKING_ZONE.maxX &&
      c.z >= MONETKA_PARKING_ZONE.minZ && c.z <= MONETKA_PARKING_ZONE.maxZ &&
      c.y <= 1.35
    ) {
      meshColliders.splice(i, 1);
      removedObbs++;
    }
  }
  if (removedBoxes || removedObbs) {
    console.log(`[MONETKA] collision carve-out: removed ${removedBoxes} XZ colliders and ${removedObbs} OBB colliders in parking passage`);
  }
}




function removeFrontSiteFlower(root) {
  if (!root) return;
  const target = new THREE.Vector3(0, 0, -5.5);
  const world = new THREE.Vector3();
  let best = null;
  let bestDist = Infinity;




  root.traverse(o => {
    if (!o.isMesh || !o.visible) return;
    const low = String(o.name || '').toLowerCase();
    const materialNames = (Array.isArray(o.material) ? o.material : [o.material])
      .filter(Boolean).map(m => String(m.name || '').toLowerCase());
    const looksLikeFlower =
      low.includes('daisy') || low.includes('flower') ||
      materialNames.some(m => m.includes('daisy') || m.includes('flower'));
    if (!looksLikeFlower) return;




    o.getWorldPosition(world);
    if (Math.abs(world.x) > 12 || world.z < -15 || world.z > 8) return;
    const dx = world.x - target.x;
    const dz = world.z - target.z;
    const dist = dx * dx + dz * dz;
    if (dist < bestDist) {
      bestDist = dist;
      best = o;
    }
  });




  if (best) {
    best.visible = false;
    best.userData = best.userData || {};
    best.userData.noCollision = true;
    console.log('[SCENE] removed front-site flower:', best.name, 'dist2=', bestDist.toFixed(3));
  }
}




function cloneVehicleMaterialForRole(src, role, palette) {
  const mat = src?.clone?.() || new THREE.MeshStandardMaterial();
  const cfg = {
    orange: { color:palette.orange, roughness:.68, metalness:.05, transparent:false, opacity:1, depthWrite:true },
    orange2:{ color:palette.orange2,roughness:.72, metalness:.04, transparent:false, opacity:1, depthWrite:true },
    cream:  { color:palette.cream, roughness:.74, metalness:.03, transparent:false, opacity:1, depthWrite:true },
    dark:   { color:palette.dark,  roughness:.84, metalness:.08, transparent:false, opacity:1, depthWrite:true },
    rubber: { color:palette.rubber,roughness:.96, metalness:.00, transparent:false, opacity:1, depthWrite:true },
    metal:  { color:palette.metal, roughness:.56, metalness:.38, transparent:false, opacity:1, depthWrite:true },
    metal2: { color:palette.metal2,roughness:.62, metalness:.24, transparent:false, opacity:1, depthWrite:true },
    glass:  { color:palette.glass, roughness:.18, metalness:.02, transparent:true, opacity:.66, depthWrite:false },
    red:    { color:palette.red,   roughness:.62, metalness:.02, transparent:false, opacity:1, depthWrite:true },
    yellow: { color:palette.yellow,roughness:.62, metalness:.02, transparent:false, opacity:1, depthWrite:true },
    blue:   { color:palette.blue,  roughness:.56, metalness:.12, transparent:false, opacity:1, depthWrite:true },
  }[role] || { color:palette.metal2,roughness:.64,metalness:.18,transparent:false,opacity:1,depthWrite:true };




  // The large painted body panels in FINAL are plain CAD colours. Clear any
  // inherited tint/texture flags on those parts so the cab shells and mixer
  // drum use the requested construction palette on every scene build.
  if (mat.color) mat.color.set(cfg.color);
  if (role === 'orange' || role === 'orange2' || role === 'cream') {
    if ('map' in mat) mat.map = null;
    if ('emissiveMap' in mat) mat.emissiveMap = null;
    if ('vertexColors' in mat) mat.vertexColors = false;
  }
  mat.transparent = cfg.transparent;
  mat.opacity = cfg.opacity;
  mat.depthWrite = cfg.depthWrite;
  mat.depthTest = true;
  if ('roughness' in mat) mat.roughness = cfg.roughness;
  if ('metalness' in mat) mat.metalness = cfg.metalness;
  if ('transmission' in mat) mat.transmission = 0;
  mat.needsUpdate = true;
  return mat;
}




function paintVehicleMesh(mesh, role, palette) {
  if (!mesh?.isMesh) return false;
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const next = mats.map(src => cloneVehicleMaterialForRole(src, role, palette));
  mesh.material = Array.isArray(mesh.material) ? next : next[0];
  return true;
}




function paintNamedVehicleMeshes(root, roleMap, palette, label) {
  if (!root) return 0;
  let count = 0;
  root.traverse(o => {
    if (!o.isMesh) return;
    const role = roleMap[o.name];
    if (!role) return; // IMPORTANT: no blanket recolour anymore.
    if (paintVehicleMesh(o, role, palette)) count++;
  });
  console.log(`[SCENE] ${label} explicit mesh repaint: ${count}/${Object.keys(roleMap).length}`);
  return count;
}




function repaintConstructionVehicles(root) {
  if (!root) return;




  const palette = {
    // Warm industrial orange + cream bodywork, graphite chassis, neutral metals.
    orange: 0xd97b2f,
    orange2:0xb95e27,
    cream:  0xe1d8c4,
    dark:   0x272a2d,
    rubber: 0x17191b,
    metal:  0x7d8386,
    metal2: 0x555b5e,
    glass:  0x344c5a,
    red:    0xb53a2d,
    yellow: 0xd2aa32,
    blue:   0x587c91,
  };




  // v51.69: explicit per-mesh paint. The old code recoloured every material by
  // fuzzy material-name rules, which turned whole multi-part assemblies into
  // giant orange/black slabs. FINAL already separates the truck into Geom3D
  // meshes, so colour the actual parts instead.
  const mixerRoles = {
    'Geom3D':'orange',          // mixer cab shell
    'Geom3D.001':'orange2',     // mixer drum stripe / secondary shell
    'Geom3D.002':'rubber',      // tyres
    'Geom3D.003':'dark',        // chassis
    'Geom3D.004':'metal',       // frame / metal fittings
    'Geom3D.005':'orange',      // broad white export shell: cab + mixer drum
    'Geom3D.006':'metal2',      // mechanical parts
    'Geom3D.007':'metal2',
    'Geom3D.008':'metal',
    'Geom3D.009':'metal2',
    'Geom3D.010':'metal',
    'Geom3D.011':'dark',        // black hardware
    'Geom3D.012':'orange2',     // cab/body secondary paint
    'Geom3D.013':'glass',       // cab glass
    'Geom3D.014':'orange2',     // cab lower painted panel
    'Geom3D.015':'red',         // marker/tail lights
    'Geom3D.016':'glass',       // pale glass / lamp cover
  };




  const pumpRoles = {
    // Pump machinery / chassis
    'Geom3D.023':'dark',
    'Geom3D.024':'metal',
    'Geom3D.025':'rubber',
    'Geom3D.026':'metal2',
    'Geom3D.027':'orange',
    'Geom3D.028':'cream',
    'Geom3D.029':'metal',       // kill the source lavender helper colour
    'Geom3D.030':'metal2',
    'Geom3D.031':'orange2',
    'Geom3D.032':'yellow',
    'Geom3D.033':'yellow',
    'Geom3D.034':'orange',      // broad upper pump housing
    'Geom3D.035':'dark',
    'Geom3D.036':'dark',
    'Geom3D.037':'orange',      // source was purple; painted structural part
    'Geom3D.038':'red',
    'Geom3D.039':'dark',
    'Geom3D.040':'blue',        // hydraulic / utility reservoir
    'Geom3D.041':'orange',
    'Geom3D.042':'metal',
    'Geom3D.043':'dark',
    'Geom3D.044':'dark',
    'Geom3D.045':'metal2',
    'Geom3D.046':'orange',      // broad white pump body export shell
    'Geom3D.047':'orange2',     // rear machinery body / painted structure
    'Geom3D.048':'dark',
    'Geom3D.049':'dark',
    'Geom3D.050':'dark',
    'Geom3D.051':'metal2',
    'Geom3D.052':'orange2',     // long light pump cover
    'Geom3D.053':'orange',      // long pump body
    'Geom3D.054':'glass',
    'Geom3D.055':'red',
    'Geom3D.056':'red',
    'Geom3D.057':'glass',       // imported translucent shell/window set
    'Geom3D.058':'orange2',     // pump cab roof/trim
    'Geom3D.059':'dark',        // grille / mesh
    'Geom3D.060':'orange',      // main cab shell
    'Geom3D.061':'dark',        // lower trim
    'Geom3D.062':'rubber',      // tyres
    'Geom3D.063':'orange',      // secondary pump cab panel
    'Geom3D.064':'glass',
    'Geom3D.065':'glass',
    'Geom3D.066':'dark',        // bumper / grille
  };




  const boomRoles = {
    'Geom3D.017':'orange',
    'Geom3D.018':'orange',
    'Geom3D.019':'cream',
    'Geom3D.020':'orange',
    'Geom3D.021':'cream',
    'Geom3D_Boom 2':'orange2',
    'Geom3D.022':'dark',
    'GREY_HOSE_SEG_01_00':'dark',
  };




  const mixerTruck = root.getObjectByName('Concrete Mixer Truck') || root.getObjectByName('Mixer Truck');
  const pumpTruck = root.getObjectByName('Hoze Truck');
  const boom = root.getObjectByName('Boom 1');




  // FINAL contains a second, single-mesh copy of the whole pump truck. It uses
  // an unrelated concrete texture and sits directly on top of the proper
  // separated CAD parts, which produced a white body and a hard UV split down
  // the middle. Keep the detailed parts and remove only that bad overlay.
  const pumpTextureOverlay = root.getObjectByName('Geom3D_Hoze Truck');
  if (pumpTextureOverlay) {
    pumpTextureOverlay.visible = false;
    pumpTextureOverlay.userData = pumpTextureOverlay.userData || {};
    pumpTextureOverlay.userData.noCollision = true;
    console.log('[SCENE] hidden duplicated textured pump overlay:', pumpTextureOverlay.name);
  }




  paintNamedVehicleMeshes(mixerTruck, mixerRoles, palette, 'mixer');
  paintNamedVehicleMeshes(pumpTruck, pumpRoles, palette, 'pump');
  paintNamedVehicleMeshes(boom, boomRoles, palette, 'pump boom');
}




let constructionMachineLifeGroup = null;
let mixerDrumSpin = null;
let pumpPistonRod = null;
let pumpPistonBaseX = 0;
let machineLifeClock = 0;
let machineSmokeAccumulator = 0;
let machineSmokeCursor = 0;
const machineBeacons = [];
const machineSmokeOrigins = [];
const machineSmokePuffs = [];




function createMachineGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 31);
  gradient.addColorStop(0, 'rgba(255,240,164,1)');
  gradient.addColorStop(.18, 'rgba(255,176,44,.92)');
  gradient.addColorStop(.52, 'rgba(255,132,18,.32)');
  gradient.addColorStop(1, 'rgba(255,110,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}




function addMachineBeacon(parent, position, phase, glowTexture) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.userData.noCollision = true;




  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(.075, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffa42a })
  );
  bulb.raycast = () => {};
  group.add(bulb);




  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xffa125,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  glow.scale.set(.62, .62, 1);
  glow.raycast = () => {};
  group.add(glow);
  parent.add(group);
  machineBeacons.push({ group, bulb, glow, phase });
}




function addMixerDrumLife(parent, mixerTruck) {
  const box = new THREE.Box3().setFromObject(mixerTruck);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const halfLength = THREE.MathUtils.clamp(size.x * .18, 1.15, 1.72);
  const radiusY = THREE.MathUtils.clamp(size.y * .335, .88, 1.22);
  const radiusZ = THREE.MathUtils.clamp(size.z * .255, .92, 1.28);
  const segments = TOUCH_DEVICE ? 32 : 52;
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 2 * 1.32 - Math.PI * .18;
    points.push(new THREE.Vector3(
      THREE.MathUtils.lerp(-halfLength, halfLength, t),
      Math.cos(angle) * radiusY,
      Math.sin(angle) * radiusZ
    ));
  }




  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xf0dfbb,
    roughness: .42,
    metalness: .04,
    emissive: 0x2b1b09,
    emissiveIntensity: .16,
  });
  mixerDrumSpin = new THREE.Group();
  mixerDrumSpin.name = 'LIVE_MIXER_DRUM_STRIPE';
  mixerDrumSpin.position.copy(center);
  mixerDrumSpin.position.x += size.x * .04;
  mixerDrumSpin.position.y += size.y * .115;
  mixerDrumSpin.userData.baseY = mixerDrumSpin.position.y;
  mixerDrumSpin.userData.noCollision = true;




  const helix = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      segments,
      TOUCH_DEVICE ? .045 : .052,
      6,
      false
    ),
    stripeMat
  );
  helix.castShadow = !TOUCH_DEVICE;
  helix.receiveShadow = true;
  helix.raycast = () => {};
  mixerDrumSpin.add(helix);
  parent.add(mixerDrumSpin);




  addMachineBeacon(
    parent,
    new THREE.Vector3(box.min.x + size.x * .10, box.max.y + .08, center.z),
    0,
    createMachineGlowTexture()
  );
  machineSmokeOrigins.push(new THREE.Vector3(
    box.min.x + size.x * .20,
    box.min.y + size.y * .78,
    box.max.z - .13
  ));
}




function addPumpLife(parent, pumpTruck) {
  const box = new THREE.Box3().setFromObject(pumpTruck);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());




  const pistonGroup = new THREE.Group();
  pistonGroup.name = 'LIVE_PUMP_HYDRAULICS';
  pistonGroup.position.set(
    center.x - size.x * .08,
    box.min.y + size.y * .34,
    box.max.z + .025
  );
  pistonGroup.userData.noCollision = true;




  const housing = new THREE.Mesh(
    new THREE.CylinderGeometry(.078, .078, .62, 8),
    new THREE.MeshStandardMaterial({ color: 0x353a3c, roughness: .55, metalness: .44 })
  );
  housing.rotation.z = Math.PI * .5;
  housing.raycast = () => {};
  pistonGroup.add(housing);




  pumpPistonRod = new THREE.Mesh(
    new THREE.CylinderGeometry(.037, .037, .58, 8),
    new THREE.MeshStandardMaterial({ color: 0xb3babd, roughness: .28, metalness: .78 })
  );
  pumpPistonRod.rotation.z = Math.PI * .5;
  pumpPistonBaseX = .36;
  pumpPistonRod.position.x = pumpPistonBaseX;
  pumpPistonRod.raycast = () => {};
  pistonGroup.add(pumpPistonRod);
  parent.add(pistonGroup);




  addMachineBeacon(
    parent,
    new THREE.Vector3(box.max.x - size.x * .12, box.max.y + .08, center.z),
    .48,
    createMachineGlowTexture()
  );
  machineSmokeOrigins.push(new THREE.Vector3(
    box.max.x - size.x * .20,
    box.min.y + size.y * .80,
    box.max.z - .13
  ));
}




function setupConstructionMachineLife(root) {
  if (!root) return;
  if (constructionMachineLifeGroup) constructionMachineLifeGroup.removeFromParent();
  constructionMachineLifeGroup = new THREE.Group();
  constructionMachineLifeGroup.name = 'CONSTRUCTION_MACHINE_LIFE';
  constructionMachineLifeGroup.userData.noCollision = true;
  scene.add(constructionMachineLifeGroup);
  mixerDrumSpin = null;
  pumpPistonRod = null;
  machineBeacons.length = 0;
  machineSmokeOrigins.length = 0;
  machineSmokePuffs.length = 0;
  machineSmokeCursor = 0;




  const mixerTruck = root.getObjectByName('Concrete Mixer Truck') || root.getObjectByName('Mixer Truck');
  const pumpTruck = root.getObjectByName('Hoze Truck');
  if (mixerTruck) addMixerDrumLife(constructionMachineLifeGroup, mixerTruck);
  if (pumpTruck) addPumpLife(constructionMachineLifeGroup, pumpTruck);




  const puffGeometry = new THREE.SphereGeometry(1, 6, 4);
  const puffCount = TOUCH_DEVICE ? 10 : 18;
  for (let i = 0; i < puffCount; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: 0x555b59,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(puffGeometry, material);
    mesh.visible = false;
    mesh.raycast = () => {};
    constructionMachineLifeGroup.add(mesh);
    machineSmokePuffs.push({
      mesh,
      age: 0,
      life: 2,
      velocity: new THREE.Vector3(),
      baseScale: .1,
    });
  }
  console.log('[MACHINES] live visuals ready', {
    mixer: Boolean(mixerDrumSpin),
    pump: Boolean(pumpPistonRod),
    smokeOrigins: machineSmokeOrigins.length,
  });
}




function spawnMachineSmoke() {
  if (!machineSmokeOrigins.length || !machineSmokePuffs.length) return;
  const origin = machineSmokeOrigins[machineSmokeCursor % machineSmokeOrigins.length];
  const puff = machineSmokePuffs[machineSmokeCursor++ % machineSmokePuffs.length];
  puff.age = 0;
  puff.life = THREE.MathUtils.randFloat(1.6, 2.5);
  puff.baseScale = THREE.MathUtils.randFloat(.075, .125);
  puff.mesh.visible = true;
  puff.mesh.position.copy(origin);
  puff.mesh.position.x += THREE.MathUtils.randFloatSpread(.045);
  puff.mesh.position.y += THREE.MathUtils.randFloatSpread(.035);
  puff.mesh.position.z += THREE.MathUtils.randFloatSpread(.045);
  puff.mesh.scale.setScalar(puff.baseScale);
  puff.mesh.material.opacity = .22;
  puff.velocity.set(
    THREE.MathUtils.randFloat(-.035, .055),
    THREE.MathUtils.randFloat(.20, .31),
    THREE.MathUtils.randFloat(-.025, .045)
  );
}




function updateConstructionMachines(dt) {
  if (!constructionMachineLifeGroup) return;
  machineLifeClock += dt;




  if (mixerDrumSpin) {
    const drumSpeed = started ? .72 : .16;
    mixerDrumSpin.rotation.x = (mixerDrumSpin.rotation.x - dt * drumSpeed) % (Math.PI * 2);
    mixerDrumSpin.position.y = mixerDrumSpin.userData.baseY + Math.sin(machineLifeClock * 7.2) * .003;
  }




  if (pumpPistonRod) {
    const pumpActivity = pumpBroken ? 0 : pouring ? 1 : .16;
    const pulse = Math.sin(machineLifeClock * THREE.MathUtils.lerp(2.2, 10.5, pumpActivity));
    pumpPistonRod.position.x = pumpPistonBaseX + pulse * .065 * pumpActivity;
  }




  for (const beacon of machineBeacons) {
    const wave = Math.max(0, Math.sin((machineLifeClock * 1.55 + beacon.phase) * Math.PI * 2));
    const flash = started ? Math.pow(wave, 9) : .08;
    beacon.glow.material.opacity = .08 + flash * .82;
    beacon.glow.scale.setScalar(.48 + flash * .38);
    beacon.bulb.scale.setScalar(1 + flash * .24);
  }




  if (started) {
    machineSmokeAccumulator += dt;
    const interval = pouring && !pumpBroken ? .38 : TOUCH_DEVICE ? .72 : .56;
    if (machineSmokeAccumulator >= interval) {
      machineSmokeAccumulator %= interval;
      spawnMachineSmoke();
    }
  }




  for (const puff of machineSmokePuffs) {
    if (!puff.mesh.visible) continue;
    puff.age += dt;
    const t = puff.age / Math.max(.001, puff.life);
    if (t >= 1) {
      puff.mesh.visible = false;
      puff.mesh.material.opacity = 0;
      continue;
    }
    puff.mesh.position.addScaledVector(puff.velocity, dt);
    puff.velocity.x += Math.sin(machineLifeClock * 1.7 + puff.age * 2.3) * dt * .008;
    const scale = puff.baseScale * THREE.MathUtils.lerp(1, 2.9, t);
    puff.mesh.scale.setScalar(scale);
    puff.mesh.material.opacity = .22 * Math.pow(1 - t, 1.55);
  }
}




function isMobileVegetationMesh(o) {
  if (!o?.isMesh || o.isSkinnedMesh || !o.geometry || !o.material) return false;
  const low = String(o.name || '').toLowerCase();
  const materialNames = (Array.isArray(o.material) ? o.material : [o.material])
    .filter(Boolean).map(m => String(m.name || '').toLowerCase());
  return (
    low.includes('grass') || low.includes('flower') || low.includes('daisy') || low.includes('daffodil') ||
    materialNames.some(m => m.includes('grass') || m.includes('flower') || m.includes('daisy') || m.includes('daffodil'))
  );
}




// Mobile-only batching: identical grass/flower meshes are instanced in 12 m spatial cells.
// Appearance and transforms are preserved, while draw calls and frustum work drop sharply.
function instanceMobileVegetation(root) {
  if (!TOUCH_DEVICE || !root) return 0;
  root.updateWorldMatrix(true, true);
  const rootInv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const worldPos = new THREE.Vector3();
  const localMat = new THREE.Matrix4();
  const groups = new Map();
  const candidates = [];
  const CELL = 12.0;




  root.traverse(o => {
    if (!isMobileVegetationMesh(o) || !o.visible) return;
    o.getWorldPosition(worldPos);
    const cellX = Math.floor(worldPos.x / CELL);
    const cellZ = Math.floor(worldPos.z / CELL);
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const matKey = mats.map(m => m?.uuid || 'null').join(',');
    const key = `${o.geometry.uuid}|${matKey}|${cellX}|${cellZ}|${o.castShadow ? 1 : 0}|${o.receiveShadow ? 1 : 0}`;
    let g = groups.get(key);
    if (!g) {
      g = { geometry:o.geometry, material:o.material, castShadow:o.castShadow, receiveShadow:o.receiveShadow, items:[] };
      groups.set(key, g);
    }
    g.items.push(o);
    candidates.push(o);
  });




  const batchRoot = new THREE.Group();
  batchRoot.name = 'MOBILE_VEGETATION_CHUNKS';
  root.add(batchRoot);
  let batched = 0;
  for (const g of groups.values()) {
    if (g.items.length < 3) continue;
    const inst = new THREE.InstancedMesh(g.geometry, g.material, g.items.length);
    inst.name = `grass_flower_chunk_${batched}`;
    inst.castShadow = g.castShadow;
    inst.receiveShadow = g.receiveShadow;
    inst.frustumCulled = true;
    inst.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    for (let i = 0; i < g.items.length; i++) {
      localMat.multiplyMatrices(rootInv, g.items[i].matrixWorld);
      inst.setMatrixAt(i, localMat);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingBox?.();
    inst.computeBoundingSphere?.();
    batchRoot.add(inst);
    for (const o of g.items) o.parent?.remove(o);
    batched += g.items.length;
  }
  if (!batchRoot.children.length) root.remove(batchRoot);
  else console.log(`[MOBILE PERF] vegetation instanced: ${batched} meshes -> ${batchRoot.children.length} spatial batches`);
  return batched;
}




function freezeMobileStaticMeshes(root) {
  if (!TOUCH_DEVICE || !root) return;
  root.updateWorldMatrix(true, true);
  let frozen = 0;
  root.traverse(o => {
    if (!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh) return;
    // Imported environment is authored static. Pickups are removed, not animated by transform.
    o.updateMatrix();
    o.matrixAutoUpdate = false;
    frozen++;
  });
  console.log(`[MOBILE PERF] frozen static mesh transforms: ${frozen}`);
}




// GLTF BufferAttributes keep typed-array views into the eight large FINAL_GEOM buffers.
// Once a static attribute is uploaded, WebGL owns the render copy and the CPU view is no
// longer needed during normal play. Releasing it prevents the scene from living in memory
// twice (CPU + GPU), which is especially important under iOS' per-tab memory limit.
// A lost context still follows the existing full-page recovery path, so keeping a second
// 140+ MB copy solely for context restoration would make that context loss more likely.
let mobileStaticGeometryReleaseRegistered = false;
let mobileStaticGeometryReleasedBytes = 0;
function registerMobileStaticGeometryRelease(root) {
  if (!TOUCH_DEVICE || !root || mobileStaticGeometryReleaseRegistered) return;




  const ownerUsage = new Map();
  const uploadOwners = new Set();
  const backingBuffers = new Set();
  let registeredBytes = 0;




  const trackAttribute = (attribute, visible) => {
    if (!attribute) return;
    const owner = attribute.isInterleavedBufferAttribute ? attribute.data : attribute;
    const array = owner?.array;
    if (!owner || !array) return;
    if (owner.usage !== undefined && owner.usage !== THREE.StaticDrawUsage) return;
    const entry = ownerUsage.get(owner);
    if (entry) { if (visible) entry.visible = true; }
    else ownerUsage.set(owner, { visible });
    if (array.buffer && !backingBuffers.has(array.buffer)) {
      backingBuffers.add(array.buffer);
      registeredBytes += array.buffer.byteLength || array.byteLength || 0;
    }
  };




  root.traverse(o => {
    if (!(o.isMesh || o.isLine || o.isPoints) || !o.geometry) return;
    let effectivelyVisible = o.visible;
    for (let p = o.parent; effectivelyVisible && p; p = p.parent) effectivelyVisible = p.visible;
    const geometry = o.geometry;
    trackAttribute(geometry.index, effectivelyVisible);
    for (const attribute of Object.values(geometry.attributes || {})) trackAttribute(attribute, effectivelyVisible);
    for (const morphList of Object.values(geometry.morphAttributes || {})) {
      for (const attribute of morphList || []) trackAttribute(attribute, effectivelyVisible);
    }
  });




  for (const [owner, use] of ownerUsage) {
    // Hidden authored helpers/alternate LODs never upload. Their cached bounds/transforms
    // were already consumed above, so release those arrays immediately.
    if (!use.visible) {
      mobileStaticGeometryReleasedBytes += owner.array?.byteLength || 0;
      owner.array = null;
      continue;
    }




    uploadOwners.add(owner);
    const previousUpload = owner.onUploadCallback;
    owner.onUpload(function releaseStaticCPUArrayAfterUpload() {
      if (typeof previousUpload === 'function') previousUpload.call(this);
      const uploadedArray = this.array;
      if (!uploadedArray) return;
      mobileStaticGeometryReleasedBytes += uploadedArray.byteLength || 0;
      this.array = null;
    });
  }




  mobileStaticGeometryReleaseRegistered = true;
  const mib = registeredBytes / (1024 * 1024);
  console.log(`[MOBILE MEMORY] static geometry CPU release armed: ${uploadOwners.size} visible attrs / ~${mib.toFixed(1)} MiB`);
  mobileDebugLog(`static geometry release armed: ${uploadOwners.size} visible attrs / ~${mib.toFixed(1)} MiB`);
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
const sceneLoadingManager = new THREE.LoadingManager();
let sceneManagerLoaded = 0;
let sceneManagerTotal = 0;
sceneLoadingManager.onStart = (url, loaded, total) => {
  armSceneLoadWatchdog();
  sceneManagerLoaded = loaded; sceneManagerTotal = total;
  mobileDebugLog(`asset start ${loaded}/${total}: ${String(url).split('/').pop()}`);
};
sceneLoadingManager.onProgress = (url, loaded, total) => {
  armSceneLoadWatchdog();
  sceneManagerLoaded = loaded; sceneManagerTotal = total;
  if (loadState && !sceneReady) loadState.textContent = `ЗАГРУЗКА СЦЕНЫ · ${loaded}/${total}`;
  if (TOUCH_DEVICE) mobileDebugLog(`asset ${loaded}/${total}: ${String(url).split('/').pop()}`);
};
sceneLoadingManager.onError = url => mobileDebugLog(`ASSET ERROR ${url}`);
const loader = new GLTFLoader(sceneLoadingManager);
const SCENE_LOAD_TIMEOUT_MS = TOUCH_DEVICE ? 60_000 : 90_000;
let sceneLoadFinished = false;
let sceneLoadWatchdog = 0;
function armSceneLoadWatchdog() {
  clearTimeout(sceneLoadWatchdog);
  sceneLoadWatchdog = setTimeout(() => {
    if (sceneLoadFinished || sceneReady) return;
    mobileDebugStage('scene-timeout');
    recoverBrokenScene(`таймаут загрузки ${Math.round(SCENE_LOAD_TIMEOUT_MS / 1000)}с`);
  }, SCENE_LOAD_TIMEOUT_MS);
}
function showBootRetry(reason) {
  sceneRecoveryPending = false;
  if (loadState) {
    loadState.textContent = `СЦЕНА НЕ ЗАГРУЗИЛАСЬ · ${String(reason)}`;
    loadState.style.color = '#ff8b78';
  }
  menuLoadingSpinner?.classList.add('isError');
  if (bootRetryBtn) bootRetryBtn.hidden = false;
}
bootRetryBtn?.addEventListener('click', () => {
  bootRetryBtn.disabled = true;
  const u = new URL(location.href);
  u.searchParams.delete('fullmobile');
  u.searchParams.set('retry', Date.now().toString());
  location.replace(u.toString());
});
function updateLoadState() {
  const done = assetsLoaded + assetsFailed >= TOTAL_ASSETS;
  if (loadState) loadState.textContent = done
    ? (assetsFailed ? `Сцена готова · ${assetsFailed} ассет(а) не загрузились` : 'Сцена готова')
    : `Загрузка моделей ${assetsLoaded + assetsFailed}/${TOTAL_ASSETS}…`;
  if (!done) menuLoadingSpinner?.classList.remove('isDone','isError');
}
function recoverBrokenScene(reason = 'scene unavailable') {
  if (sceneRecoveryPending) return;
  sceneRecoveryPending = true;
  console.error('[SCENE RECOVERY]', reason);
  mobileDebugLog(`scene failure: ${reason}`);
  sceneReady = false;
  if (startBtn) { startBtn.disabled = true; startBtn.setAttribute('aria-disabled','true'); }
  if (start) start.classList.remove('hidden');
  document.body.classList.remove('gameStarted');
  // Full-mobile is a QA override only. One failure immediately falls back to LITE.
  if (TOUCH_DEVICE && !MOBILE_LITE_MODE) {
    mobileDebugStage('switching-lite');
    const u = new URL(location.href);
    u.searchParams.delete('fullmobile');
    u.searchParams.set('liteRecovery', Date.now().toString());
    setTimeout(() => location.replace(u.toString()), 120);
    return;
  }
  showBootRetry(reason);
}
function applyVegetationCutout(mat) {
  if (!mat || mat.userData?.vegetationCutoutFix) return;
  // FINAL already contains proper alpha on the foliage atlases.  Do NOT black-key every
  // vegetation material: dark green/brown texels are legitimate leaves and were being
  // discarded by the old shader hack. Preserve the glTF alpha mode and only add a tiny
  // cutoff to BLEND cards so their fully transparent background stays clean.
  const authoredBlend = !!mat.transparent;
  const authoredCutoff = Number.isFinite(mat.alphaTest) ? mat.alphaTest : 0;
  mat.opacity = 1;
  mat.depthWrite = true;
  if (authoredBlend) {
    mat.transparent = true;
    mat.alphaTest = Math.max(authoredCutoff, 0.012);
  } else {
    mat.transparent = false;
    mat.alphaTest = authoredCutoff;
  }
  mat.userData = mat.userData || {};
  mat.userData.vegetationCutoutFix = true;
  mat.needsUpdate = true;
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
      // Keep road/floor textures sharp at grazing angles on phones. This costs
      // almost no extra memory and avoids the smeared, low-resolution look.
      const maxSceneAnisotropy = Math.min(TOUCH_DEVICE ? 4 : 8, renderer.capabilities.getMaxAnisotropy());
      for (const tex of [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap]) {
        if (tex) tex.anisotropy = maxSceneAnisotropy;
      }




      // v0.23: restore double-sided scene materials.
      mat.side = THREE.DoubleSide;




      // Only actual glass stays blended. Cutout textures use alphaTest,
      // all other construction materials are forced solid.
      const mn = String(mat.name || '').toLowerCase();
      const isGlass = mn.includes('glass');
      const isCigButt = mn.includes('cigbutt');
      const isVegetationCard =
        mn === 'leaf' || mn === 'leaves' || mn.includes('leaf') || mn.includes('leaves') ||
        mn.includes('tree_birch') || mn === 'tree-04' || mn.includes('tree-branch') || mn.includes('tree_branc') ||
        mn.includes('grass') || mn.includes('flower') || mn.includes('daisy') || mn.includes('daffodil');
      const isCutout = isCigButt || mn.includes('panelkamat') || isVegetationCard || mat.alphaTest > 0 || mat.transparent;




      if (isVegetationCard && !isGlass) {
        applyVegetationCutout(mat);
      } else if (isCutout && !isGlass) {
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
let babaWorldRoot = null;
let babaLockedY = 0;
let babaGroundLockEnabled = false;
let hoseAnchorObject = null;
let hoseProxy = null;
let hoseInteraction = null;
let shopProxy = null;
let shopInteraction = null;
let hoseHeld = false;
let pouring = false;
const HOSE_TUTORIAL_HINT_KEY = 'beton_tutorial_hose_hint_seen_v1';
const HOSE_FIRST_PICKUP_KEY = 'beton_hose_first_pickup_v1';
let hoseHeldAtLeastOnce = localStorage.getItem(HOSE_FIRST_PICKUP_KEY) === '1';
const hoseAnchorFallback = new THREE.Vector3();
let hoseAnchorFallbackValid = false;




// -----------------------------
// Physical hose
// -----------------------------
const hosePoints = [];
const hosePrev = [];
const hoseMeshes = []; // legacy array kept empty for compatibility/debug counters
const HOSE_SEGMENTS = 36;
const HOSE_REST = 0.21;
const HOSE_RADIUS = .105;
const HOSE_RADIAL_SEGMENTS = TOUCH_DEVICE ? 10 : 14;
// Textured procedural concrete-pump hose.
const hoseTextureLoader = new THREE.TextureLoader();
const hoseColorTex = hoseTextureLoader.load('./assets/hose_rubber_corrugated.jpg');
hoseColorTex.wrapS = THREE.RepeatWrapping;
hoseColorTex.wrapT = THREE.RepeatWrapping;
hoseColorTex.repeat.set(1.0, 5.5);
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




function makeDynamicHoseGeometry() {
  const rings = HOSE_SEGMENTS + 1;
  const radial = HOSE_RADIAL_SEGMENTS;
  const pos = new Float32Array(rings * radial * 3);
  const nor = new Float32Array(rings * radial * 3);
  const uv = new Float32Array(rings * radial * 2);
  const idx = [];
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < radial; j++) {
      const vi = i * radial + j;
      uv[vi * 2] = j / radial;
      uv[vi * 2 + 1] = i / HOSE_SEGMENTS;
    }
  }
  for (let i = 0; i < HOSE_SEGMENTS; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const b = i * radial + (j + 1) % radial;
      const c = (i + 1) * radial + (j + 1) % radial;
      const d = (i + 1) * radial + j;
      idx.push(a, d, b, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}




const hoseTubeGeom = makeDynamicHoseGeometry();
const hoseGroup = new THREE.Group();
hoseGroup.name = 'PHYSICAL_HOSE_RUNTIME';
scene.add(hoseGroup);
const hoseTube = new THREE.Mesh(hoseTubeGeom, hoseMat);
hoseTube.name = 'PHYSICAL_HOSE_CONTINUOUS_TUBE';
hoseTube.castShadow = true;
hoseTube.receiveShadow = true;
hoseTube.frustumCulled = false;
hoseTube.renderOrder = 2;
hoseGroup.add(hoseTube);




const hoseOutlineMat = new THREE.ShaderMaterial({
  uniforms: {
    uColor: { value: new THREE.Color(0x45ff33) },
    uExpand: { value: .028 },
    uOpacity: { value: .90 },
  },
  vertexShader: `
    uniform float uExpand;
    void main(){
      vec3 p = position + normal * uExpand;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    void main(){ gl_FragColor = vec4(uColor,uOpacity); }
  `,
  side: THREE.BackSide,
  transparent: true,
  depthTest: false,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  toneMapped: false,
});
const hoseOutline = new THREE.Mesh(hoseTubeGeom, hoseOutlineMat);
hoseOutline.name = 'PHYSICAL_HOSE_SELECTION_OUTLINE';
hoseOutline.visible = false;
hoseOutline.frustumCulled = false;
hoseOutline.renderOrder = 30;
hoseGroup.add(hoseOutline);




const hoseTip = new THREE.Mesh(new THREE.CylinderGeometry(.07, .095, .20, 14, 1, false), hoseEndMat);
hoseTip.geometry.translate(0, .10, 0);
const hoseCoupler = new THREE.Mesh(new THREE.CylinderGeometry(.125, .125, .32, 16, 1, false), hoseEndMat);
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
const hoseHeldForward = new THREE.Vector3();
const hoseHeldGuide = new THREE.Vector3();
const hoseHeldDrop = new THREE.Vector3();
const hoseTipAxis = new THREE.Vector3(0, 1, 0);
const hoseTubeTangent = new THREE.Vector3();
const hoseTubeN1 = new THREE.Vector3();
const hoseTubeN2 = new THREE.Vector3();
const hoseTubeRef = new THREE.Vector3();
const Y_AXIS = new THREE.Vector3(0, 1, 0);




function updateHoseTubeGeometry() {
  if (hosePoints.length !== HOSE_SEGMENTS + 1) return;
  const pos = hoseTubeGeom.attributes.position.array;
  const nor = hoseTubeGeom.attributes.normal.array;
  const radial = HOSE_RADIAL_SEGMENTS;
  for (let i = 0; i <= HOSE_SEGMENTS; i++) {
    const prev = hosePoints[Math.max(0, i - 1)];
    const next = hosePoints[Math.min(HOSE_SEGMENTS, i + 1)];
    hoseTubeTangent.copy(next).sub(prev).normalize();
    // Pick a stable reference axis even on the near-vertical hanging section.
    if (Math.abs(hoseTubeTangent.y) < .88) hoseTubeRef.set(0, 1, 0);
    else hoseTubeRef.set(1, 0, 0);
    hoseTubeN1.crossVectors(hoseTubeTangent, hoseTubeRef).normalize();
    hoseTubeN2.crossVectors(hoseTubeTangent, hoseTubeN1).normalize();
    const p = hosePoints[i];
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const ca = Math.cos(a), sa = Math.sin(a);
      const nx = hoseTubeN1.x * ca + hoseTubeN2.x * sa;
      const ny = hoseTubeN1.y * ca + hoseTubeN2.y * sa;
      const nz = hoseTubeN1.z * ca + hoseTubeN2.z * sa;
      const k = (i * radial + j) * 3;
      pos[k] = p.x + nx * HOSE_RADIUS;
      pos[k + 1] = p.y + ny * HOSE_RADIUS;
      pos[k + 2] = p.z + nz * HOSE_RADIUS;
      nor[k] = nx; nor[k + 1] = ny; nor[k + 2] = nz;
    }
  }
  hoseTubeGeom.attributes.position.needsUpdate = true;
  hoseTubeGeom.attributes.normal.needsUpdate = true;
}




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
// v51.29 — recesses are 15% deeper. TARGET_H follows physical depth so fill still ends flush.
const PIT_DEPTH = .16 * 1.15;
const TARGET_H = PIT_DEPTH;
const PIT_BOTTOM_Y = SLAB.floorY - PIT_DEPTH;
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
      levelRequired: .94,
      levelPrompted: false,
      readyNotified: false,
      hosePouredVolume: 0,
      settledGrade: null,
      eventType: null,
      eventThreshold: 0,
      eventTriggered: false,
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
  for (let zoneIndex = 0; zoneIndex < POUR_ZONES.length; zoneIndex++) {
    const zone = POUR_ZONES[zoneIndex];
    if (
      x >= zone.minX && x < zone.maxX &&
      z >= zone.minZ && z < zone.maxZ
    ) return zone;
  }
  return null;
}




// Rake and hose contact can land a few centimetres onto the inner wall/lip
// even though the visible tool is clearly inside the recess. Resolve that
// narrow seam to the nearest bay instead of creating a broken strip or spill.
function zoneNearEdge(x, z, padding = .20, preferredZone = null) {
  let best = null;
  let bestD2 = padding * padding;
  const candidates = preferredZone ? [preferredZone] : POUR_ZONES;




  for (const zone of candidates) {
    if (!zone) continue;
    const nearestX = THREE.MathUtils.clamp(x, zone.minX, zone.maxX);
    const nearestZ = THREE.MathUtils.clamp(z, zone.minZ, zone.maxZ);
    const dx = x - nearestX;
    const dz = z - nearestZ;
    const d2 = dx * dx + dz * dz;
    if (d2 <= bestD2) {
      bestD2 = d2;
      best = zone;
    }
  }
  return best;
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
  // Mobile top slab is intentionally a little lighter than the authored asphalt.
  // The stronger value separation makes the 18 cm structural recess readable on a phone.
  color: TOUCH_DEVICE ? 0xb8b5ab : 0xa7a8a2, roughness: .90, side: THREE.DoubleSide
});
const pitWallMat = new THREE.MeshStandardMaterial({
  // Strong inner-wall contrast substitutes for contact shadows on mobile.
  color: TOUCH_DEVICE ? 0x4b504d : 0x8d8f8a,
  roughness: .97, side: THREE.DoubleSide,
  polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
});
const pitBottomMat = new THREE.MeshStandardMaterial({
  // Light sub-base gives the dark steel enough contrast on a phone display.
  color: TOUCH_DEVICE ? 0x777970 : 0x777a73,
  roughness: 1.0, side: THREE.DoubleSide,
  polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
});




// Transparent tied-rebar layer at the physical bottom of every pour bay.
// It is deliberately a visual-only plane: player grounding continues to use
// zone.bottomY, it is never registered as a collider and raycasts ignore it.
function createFallbackRebarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  ctx.strokeStyle = '#2b2927';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  for (const p of [32, 96, 160, 224]) {
    ctx.beginPath(); ctx.moveTo(p, -12); ctx.lineTo(p, 268); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12, p); ctx.lineTo(268, p); ctx.stroke();
  }
  ctx.strokeStyle = '#171615';
  ctx.lineWidth = 3;
  for (const x of [32, 96, 160, 224]) {
    for (const y of [32, 96, 160, 224]) {
      ctx.beginPath();
      ctx.arc(x, y, 13, -.7, Math.PI + .8);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}




const rebarLayerMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  map: createFallbackRebarTexture(),
  transparent: true,
  opacity: .98,
  alphaTest: .055,
  depthTest: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  toneMapped: true,
  polygonOffset: true,
  polygonOffsetFactor: -7,
  polygonOffsetUnits: -7,
});




const rebarTexturePaths = TOUCH_DEVICE
  ? [
      './assets/final_mobile_safe_textures/rebar_grid_transparent.webp',
      './assets/final_mobile_textures/rebar_grid_transparent.webp',
    ]
  : [
      './assets/final_pc_textures/rebar_grid_transparent.webp',
      './rebar_grid_transparent.webp',
    ];




function loadRebarTexture(pathIndex = 0) {
  if (pathIndex >= rebarTexturePaths.length) {
    mobileDebugLog('rebar texture missing; procedural fallback active');
    return;
  }




  const path = rebarTexturePaths[pathIndex];
  new THREE.TextureLoader().load(path, texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // Three repeats keep the bars readable instead of aliasing into the dark
    // bottom at mobile resolution.
    texture.repeat.set(6, 6);
    texture.anisotropy = Math.min(TOUCH_DEVICE ? 4 : 8, renderer.capabilities.getMaxAnisotropy());
    rebarLayerMat.map = texture;
    rebarLayerMat.opacity = .98;
    rebarLayerMat.needsUpdate = true;
    mobileDebugLog(`rebar texture ready: ${path}`);
  }, undefined, () => loadRebarTexture(pathIndex + 1));
}




loadRebarTexture();




const wetConcreteMat = new THREE.MeshStandardMaterial({
  color: 0xd9dddb,
  roughness: .20,
  metalness: 0.0,
  side: THREE.DoubleSide,
  vertexColors: true,
  // The wet top ends flush with the structural slab. Bias it slightly toward
  // the camera so mobile depth precision cannot turn that shared rim into a
  // dotted black seam.
  polygonOffset: true,
  polygonOffsetFactor: -1,
  polygonOffsetUnits: -2,
});




// Generated seamless actively-flowing concrete PBR set. It deliberately shows
// wet cement slurry and exposed crushed aggregate instead of a finished floor.
// Mobile receives 512 px maps; desktop receives 1024 px maps.
const wetConcreteMaterials = new Set();
let wetConcreteAlbedo = null;
let wetConcreteNormal = null;
let wetConcreteHeight = null;




function applyWetConcreteTexture(material) {
  if (!material) return;
  if (wetConcreteAlbedo) material.map = wetConcreteAlbedo;
  if (wetConcreteNormal) {
    material.normalMap = wetConcreteNormal;
    material.normalScale.setScalar(material.userData.concreteNormalScale ?? .34);
  }
  if (wetConcreteHeight) {
    // Height drives micro-relief only. Real fill height remains controlled by
    // the gameplay heightfield, so visuals never alter collision or volume.
    material.bumpMap = wetConcreteHeight;
    material.bumpScale = material.userData.concreteBumpScale ?? .018;
  }
  material.needsUpdate = true;
}




function registerWetConcreteMaterial(material, bumpScale = .018, normalScale = .34) {
  material.userData.concreteBumpScale = bumpScale;
  material.userData.concreteNormalScale = normalScale;
  wetConcreteMaterials.add(material);
  applyWetConcreteTexture(material);
  return material;
}




registerWetConcreteMaterial(wetConcreteMat);




const wetConcreteTextureDir = TOUCH_DEVICE
  ? './assets/final_mobile_textures'
  : './assets/final_pc_textures';
const wetConcreteLoader = new THREE.TextureLoader();




function configureConcreteMap(texture, colorSpace) {
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.anisotropy = Math.min(
    TOUCH_DEVICE ? 4 : 8,
    renderer.capabilities.getMaxAnisotropy()
  );
  return texture;
}




function refreshWetConcreteMaterials() {
  for (const material of wetConcreteMaterials) applyWetConcreteTexture(material);
}




wetConcreteLoader.load(
  `${wetConcreteTextureDir}/wet_concrete_v3_albedo.webp`,
  texture => {
    wetConcreteAlbedo = configureConcreteMap(texture, THREE.SRGBColorSpace);
    refreshWetConcreteMaterials();
    mobileDebugLog('wet aggregate concrete albedo ready');
  },
  undefined,
  () => mobileDebugLog('wet concrete albedo missing; color fallback active')
);




wetConcreteLoader.load(
  `${wetConcreteTextureDir}/wet_concrete_v3_normal.webp`,
  texture => {
    wetConcreteNormal = configureConcreteMap(texture, THREE.NoColorSpace);
    refreshWetConcreteMaterials();
    mobileDebugLog('wet aggregate concrete normal ready');
  },
  undefined,
  () => mobileDebugLog('wet concrete normal map missing')
);




wetConcreteLoader.load(
  `${wetConcreteTextureDir}/wet_concrete_v3_height.webp`,
  texture => {
    wetConcreteHeight = configureConcreteMap(texture, THREE.NoColorSpace);
    refreshWetConcreteMaterials();
    mobileDebugLog('wet aggregate concrete height ready');
  },
  undefined,
  () => mobileDebugLog('wet concrete height map missing')
);




// v51.127 SAFE CURE -----------------------------------------------------------
// This replaces the old pre-game compatibility patch. v2 maps are requested only
// after a finished map has waited 30 seconds, so boot/GLTF loading stays untouched.
const DRY_AFTER_MS = 30_000;
const DRY_STORAGE_KEY = 'beton_concrete_cure_v51127';
const dryTimers = new Map();
const dryMaterials = new Map();
let dryTexturesPromise = null;
let dryState = (() => {
  try {
    const value = JSON.parse(localStorage.getItem(DRY_STORAGE_KEY) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch (_) { return {}; }
})();
function saveDryState() { try { localStorage.setItem(DRY_STORAGE_KEY, JSON.stringify(dryState)); } catch (_) {} }
function loadDryTexturesLazy() {
  if (dryTexturesPromise) return dryTexturesPromise;
  const load = (name, isColor) => new Promise((resolve, reject) => {
    wetConcreteLoader.load(`${wetConcreteTextureDir}/${name}`, texture => {
      configureConcreteMap(texture, isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace);
      resolve(texture);
    }, undefined, reject);
  });
  dryTexturesPromise = Promise.all([
    load('wet_concrete_v2_albedo.webp', true),
    load('wet_concrete_v2_normal.webp', false),
    load('wet_concrete_v2_height.webp', false),
  ]).then(([albedo, normal, height]) => ({ albedo, normal, height })).catch(error => {
    console.warn('[CURE] v2 maps unavailable; using matte fallback', error);
    return null;
  });
  return dryTexturesPromise;
}
async function applyCuredLook(zoneId) {
  const zone = POUR_ZONES.find(z => z.id === Number(zoneId));
  if (!zone?.surface || zone.surface.userData?.curedConcrete) return;
  zone.curedConcrete = true;
  if (zone.mobility?.fill) zone.mobility.fill(0);
  if (zone.velX?.fill) zone.velX.fill(0);
  if (zone.velZ?.fill) zone.velZ.fill(0);
  if (zone.flowDelta?.fill) zone.flowDelta.fill(0);
  if (zone.flowBudget?.fill) zone.flowBudget.fill(0);
  const textures = await loadDryTexturesLazy();
  const source = zone.surface.material;
  let material = dryMaterials.get(zone.id);
  if (!material) {
    material = source?.clone?.() || new THREE.MeshStandardMaterial();
    material.name = `CURED_CONCRETE_ZONE_${zone.id}_MATERIAL`;
    material.vertexColors = false;
    material.color?.set?.(0xd3d6d2);
    material.metalness = 0; material.roughness = .73; material.roughnessMap = null;
    material.transparent = false; material.opacity = 1; material.side = THREE.DoubleSide;
    if (textures) {
      material.map = textures.albedo; material.normalMap = textures.normal;
      material.normalScale = new THREE.Vector2(.16,.16);
      material.bumpMap = textures.height; material.bumpScale = .006;
    } else { material.normalMap = null; material.bumpMap = null; }
    material.userData = { ...(material.userData || {}), curedConcrete:true };
    material.needsUpdate = true; dryMaterials.set(zone.id, material);
  }
  zone.surface.material = material;
  zone.surface.userData = { ...(zone.surface.userData || {}), curedConcrete:true };
  for (const skirt of zone.surfaceSkirts || []) {
    if (!skirt?.material) continue;
    const side = skirt.material.clone();
    side.map = null; side.normalMap = null; side.bumpMap = null; side.roughnessMap = null;
    side.color?.set?.(0x767b76); side.roughness = .86; side.metalness = 0; side.needsUpdate = true;
    skirt.material = side;
  }
  dryState[zone.id] = { cured:true, cureAt:Date.now() }; saveDryState();
}
function armCure(zoneId, delay = DRY_AFTER_MS) {
  const id = Number(zoneId); if (!Number.isFinite(id) || id < 1 || dryTimers.has(id)) return;
  if (dryState[id]?.cured) {
    // Applying a saved visual is deferred until actual gameplay to protect initial boot.
    if (started) applyCuredLook(id);
    return;
  }
  const now = Date.now();
  const cureAt = Number(dryState[id]?.cureAt) || (now + Math.max(0, delay));
  dryState[id] = { cured:false, cureAt }; saveDryState();
  const timer = setTimeout(() => { dryTimers.delete(id); applyCuredLook(id); }, Math.max(0, cureAt-now));
  dryTimers.set(id, timer);
}
function restoreCuredLooksAfterStart() {
  for (const zone of POUR_ZONES) {
    const state = dryState[zone.id];
    if (state?.cured) setTimeout(() => applyCuredLook(zone.id), 200 + zone.id * 80);
    else if (Number(state?.cureAt) > 0) armCure(zone.id);
  }
}

function addPitBox(name, x, y, z, w, h, d, mat) {
  if (w <= .001 || h <= .001 || d <= .001) return null;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.name = name;
  m.position.set(x, y, z);
  m.castShadow = false;
  m.receiveShadow = true;
  m.frustumCulled = false;
  // Keep runtime recess geometry in the normal depth pass but after imported ground.
  m.renderOrder = TOUCH_DEVICE ? 2 : 0;
  pitGroup.add(m);
  return m;
}




function addPitRebarLayer(zone, visualBottomY) {
  const inset = .10;
  const geometry = new THREE.PlaneGeometry(
    Math.max(.10, zone.w - inset * 2),
    Math.max(.10, zone.d - inset * 2)
  );
  geometry.rotateX(-Math.PI * .5);




  const mesh = new THREE.Mesh(geometry, rebarLayerMat);
  mesh.name = `PIT_${zone.id}_REBAR_LAYER`;
  mesh.position.set(
    (zone.minX + zone.maxX) * .5,
    visualBottomY + .014,
    (zone.minZ + zone.maxZ) * .5
  );
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  mesh.renderOrder = TOUCH_DEVICE ? 9 : 3;
  mesh.userData.visualOnly = true;
  mesh.userData.noCollision = true;
  mesh.raycast = () => {};
  pitGroup.add(mesh);
  zone.rebarLayer = mesh;
  return mesh;
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




    // Desktop can use a single top plane. On mobile use a real thin slab box instead.
    // Some mobile GPUs + shadowless lighting made the old plane and the imported SITE_GROUND
    // read as one flat surface, visually erasing the 18 cm recess even though gameplay still
    // used the pit. The box adds actual vertical slab edges, so the depression is unambiguous
    // without changing simulation height or collision/gameplay.
    const mobileSlabH = .14;
    const tile = TOUCH_DEVICE
      ? new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, mobileSlabH, z1 - z0), slabMat)
      : new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), slabMat);
    tile.name = `SLAB_TILE_${xi}_${zi}`;
    if (TOUCH_DEVICE) {
      tile.position.set(mx, SLAB.floorY - mobileSlabH * .5, mz);
    } else {
      tile.rotation.x = -Math.PI * 0.5;
      tile.position.set(mx, SLAB.floorY, mz);
    }
    tile.castShadow = false;
    tile.receiveShadow = true;
    tile.frustumCulled = false;
    pitGroup.add(tile);
  }
}




function createConcreteEdgeSkirt(zone, edge) {
  const alongX = edge === 'minZ' || edge === 'maxZ';
  const segments = alongX ? zone.cols : zone.rows;
  const positions = new Float32Array((segments + 1) * 2 * 3);
  const indices = new Uint16Array(segments * 6);
  const surfaceVertexIndices = new Uint16Array(segments + 1);




  for (let i = 0; i <= segments; i++) {
    const vc = edge === 'minX' ? 0 : edge === 'maxX' ? zone.cols : i;
    const vr = edge === 'minZ' ? 0 : edge === 'maxZ' ? zone.rows : i;
    const x = -zone.w * .5 + (vc / zone.cols) * zone.w;
    const z = -zone.d * .5 + (vr / zone.rows) * zone.d;
    const p = i * 6;




    // Bottom/top pair. The tiny downward overlap hides precision cracks where
    // the dynamic concrete meets the fixed pit bottom and wall meshes.
    positions[p] = x;
    positions[p + 1] = -.004;
    positions[p + 2] = z;
    positions[p + 3] = x;
    positions[p + 4] = 0;
    positions[p + 5] = z;
    surfaceVertexIndices[i] = vr * (zone.cols + 1) + vc;




    if (i < segments) {
      const b0 = i * 2;
      const t0 = b0 + 1;
      const b1 = b0 + 2;
      const t1 = b0 + 3;
      indices.set([b0, b1, t0, t0, b1, t1], i * 6);
    }
  }




  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();




  const mesh = new THREE.Mesh(geometry, zone.edgeMaterial || wetConcreteMat);
  mesh.name = `FRESH_CONCRETE_ZONE_${zone.id}_SKIRT_${edge}`;
  mesh.position.copy(zone.surface.position);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  mesh.renderOrder = TOUCH_DEVICE ? 3 : 0;
  mesh.visible = false;
  mesh.userData.surfaceVertexIndices = surfaceVertexIndices;
  scene.add(mesh);
  return mesh;
}




// Bottom + four vertical walls for every bay.
for (const zone of POUR_ZONES) {
  // v51.72: mobile cuts SITE_GROUND away under the pour slab, so the visual floor can
  // finally sit at the authored bay bottom instead of being lifted onto the asphalt.
  const visualPitTopY = TOUCH_DEVICE
    ? zone.bottomY + .004
    : Math.max(zone.bottomY + .020, .016);
  addPitBox(
    `PIT_${zone.id}_BOTTOM`,
    (zone.minX + zone.maxX) * .5,
    visualPitTopY - .025,
    (zone.minZ + zone.maxZ) * .5,
    zone.w, .05, zone.d,
    pitBottomMat
  );
  addPitRebarLayer(zone, visualPitTopY);




  // Leave a tiny top gap so the pit wall and slab edge never become coplanar.
  const wallTopGap = .008;
  const wallH = Math.max(.02, zone.floorY - zone.bottomY - wallTopGap);
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




  // v51.127: decorative mobile lip removed. It overlapped the real wall/slab edge
  // and caused the doubled/jagged recess border.
}




// v51.72 MOBILE GROUND CUTOUT ------------------------------------------------
// FINAL_MOBILE's SITE_GROUND is one large asphalt box whose top is y=0.
// The bay bottom is ~y=-0.004, so that box visually caps every recess even though
// gameplay/camera height already follows the lower pit. On touch devices replace the
// single ground box with a four-piece frame around the slab. Outside the slab the
// authored asphalt/material is preserved; under the slab there is now an actual hole.
let mobileSiteGroundFrame = null;
function cutMobileSiteGroundUnderPourSlab(root) {
  if (!TOUCH_DEVICE || !root || mobileSiteGroundFrame) return false;




  const ground = root.getObjectByName('SITE_GROUND');
  if (!ground || !ground.isMesh || !ground.geometry || !ground.material) {
    mobileDebugLog('pit cutout: SITE_GROUND not found');
    return false;
  }




  ground.updateWorldMatrix(true, false);
  const bb = new THREE.Box3().setFromObject(ground);
  if (!Number.isFinite(bb.min.x) || !Number.isFinite(bb.max.x)) {
    mobileDebugLog('pit cutout: invalid SITE_GROUND bounds');
    return false;
  }




  const minX = bb.min.x, maxX = bb.max.x;
  const minZ = bb.min.z, maxZ = bb.max.z;
  const bottomY = bb.min.y, topY = bb.max.y;
  const h = Math.max(.04, topY - bottomY);
  const cy = (bottomY + topY) * .5;




  const parent = ground.parent || root;
  const frame = new THREE.Group();
  frame.name = 'MOBILE_SITE_GROUND_FRAME';




  const addFrameBox = (name, x0, x1, z0, z1) => {
    const w = x1 - x0;
    const d = z1 - z0;
    if (w <= .01 || d <= .01) return;




    const mat = Array.isArray(ground.material)
      ? ground.material.map(m => m?.clone?.() || m)
      : (ground.material.clone?.() || ground.material);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.name = name;
    mesh.position.set((x0 + x1) * .5, cy, (z0 + z1) * .5);
    mesh.castShadow = false;
    mesh.receiveShadow = ground.receiveShadow;
    mesh.frustumCulled = true;
    mesh.userData.walkOnly = true;
    frame.add(mesh);
  };




  // Full authored ground minus the exact runtime slab rectangle.
  addFrameBox('MOBILE_SITE_GROUND_W', minX, SLAB.minX, minZ, maxZ);
  addFrameBox('MOBILE_SITE_GROUND_E', SLAB.maxX, maxX, minZ, maxZ);
  addFrameBox('MOBILE_SITE_GROUND_S', SLAB.minX, SLAB.maxX, minZ, SLAB.minZ);
  addFrameBox('MOBILE_SITE_GROUND_N', SLAB.minX, SLAB.maxX, SLAB.maxZ, maxZ);




  ground.visible = false;
  parent.add(frame);
  mobileSiteGroundFrame = frame;
  frame.updateWorldMatrix(true, true);




  mobileDebugLog(
    `pit cutout active: SITE_GROUND ${Math.round(maxX-minX)}x${Math.round(maxZ-minZ)}m -> frame; slab opening ${SLAB.minX}..${SLAB.maxX}/${SLAB.minZ}..${SLAB.maxZ}`
  );
  return true;
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
  const surfaceVertexColors = new Float32Array(
    zone.surfaceGeom.attributes.position.count * 3
  );
  surfaceVertexColors.fill(1);
  zone.surfaceGeom.setAttribute(
    'color',
    new THREE.BufferAttribute(surfaceVertexColors, 3)
  );




  zone.wetMaterial = registerWetConcreteMaterial(wetConcreteMat.clone());
  zone.roughnessData = new Uint8Array(zone.cols * zone.rows * 4);
  zone.roughnessData.fill(255);
  zone.roughnessTexture = new THREE.DataTexture(
    zone.roughnessData,
    zone.cols,
    zone.rows,
    THREE.RGBAFormat,
    THREE.UnsignedByteType
  );
  zone.roughnessTexture.colorSpace = THREE.NoColorSpace;
  zone.roughnessTexture.flipY = true;
  zone.roughnessTexture.generateMipmaps = false;
  zone.roughnessTexture.minFilter = THREE.LinearFilter;
  zone.roughnessTexture.magFilter = THREE.LinearFilter;
  zone.roughnessTexture.needsUpdate = true;
  zone.wetMaterial.roughness = 1;
  zone.wetMaterial.roughnessMap = zone.roughnessTexture;
  zone.wetMaterial.needsUpdate = true;
  zone.edgeMaterial = wetConcreteMat.clone();
  zone.edgeMaterial.vertexColors = false;
  zone.edgeMaterial.map = null;
  zone.edgeMaterial.bumpMap = null;
  zone.edgeMaterial.color.set(0x59615e);
  zone.edgeMaterial.roughness = .52;
  zone.visualWetness = 1;




  zone.surface = new THREE.Mesh(zone.surfaceGeom, zone.wetMaterial);
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




  // PlaneGeometry has no vertical sides. Without these four lightweight
  // dynamic skirts the raised edge exposes the clear colour between the wet
  // surface and the pit wall, which looked like broken/dashed card borders.
  zone.surfaceSkirts = ['minZ', 'maxZ', 'minX', 'maxX']
    .map(edge => createConcreteEdgeSkirt(zone, edge));
}




function markZoneDirty(zone) { if (zone) zone.dirty = true; }
function markConcreteDirty() {
  for (const zone of POUR_ZONES) zone.dirty = true;
}




const concreteWetColor = new THREE.Color(0xd9dddb);
const concreteDryColor = new THREE.Color(0xffffff);
const concreteLocalWetColor = new THREE.Color(0xdee6e2);
const concreteLocalDryColor = new THREE.Color(0xffffff);
const concreteLocalFinishedColor = new THREE.Color(0xf4f5f1);
const concreteVertexColor = new THREE.Color();
let concreteAppearanceTimer = 0;




function updateConcreteVertexColors(zone) {
  const color = zone.surfaceGeom.attributes.color;
  if (!color) return;




  // MeshStandardMaterial reads roughness from the green channel. A tiny RGBA
  // DataTexture lets fresh cells stay glossy while old cells go matte without
  // requiring a custom shader or a full-resolution render target.
  for (let r = 0; r < zone.rows; r++) {
    for (let c = 0; c < zone.cols; c++) {
      const cell = zoneIndex(zone, c, r);
      const filled = zone.fill[cell] > .001;
      const wet = filled
        ? THREE.MathUtils.clamp((zone.mobility[cell] - .14) / .80, 0, 1)
        : 0;
      const finish = filled && zone.rakeTouched[cell] ? 1 : 0;
      const coarseRoughness = THREE.MathUtils.lerp(.82, .18, wet);
      const finishedRoughness = THREE.MathUtils.lerp(.62, .14, wet);
      const roughness = filled
        ? THREE.MathUtils.lerp(coarseRoughness, finishedRoughness, finish)
        : 1;
      const value = Math.round(THREE.MathUtils.clamp(roughness, 0, 1) * 255);
      const p = cell * 4;
      zone.roughnessData[p] = value;
      zone.roughnessData[p + 1] = value;
      zone.roughnessData[p + 2] = value;
      zone.roughnessData[p + 3] = 255;
    }
  }
  zone.roughnessTexture.needsUpdate = true;




  for (let vr = 0; vr <= zone.rows; vr++) {
    for (let vc = 0; vc <= zone.cols; vc++) {
      let mobility = 0;
      let finished = 0;
      let count = 0;




      for (const dc of [-1, 0]) {
        for (const dr of [-1, 0]) {
          const c = vc + dc;
          const r = vr + dr;
          if (c < 0 || c >= zone.cols || r < 0 || r >= zone.rows) continue;
          const cell = zoneIndex(zone, c, r);
          if (zone.fill[cell] <= .001) continue;
          mobility += zone.mobility[cell];
          finished += zone.rakeTouched[cell] ? 1 : 0;
          count++;
        }
      }




      const wet = count
        ? THREE.MathUtils.clamp((mobility / count - .14) / .80, 0, 1)
        : 0;
      const finish = count ? finished / count : 0;
      concreteVertexColor
        .lerpColors(concreteLocalDryColor, concreteLocalWetColor, wet)
        .lerp(concreteLocalFinishedColor, finish * .72);
      color.setXYZ(
        vr * (zone.cols + 1) + vc,
        concreteVertexColor.r,
        concreteVertexColor.g,
        concreteVertexColor.b
      );
    }
  }
  color.needsUpdate = true;
}




function updateConcreteAppearance(dt) {
  concreteAppearanceTimer += dt;
  const interval = TOUCH_DEVICE ? .20 : .12;
  if (concreteAppearanceTimer < interval) return;
  const step = concreteAppearanceTimer;
  concreteAppearanceTimer = 0;




  for (const zone of POUR_ZONES) {
    let mobilitySum = 0;
    let filledCells = 0;
    let finishedCells = 0;
    for (let i = 0; i < zone.fill.length; i++) {
      if (zone.fill[i] <= .001) continue;
      mobilitySum += zone.mobility[i];
      if (zone.rakeTouched[i]) finishedCells++;
      filledCells++;
    }




    const averageMobility = filledCells ? mobilitySum / filledCells : 1;
    const targetWetness = THREE.MathUtils.clamp(
      (averageMobility - .14) / .80,
      0,
      1
    );
    zone.visualWetness = THREE.MathUtils.damp(
      zone.visualWetness,
      targetWetness,
      2.2,
      step
    );




    const wet = zone.visualWetness;
    const finish = filledCells ? finishedCells / filledCells : 0;
    zone.wetMaterial.color.lerpColors(concreteDryColor, concreteWetColor, wet);
    zone.wetMaterial.roughness = 1;
    zone.wetMaterial.bumpScale = THREE.MathUtils.lerp(.022, .014, wet) *
      THREE.MathUtils.lerp(1, .48, finish);
    zone.wetMaterial.normalScale.setScalar(
      THREE.MathUtils.lerp(.24, .38, wet) * THREE.MathUtils.lerp(1, .54, finish)
    );
    zone.wetMaterial.envMapIntensity = THREE.MathUtils.lerp(.38, 1.15, wet);
    updateConcreteVertexColors(zone);




    // A darker vertical contact band visually seals concrete against the bay
    // wall and hides precision seams without changing collision or fill math.
    zone.edgeMaterial.color.copy(zone.wetMaterial.color).multiplyScalar(.58);
    zone.edgeMaterial.roughness = Math.min(1, zone.wetMaterial.roughness + .16);
  }
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
        let rawH = zoneVertexHeight(zone, vc, vr);




        // The final vertex row used to copy a single cell verbatim. Along the
        // wall this exposed every cell transition as a jagged saw-tooth. Blend
        // boundary vertices slightly toward the first interior row while the
        // physical heightfield and its volume remain untouched.
        if (zone.cols > 2 && zone.rows > 2 && (
          vc === 0 || vc === zone.cols || vr === 0 || vr === zone.rows
        )) {
          const innerVC = THREE.MathUtils.clamp(vc, 1, zone.cols - 1);
          const innerVR = THREE.MathUtils.clamp(vr, 1, zone.rows - 1);
          rawH = THREE.MathUtils.lerp(
            rawH,
            zoneVertexHeight(zone, innerVC, innerVR),
            .24
          );
        }
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




    for (const skirt of zone.surfaceSkirts || []) {
      const skirtPos = skirt.geometry.attributes.position;
      const edgeIndices = skirt.userData.surfaceVertexIndices;
      for (let i = 0; i < edgeIndices.length; i++) {
        // Odd vertices are the live top edge; even vertices stay slightly
        // below the pit floor to guarantee overlap.
        skirtPos.setY(i * 2, -.004);
        skirtPos.setY(i * 2 + 1, pos.getY(edgeIndices[i]) + .001);
      }
      skirtPos.needsUpdate = true;
      skirt.geometry.computeVertexNormals();
      skirt.geometry.computeBoundingSphere();
      skirt.visible = any;
    }
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
    meanHeight: 0,
  };




  const n = zone.fill.length;
  if (!n) return {
    score: 0,
    uniformity: 0,
    rakeCoverage: 0,
    coverage: 0,
    rmsError: zone.targetH,
    meanHeight: 0,
  };




  let meanHeight = 0;
  for (let i = 0; i < n; i++) meanHeight += zone.fill[i];
  meanHeight /= n;




  let sq = 0;
  for (let i = 0; i < n; i++) {
    // Flatness is measured against the current mean layer, not the target
    // height. Extra concrete is evaluated separately by Pavel as overpour, so
    // a deliberately overfilled but properly raked map can still be handed in.
    const err = zone.fill[i] - meanHeight;
    sq += err * err;
  }




  const rmsError = Math.sqrt(sq / n);




  // 0% when the slab is wildly lumpy/empty, 100% when cell heights are close
  // to the desired finished layer. Deliberately generous: this is arcade.
  const uniformity = THREE.MathUtils.clamp(
    1 - rmsError / (zone.targetH * .52),
    0, 1
  );




  const rakeCoverage = zoneRakeCoverage(zone);
  const rakeWork = THREE.MathUtils.clamp(rakeCoverage / .55, 0, 1);
  const coverage = zoneCoverage(zone);




  // Real surface quality matters most, but the player must actually work a
  // meaningful part of the area with the rake.
  const score = THREE.MathUtils.clamp(
    uniformity * .72 + rakeWork * .28,
    0, 1
  );




  return { score, uniformity, rakeCoverage, coverage, rmsError, meanHeight };
}




function zoneReadyForSequence(zone) {
  if (!zone) return false;
  const ratio = zoneVolume(zone) / zone.targetVolume;
  const level = zoneLevelStats(zone);
  return (
    ratio >= zone.successRatio &&
    level.coverage >= .82 &&
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




const CAREER_STATS_KEY = 'beton_career_stats_v1';
const CAREER_STATS_DEFAULTS = Object.freeze({
  concreteM3: 0,
  floorM2: 0,
  rakeStrokes: 0,
  moneyEarned: 0,
  energyDrunk: 0,
  beerDrunk: 0,
  cigarettesSmoked: 0,
  perfectQte: 0,
});




function loadCareerStats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CAREER_STATS_KEY) || '{}');
    const clean = { ...CAREER_STATS_DEFAULTS };
    for (const key of Object.keys(clean)) {
      const value = Number(parsed[key]);
      if (Number.isFinite(value) && value >= 0) clean[key] = value;
    }
    return clean;
  } catch (_) {
    return { ...CAREER_STATS_DEFAULTS };
  }
}




const careerStats = loadCareerStats();
let careerStatsDirty = false;
let careerStatsSaveTimer = 0;




function recordCareerStat(key, amount = 1) {
  if (!(key in careerStats) || !Number.isFinite(amount) || amount <= 0) return;
  careerStats[key] += amount;
  careerStatsDirty = true;
}




function saveCareerStats(force = false) {
  if (!careerStatsDirty && !force) return;
  try {
    localStorage.setItem(CAREER_STATS_KEY, JSON.stringify(careerStats));
    careerStatsDirty = false;
    careerStatsSaveTimer = 0;
  } catch (_) {}
}




function updateCareerStatsPersistence(dt) {
  if (!careerStatsDirty) return;
  careerStatsSaveTimer += dt;
  if (careerStatsSaveTimer >= 2.5) saveCareerStats();
}




window.addEventListener('pagehide', () => saveCareerStats(true));




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
let concreteVisualTimer = 0;
const POUR_PROGRESS_KEY = 'beton_pour_progress_v2';
let pourProgressDirty = false;
let pourProgressSaveTimer = 0;
let pourProgressLoading = false;




const POUR_EVENT_TYPES = ['pressure', 'hose', 'pump', 'eye'];
const POUR_EVENT_COPY = {
  pressure: { title: 'СКАЧОК ДАВЛЕНИЯ', text: '0,5 СЕК · ОТВЕДИ ШЛАНГ ИЛИ ВЫКЛЮЧИ ПОДАЧУ' },
  hose: { title: 'ШЛАНГ ВЫСКОЛЬЗНУЛ', text: 'ПЕРЕХВАТИ ЕГО' },
  pump: { title: 'ПОЛОМКА НАСОСА', text: 'ПОДАЧА ОСТАНОВЛЕНА' },
  eye: { title: 'БЕТОН В ГЛАЗ', text: 'СМАХНИ БЕТОН' },
};
const EVENT_ALARM_SECONDS = 1.00;

// v51.130: event assets are resolved before the first preload call.
// v51.129 called preloadEventUiAssets() before these helpers existed, which
// stopped the whole module at boot with ReferenceError on Safari.
const EVENT_UI_ASSET_CANDIDATES = {
  pressure: ['./assets/ui/events/alarm_pressure.png'],
  hose: ['./assets/ui/events/alarm_pump.png'],
  pump: ['./assets/ui/events/alarm_pump.png'],
  eye: ['./assets/ui/events/alarm_pump.png'],
  eyeSplat: ['./assets/ui/events/eye_splat.png'],
};
const resolvedEventUiAssets = Object.create(null);
function resolveExistingImage(candidates = []) {
  return new Promise(resolve => {
    const next = (i) => {
      if (i >= candidates.length) { resolve(''); return; }
      const src = candidates[i];
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => next(i + 1);
      img.src = src;
    };
    next(0);
  });
}
async function preloadEventUiAssets() {
  const keys = Object.keys(EVENT_UI_ASSET_CANDIDATES);
  await Promise.all(keys.map(async key => {
    resolvedEventUiAssets[key] = await resolveExistingImage(EVENT_UI_ASSET_CANDIDATES[key]);
  }));
}
function getResolvedEventUiAsset(key) {
  const list = EVENT_UI_ASSET_CANDIDATES[key] || [];
  return resolvedEventUiAssets[key] || list[0] || '';
}

let pendingPourEvent = null;
preloadEventUiAssets().catch(() => {});
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
  root.innerHTML = '<img class="betonEyeBlob" alt=""><div class="betonEyeTrack"><i></i></div><div class="betonEyeHint">СМАХНИ БЕТОН СЛЕВА НАПРАВО</div>';
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
  blindnessTimer = 30.0;
  blindnessOverlayEl?.classList.remove('active');
  const root = ensureEyeWipeUi();
  root.classList.add('show');
  const blob = root.querySelector('.betonEyeBlob'); if (blob) { blob.src = getResolvedEventUiAsset('eyeSplat'); blob.style.opacity='.98'; blob.style.transform='rotate(-3deg)'; }
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

const WIRE_COLORS = ['#ff5c57','#ff9c38','#f3d24e','#59d96d','#4ba6ff'];
const WIRE_GRID_COLS = 9;
const WIRE_GRID_ROWS = 9;
const WIRE_PUZZLE_TEMPLATES = [
  {
    starts: [
      { c: 0, r: 1, color: 0 },
      { c: 0, r: 3, color: 1 },
      { c: 0, r: 5, color: 2 },
      { c: 0, r: 7, color: 3 },
      { c: 2, r: 8, color: 4 },
    ],
    targets: [
      { c: 8, r: 5, color: 0 },
      { c: 8, r: 1, color: 1 },
      { c: 8, r: 7, color: 2 },
      { c: 8, r: 3, color: 3 },
      { c: 6, r: 0, color: 4 },
    ],
    blocked: [[4,2],[4,4],[4,6]]
  },
  {
    starts: [
      { c: 0, r: 1, color: 0 },
      { c: 1, r: 8, color: 1 },
      { c: 0, r: 5, color: 2 },
      { c: 0, r: 7, color: 3 },
      { c: 2, r: 0, color: 4 },
    ],
    targets: [
      { c: 8, r: 3, color: 0 },
      { c: 8, r: 7, color: 1 },
      { c: 8, r: 1, color: 2 },
      { c: 6, r: 8, color: 3 },
      { c: 8, r: 5, color: 4 },
    ],
    blocked: [[3,2],[5,2],[4,4],[3,6],[5,6]]
  },
  {
    starts: [
      { c: 0, r: 1, color: 0 },
      { c: 0, r: 4, color: 1 },
      { c: 0, r: 7, color: 2 },
      { c: 2, r: 8, color: 3 },
      { c: 2, r: 0, color: 4 },
    ],
    targets: [
      { c: 8, r: 7, color: 0 },
      { c: 8, r: 1, color: 1 },
      { c: 8, r: 4, color: 2 },
      { c: 6, r: 0, color: 3 },
      { c: 6, r: 8, color: 4 },
    ],
    blocked: [[4,1],[4,3],[4,5],[4,7]]
  },
];
let wirePuzzle = null;

function ensurePumpPuzzleUi() {
  let root = document.querySelector('#betonPumpPuzzle');
  if (root) return root;
  root = document.createElement('div');
  root.id='betonPumpPuzzle';
  root.className='betonEventQte';
  root.innerHTML='<div class="betonPumpPuzzleWrap"><button class="betonEventClose" type="button">×</button><div class="betonPumpPuzzleTitle">ЩИТОК НАСОСА</div><div class="betonPumpPuzzleSub">СОЕДИНИ 5 ПАР ПРОВОДОВ · НЕ ПЕРЕСЕКАЙ ЛИНИИ</div><div class="betonPumpShell"><canvas class="betonWireCanvas" width="720" height="720"></canvas></div><div class="betonWireStatus">ПРОВОДОВ: 0 / 5</div></div>';
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
  const template = WIRE_PUZZLE_TEMPLATES[Math.floor(Math.random() * WIRE_PUZZLE_TEMPLATES.length)];
  const starts = template.starts.map(p => ({ ...p }));
  const targets = template.targets.map(p => ({ ...p }));
  wirePuzzle={starts,targets,paths:new Map(),drag:null,count:starts.length,blocked:new Set((template.blocked || []).map(p=>p[0]+','+p[1])),mistakes:0};
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
  ctx.strokeStyle='rgba(205,205,184,.10)';ctx.lineWidth=1.0;
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
  for(let color=0;color<wirePuzzle.count;color++)for(const cell of [wirePuzzle.starts[color],wirePuzzle.targets[color]]){const p=wirePointForCell(cell,canvas);ctx.fillStyle='#111';ctx.beginPath();ctx.arc(p.x,p.y,22,0,Math.PI*2);ctx.fill();ctx.strokeStyle=WIRE_COLORS[color];ctx.lineWidth=10;ctx.stroke();ctx.fillStyle=WIRE_COLORS[color];ctx.beginPath();ctx.arc(p.x,p.y,8.5,0,Math.PI*2);ctx.fill();}
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
function prepareZoneRandomEvent(zone, index = 0) {
  if (!zone) return;
  const randomIndex = Math.floor(Math.random() * POUR_EVENT_TYPES.length);
  zone.eventType = POUR_EVENT_TYPES[(randomIndex + index) % POUR_EVENT_TYPES.length];
  zone.eventThreshold = THREE.MathUtils.randFloat(.26, .62);
  zone.eventTriggered = false;
}

POUR_ZONES.forEach((zone,index)=>prepareZoneRandomEvent(zone,index));

function cancelQTEWithoutPenalty(){if(!qteActive)return;qteActive=false;qteLayerEl.classList.remove('active');qteTargetEl.classList.remove('pulse','perfect','badclick');resetQTECooldown();}
function dropHoseFromEvent(message){hoseHeld=false;playHoseSlipAudio();if(hoseInteraction)hoseInteraction.text=pouring?'E — взять шланг · БЕТОН ЛЬЁТСЯ!':'E — взять шланг';showToast(message,4.2);}

function showPourEventAlarm(zone) {
  if (!zone || zone.eventTriggered || pendingPourEvent) return;
  zone.eventTriggered=true; pendingPourEvent={zone,type:zone.eventType}; eventAlarmTimer=EVENT_ALARM_SECONDS;
  const copy=POUR_EVENT_COPY[zone.eventType]||POUR_EVENT_COPY.pressure;
  if(eventAlarmEl){eventAlarmEl.dataset.event=zone.eventType;eventAlarmTitleEl.textContent=copy.title;eventAlarmTextEl.textContent=copy.text;eventAlarmEl.style.setProperty('--event-icon-image', getResolvedEventUiAsset(zone.eventType) ? `url("${getResolvedEventUiAsset(zone.eventType)}")` : 'none');eventAlarmEl.classList.remove('show');void eventAlarmEl.offsetWidth;eventAlarmEl.classList.add('show');}
  playQTEAppearAudio(); mobileHaptic(35); markPourProgressDirty();
}

function executePendingPourEvent() {
  const event=pendingPourEvent; pendingPourEvent=null; eventAlarmTimer=0; eventAlarmEl?.classList.remove('show'); pressurePulseMesh.visible=false;
  if(!event)return;
  if(event.type==='pressure'){
    // Turning the pump off during the 1.0 s warning is a full counter.
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
      eventAlarmEl.style.setProperty('--event-icon-image', getResolvedEventUiAsset('pump') ? `url("${getResolvedEventUiAsset('pump')}")` : 'none');
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

// Deliberately simple material ladder requested for settlement:
// S/diamond = a HUD-clean 100.0%, A/gold <=105%, B/iron <=115%,
// F/poop covers 115–125%; anything beyond the scale remains F.
const POUR_GRADE_RULES = [
  { grade: 'S', maxOverpour: .049, multiplier: 1.40, color: '#d8f4ff' },
  { grade: 'A', maxOverpour: 5.0, multiplier: 1.15, color: '#ffe28a' },
  { grade: 'B', maxOverpour: 15.0, multiplier: .75, color: '#b9c4cf' },
  { grade: 'F', maxOverpour: 25.0, multiplier: .25, color: '#a96b47' },
];
const BASE_ZONE_REWARD = 500;




function zoneOverpourPercent(zone) {
  if (!zone) return 0;
  // Use the same live physical volume that drives the HUD. The old hidden
  // hosePouredVolume counter could keep counting concrete lost against a
  // capped edge cell, so a visible 100.1% slab could incorrectly receive F.
  return Math.max(0, zoneVolume(zone) / Math.max(.000001, zone.targetVolume) * 100 - 100);
}




function gradePourZone(zone) {
  const overpour = zoneOverpourPercent(zone);
  const rule = POUR_GRADE_RULES.find(entry => overpour <= entry.maxOverpour) || POUR_GRADE_RULES[POUR_GRADE_RULES.length - 1];
  return {
    ...rule,
    overpour,
    reward: Math.round(BASE_ZONE_REWARD * rule.multiplier),
  };
}








// -----------------------------
// PERSISTENT SURFACE SPILLS / "ПЛЮХИ"
// -----------------------------
// Pouring onto the solid construction slab no longer deletes concrete.
// Outside the recessed bays it forms persistent wet clumps which can be
// pushed with the rake back into a bay.
const spillClumps = [];
// A moving hose used to create an unlimited number of individual spill meshes.
// Besides growing scene memory, relaxSurfaceSpills() compares every pair (O(n²)).
// Pool a fixed visual budget and preserve excess volume by merging the lightest old clump.
const SPILL_CLUMP_MAX = TOUCH_DEVICE ? 56 : 160;
const spillGroup = new THREE.Group();
spillGroup.name = 'PERSISTENT_SURFACE_CONCRETE_SPILLS';
scene.add(spillGroup);




// Shared cheap hemisphere. Each clump is scaled into a wide, low wet mound.
const spillGeom = new THREE.SphereGeometry(
  1, 18, 8,
  0, Math.PI * 2,
  0, Math.PI * .5
);
const spillMat = registerWetConcreteMaterial(new THREE.MeshStandardMaterial({
  color: 0xa0a9a5,
  roughness: .24,
  metalness: 0.0,
  side: THREE.DoubleSide
}), .022);
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




function recycleSpillClump(x, z, volume, impactVX, impactVZ, impactSpeed) {
  let victim = spillClumps[0];
  for (const p of spillClumps) {
    if ((p.volume || 0) < (victim.volume || 0)) victim = p;
  }




  // Preserve the victim's concrete by folding it into its nearest neighbour,
  // then reuse the already-uploaded Mesh for the new impact point.
  let receiver = null;
  let receiverD2 = Infinity;
  for (const p of spillClumps) {
    if (p === victim) continue;
    const dx = p.x - victim.x;
    const dz = p.z - victim.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < receiverD2) { receiver = p; receiverD2 = d2; }
  }
  if (receiver && victim.volume > 0) {
    const a = Math.max(0, receiver.volume);
    const b = Math.max(0, victim.volume);
    const total = a + b;
    if (total > 0) {
      receiver.x = (receiver.x * a + victim.x * b) / total;
      receiver.z = (receiver.z * a + victim.z * b) / total;
      receiver.vx = (receiver.vx * a + victim.vx * b) / total;
      receiver.vz = (receiver.vz * a + victim.vz * b) / total;
      receiver.volume = total;
      receiver.mobility = Math.max(receiver.mobility || .18, victim.mobility || .18);
      receiver.spread = Math.max(receiver.spread || 1, victim.spread || 1);
      refreshSpillClump(receiver);
    }
  }




  victim.x = x;
  victim.z = z;
  victim.volume = Math.max(0, volume);
  victim.radius = .2;
  victim.height = .035;
  victim.vx = THREE.MathUtils.clamp(impactVX * .11, -.75, .75);
  victim.vz = THREE.MathUtils.clamp(impactVZ * .11, -.75, .75);
  victim.mobility = THREE.MathUtils.clamp(.78 + impactSpeed * .02, .78, 1);
  victim.spread = .72;
  victim.age = 0;
  refreshSpillClump(victim);
  return victim;
}




function createSpillClump(x, z, volume, impactVX = 0, impactVZ = 0, impactSpeed = 0) {
  if (spillClumps.length >= SPILL_CLUMP_MAX) {
    return recycleSpillClump(x, z, volume, impactVX, impactVZ, impactSpeed);
  }
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
    markPourProgressDirty();
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
  markPourProgressDirty();
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




  let changed = false;




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
        changed = true;
        addConcreteVolumeAt(
          nx, nz, moved,
          p.vx, p.vz,
          Math.hypot(p.vx, p.vz)
        );
      }
      p.vx *= .55;
      p.vz *= .55;
    } else if (insideSlab(nx, nz) && !targetZone) {
      if (Math.abs(nx - p.x) > 1e-5 || Math.abs(nz - p.z) > 1e-5) changed = true;
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
      changed = true;
      refreshSpillClump(a);
      refreshSpillClump(b);
    }
  }




  deleteDeadSpills();
  if (changed) markPourProgressDirty();
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




  if (zone?.curedConcrete) return 0;
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
  if (amountM3 <= 0 || zone?.curedConcrete) return false;




  const radius = THREE.MathUtils.clamp(
    .20 + Math.cbrt(Math.max(.00001, amountM3)) * .30 + impactSpeed * .008,
    .20, .40
  );
  const r2 = radius * radius;




  // Keep the numerical impact kernel inside the recess. Previously a circle
  // centred against a wall was cut in half and the full volume was normalized
  // into the few surviving cells, producing spikes and broken-looking seams.
  const edgeInsetX = Math.min(radius * .68, zone.w * .45);
  const edgeInsetZ = Math.min(radius * .68, zone.d * .45);
  const kernelX = THREE.MathUtils.clamp(cx, zone.minX + edgeInsetX, zone.maxX - edgeInsetX);
  const kernelZ = THREE.MathUtils.clamp(cz, zone.minZ + edgeInsetZ, zone.maxZ - edgeInsetZ);




  const minC = Math.max(0, Math.floor((kernelX - radius - zone.minX) / zone.cellX));
  const maxC = Math.min(zone.cols - 1, Math.floor((kernelX + radius - zone.minX) / zone.cellX));
  const minR = Math.max(0, Math.floor((kernelZ - radius - zone.minZ) / zone.cellZ));
  const maxR = Math.min(zone.rows - 1, Math.floor((kernelZ + radius - zone.minZ) / zone.cellZ));




  const cells = [];
  let weightSum = 0;




  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const x = zone.minX + (c + .5) * zone.cellX;
      const z = zone.minZ + (r + .5) * zone.cellZ;
      const dx = x - kernelX, dz = z - kernelZ;
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
    cells.push([zoneCellAt(zone, kernelX, kernelZ).index, 1]);
    weightSum = 1;
  }




  for (const [idx, w] of cells) {
    const cellVolume = amountM3 * (w / weightSum);
    zone.fill[idx] = Math.min(
      zone.maxH,
      zone.fill[idx] + cellVolume / zone.cellArea
    );




    zone.mobility[idx] = Math.max(
      zone.mobility[idx],
      THREE.MathUtils.clamp(.86 + impactSpeed * .018, .86, 1)
    );
    // Fresh material poured over an already finished patch must restore the
    // coarse wet look until the player works that cell again.
    zone.rakeTouched[idx] = 0;




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
  impactSpeed = 0,
  fromHose = false
) {
  if (jobState !== 'active' || volumeM3 <= 0) return false;




  let zone = zoneAt(x, z);
  let depositX = x;
  let depositZ = z;




  // A ray/particle landing on the inner lip should feed the currently active
  // recess, not create a thin spill exactly along its wall.
  if (!zone) {
    const targetZone = activePourZone();
    const seamZone = zoneNearEdge(x, z, .18, targetZone);
    if (seamZone) {
      zone = seamZone;
      depositX = THREE.MathUtils.clamp(x, zone.minX + zone.cellX * .35, zone.maxX - zone.cellX * .35);
      depositZ = THREE.MathUtils.clamp(z, zone.minZ + zone.cellZ * .35, zone.maxZ - zone.cellZ * .35);
    }
  }




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
    markPourProgressDirty();
    return false;
  }




  if (fromHose) zone.hosePouredVolume += volumeM3;




  const changed = depositConcreteImpact(
    zone,
    depositX, depositZ,
    volumeM3,
    impactVX,
    impactVZ,
    impactSpeed
  );




  if (changed) {
    markPourProgressDirty();
    evaluateJob();
  }
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




  if (changed) {
    markZoneDirty(zone);
    markPourProgressDirty();
  }
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
const BLOB_MAX = TOUCH_DEVICE ? 48 : 120;
const blobGeom = new THREE.SphereGeometry(.15, 14, 10);
const blobMat = registerWetConcreteMaterial(new THREE.MeshStandardMaterial({ color: 0x707774, roughness: .30, metalness: 0.0 }), .010, .24);
blobMat.map = wetConcreteAlbedo || blobMat.map;
blobMat.normalMap = wetConcreteNormal || blobMat.normalMap;
blobMat.bumpMap = wetConcreteHeight || blobMat.bumpMap;
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




// Lightweight pooled hose splashes. They are purely visual and never allocate
// during gameplay, which keeps repeated pouring safe on iPhone Safari.
const HOSE_SPLASH_MAX = TOUCH_DEVICE ? 24 : 56;
const hoseSplashGeom = new THREE.SphereGeometry(.022, 6, 4);
const hoseSplashMat = registerWetConcreteMaterial(new THREE.MeshStandardMaterial({
  color: 0x8b918d,
  roughness: .30,
  metalness: 0,
}), .008, .22);
const hoseSplashGroup = new THREE.Group();
hoseSplashGroup.name = 'HOSE_SPLASH_PARTICLES';
scene.add(hoseSplashGroup);
const hoseSplashes = [];
for (let i = 0; i < HOSE_SPLASH_MAX; i++) {
  const mesh = new THREE.Mesh(hoseSplashGeom, hoseSplashMat);
  mesh.visible = false;
  mesh.castShadow = false;
  hoseSplashGroup.add(mesh);
  hoseSplashes.push({ mesh, vel: new THREE.Vector3(), age: 0, life: .45 });
}
let hoseSplashCursor = 0;
let hoseSplashAccumulator = 0;




// Short-lived flat wet spots sell the impact of droplets without becoming
// permanent decals or adding collision. Every mesh is pooled up front.
const SPLASH_SPOT_MAX = TOUCH_DEVICE ? 12 : 24;
const splashSpotGeom = new THREE.CircleGeometry(1, 12);
splashSpotGeom.rotateX(-Math.PI * .5);
const splashSpotGroup = new THREE.Group();
splashSpotGroup.name = 'HOSE_WET_SPOTS';
scene.add(splashSpotGroup);
const splashSpots = [];
for (let i = 0; i < SPLASH_SPOT_MAX; i++) {
  const material = registerWetConcreteMaterial(new THREE.MeshStandardMaterial({
    color: 0x424c48,
    roughness: .34,
    metalness: 0,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  }), .004, .12);
  const mesh = new THREE.Mesh(splashSpotGeom, material);
  mesh.visible = false;
  mesh.raycast = () => {};
  splashSpotGroup.add(mesh);
  splashSpots.push({ mesh, age: 0, life: 2, baseOpacity: .16 });
}
let splashSpotCursor = 0;




// Expanding surface ripples make the hose impact read as a heavy viscous
// liquid. They are flat, pooled and collision-free, so the effect is cheap on
// mobile and cannot interfere with the fill simulation.
const IMPACT_RIPPLE_MAX = TOUCH_DEVICE ? 10 : 18;
const impactRippleGeom = new THREE.RingGeometry(.72, 1, TOUCH_DEVICE ? 16 : 24);
impactRippleGeom.rotateX(-Math.PI * .5);
const impactRippleGroup = new THREE.Group();
impactRippleGroup.name = 'CONCRETE_IMPACT_RIPPLES';
scene.add(impactRippleGroup);
const impactRipples = [];
for (let i = 0; i < IMPACT_RIPPLE_MAX; i++) {
  const material = new THREE.MeshBasicMaterial({
    color: 0xb8c2bd,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
  const mesh = new THREE.Mesh(impactRippleGeom, material);
  mesh.visible = false;
  mesh.raycast = () => {};
  impactRippleGroup.add(mesh);
  impactRipples.push({ mesh, age: 0, life: .55, intensity: 1 });
}
let impactRippleCursor = 0;




function spawnConcreteImpactRipple(x, z, surfaceY, intensity) {
  const ripple = impactRipples[impactRippleCursor++ % impactRipples.length];
  ripple.age = 0;
  ripple.life = THREE.MathUtils.randFloat(.42, .68);
  ripple.intensity = THREE.MathUtils.clamp(intensity, .65, 1.6);
  ripple.mesh.visible = true;
  ripple.mesh.position.set(x, surfaceY + .010, z);
  ripple.mesh.rotation.y = Math.random() * Math.PI;
  ripple.mesh.scale.setScalar(.055 * ripple.intensity);
  ripple.mesh.material.opacity = .26;
}




function spawnWetSplashSpot(x, z, surfaceY, intensity) {
  const spot = splashSpots[splashSpotCursor++ % splashSpots.length];
  spot.age = 0;
  spot.life = THREE.MathUtils.randFloat(1.6, 2.8);
  spot.baseOpacity = THREE.MathUtils.clamp(.10 + intensity * .08, .10, .24);
  spot.mesh.visible = true;
  spot.mesh.material.opacity = spot.baseOpacity;
  spot.mesh.position.set(
    x + THREE.MathUtils.randFloatSpread(.16),
    surfaceY + .008,
    z + THREE.MathUtils.randFloatSpread(.16)
  );
  spot.mesh.rotation.y = Math.random() * Math.PI;
  const radius = THREE.MathUtils.randFloat(.075, .16) * Math.max(.8, intensity);
  spot.mesh.scale.set(radius * THREE.MathUtils.randFloat(.75, 1.35), radius, radius);
}




function spawnHoseSplashBurst(x, z, zone, intensity = 1) {
  const surfaceY = zone
    ? zone.bottomY + getFillHeightAt(x, z)
    : groundHeightAt(x, z);
  const count = TOUCH_DEVICE ? 2 : 3;
  for (let i = 0; i < count; i++) {
    const p = hoseSplashes[hoseSplashCursor++ % hoseSplashes.length];
    p.age = 0;
    p.life = THREE.MathUtils.randFloat(.28, .50);
    p.mesh.visible = true;
    p.mesh.position.set(
      x + THREE.MathUtils.randFloatSpread(.08),
      surfaceY + .035,
      z + THREE.MathUtils.randFloatSpread(.08)
    );
    const speed = THREE.MathUtils.randFloat(.34, .78) * intensity;
    const angle = Math.random() * Math.PI * 2;
    p.vel.set(Math.cos(angle) * speed, THREE.MathUtils.randFloat(.45, 1.05) * intensity, Math.sin(angle) * speed);
    p.mesh.scale.setScalar(THREE.MathUtils.randFloat(.72, 1.30) * intensity);
  }
  spawnWetSplashSpot(x, z, surfaceY, intensity);
  spawnConcreteImpactRipple(x, z, surfaceY, intensity);
}




function updateHoseSplashes(dt) {
  for (const p of hoseSplashes) {
    if (!p.mesh.visible) continue;
    p.age += dt;
    p.vel.y -= 4.8 * dt;
    p.mesh.position.addScaledVector(p.vel, dt);
    const lifeLeft = 1 - p.age / Math.max(.001, p.life);
    p.mesh.scale.multiplyScalar(Math.max(.86, 1 - dt * 2.6));
    if (lifeLeft <= 0 || p.mesh.position.y < groundHeightAt(p.mesh.position.x, p.mesh.position.z) - .03) {
      p.mesh.visible = false;
    }
  }




  for (const spot of splashSpots) {
    if (!spot.mesh.visible) continue;
    spot.age += dt;
    const lifeLeft = 1 - spot.age / Math.max(.001, spot.life);
    if (lifeLeft <= 0) {
      spot.mesh.visible = false;
      spot.mesh.material.opacity = 0;
      continue;
    }
    spot.mesh.material.opacity = spot.baseOpacity * lifeLeft * lifeLeft;
  }




  for (const ripple of impactRipples) {
    if (!ripple.mesh.visible) continue;
    ripple.age += dt;
    const t = ripple.age / Math.max(.001, ripple.life);
    if (t >= 1) {
      ripple.mesh.visible = false;
      ripple.mesh.material.opacity = 0;
      continue;
    }
    const radius = THREE.MathUtils.lerp(.055, .42, 1 - Math.pow(1 - t, 2));
    ripple.mesh.scale.setScalar(radius * ripple.intensity);
    ripple.mesh.material.opacity = .26 * Math.pow(1 - t, 1.7);
  }
}




// Pooled rake grooves sit a few millimetres above the wet heightfield and are
// recycled after several seconds. They make each real sweep visible without
// adding permanent geometry or textures.
// v51.90: visual grooves/decals were removed at the player's request.
// Physical leveling and rake coverage tracking remain unchanged.
const RAKE_MARK_MAX = 0;
const rakeMarkGeom = new THREE.PlaneGeometry(.032, .62);
const rakeMarkMat = new THREE.MeshBasicMaterial({
  color: 0x303633,
  transparent: true,
  opacity: .24,
  depthWrite: false,
  side: THREE.DoubleSide,
  polygonOffset: true,
  polygonOffsetFactor: -2,
});
const rakeMarkGroup = new THREE.Group();
rakeMarkGroup.name = 'WET_RAKE_MARKS';
scene.add(rakeMarkGroup);
const rakeMarks = [];
for (let i = 0; i < RAKE_MARK_MAX; i++) {
  const mesh = new THREE.Mesh(rakeMarkGeom, rakeMarkMat);
  mesh.visible = false;
  mesh.renderOrder = 5;
  rakeMarkGroup.add(mesh);
  rakeMarks.push({ mesh, age: 0, life: 9 });
}
let rakeMarkCursor = 0;
let rakeMarkCooldown = 0;
const rakeMarkFlatQuat = new THREE.Quaternion().setFromUnitVectors(
  new THREE.Vector3(0, 0, 1),
  Y_AXIS
);
const rakeMarkYawQuat = new THREE.Quaternion();




function spawnRakeMarks(px, pz, dirX, dirZ) {
  const zone = zoneAt(px, pz);
  if (!zone) return;
  const len = Math.hypot(dirX, dirZ);
  if (len < .001) return;
  dirX /= len;
  dirZ /= len;
  const sideX = -dirZ;
  const sideZ = dirX;
  const angle = Math.atan2(dirX, dirZ);
  for (const offset of [-.16, 0, .16]) {
    const x = px + sideX * offset;
    const z = pz + sideZ * offset;
    if (zoneAt(x, z) !== zone) continue;
    const mark = rakeMarks[rakeMarkCursor++ % rakeMarks.length];
    mark.age = 0;
    mark.life = THREE.MathUtils.randFloat(7.0, 10.5);
    mark.mesh.visible = true;
    mark.mesh.position.set(x, zone.bottomY + getFillHeightAt(x, z) + .004, z);
    rakeMarkYawQuat.setFromAxisAngle(Y_AXIS, angle);
    mark.mesh.quaternion.copy(rakeMarkYawQuat).multiply(rakeMarkFlatQuat);
    mark.mesh.scale.set(THREE.MathUtils.randFloat(.80, 1.12), THREE.MathUtils.randFloat(.72, 1.18), 1);
  }
}




function updateRakeMarks(dt) {
  rakeMarkCooldown = Math.max(0, rakeMarkCooldown - dt);
  for (const mark of rakeMarks) {
    if (!mark.mesh.visible) continue;
    mark.age += dt;
    if (mark.age >= mark.life) mark.mesh.visible = false;
  }
}




const pourTipPrevSafe = new THREE.Vector3();
const pourTipVelSafe = new THREE.Vector3();
const pourOutletDirSafe = new THREE.Vector3();
const pourVisualVelSafe = new THREE.Vector3();
let pourTipPrevSafeValid = false;




function spawnBlob(pos, burst = false, inheritedVel = null, radius = .145) {
  const b = blobs[blobCursor++ % BLOB_MAX];
  b.active = true;
  b.age = 0;
  b.settled = false;
  b.radius = radius;
  b.mesh.visible = true;
  b.mesh.position.copy(pos);
  b.mesh.scale.setScalar(b.radius / .15);
  b.vel.set(
    THREE.MathUtils.randFloatSpread(burst ? .6 : .14),
    THREE.MathUtils.randFloat(burst ? -.12 : -.04, .06),
    THREE.MathUtils.randFloatSpread(burst ? .6 : .14)
  );
  if (inheritedVel) b.vel.addScaledVector(inheritedVel, 1.18);
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
const RAKE_OWNED_STORAGE_KEY = 'beton_rake_owned_v5128';
let rakeOwned = false;
try { rakeOwned = localStorage.getItem(RAKE_OWNED_STORAGE_KEY) === '1'; } catch (_) {}
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
const RAKE_VM_BASE_POS = new THREE.Vector3(.72, -.58, -1.68);
// v51.29 — handle points back toward the player instead of sideways across the frame.
const RAKE_VM_BASE_ROT = new THREE.Euler(-.16, -.18, -.06, 'XYZ');




const RAKE_VIEWMODEL_LAYER = 2;




const rakeVM = new THREE.Group();
rakeVM.name = 'SCENE_CONCRETE_RAKE_VM';
rakeVM.visible = false;
rakeVM.layers.set(RAKE_VIEWMODEL_LAYER);
camera.add(rakeVM);




// The rake is rendered in a dedicated second pass/layer. Enable the normal
// scene lights on that layer too, otherwise MeshStandardMaterial renders black.
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
  holder.scale.setScalar(2.70 / modelLength); // +33% more than v51.42 in-hand size
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




  // Canonical rake model for first-person/hotbar. The world can contain
  // multiple authored rake props with different transforms, but picking any of
  // them must always give the SAME viewmodel in the player's hand.
  rakeSceneSource = candidates[0];
  rakeWorld = candidates[0];
  buildRakeViewModelFromScene(rakeSceneSource);
  rakeVM.visible = false;
  setHotbar3DModel('rake', rakeSceneSource);

  if (rakeOwned) {
    for (const source of rakeCandidateRoots) source.visible = false;
    for (const it of rakePickupInteractions) {
      const i = interactive.indexOf(it);
      if (i >= 0) interactive.splice(i, 1);
      if (it.obj?.parent) it.obj.parent.remove(it.obj);
    }
    rakePickupInteractions.length = 0;
    rakePickupInteraction = null;
  }
}




function pickupRake(source = null) {
  if (rakeOwned) return;
  rakeOwned = true;
  saveRakeOwned();




  // Hide only the physical rake that was picked. Do not rebuild the FPS
  // viewmodel from it: the hand model is canonical and independent of pickup.
  const pickedWorldRake = source || rakeWorld || rakeCandidateRoots[0] || null;
  rakeWorld = pickedWorldRake;
  if (pickedWorldRake) pickedWorldRake.visible = false;




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
    rakeVM.scale.setScalar(1);
    rakeProximityScaleBlend = 0;
    if (hoseHeld) {
      hoseHeld = false;
      pouring = false;
      if (hoseInteraction) hoseInteraction.text = 'E — взять шланг';
      evaluateJob();
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
  const zone = zoneAt(px, pz) || zoneNearEdge(px, pz, .62, activePourZone());
  if (!zone || zone.curedConcrete) return didSomething;




  // Clamp only the simulation brush centre. The visible rake remains exactly
  // under the player's aim, while its useful area now reaches the wall cells.
  const workX = THREE.MathUtils.clamp(
    px,
    zone.minX + zone.cellX * .35,
    zone.maxX - zone.cellX * .35
  );
  const workZ = THREE.MathUtils.clamp(
    pz,
    zone.minZ + zone.cellZ * .35,
    zone.maxZ - zone.cellZ * .35
  );




  const brushRadius = 1.55;
  const brushR2 = brushRadius * brushRadius;
  const cells = [];
  let localSum = 0;
  let weightSum = 0;




  for (let r = 0; r < zone.rows; r++) {
    for (let c = 0; c < zone.cols; c++) {
      const x = zone.minX + (c + .5) * zone.cellX;
      const z = zone.minZ + (r + .5) * zone.cellZ;
      const dx = x - workX;
      const dz = z - workZ;
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
  const centerStrength = 1 - Math.exp(-8.20 * step);




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




  // Finishing assist: once the bay is essentially full and the player has
  // genuinely raked a meaningful portion of it, gently relax the remaining tiny
  // highs/lows across the whole bay. This removes end-game pixel hunting while
  // preserving total concrete volume exactly enough for gameplay purposes.
  const finishRatio = zoneVolume(zone) / Math.max(.000001, zone.targetVolume);
  const finishCoverage = zoneRakeCoverage(zone);
  if (finishRatio >= .985 && finishRatio <= 1.45 && finishCoverage >= .34) {
    let globalSum = 0;
    for (let i = 0; i < zone.fill.length; i++) globalSum += zone.fill[i];
    const globalMean = globalSum / zone.fill.length;
    const assistStrength = 1 - Math.exp(-2.80 * step);
    let assistBefore = 0;
    let assistAfter = 0;
    for (let i = 0; i < zone.fill.length; i++) {
      assistBefore += zone.fill[i];
      zone.fill[i] += (globalMean - zone.fill[i]) * assistStrength;
      assistAfter += zone.fill[i];
    }
    const assistCorrection = (assistBefore - assistAfter) / zone.fill.length;
    for (let i = 0; i < zone.fill.length; i++) {
      zone.fill[i] = Math.max(0, zone.fill[i] + assistCorrection);
    }
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
    markPourProgressDirty();
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
const QTE_DURATION_MS = 1140; // v51.65: +20% response window (950ms -> 1140ms)
const QTE_PERFECT_AT = 0.76;       // visual approach ring coincides with target here
const QTE_PERFECT_WINDOW_MS = 90;  // rhythm-game perfect window
let qtePerfectBoostUntil = 0;
let qtePerfects = 0;
let qteX = innerWidth * .5, qteY = innerHeight * .5;
let qteCursorX = innerWidth * .5, qteCursorY = innerHeight * .5;




function resetQTECooldown() {
  qteCooldown = THREE.MathUtils.randFloat(10.0, 15.0);
}
function showPerfectQTEFeedback() {
  if (!qtePerfectFeedbackEl) return;
  qtePerfectFeedbackEl.classList.remove('show');
  void qtePerfectFeedbackEl.offsetWidth;
  qtePerfectFeedbackEl.classList.add('show');
  window.setTimeout(() => qtePerfectFeedbackEl.classList.remove('show'), 1900);
}
function startQTE() {
  if (qteActive || pendingPourEvent || eventAlarmTimer > 0 || pumpBroken || jobState !== 'active' || !hoseHeld || !pouring) return;
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
      recordCareerStat('perfectQte');
      qtePerfectBoostUntil = performance.now() + 5000;
      qteTargetEl.classList.add('perfect');
      setTimeout(() => qteTargetEl.classList.remove('perfect'), 180);
      showToast('ИДЕАЛЬНО! ПОДАЧА БЕТОНА +35% · 5 СЕК');
      showPerfectQTEFeedback();
    } else {
      showToast('ДАВЛЕНИЕ СТАБИЛЬНО · QTE OK');
    }
    markPourProgressDirty();
  } else {
    qteMisses++;
    markPourProgressDirty();
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
  }




  hoseGroup.visible = true;
  hoseTube.visible = true;
  hoseOutline.visible = false;
  hoseCoupler.position.copy(anchorPos);
  hoseCoupler.position.y -= .16;
  hoseCoupler.rotation.set(0, 0, 0);
  updateHoseTubeGeometry();




  hoseProxy = new THREE.Object3D();
  hoseProxy.name = 'HOSE_GRAB_END';
  scene.add(hoseProxy);
  hoseProxy.position.copy(hosePoints[hosePoints.length - 1]);
  hoseTip.position.copy(hosePoints[hosePoints.length - 1]);
  if (hosePoints.length > 1) {
    hoseTmpDir.copy(hosePoints[hosePoints.length - 1]).sub(hosePoints[hosePoints.length - 2]);
    if (hoseTmpDir.lengthSq() > 1e-8) hoseTip.quaternion.setFromUnitVectors(hoseTipAxis, hoseTmpDir.normalize());
  }




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




    camera.getWorldDirection(hoseHeldForward);
    hoseHeldForward.y = THREE.MathUtils.clamp(hoseHeldForward.y - 0.08, -0.22, 0.18);
    if (hoseHeldForward.lengthSq() < 1e-6) hoseHeldForward.set(0, -0.12, -1);
    hoseHeldForward.normalize();
    for (let k = 1; k <= Math.min(4, HOSE_SEGMENTS); k++) {
      const idx = HOSE_SEGMENTS - k;
      hoseHeldGuide.copy(hoseHandTarget).addScaledVector(hoseHeldForward, -0.18 * k);
      hoseHeldDrop.set(0, -0.028 * k, 0);
      hoseHeldGuide.add(hoseHeldDrop);
      hosePoints[idx].copy(hoseHeldGuide);
      hosePrev[idx].copy(hoseHeldGuide);
    }
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




  updateHoseTubeGeometry();
  if (hoseProxy) hoseProxy.position.copy(hosePoints[HOSE_SEGMENTS]);
  hoseTip.position.copy(hosePoints[HOSE_SEGMENTS]);
  if (hosePoints.length > 1) {
    hoseTmpDir.copy(hosePoints[HOSE_SEGMENTS]).sub(hosePoints[Math.max(0, HOSE_SEGMENTS - 1)]);
    if (hoseTmpDir.lengthSq() > 1e-8) hoseTip.quaternion.setFromUnitVectors(hoseTipAxis, hoseTmpDir.normalize());
  }
  if (hosePoints.length > 1) {
    hoseTmpDir.copy(hosePoints[HOSE_SEGMENTS]).sub(hosePoints[Math.max(0, HOSE_SEGMENTS - 1)]);
    if (hoseTmpDir.lengthSq() > 1e-8) hoseTip.quaternion.setFromUnitVectors(hoseTipAxis, hoseTmpDir.normalize());
  }




  updatePouring(dt);
  updatePourEvents(dt);
  relaxConcrete(dt);
  updateConcreteAppearance(dt);
  concreteVisualTimer += dt;
  if (!TOUCH_DEVICE || concreteVisualTimer >= 1 / 12) {
    concreteVisualTimer = 0;
    refreshConcreteSurfaces();
  }
  updateBlobs(dt);
  updateHoseSplashes(dt);
  updateRakeMarks(dt);
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
  if (!pouring || pumpBroken || !hosePoints.length || jobState !== 'active') {
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




  if (hoseHeld) {
    camera.getWorldDirection(pourOutletDirSafe);
    pourOutletDirSafe.y = THREE.MathUtils.clamp(pourOutletDirSafe.y - 0.10, -0.26, 0.12);
    if (pourOutletDirSafe.lengthSq() < 1e-7) pourOutletDirSafe.set(0, -0.16, -1);
    pourOutletDirSafe.normalize();
  } else {
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
  }




  const rateMult = currentPumpRateMultiplier() * currentPerfectQTEBoost();




  pourVisualVelSafe
    .copy(pourOutletDirSafe)
    .multiplyScalar((hoseHeld ? 2.35 : 1.35) * rateMult)
    .addScaledVector(pourTipVelSafe, hoseHeld ? .22 : .42);




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
  let volume = currentPourRateM3() * dt;




  // Pressure spike: one dangerous mass-bearing slug. Its volume is precomputed from
  // the current map percentage so ignoring it threatens an overpour.
  const pressureSpike = pressureSpikePending;
  if (pressureSpike) {
    pressureSpikePending = false;
    const spikeVolume = Math.max(0, pressureSpikeVolumeM3);
    pressureSpikeVolumeM3 = 0;
    volume += spikeVolume;
    spawnBlob(end, true, pourVisualVelSafe, .52);
  }




  recordCareerStat('concreteM3', volume);




  addConcreteVolumeAt(
    impactX,
    impactZ,
    volume,
    pourVisualVelSafe.x,
    pourVisualVelSafe.z,
    pourVisualVelSafe.length(),
    true
  );




  hoseSplashAccumulator += dt;
  const splashInterval = TOUCH_DEVICE ? .115 : .075;
  if (hoseSplashAccumulator >= splashInterval) {
    hoseSplashAccumulator %= splashInterval;
    spawnHoseSplashBurst(
      impactX,
      impactZ,
      zoneAt(impactX, impactZ),
      pressureSpike ? 1.8 : 1
    );
  }




  // Denser stream at higher pump levels.
  const blobInterval = .065 / Math.pow(rateMult, .30);
  if (pressureSpike) {
    // The event frame is represented by the single large slug above instead
    // of a cluster of normal stream balls.
    blobSpawnAccumulator = 0;
  } else {
    blobSpawnAccumulator += dt;
    while (blobSpawnAccumulator >= blobInterval) {
      blobSpawnAccumulator -= blobInterval;
      spawnBlob(end, false, pourVisualVelSafe);
    }
  }
}
// -----------------------------
// Job evaluation / reset
// -----------------------------
function evaluateJob() {
  if (jobState !== 'active') return;




  // Reaching the target no longer turns the pump off. The player owns the
  // switch and can deliberately overpour; Pavel converts that excess into a
  // lower rank and payout at settlement.
  const currentZone = activePourZone();
  if (currentZone) {
    const currentRatio = zoneVolume(currentZone) / currentZone.targetVolume;
    const currentLevel = zoneLevelStats(currentZone);




    if (
      currentRatio >= .995 &&
      currentLevel.score < currentZone.levelRequired
    ) {
      if (!currentZone.levelPrompted) {
        currentZone.levelPrompted = true;
        showToast(
          `100% НАБРАНО · НАСОС НЕ ОСТАНОВЛЕН · ПЕРЕЛИВ УХУДШИТ ОЦЕНКУ · РОВНОСТЬ ${Math.round(THREE.MathUtils.clamp(currentLevel.score / Math.max(.001, currentZone.levelRequired), 0, 1) * 100)}%`,
          4.4
        );
      }
    }
  }




  // Advance the authored sequence only after the current highlighted map is
  // both deep enough and sufficiently covered. If it happens while the pump
  // is still ON, keep that map active until the player switches it off so an
  // intentional overpour remains possible.
  let settlementNoticeShown = false;
  if (currentZone && zoneReadyForSequence(currentZone) && !currentZone.readyNotified) {
    currentZone.readyNotified = true;
    markPourProgressDirty();
    armCure(currentZone.id);
    settlementNoticeShown = true;
    preloadSettlementRankSheet();
    showToast(`КАРТА №${currentZone.id} ЗАЛИТА · ДОСТУПЕН РАСЧЁТ — ПОДОЙДИ К ПАШЕ`, 5.4);
  }




  const beforeAdvance = activePourZoneIndex;
  if (!pouring) {
    while (activePourZoneIndex < POUR_ZONES.length && zoneReadyForSequence(POUR_ZONES[activePourZoneIndex])) {
      activePourZoneIndex++;
    }
  }
  if (activePourZoneIndex !== beforeAdvance) {
    markPourProgressDirty();
    outlinedPourZoneId = -1;
    if (!settlementNoticeShown && activePourZoneIndex < POUR_ZONES.length) {
      showToast(`КАРТА №${beforeAdvance + 1} ВЫРОВНЕНА · ТЕПЕРЬ №${activePourZoneIndex + 1}`);
    } else if (!settlementNoticeShown) {
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
    markPourProgressDirty();
    pouring = false;
    hoseHeld = false;
    if (hoseInteraction) hoseInteraction.text = 'E — взять шланг';
    if (qteActive) {
      qteActive = false;
      qteLayerEl.classList.remove('active');
    }
    showToast('ВСЕ КАРТЫ ГОТОВЫ · ДОСТУПЕН РАСЧЁТ — ПОДОЙДИ К ПАШЕ', 5.4);
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
    markPourProgressDirty();
    showToast('ЗАЛИВКА ГОТОВА. СДАЙ ОБЪЕКТ ПАВЛУ ПЕТРОВИЧУ.');
    return;
  }




  jobState = 'failed';
  markPourProgressDirty();
  openJobResult(
    'ПЕРЕЛИВ',
    `Сектор ${failedZone ? failedZone.id : '?'} перелит выше допуска. Переделываешь весь объект.`,
    'ПЕРЕДЕЛАТЬ'
  );
}




function resetPourJob() {
  for (let zoneIndex = 0; zoneIndex < POUR_ZONES.length; zoneIndex++) {
    const zone = POUR_ZONES[zoneIndex];
    zone.fill.fill(0);
    zone.mobility.fill(0);
    zone.velX.fill(0);
    zone.velZ.fill(0);
    zone.flowDelta.fill(0);
    zone.flowBudget.fill(0);
    zone.rakeTouched.fill(0);
    zone.levelPrompted = false;
    zone.readyNotified = false;
    zone.curedConcrete = false;
    zone.hosePouredVolume = 0;
    zone.settledGrade = null;
    prepareZoneRandomEvent(zone, zoneIndex);
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
  pumpBroken = false;
  pressureSpikePending = false;
  pressureSpikeVolumeM3 = 0;
  hoseRecoveryNeeded = false;
  hoseControlActive = false;
  hoseControlHeld = false;
  hoseControlFailures = 0;
  eyeWipeActive = false;
  pumpPuzzleOpen = false;
  window.__betonEventResult = '—';
  document.querySelector('#betonHoseControl')?.classList.remove('show','pressed');
  document.querySelector('#betonEyeWipe')?.classList.remove('show');
  document.querySelector('#betonPumpPuzzle')?.classList.remove('show');
  pendingPourEvent = null;
  eventAlarmTimer = 0;
  blindnessTimer = 0;
  eventAlarmEl?.classList.remove('show');
  blindnessOverlayEl?.classList.remove('active');
  wastedVolume = 0;
  pouring = false;
  blobSpawnAccumulator = 0;
  hoseSplashAccumulator = 0;
  for (const splash of hoseSplashes) splash.mesh.visible = false;
  for (const mark of rakeMarks) mark.mesh.visible = false;
  pourTipPrevSafeValid = false;
  concreteRelaxTimer = 0;
  concreteVisualTimer = 0;
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
  const rawZonePct = Math.max(0, zoneRatio * 100);
  const zonePct = (zoneRatio >= .995 && zoneRatio <= 1.0)
    ? 100
    : rawZonePct;
  const zoneRemaining = zoneRatio >= .995
    ? 0
    : Math.max(0, zone.targetVolume - zoneVol);
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
  // HUD percentage is normalized to the practical completion threshold: when
  // the bay is good enough to advance, the player sees a clean 100%, not 94–99%.
  const levelPct = Math.round(THREE.MathUtils.clamp(
    levelStats.score / Math.max(.001, zone.levelRequired), 0, 1
  ) * 100);
  fillLevelEl.textContent = `${levelPct}%`;
  fillLevelEl.style.color =
    levelPct >= 100
      ? '#91e68b'
      : levelPct >= 65
        ? '#eee790'
        : '#e4b18d';
  const active = activePourZone();
  if (active && jobState === 'active') {
    const activeRatio = zoneVolume(active) / active.targetVolume;
    const activeLevel = zoneLevelStats(active);
    const gradePreview = gradePourZone(active);
    zoneProgressEl.textContent = activeRatio >= .985
      ? `№${active.id}: РАНГ ${gradePreview.grade} · РОВНОСТЬ ${Math.round(THREE.MathUtils.clamp(activeLevel.score / Math.max(.001, active.levelRequired), 0, 1) * 100)}% · готово ${completed}/6`
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




let lastTaskTrackerKey = '';
let taskTrackerPulseTimer = 0;




function updateTaskTracker() {
  if (!taskTrackerEl) return;
  const blocked = !started || shopOpen || resultOpen || dialogueOpen || statsOpen || settlementCutsceneActive;
  taskTrackerEl.classList.toggle('isHidden', blocked);
  if (blocked) return;




  const active = activePourZone();
  const step = active
    ? `${Math.min(active.id, POUR_ZONES.length)}/${POUR_ZONES.length}`
    : `${Math.min(paidPourZoneCount, POUR_ZONES.length)}/${POUR_ZONES.length}`;
  let key = 'idle';
  let icon = '◆';
  let title = 'Ожидайте задачу';
  let detail = 'Объект №17';
  let progress = 0;




  if (jobState === 'accepted') {
    key = 'complete';
    icon = '✓';
    title = 'Объект завершён';
    detail = 'Все карты приняты Павлом';
    progress = 100;
  } else if (pumpBroken) {
    key = 'repair';
    icon = '!';
    title = 'Починить насос';
    detail = 'Подойдите к Джорджу';
    progress = 0;
  } else if (!hoseHeldAtLeastOnce) {
    key = 'find-hose';
    icon = '◆';
    title = 'Найти и взять шланг';
    detail = 'Он находится возле бетонного насоса';
    progress = 0;
  } else if (jobReadyForHandover()) {
    key = `pavel-${paidPourZoneCount}`;
    icon = '✓';
    title = 'Получить расчёт';
    detail = 'Готовая карта · подойдите к Павлу';
    progress = 100;
  } else if (active) {
    const ratio = zoneVolume(active) / Math.max(.000001, active.targetVolume);
    const fillPct = THREE.MathUtils.clamp(ratio * 100, 0, 125);
    const levelStats = zoneLevelStats(active);
    const levelPct = Math.round(THREE.MathUtils.clamp(
      levelStats.score / Math.max(.001, active.levelRequired),
      0,
      1
    ) * 100);




    if (ratio < .985) {
      key = hoseHeld ? `pour-${active.id}` : `take-hose-${active.id}`;
      icon = hoseHeld ? '●' : '◆';
      title = hoseHeld ? `Залить карту №${active.id}` : 'Взять шланг';
      detail = `${fillPct.toFixed(0)}% · осталось ${Math.max(0, active.targetVolume - zoneVolume(active)).toFixed(2)} м³`;
      progress = THREE.MathUtils.clamp(fillPct, 0, 100);
    } else if (levelPct < 100) {
      key = !rakeOwned
        ? `find-rake-${active.id}`
        : rakeEquipped
          ? `level-${active.id}`
          : `take-rake-${active.id}`;
      icon = '↔';
      title = !rakeOwned
        ? 'Найти и взять грабли'
        : rakeEquipped
          ? `Выровнять карту №${active.id}`
          : 'Взять грабли в руки';
      detail = `Ровность ${levelPct}% · требуется 100%`;
      progress = levelPct;
    } else if (surfaceSpillVolume() > .015) {
      key = `spill-${active.id}`;
      icon = '!';
      title = 'Собрать бетон с плиты';
      detail = `${surfaceSpillVolume().toFixed(2)} м³ · загоните граблями в карту`;
      progress = 100;
    } else {
      key = `pavel-ready-${active.id}`;
      icon = '✓';
      title = 'Получить расчёт';
      detail = `Карта №${active.id} готова · подойдите к Павлу`;
      progress = 100;
    }
  }




  taskTrackerStepEl.textContent = jobState === 'accepted' ? '6/6' : step;
  taskTrackerIconEl.textContent = icon;
  taskTrackerTitleEl.textContent = title;
  taskTrackerDetailEl.textContent = detail;
  taskTrackerFillEl.style.width = `${THREE.MathUtils.clamp(progress, 0, 100)}%`;
  taskTrackerEl.dataset.state = key.startsWith('repair') || key.startsWith('spill') ? 'warning' :
    key.startsWith('complete') || key.startsWith('pavel') ? 'done' : 'active';




  if (key !== lastTaskTrackerKey) {
    lastTaskTrackerKey = key;
    taskTrackerEl.classList.remove('taskChanged');
    void taskTrackerEl.offsetWidth;
    taskTrackerEl.classList.add('taskChanged');
    if (taskTrackerPulseTimer) window.clearTimeout(taskTrackerPulseTimer);
    taskTrackerPulseTimer = window.setTimeout(() => {
      taskTrackerEl?.classList.remove('taskChanged');
    }, 620);
  }
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
    if (o.userData?.noCollision) return;




    // FOLIAGE / GROUND DECALS: never collide with leaf cards, tree crowns, flowers,
    // grass tufts or parking-line decals. These meshes are visual only.
    const materialNames = (Array.isArray(o.material) ? o.material : [o.material])
      .filter(Boolean).map(m => String(m.name || '').toLowerCase());
    const isFoliage =
      low.includes('cannabis plant_leaf') || low.includes('leaf_') || low.includes('leaves') ||
      low.includes('foliage') || low.includes('tree_birch') || low.includes('birch-') ||
      materialNames.some(m =>
        m === 'leaf' || m === 'leaves' || m.includes('foliage') || m.includes('tree_birch') ||
        m.includes('tree-branches') || m.includes('leaves')
      );
    const isGrassOrFlowers =
      low.includes('grass') || low.includes('flower') || low.includes('daisy') || low.includes('daffodil') || low.includes('stem') ||
      materialNames.some(m => m.includes('grass') || m.includes('flower') || m.includes('daisy') || m.includes('daffodil') || m.includes('stem'));
    if (isFoliage || isGrassOrFlowers) return;




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




    // Imported pump/mixer CAD is split by material, not by physical solid part. Some of those
    // meshes span 8-12 metres while containing only sparse rails/panels; one OBB then blocks
    // a completely empty lane (the invisible blocker near George). Keep compact vehicle parts
    // collidable, but reject only broad material-aggregate boxes automatically.
    let vehicleAncestor = o.parent;
    let underVehicle = false;
    while (vehicleAncestor) {
      const vn = String(vehicleAncestor.name || '').toLowerCase();
      if (vn.includes('hoze truck') || vn.includes('concrete mixer truck') || vn.includes('mixer truck') || vn === 'assembly-10') {
        underVehicle = true; break;
      }
      vehicleAncestor = vehicleAncestor.parent;
    }
    const vehicleMaterialAggregate = underVehicle && (footprintMax > 4.15 || (size.x * size.z) > 13.5);
    if (vehicleMaterialAggregate) {
      skippedHuge++;
      console.warn('[COLLISION] sparse vehicle material aggregate skipped:', n, size);
      return;
    }




    const isParkingDecal =
      inMonetkaParkingZone(bb, 1.0, 1.0) &&
      low.startsWith('plane') &&
      size.y <= 0.35 && bb.max.y <= 0.35 &&
      footprintMax >= 3.0 && footprintMax <= 13.5 &&
      footprintMin >= 2.5 && footprintMin <= 5.5;
    if (isParkingDecal) {
      addWalkSurface(n || 'parking decal', bb.min.x, bb.max.x, bb.min.z, bb.max.z, bb.max.y);
      walkable++;
      return;
    }




    if (o.userData?.walkOnly) {
      addWalkSurface(n || 'walk surface', bb.min.x, bb.max.x, bb.min.z, bb.max.z, bb.max.y);
      walkable++;
      return;
    }




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




  // v51.29 — explicit collision along the authored scene perimeter. The vehicle gate stays open.
  addColliderXZ('PERIMETER_NORTH', -32.50, 32.50, 22.80, 23.30, 0, 2.25);
  addColliderXZ('PERIMETER_SOUTH_LEFT', -32.50, -9.20, -23.20, -22.65, 0, 2.25);
  addColliderXZ('PERIMETER_SOUTH_RIGHT', 9.20, 32.50, -23.20, -22.65, 0, 2.25);
  addColliderXZ('PERIMETER_FAR_SOUTH', -31.80, 32.05, -50.95, -50.35, 0, 2.25);
  addColliderXZ('PERIMETER_WEST_MAIN', -32.55, -32.20, -23.25, 23.30, 0, 2.25);
  addColliderXZ('PERIMETER_EAST_MAIN', 32.20, 32.55, -23.25, 23.30, 0, 2.25);
  addColliderXZ('PERIMETER_WEST_YARD', -32.55, -32.20, -51.40, -22.95, 0, 2.25);
  addColliderXZ('PERIMETER_EAST_YARD', 32.20, 32.55, -51.40, -22.95, 0, 2.25);




  // Prefer higher overlapping walk surfaces (e.g. pavement over SITE_GROUND).
  walkSurfaces.sort((a, b) => b.topY - a.topY);
  console.log(`Scene collision: ${added} compact OBB obstacles · ${walkable} walk surfaces · ${skippedHuge} broad/combined meshes skipped + perimeter walls`);
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




  // The plane pivot is authored at the intended feet position. The exported
  // marker has no useful rotation, so face the actual construction yard
  // instead of forcing yaw=0 (which points out of the map from this spawn).
  const p = spawn.getWorldPosition(new THREE.Vector3());
  playerPos.set(p.x, 0, p.z);
  authoredSpawnXZ.set(p.x, p.z);
  authoredSpawnReady = true;
  const initialLookTarget = new THREE.Vector2(0, -6);
  yaw = Math.atan2(p.x - initialLookTarget.x, p.z - initialLookTarget.y);
  pitch = 0;
  spawn.visible = false;
  syncCameraToPlayer();
  console.log('PLAYER SPAWN FROM BLENDER:', p, 'facing construction yard, yaw=', yaw);
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

  let bb = new THREE.Box3().setFromObject(source);
  // FINAL_MOBILE_LITE strips two absurdly dense authored drink pickup meshes.
  // Their named nodes keep the original positions; rebuild the visible can with ~40 tris.
  if (bb.isEmpty() && MOBILE_LITE_MODE && spec.type === 'rewind') {
    const canMat = new THREE.MeshStandardMaterial({ color: 0xe2bb24, roughness: .48, metalness: .18 });
    const topMat = new THREE.MeshStandardMaterial({ color: 0x9ca1a1, roughness: .38, metalness: .72 });
    const can = new THREE.Mesh(new THREE.CylinderGeometry(.048, .048, .22, 10, 1), canMat);
    can.position.y = .11;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(.043, .043, .008, 10, 1), topMat);
    top.position.y = .222;
    source.add(can, top);
    source.updateWorldMatrix(true, true);
    bb = new THREE.Box3().setFromObject(source);
    mobileDebugLog(`lite pickup stand-in: ${spec.node}`);
  }
  const center = bb.isEmpty()
    ? source.getWorldPosition(new THREE.Vector3())
    : bb.getCenter(new THREE.Vector3());
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
    requiresLook: true,
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




function rotateStaticArmVertices(mesh, centerX, leftShoulderX, rightShoulderX, pivotY, angleRad) {
  if (!mesh?.isMesh || !mesh.geometry?.attributes?.position || mesh.userData?.babaArmsRelaxed) return;
  mesh.geometry = mesh.geometry.clone();
  const attr = mesh.geometry.attributes.position;
  for (let i = 0; i < attr.count; i++) {
    let x = attr.getX(i), y = attr.getY(i), z = attr.getZ(i);
    let px = null, a = 0;
    if (x < leftShoulderX) { px = leftShoulderX; a = angleRad; }
    else if (x > rightShoulderX) { px = rightShoulderX; a = -angleRad; }
    if (px === null) continue;
    const dx = x - px, dy = y - pivotY;
    const c = Math.cos(a), sn = Math.sin(a);
    attr.setXYZ(i, px + dx * c - dy * sn, pivotY + dx * sn + dy * c, z);
  }
  attr.needsUpdate = true;
  mesh.geometry.computeBoundingBox();
  mesh.geometry.computeBoundingSphere();
  mesh.geometry.computeVertexNormals();
  mesh.userData = mesh.userData || {};
  mesh.userData.babaArmsRelaxed = true;
}




function relaxBabaKapaTPose(root) {
  if (!root) return;
  const torso = root.getObjectByName('туловище');
  const arms = root.getObjectByName('руки');
  const gloves = root.getObjectByName('перчатки');
  if (!torso || !arms) return;
  torso.geometry?.computeBoundingBox?.();
  arms.geometry?.computeBoundingBox?.();
  const tb = torso.geometry?.boundingBox;
  const ab = arms.geometry?.boundingBox;
  if (!tb || !ab) return;
  const centerX = (tb.min.x + tb.max.x) * .5;
  const leftShoulderX = tb.min.x + (tb.max.x - tb.min.x) * .08;
  const rightShoulderX = tb.max.x - (tb.max.x - tb.min.x) * .08;
  const pivotY = (ab.min.y + ab.max.y) * .5;
  const relaxAngle = THREE.MathUtils.degToRad(68);
  rotateStaticArmVertices(arms, centerX, leftShoulderX, rightShoulderX, pivotY, relaxAngle);
  rotateStaticArmVertices(gloves, centerX, leftShoulderX, rightShoulderX, pivotY, relaxAngle);
  console.log('[BABA] static T-pose arms relaxed procedurally');
}




let babaIdleClock = 0;
let babaIdleBaseYaw = 0;
function updateBabaProceduralIdle(dt) {
  if (!babaGroundLockEnabled || !babaWorldRoot) return;
  babaIdleClock += dt;
  const breathe = Math.sin(babaIdleClock * 1.72);
  const sway = Math.sin(babaIdleClock * .73);
  babaWorldRoot.visible = true;
  babaWorldRoot.position.y = babaLockedY + breathe * .006;
  babaWorldRoot.rotation.y = babaIdleBaseYaw + sway * .015;
  babaWorldRoot.updateMatrixWorld(true);
}




function findOrCreateBabaKapa(root) {
  if (!root) return null;
  const existing = root.getObjectByName('BabaKapa');
  if (existing) return existing;
  const partNames = ['брови','веки','волосы','глаза','голова','крылья','ноги','нос','перчатки','платок','платье','руки','тапки','туловище','усы'];
  const parts = partNames.map(name => root.getObjectByName(name)).filter(Boolean);
  if (parts.length < 8) return null;
  const group = new THREE.Group();
  group.name = 'BabaKapa';
  // Put the group pivot at Baba herself before attaching the baked-world-coordinate parts.
  // attach() preserves their world transforms, while the centered pivot makes idle sway local
  // instead of orbiting the character around scene origin.
  root.updateWorldMatrix(true, true);
  const partsBox = new THREE.Box3();
  for (const part of parts) partsBox.expandByObject(part);
  const pivotWorld = partsBox.getCenter(new THREE.Vector3());
  pivotWorld.y = 0;
  root.worldToLocal(pivotWorld);
  group.position.copy(pivotWorld);
  root.add(group);
  group.updateWorldMatrix(true, true);
  for (const part of parts) group.attach(part);
  group.updateWorldMatrix(true, true);
  console.log(`[BABA] reconstructed root from ${parts.length} FINAL parts`);
  mobileDebugLog(`Baba root reconstructed: ${parts.length} parts`);
  return group;
}




mobileDebugStage(TOUCH_DEVICE ? (MOBILE_LITE_MODE ? 'scene-loading-lite' : 'scene-loading-full') : 'desktop-scene-loading');
armSceneLoadWatchdog();
function installMobileLiteStandins() {
  if (!MOBILE_LITE_MODE) return;
  const g = new THREE.Group();
  g.name = 'MOBILE_LITE_STANDINS';
  const concrete = new THREE.MeshStandardMaterial({ color: 0x686b68, roughness: .95, metalness: 0 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x363a36, roughness: .91, metalness: .03 });
  const yellow = new THREE.MeshStandardMaterial({ color: 0xb89b29, roughness: .74, metalness: .08 });
  function boxFromBounds(name, min, max, mat, collide = false) {
    const sx=max[0]-min[0], sy=max[1]-min[1], sz=max[2]-min[2];
    const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);
    m.name=name;
    m.position.set((min[0]+max[0])*.5,(min[1]+max[1])*.5,(min[2]+max[2])*.5);
    m.receiveShadow=!TOUCH_DEVICE; m.castShadow=false;
    g.add(m);
    if (collide) addColliderXZ(name,min[0],max[0],min[2],max[2],min[1],max[1]);
  }
  // Four expensive architectural meshes lived in separate ~80 MiB buffers.
  // Coarse boxes keep the silhouette/collision on phones while desktop keeps originals.
  boxFromBounds('LITE_BUILDING_W',[-50.7836,-.4606,16.6819],[-25.3687,18.0502,42.4089],dark,true);
  boxFromBounds('LITE_PANEL_1',[-47.7034,-.0657,-43.5718],[-37.6018,14.0456,-20.2886],concrete,true);
  boxFromBounds('LITE_PANEL_2',[-44.5059,-.0657,-68.6756],[-23.4439,14.0456,-47.4757],concrete,true);
  boxFromBounds('LITE_PANEL_3',[-24.2622,-.0657,27.5393],[-1.1231,14.0456,37.2842],concrete,true);
  // Dense 500k-triangle shop display cans are replaced by one simple cabinet silhouette.
  boxFromBounds('LITE_SHOP_DISPLAY',[27.2753,-.0118,-40.1696],[31.5199,2.1314,-39.5194],yellow,false);
  scene.add(g);
  mobileDebugLog('lite stand-ins installed: architecture + shop display');
}

loader.load(FINAL_SCENE_URL, gltf => {
  sceneLoadFinished = true;
  clearTimeout(sceneLoadWatchdog);
  if (bootRetryBtn) bootRetryBtn.hidden = true;
  layoutRoot = gltf.scene;
  layoutRoot.name = 'BETONSHCHIK_FINAL_LAYOUT';
  prepModel(layoutRoot);
  scene.add(layoutRoot);
  installMobileLiteStandins();
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




  // Replace flat Blender slab with the actual runtime recess. Hide every matching node
  // (mobile glTF can expose mesh/group wrappers differently) and force the runtime pit visible.
  layoutRoot.traverse(o => {
    if (String(o.name || '').toLowerCase().includes('pour_slab')) o.visible = false;
  });
  // Mobile: remove the authored asphalt cap only under the runtime pour slab.
  // This is the missing piece that makes the physical depressions actually visible.
  cutMobileSiteGroundUnderPourSlab(layoutRoot);
  pitGroup.visible = true;
  pitGroup.traverse(o => { if (o.isMesh) { o.visible = true; o.frustumCulled = false; } });
  if (TOUCH_DEVICE) {
    const pitMeshes = [];
    pitGroup.traverse(o => { if (o.isMesh) pitMeshes.push(o.name || '(unnamed)'); });
    mobileDebugLog(`runtime pits visible: ${pitMeshes.length} meshes; slabBoxes=mobile`);
  }




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
    console.log('PHYSICAL HOSE INITIALIZED', anchorPos, 'continuous tube rings', HOSE_SEGMENTS + 1);
  } else {
    console.error('NO VALID HOSE ANCHOR FOUND — add a tiny mesh named ShlangAnchor in Blender');
  }




  // Rake is authored/positioned in Blender now. Use that exact scene model.
  setupSceneRake(layoutRoot);




  // FINAL contains Baba as separated static parts in a T-pose (no skin/armature was exported).
  // Relax the arms directly from their actual mesh bounds, then run a subtle procedural idle.
  relaxBabaKapaTPose(layoutRoot);
  const baba = findOrCreateBabaKapa(layoutRoot);
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
    babaWorldRoot = baba;
    babaLockedY = baba.position.y;
    babaIdleBaseYaw = baba.rotation.y;
    babaIdleClock = 0;
    babaGroundLockEnabled = true;
    addEmbeddedNPCCollider(baba, 'BabaKapa');
    addBabaInteraction(baba);
  } else {
    console.warn('BabaKapa node not found in scene');
  }




  // Pickups are authored scene meshes. Register them before collision generation so
  // they never leave invisible blockers after being collected.
  setupWorldPickups(layoutRoot);




  // Scene cleanup / art polish for the new export.
  removeFrontSiteFlower(layoutRoot);
  repaintConstructionVehicles(layoutRoot);
  setupConstructionMachineLife(layoutRoot);




  // The real storefront was omitted because it was hidden during Blender export.
  // Restore that missing mesh from a tiny standalone asset; no Blender re-export required.
  forceMonetka5Visible(layoutRoot);




  // Small parking-marking planes near MONETKA need alpha punch-through and must never
  // become solid blockers in the storefront parking lane.
  fixMonetkaParking(layoutRoot);




  // Mobile static batching happens after all scene-art fixes and before collider extraction.
  // Grass/flowers are visual-only and already collision-free, so replacing them with instancing
  // cannot affect gameplay volumes.
  instanceMobileVegetation(layoutRoot);




  addFinalLayoutColliders(layoutRoot);
  carveMonetkaParkingPassage();
  rebuildMeshColliderGrid();
  freezeMobileStaticMeshes(layoutRoot);
  if (TOUCH_DEVICE) {
    // Cache vehicle bounds while FINAL's CPU vertex arrays are still available.
    resolveMachineAudioWorldPositions();
    for (const spec of NPC_SPECS) {
      const placeholder = layoutRoot.getObjectByName(spec.placeholder);
      if (placeholder) spec.cachedLayoutPose = placeholderPose(placeholder);
    }
    // The shop's cigarette preview is baked from a FINAL mesh. Cache that tiny
    // detached copy before FINAL's static CPU attributes are released.
    getShopPreviewSource('samec').catch(e => console.warn('Samec preview pre-cache failed', e));
    registerMobileStaticGeometryRelease(layoutRoot);
  }
  // Avoid the largest mobile memory spike: scene geometry/textures finish uploading first,
  // then NPC FBX/base textures are loaded after the browser has had time to release network buffers.
  if (TOUCH_DEVICE) {
    setTimeout(() => {
      mobileDebugStage('npc-loading');
      startSceneNPCs().finally?.(() => mobileDebugStage('npc-ready'));
    }, 1500);
  } else {
    startSceneNPCs();
  }




  assetsLoaded++;
  sessionStorage.removeItem(SCENE_RETRY_KEY);
  updateLoadState();
  // One explicit warm-up frame uploads static geometry and triggers the mobile
  // CPU-array release callbacks. The normal game loop remains asleep behind the menu.
  requestAnimationFrame(() => {
    try {
      camera.layers.set(0);
      if (TOUCH_DEVICE) renderer.render(scene, camera);
      else { renderPass.camera = camera; composer?.render(0); }
    } catch (error) {
      recoverBrokenScene(`first render failed: ${error?.message || error}`);
      return;
    }
    requestAnimationFrame(() => {
      sceneReady = !!(layoutRoot && layoutRoot.parent && layoutRoot.children.length);
      if (sceneReady) {
        mobileDebugStage('scene-ready');
        menuLoadingSpinner?.classList.add('isDone');
        if (loadState) { loadState.textContent = 'ГОТОВО'; loadState.style.color = ''; }
      }
      if (sceneReady && startBtn) { startBtn.disabled = false; startBtn.removeAttribute('aria-disabled'); }
    });
  });
}, xhr => {
  armSceneLoadWatchdog();
  if (TOUCH_DEVICE && xhr) {
    const pct = xhr.total ? Math.round(xhr.loaded / xhr.total * 100) : 0;
    if (pct && pct % 10 === 0) mobileDebugLog(`scene network ${pct}%`);
  }
}, err => {
  sceneLoadFinished = true;
  clearTimeout(sceneLoadWatchdog);
  mobileDebugLog(`Final layout failed: ${err?.message || err}`);
  console.error('Final layout failed', err);
  assetsFailed++;
  updateLoadState();
  recoverBrokenScene('final GLTF load failed');
});




// FIRST-PERSON PLAYER / CONTROLS
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
function saveRakeOwned() {
  try { localStorage.setItem(RAKE_OWNED_STORAGE_KEY, rakeOwned ? '1' : '0'); } catch (_) {}
}




function saveEconomy() {
  localStorage.setItem('beton_money', String(money));
  localStorage.setItem('beton_cigarettes', String(cigarettes));
  localStorage.setItem('beton_energy', String(energyCans));
  localStorage.setItem('beton_beer', String(beerCans));
}
function addMoney(amount) {
  const earned = Math.max(0, Math.round(amount));
  money += earned;
  recordCareerStat('moneyEarned', earned);
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




  // Supplied can opening + close-up gulps.
  drinkCanOpen: .46,
  drinkGulps: 2.55,




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
let drinkCanOpenBuffer = null;
let drinkGulpsBuffer = null;
let drinkCanOpenSource = null;
let drinkGulpsSource = null;
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
const pumpAudioBounds = new THREE.Box3();
const mixerAudioBounds = new THREE.Box3();
const machineAudioNearestPoint = new THREE.Vector3();
let pumpAudioWorldValid = false;
let mixerAudioWorldValid = false;




async function decodeGameAudio(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Audio HTTP ${res.status}: ${url}`);
  const data = await res.arrayBuffer();
  return await gameAudioCtx.decodeAudioData(data.slice(0));
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
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
        drinkCanOpen, drinkGulps,
        wetFootstep,
        qteAppear, qteHit, hoseSlip,
        babaGreeting, babaFarewell, babaPurchase
      ] = await mapWithConcurrency([
        './assets/audio/footsteps/concrete_001.ogg',
        './assets/audio/footsteps/concrete_002.ogg',
        './assets/audio/pour/concrete_pour_loop.wav',
        './assets/audio/machines/pump_loop.wav',
        './assets/audio/machines/mixer_loop.wav',
        './assets/audio/rake/rake_drag_01.mp3',
        './assets/audio/voices/seryoga/greeting_zdarova_truten.wav',
        './assets/audio/voices/seryoga/farewell.mp3',
        './assets/audio/voices/pavel/greeting.mp3',
        './assets/audio/voices/pavel/farewell_non_success.mp3',
        './assets/audio/voices/pavel/success_dance.mp3',
        './assets/audio/music/pavel_success.mp3',
        './assets/audio/voices/george/greeting.mp3',
        './assets/audio/voices/george/upgrade_01.mp3',
        './assets/audio/voices/george/upgrade_02.mp3',
        './assets/audio/voices/george/upgrade_03.mp3',
        './assets/audio/voices/george/no_money.mp3',
        './assets/audio/smoking/cigarette_puff.mp3',
        './assets/audio/drinks/can_open.mp3',
        './assets/audio/drinks/drinking_gulps.mp3',
        './assets/audio/footsteps/wet_concrete.mp3',
        './assets/audio/qte/qte_appear.mp3',
        './assets/audio/qte/qte_hit.mp3',
        './assets/audio/hose/hose_slip.mp3',
        './assets/audio/voices/baba/greeting.mp3',
        './assets/audio/voices/baba/farewell.mp3',
        './assets/audio/voices/baba/purchase.mp3'
      ], TOUCH_DEVICE ? 3 : 5, decodeGameAudio);;




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
      drinkCanOpenBuffer = drinkCanOpen;
      drinkGulpsBuffer = drinkGulps;




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




function objectVisualBounds(obj, outBox, outCenter) {
  if (!obj) return false;
  obj.updateWorldMatrix(true, true);
  outBox.setFromObject(obj);
  if (outBox.isEmpty()) return objectVisualCenter(obj, outCenter);
  outBox.getCenter(outCenter);
  return [outCenter.x, outCenter.y, outCenter.z].every(Number.isFinite);
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
    scene.getObjectByName('Hoze Truck') ||
    scene.getObjectByName('Geom3D_Hoze Truck');




  const mixerTruck =
    scene.getObjectByName('Concrete Mixer Truck');




  if (pumpTruck) {
    pumpAudioWorldValid = objectVisualBounds(pumpTruck, pumpAudioBounds, pumpAudioWorld);
  }




  if (mixerTruck) {
    mixerAudioWorldValid = objectVisualBounds(mixerTruck, mixerAudioBounds, mixerAudioWorld);
  }




  // Last-resort fallbacks only.
  if (!pumpAudioWorldValid) {
    const fallback =
      scene.getObjectByName('camec') ||
      scene.getObjectByName('camec2') ||
      scene.getObjectByName('ShlangAnchor');




    if (fallback) {
      pumpAudioWorldValid = objectVisualBounds(fallback, pumpAudioBounds, pumpAudioWorld);
    }
  }




  if (!mixerAudioWorldValid && pumpAudioWorldValid) {
    const fallbackOffset = new THREE.Vector3(-4.0, 0, 1.0);
    mixerAudioWorld.copy(pumpAudioWorld).add(fallbackOffset);
    mixerAudioBounds.copy(pumpAudioBounds).translate(fallbackOffset);
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




function distanceGainFromVehicle(listenerPos, bounds, fallbackCenter, nearDist, farDist, maxGain) {
  if (bounds && !bounds.isEmpty()) {
    bounds.clampPoint(listenerPos, machineAudioNearestPoint);
    return distanceGain3D(listenerPos, machineAudioNearestPoint, nearDist, farDist, maxGain);
  }
  return distanceGain3D(listenerPos, fallbackCenter, nearDist, farDist, maxGain);
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




    const g = distanceGainFromVehicle(
      camera.position,
      pumpAudioBounds,
      pumpAudioWorld,
      2.6,
      23.0 * 1.30,
      AUDIO_MIX.pumpNear
    ) * voiceDuck;
    pumpSpatialGain.gain.setTargetAtTime(g, now, .08);
  }




  if (mixerSpatialGain && mixerAudioWorldValid) {
    const voiceDuck = isVoiceOrSuccessMomentActive()
      ? AUDIO_MIX.ambienceDuckWhileVoice
      : 1;




    const g = distanceGainFromVehicle(
      camera.position,
      mixerAudioBounds,
      mixerAudioWorld,
      2.8,
      25.0 * 1.30,
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




function stopDrinkAudio() {
  for (const src of [drinkCanOpenSource, drinkGulpsSource]) {
    if (!src) continue;
    try { src.stop(); } catch (_) {}
  }
  drinkCanOpenSource = null;
  drinkGulpsSource = null;
}




function playCanDrinkAudio() {
  if (!gameAudioReady || !gameAudioCtx || gameAudioCtx.state !== 'running') return;
  stopDrinkAudio();
  const now = gameAudioCtx.currentTime;




  if (drinkCanOpenBuffer) {
    const source = gameAudioCtx.createBufferSource();
    const gain = gameAudioCtx.createGain();
    source.buffer = drinkCanOpenBuffer;
    gain.gain.value = AUDIO_MIX.drinkCanOpen;
    source.connect(gain);
    gain.connect(gameAudioMaster);
    drinkCanOpenSource = source;
    source.onended = () => { if (drinkCanOpenSource === source) drinkCanOpenSource = null; };
    source.start(now);
  }




  if (drinkGulpsBuffer) {
    const source = gameAudioCtx.createBufferSource();
    const gain = gameAudioCtx.createGain();
    source.buffer = drinkGulpsBuffer;
    gain.gain.value = AUDIO_MIX.drinkGulps;
    source.connect(gain);
    gain.connect(gameAudioMaster);
    drinkGulpsSource = source;
    source.onended = () => { if (drinkGulpsSource === source) drinkGulpsSource = null; };
    source.start(now + 1.12);
  }
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
let playerHeadShadowCaster = null;
let rightIndexBone = null;
let rightMiddleBone = null;
let leftIndexBone = null;
let leftMiddleBone = null;




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
const procIdentityQ = new THREE.Quaternion();
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




for(let i=0;i<48;i++){
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
  p.age=0;p.life=THREE.MathUtils.randFloat(1.45,2.25);
  p.sprite.visible=true;p.sprite.position.copy(smokeTipWorld);
  p.sprite.position.x+=THREE.MathUtils.randFloatSpread(.008);
  p.sprite.position.y+=THREE.MathUtils.randFloatSpread(.006);
  p.sprite.position.z+=THREE.MathUtils.randFloatSpread(.008);
  p.vel.set(
    THREE.MathUtils.randFloatSpread(.040),
    THREE.MathUtils.randFloat(.10,.18),
    THREE.MathUtils.randFloatSpread(.040)
  );
  const s=THREE.MathUtils.randFloat(.026,.045)*(0.92+strength*.34);
  p.sprite.scale.set(s,s,s);
  p.sprite.material.opacity=.50+strength*.20;
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
    p.sprite.scale.multiplyScalar(1+dt*.82);
    p.sprite.material.opacity=Math.max(0,(1-k)*.58);
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
    cigaretteSmokeSpawnTimer=THREE.MathUtils.lerp(.105,.042,dragStrength);
    spawnCigaretteSmoke(dragStrength);
    if (dragStrength > .38) spawnCigaretteSmoke(dragStrength * .86);
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
        loader.load('./assets/shop/rubberbootstier2.gltf', resolve, undefined, reject)
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
    if (o.userData?.headShadowOnly) {
      o.castShadow = true;
      o.receiveShadow = false;
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of ms) { if (m) { m.colorWrite=false; m.depthWrite=false; m.depthTest=false; m.side=THREE.DoubleSide; m.needsUpdate=true; } }
      return;
    }
    o.castShadow = !TOUCH_DEVICE;
    o.receiveShadow = false;
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
      m.side = THREE.DoubleSide;
      m.shadowSide = THREE.DoubleSide;
      m.forceSinglePass = true;
      m.needsUpdate = true;
    }
  });
}
function buildHeadShadowGeometry(mesh) {
  if (!mesh?.isSkinnedMesh || !mesh.geometry?.attributes?.position || !mesh.skeleton?.bones?.length) return null;
  const skinIndex = mesh.geometry.attributes.skinIndex;
  const skinWeight = mesh.geometry.attributes.skinWeight;
  if (!skinIndex || !skinWeight) return null;




  const headBones = new Set();
  mesh.skeleton.bones.forEach((b, i) => {
    const core = canonicalBoneCore(b.name);
    if (core === 'head' || core === 'neck' || core.startsWith('headtop') || core.includes('headend')) headBones.add(i);
  });
  if (!headBones.size) return null;




  const src = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  const si = src.attributes.skinIndex, sw = src.attributes.skinWeight, pos = src.attributes.position;
  const attrs = Object.keys(src.attributes);
  const out = Object.fromEntries(attrs.map(n => [n, []]));
  const influence = (v) => {
    let total = 0;
    for (let c = 0; c < Math.min(si.itemSize, sw.itemSize); c++) {
      const bi = si.array[v * si.itemSize + c];
      const w = sw.array[v * sw.itemSize + c];
      if (headBones.has(bi)) total += w;
    }
    return total;
  };
  let kept = 0;
  for (let base = 0; base + 2 < pos.count; base += 3) {
    const a=influence(base), b=influence(base+1), c=influence(base+2);
    // Keep actual deformed head/neck silhouette, not a fake sphere/box proxy.
    if (Math.max(a,b,c) < .14 && (a+b+c)/3 < .07) continue;
    kept += 3;
    for (let j=0;j<3;j++) {
      const vi=base+j;
      for (const name of attrs) {
        const at=src.attributes[name], off=vi*at.itemSize;
        for (let q=0;q<at.itemSize;q++) out[name].push(at.array[off+q]);
      }
    }
  }
  if (!kept) { src.dispose(); return null; }
  const ng = new THREE.BufferGeometry();
  for (const name of attrs) {
    const at=src.attributes[name], Arr=at.array.constructor;
    ng.setAttribute(name,new THREE.BufferAttribute(new Arr(out[name]),at.itemSize,at.normalized));
  }
  ng.computeBoundingBox(); ng.computeBoundingSphere();
  src.dispose();
  return ng;
}




function ensurePlayerHeadShadowCaster(root) {
  if (!root || playerHeadShadowCaster) return;
  const holder = new THREE.Group();
  holder.name = 'PLAYER_REAL_HEAD_SHADOW';
  holder.userData.headShadowHolder = true;
  let count = 0;
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
  shadowMat.colorWrite = false;
  shadowMat.depthWrite = false;
  shadowMat.depthTest = false;




  const additions = [];
  root.traverse(o => {
    if (!o.isSkinnedMesh || o.userData?.headShadowOnly) return;
    const geo = buildHeadShadowGeometry(o);
    if (!geo) return;
    const sh = new THREE.SkinnedMesh(geo, shadowMat);
    sh.name = `${o.name || 'mesh'}__HEAD_SHADOW_ONLY`;
    sh.userData.headShadowOnly = true;
    sh.position.copy(o.position); sh.quaternion.copy(o.quaternion); sh.scale.copy(o.scale);
    sh.bindMode = o.bindMode;
    sh.bind(o.skeleton, o.bindMatrix);
    sh.bindMatrix.copy(o.bindMatrix);
    sh.bindMatrixInverse.copy(o.bindMatrixInverse);
    sh.castShadow = true;
    sh.receiveShadow = false;
    sh.frustumCulled = false;
    additions.push([o.parent || root, sh]);
    count++;
  });
  for (const [parent, sh] of additions) parent.add(sh);
  if (count) {
    root.add(holder); // bookkeeping marker only; shadow meshes remain under original parents.
    playerHeadShadowCaster = holder;
  }
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
    if (o.userData?.headShadowOnly) return;
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
let pavelLastDanceIndex = -1;




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
    // v51.29 — Pavel turned exactly 180° from v51.28.
    sceneYawDeg: 143.44731,
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
    label: 'Джордж',
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
  // Keep character base-color at full source resolution on all devices. On phones,
  // skip the two extra 2K PBR maps to avoid ~32 MB+ GPU allocation per NPC.
  if (TOUCH_DEVICE) {
    const baseUrl = MOBILE_SAFE_MODE ? spec.base.replace(/\.jpg$/i, '_mobile_safe.jpg') : spec.base;
    const base = await loadNPCTexture(baseUrl, true);
    return { base, mr: null, normal: null };
  }
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
      normalMap: maps.normal || null,
      roughnessMap: maps.mr || null,
      metalnessMap: maps.mr || null,
      roughness: TOUCH_DEVICE ? .92 : 1.0,
      metalness: TOUCH_DEVICE ? 0.0 : spec.metalness,
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




  const pose = spec.cachedLayoutPose || placeholderPose(placeholder);
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
    text: `E — поговорить · ${spec.label}`,
    requiresLook: true
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




function lockBabaToGround() {
  if (!babaGroundLockEnabled || !babaWorldRoot) return;
  babaWorldRoot.visible = true;
  // Keep a safety leash against the old falling bug, while allowing millimetre-scale idle breathing.
  if (Math.abs(babaWorldRoot.position.y - babaLockedY) > .08) {
    babaWorldRoot.position.y = babaLockedY;
    babaWorldRoot.updateWorldMatrix(true, true);
  }
}




async function startSceneNPCs() {
  if (npcSpawnStarted || !layoutRoot) return;
  npcSpawnStarted = true;
  try {
    npcIdlePromise ||= loadFBX('./assets/npcs/Neutral_Idle.fbx');
    const idleSource = await npcIdlePromise;
    if (!idleSource.animations?.length) throw new Error('Neutral Idle.fbx has no animation');




    // Rigged embedded characters use Neutral Idle. Baba has no skin in FINAL, so her
    // relaxed pose + breathing idle are handled procedurally instead of retargeting Mixamo.
    lockBabaToGround();
    idleEmbeddedRig(layoutRoot.getObjectByName('Armature.001'), idleSource, 'SceneCharacter');




    await Promise.all(NPC_SPECS.map(spec => spawnRiggedNPC(spec, idleSource)));
    console.log(`Scene NPC idle setup complete: ${npcMixers.length} mixers`);
  } catch (e) {
    console.error('NPC idle setup failed', e);
  }
}




const handWorldPos = new THREE.Vector3();
const handWorldPosB = new THREE.Vector3();
const handWorldQuat = new THREE.Quaternion();
const cameraWorldQuatInv = new THREE.Quaternion();
const localHandQuat = new THREE.Quaternion();
function followBoneWithProp(holder, bone, offset, rotOffset, orientationBone = bone) {
  if (!holder || !bone) return;
  bone.getWorldPosition(handWorldPos);
  (orientationBone || bone).getWorldQuaternion(handWorldQuat);
  camera.worldToLocal(handWorldPos);
  camera.getWorldQuaternion(cameraWorldQuatInv).invert();
  localHandQuat.copy(cameraWorldQuatInv).multiply(handWorldQuat);
  holder.position.copy(handWorldPos).add(offset.clone().applyQuaternion(localHandQuat));
  holder.quaternion.copy(localHandQuat).multiply(rotOffset);
}




// Put a prop at the real grip centre between two hand bones.  This is more
// stable than a large hand-local offset: fingers can animate freely while the
// cigarette stays between them and cans stay centred in the palm.
function followGripBetweenBones(holder, boneA, boneB, offset, rotOffset, orientationBone = boneA) {
  if (!holder || !boneA) return;
  boneA.getWorldPosition(handWorldPos);
  if (boneB) {
    boneB.getWorldPosition(handWorldPosB);
    handWorldPos.lerp(handWorldPosB, .5);
  }
  (orientationBone || boneA).getWorldQuaternion(handWorldQuat);
  camera.worldToLocal(handWorldPos);
  camera.getWorldQuaternion(cameraWorldQuatInv).invert();
  localHandQuat.copy(cameraWorldQuatInv).multiply(handWorldQuat);
  holder.position.copy(handWorldPos).add(offset.clone().applyQuaternion(localHandQuat));
  holder.quaternion.copy(localHandQuat).multiply(rotOffset);
}




const PROP_DEFAULTS = {
  // v51.81: the anchor itself is now the physical grip centre.  The old can
  // offsets pushed the models roughly 11 cm away from the palm on the phone.
  cigarette: { pos:[0,0,0], rot:[0.059999,1.671593,-0.139999] },
  lighter:   { pos:[-.010,.012,.028], rot:[0,Math.PI/2,-Math.PI/2] },
  energy:    { pos:[0,0,0], rot:[0.58435,-1.925996,0.824049] },
  beer:      { pos:[0,0,0], rot:[-0.516996,1.929938,1.121659] },
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




if (localStorage.getItem('beton_prop_grip_fix_v533') !== '1') {
  for (const name of ['cigarette','energy','beer']) {
    localStorage.removeItem(`beton_prop_${name}`);
    const d = PROP_DEFAULTS[name];
    propConfigs[name].pos.set(...d.pos);
    propConfigs[name].euler.set(...d.rot);
    propConfigs[name].quat.setFromEuler(propConfigs[name].euler);
  }
  localStorage.setItem('beton_prop_grip_fix_v533', '1');
}




// v51.50: discard all old production grip offsets. These props now use one fixed authored grip.
if (localStorage.getItem('beton_prop_grip_fix_v5155') !== '1') {
  for (const name of ['cigarette','energy','beer']) {
    localStorage.removeItem(`beton_prop_${name}`);
    const d = PROP_DEFAULTS[name];
    propConfigs[name].pos.set(...d.pos);
    propConfigs[name].euler.set(...d.rot);
    propConfigs[name].quat.setFromEuler(propConfigs[name].euler);
  }
  localStorage.setItem('beton_prop_grip_fix_v5155', '1');
}




// v51.60: final cigarette grip: attach to the hand, not the finger bone, and reset stale saved rotation once.
if (localStorage.getItem('beton_cigarette_grip_v5160') !== '1') {
  localStorage.removeItem('beton_prop_cigarette');
  const d = PROP_DEFAULTS.cigarette;
  propConfigs.cigarette.pos.set(...d.pos);
  propConfigs.cigarette.euler.set(...d.rot);
  propConfigs.cigarette.quat.setFromEuler(propConfigs.cigarette.euler);
  localStorage.setItem('beton_cigarette_grip_v5160', '1');
}




// v51.62: final Blender-authored prop grips. Reset any older localStorage overrides once.
if (localStorage.getItem('beton_prop_grip_final_v5162') !== '1') {
  for (const name of ['cigarette','energy','beer']) {
    localStorage.removeItem(`beton_prop_${name}`);
    const d = PROP_DEFAULTS[name];
    propConfigs[name].pos.set(...d.pos);
    propConfigs[name].euler.set(...d.rot);
    propConfigs[name].quat.setFromEuler(propConfigs[name].euler);
  }
  localStorage.setItem('beton_prop_grip_final_v5162', '1');
}




// v51.68: runtime grip correction after Blender verification.
// Force a clean reload once so a browser that already ran v51.62 cannot keep
// stale localStorage offsets. Cigarette uses the non-folded GRIP value; cans use
// the authored Blender GRIPs unchanged.
if (localStorage.getItem('beton_prop_grip_runtimefix_v5168') !== '1') {
  for (const name of ['cigarette','energy','beer']) {
    localStorage.removeItem(`beton_prop_${name}`);
    const d = PROP_DEFAULTS[name];
    propConfigs[name].pos.set(...d.pos);
    propConfigs[name].euler.set(...d.rot);
    propConfigs[name].quat.setFromEuler(propConfigs[name].euler);
  }
  localStorage.setItem('beton_prop_grip_runtimefix_v5168', '1');
}




// v51.70: force the final user-authored Blender grips once, even on browsers
// that already cached earlier v51.68/v51.69 prop offsets.
if (localStorage.getItem('beton_prop_grip_final_v5170') !== '1') {
  for (const name of ['cigarette','energy','beer']) {
    localStorage.removeItem(`beton_prop_${name}`);
    const d = PROP_DEFAULTS[name];
    propConfigs[name].pos.set(...d.pos);
    propConfigs[name].euler.set(...d.rot);
    propConfigs[name].quat.setFromEuler(propConfigs[name].euler);
  }
  localStorage.setItem('beton_prop_grip_final_v5170', '1');
}




// v51.80: the old cigarette grip sat almost 39 cm behind the hand. Anchor the
// prop at the index-finger base and discard that stale production offset once.
if (localStorage.getItem('beton_cigarette_grip_v5180') !== '1') {
  localStorage.removeItem('beton_prop_cigarette');
  const d = PROP_DEFAULTS.cigarette;
  propConfigs.cigarette.pos.set(...d.pos);
  propConfigs.cigarette.euler.set(...d.rot);
  propConfigs.cigarette.quat.setFromEuler(propConfigs.cigarette.euler);
  localStorage.setItem('beton_cigarette_grip_v5180', '1');
}
if (localStorage.getItem('beton_cigarette_flip_v5128') !== '1') {
  localStorage.removeItem('beton_prop_cigarette');
  const d = PROP_DEFAULTS.cigarette;
  propConfigs.cigarette.pos.set(...d.pos);
  propConfigs.cigarette.euler.set(...d.rot);
  propConfigs.cigarette.quat.setFromEuler(propConfigs.cigarette.euler);
  localStorage.setItem('beton_cigarette_flip_v5128', '1');
}




// v51.81: switch every hand prop to the bone-to-bone grip centre and clear
// any manual/stale offsets left by the older single-bone placement.
if (localStorage.getItem('beton_prop_grip_centred_v5181') !== '1') {
  for (const name of ['cigarette','energy','beer']) {
    localStorage.removeItem(`beton_prop_${name}`);
    const d = PROP_DEFAULTS[name];
    propConfigs[name].pos.set(...d.pos);
    propConfigs[name].euler.set(...d.rot);
    propConfigs[name].quat.setFromEuler(propConfigs[name].euler);
  }
  localStorage.setItem('beton_prop_grip_centred_v5181', '1');
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
  const baseMap = await playerTextureLoader.loadAsync(MOBILE_SAFE_MODE ? './assets/player/player_base_mobile_safe.webp' : './assets/player/player_base.webp');
  const normalMap = TOUCH_DEVICE ? null : await playerTextureLoader.loadAsync('./assets/player/player_normal.webp');
  const roughnessMap = TOUCH_DEVICE ? null : await playerTextureLoader.loadAsync('./assets/player/player_roughness.webp');
  baseMap.colorSpace = THREE.SRGBColorSpace;
  if (normalMap) normalMap.colorSpace = THREE.NoColorSpace;
  if (roughnessMap) roughnessMap.colorSpace = THREE.NoColorSpace;
  // FBX UVs expect TextureLoader's flipped-Y convention. The previous glTF-style false
  // setting mirrored the atlas and sampled its black padding on large parts of the body.
  baseMap.flipY = true;
  if (normalMap) normalMap.flipY = true;
  if (roughnessMap) roughnessMap.flipY = true;
  const aniso = Math.min(TOUCH_DEVICE ? 2 : 8, renderer.capabilities.getMaxAnisotropy());
  baseMap.anisotropy = aniso;
  if (normalMap) normalMap.anisotropy = aniso;
  if (roughnessMap) roughnessMap.anisotropy = aniso;




  const makeMat = (source, slotIndex = 0) => {
    const mat = new THREE.MeshStandardMaterial({
      name: `PLAYER_PBR_${slotIndex}`,
      map: baseMap,
      normalMap: normalMap || null,
      normalScale: new THREE.Vector2(.48, .48),
      roughnessMap: roughnessMap || null,
      roughness: .92,
      metalness: 0.0,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1,
      depthTest: true,
      depthWrite: true,
      shadowSide: THREE.DoubleSide,
    });
    // Preserve slot-specific vertex colors / alpha test semantics from the FBX if present.
    if (source) {
      mat.vertexColors = !!source.vertexColors;
      if (source.alphaTest > 0) mat.alphaTest = source.alphaTest;
    }
    return mat;
  };
  root.traverse(o => {
    if (!(o.isMesh || o.isSkinnedMesh)) return;
    const sourceMats = Array.isArray(o.material) ? o.material : [o.material];
    const mats = sourceMats.map((m, i) => makeMat(m, i));
    o.material = Array.isArray(o.material) ? mats : mats[0];
    o.castShadow = !TOUCH_DEVICE;
    o.receiveShadow = false;
    o.renderOrder = 0;
  });
}




function setPlayerLocomotion(moving, sprinting) {
  if (!armsReady || !armsMixer || specialMode) return;
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
  mobileDebugStage('player-loading');
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
    ensurePlayerHeadShadowCaster(character);
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
    // Use the second phalanges for the cigarette pinch, and the first left
    // knuckles for a stable palm centre around the cans.
    rightIndexBone = findBone(character, 'RightHandIndex2') || findBone(character, 'RightHandIndex1') || rightHandBone;
    rightMiddleBone = findBone(character, 'RightHandMiddle2') || findBone(character, 'RightHandMiddle1') || rightIndexBone;
    leftIndexBone = findBone(character, 'LeftHandIndex1') || findBone(character, 'LeftHandIndex2') || leftHandBone;
    leftMiddleBone = findBone(character, 'LeftHandMiddle1') || findBone(character, 'LeftHandMiddle2') || leftIndexBone;
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
      // Props must participate in the same depth buffer as the fingers. The
      // old overlay mode always drew the cigarette on top of the hand.
      forceOpaqueProp(cigRoot, false);
      normalizeProp(cigRoot,.082);
      // normalizeProp centres the whole cigarette. Shift the mesh so the grip
      // lands near the filter instead of balancing it across the fingertips.
      cigRoot.position.x -= .019;
      cigaretteProp=cigRoot;cigaretteVM.add(cigRoot);
      setHotbar3DModel('smoke',cigRoot);
    } catch (e) { console.warn('Cigarette failed', e); }




    try {
      const energyGLTF = await new Promise((resolve, reject) => loader.load('./assets/energy/litenergy_classic.gltf', resolve, undefined, reject));
      const eroot=energyGLTF.scene;
      prepViewModel(eroot);forceOpaqueProp(eroot,false);normalizeProp(eroot,.148);
      energyProp=eroot;energyVM.add(eroot);setHotbar3DModel('energy',eroot);
    } catch (e) { console.warn('Energy failed', e); }




    try {
      const broot = await loadFBX('./assets/beer/Baltika.fbx');
      prepViewModel(broot);forceOpaqueProp(broot,false);normalizeProp(broot,.148);
      beerProp=broot;beerVM.add(broot);setHotbar3DModel('beer',broot);
    } catch (e) { console.warn('Beer failed', e); }




    try {
      const lighterGLTF = await new Promise((resolve, reject) => loader.load('./assets/lighter.glb', resolve, undefined, reject));
      const lroot = lighterGLTF.scene;
      prepViewModel(lroot);forceOpaqueProp(lroot,false);normalizeProp(lroot,.105);
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
    mobileDebugStage('player-ready');
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
if (TOUCH_DEVICE) {
  const startMobilePlayerLoad = () => {
    if (sceneReady) loadArmsViewModel();
    else setTimeout(startMobilePlayerLoad, 220);
  };
  setTimeout(startMobilePlayerLoad, 500);
} else {
  loadArmsViewModel();
}




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
    (kind === 'beer' || kind === 'drink') ? 4.35 :
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
    procDeltaQ.slerp(procIdentityQ, 1 - strength);
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




  cameraLocalToWorld(.33, -.58, -.48, procTargetA);   // relaxed right hand lower in frame
  cameraLocalToWorld(.18, -.205, -.37, procTargetB); // drag position: around lower third of the screen
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
  // Open low -> lift -> hold at lips -> lower.
  const raise = procSmooth01(THREE.MathUtils.clamp((t - .10) / .22, 0, 1));
  const lower = procSmooth01(THREE.MathUtils.clamp((t - .79) / .21, 0, 1));
  const hold = raise * (1 - lower);




  // Keep the relaxed can and the gripping fingers fully inside the phone
  // viewport instead of burying the hand below the hotbar.
  cameraLocalToWorld(-.23, -.36, -.48, procTargetA);
  cameraLocalToWorld(-.12, -.16, -.29, procTargetB);
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




const rakeProximityRay = new THREE.Ray();
const rakeProximityOrigin = new THREE.Vector3();
const rakeProximityDir = new THREE.Vector3();
const rakeProximityHit = new THREE.Vector3();
const rakeProximityBox = new THREE.Box3();
let rakeProximityScaleBlend = 0;




// v51.65 — depth-aware FPS rake scale.
// The rake is a camera-layer viewmodel, so its screen size would normally stay
// constant even when the player puts the camera right against a real surface.
// Sample the actual gameplay collision depth in the look direction and smoothly
// increase ONLY the viewmodel scale as clearance shrinks. No object-name hacks.
function updateRakeProximity(dt) {
  if (!rakeEquipped || !rakeVM.visible) {
    rakeProximityScaleBlend = THREE.MathUtils.damp(rakeProximityScaleBlend, 0, 14, dt);
    return;
  }
  camera.getWorldPosition(rakeProximityOrigin);
  camera.getWorldDirection(rakeProximityDir).normalize();
  rakeProximityRay.set(rakeProximityOrigin, rakeProximityDir);
  let nearest = Infinity;




  for (const c of meshColliders) {
    const hit = c.obb?.intersectRay?.(rakeProximityRay, rakeProximityHit);
    if (hit) {
      const d = rakeProximityOrigin.distanceTo(hit);
      if (d > .05 && d < nearest) nearest = d;
    }
  }
  for (const c of colliders) {
    rakeProximityBox.min.set(c.minX, Number.isFinite(c.minY) ? c.minY : -20, c.minZ);
    rakeProximityBox.max.set(c.maxX, Number.isFinite(c.maxY) ? c.maxY : 20, c.maxZ);
    const hit = rakeProximityRay.intersectBox(rakeProximityBox, rakeProximityHit);
    if (hit) {
      const d = rakeProximityOrigin.distanceTo(hit);
      if (d > .05 && d < nearest) nearest = d;
    }
  }




  // Starts imperceptibly around 1.8 m and reaches full correction close to a wall.
  const target = nearest < 1.80
    ? THREE.MathUtils.clamp((1.80 - nearest) / 1.35, 0, 1)
    : 0;
  rakeProximityScaleBlend = THREE.MathUtils.damp(rakeProximityScaleBlend, target, 16, dt);
}




function applyProceduralRakePose(dt) {
  if (!rakeEquipped) return;
  updateRakeProximity(dt);




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




  // Holding LMB now produces a real visible push/pull stroke even if the
  // player is standing still.  This is viewmodel-only; concrete work logic
  // still uses the actual rake work point below.
  if (raking) rakeAnimClock += dt * 8.4;
  else rakeAnimClock = 0;




  const work = rakeSweepWorkBlend;
  const travel = rakeSweepTravel;
  const stroke = raking ? Math.sin(rakeAnimClock) : 0;
  const strokeForward = stroke * work;
  const strokeForwardWide = strokeForward * 1.5;




  // v51.32: much stronger front/back motion.  At full work the rake travels
  // roughly half a metre in camera depth from back extreme to front extreme.
  rakeVM.position.set(
    RAKE_VM_BASE_POS.x - work * .030 + strokeForward * .018 + travel * .010,
    RAKE_VM_BASE_POS.y - work * .070 - Math.abs(strokeForwardWide) * .018 - travel * .009,
    RAKE_VM_BASE_POS.z - work * .285 - strokeForwardWide * .255
  );




  // Keep the rake head visually level; only a tiny natural pitch/yaw follows
  // the stroke instead of rolling the head diagonally across the screen.
  rakeVM.rotation.set(
    RAKE_VM_BASE_ROT.x - work * .055 - strokeForward * .035,
    RAKE_VM_BASE_ROT.y + strokeForward * .018 + travel * .018,
    RAKE_VM_BASE_ROT.z + strokeForward * .008
  );




  // When the world surface gets very close, a fixed-size overlay looks tiny.
  // Grow it continuously from measured scene depth instead of per-object rules.
  const nearSurfaceScale = 1 + rakeProximityScaleBlend * .48;
  rakeVM.scale.setScalar(nearSurfaceScale);
}








const mainThemeAudio = new Audio('./assets/audio/music/main_theme_v528.wav');
mainThemeAudio.loop = true;
mainThemeAudio.preload = 'none';
mainThemeAudio.volume = 0.14;
let mainThemeLoadArmed = false;
function armMainThemeLoad() {
  if (mainThemeLoadArmed) return;
  mainThemeLoadArmed = true;
  try { mainThemeAudio.load(); } catch (_) {}
}
function startMainTheme() {
  // Do not make the 5.7 MiB WAV compete with the initial glTF/buffer download.
  if (!sceneReady && !started) return;
  armMainThemeLoad();
  if (!mainThemeAudio.paused) return;
  const p = mainThemeAudio.play();
  if (p && typeof p.catch === 'function') p.catch(err => {
    if (TOUCH_DEVICE) mobileDebugLog(`menu music autoplay blocked: ${err?.name || err}`);
  });
}
const unlockMenuMusic = () => {
  if (sceneReady && !started && start && !start.classList.contains('hidden')) startMainTheme();
};
document.addEventListener('pointerdown', unlockMenuMusic, { passive:true });
document.addEventListener('touchstart', unlockMenuMusic, { passive:true });
document.addEventListener('keydown', unlockMenuMusic, { passive:true });




function requestImmersiveMode() {
  if (!TOUCH_DEVICE) return;
  try {
    const root = document.documentElement;
    const req = root.requestFullscreen || root.webkitRequestFullscreen || document.body.requestFullscreen || document.body.webkitRequestFullscreen;
    if (typeof req === 'function') req.call(root, { navigationUI: 'hide' });
  } catch (_) {}
  try { screen.orientation?.lock?.('landscape').catch(() => {}); } catch (_) {}
  setTimeout(() => { try { window.scrollTo(0, 1); } catch (_) {} }, 60);
  setTimeout(() => { try { window.scrollTo(0, 1); } catch (_) {} }, 360);
}




function requestMouseLock() {
  if (TOUCH_DEVICE) { locked = true; return; }
  if (!renderer.domElement.requestPointerLock) return;
  try { renderer.domElement.requestPointerLock(); } catch (_) {}
}
function enterSite() {
  if (!sceneReady || !layoutRoot || !layoutRoot.parent) { showToast('ДОЖДИСЬ ЗАГРУЗКИ СЦЕНЫ'); return; }
  if (!pumpAudioWorldValid || !mixerAudioWorldValid) resolveMachineAudioWorldPositions();
  if (loadState) loadState.style.opacity = '0';
  startMainTheme();
  initGameAudio();
  started = true;
  restoreCuredLooksAfterStart();
  mobileDebugStage('running');
  start.classList.add('hidden');
  document.body.classList.add('gameStarted');
  if (TOUCH_DEVICE) {
    locked = true;
    requestImmersiveMode();
  } else requestMouseLock();




  // First-session objective. Mark it immediately so a refresh cannot repeat it;
  // the hose itself remains highlighted until it has actually been picked up.
  if (localStorage.getItem(HOSE_TUTORIAL_HINT_KEY) !== '1') {
    localStorage.setItem(HOSE_TUTORIAL_HINT_KEY, '1');
    setTimeout(() => {
      if (started) {
        showToast('ВОЗЬМИТЕ В РУКИ ШЛАНГ. ЕГО МОЖНО НАЙТИ НА СТРОЙПЛОЩАДКЕ.', 6.2);
      }
    }, 850);
  }
}
startBtn.addEventListener('click', enterSite);
renderer.domElement.addEventListener('click', () => { if (!TOUCH_DEVICE && started && !locked && !shopOpen && !resultOpen && !dialogueOpen && !statsOpen) requestMouseLock(); });
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




  yaw -= e.movementX * .00155;
  pitch -= e.movementY * .00145;
  pitch = THREE.MathUtils.clamp(pitch, -FPS_PITCH_LIMIT, FPS_PITCH_LIMIT);
});




function primaryActionDown() {
  if (!started || !locked || shopOpen || resultOpen || dialogueOpen || statsOpen) return;
  if (qteActive) { clickQTE(); return; }
  if (rakeEquipped && jobState === 'active') {
    if (!raking) recordCareerStat('rakeStrokes');
    raking = true;
    rakeSweepPrevValid = false;
    rakeSweepAccumulator = 0;
    return;
  }
  if (hoseHeld && jobState === 'active') {
    if (pumpBroken) {
      showToast('НАСОС СЛОМАН · ИДИ К ДЖОРДЖУ', 3.6);
      return;
    }
    pouring = !pouring;
    if (hoseInteraction) hoseInteraction.text = pouring
      ? 'E — бросить шланг · ЛКМ — выключить бетон'
      : 'E — бросить шланг · ЛКМ — включить бетон';
    showToast(pouring ? 'ПОДАЧА БЕТОНА ВКЛ' : 'ПОДАЧА БЕТОНА ВЫКЛ');
    if (!pouring) evaluateJob();
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




document.addEventListener('keydown', e => {
  keys[e.code] = true;




  if (settlementCutsceneActive) {
    e.preventDefault();
    return;
  }




  if (statsOpen) {
    if (e.code === 'Escape' && !e.repeat) {
      e.preventDefault();
      closeCharacterStats();
    }
    return;
  }




  if (dialogueOpen) {
    if (e.code === 'Escape' && !e.repeat) {
      e.preventDefault();
      closeDialogue();
      return;
    }
    const m = /^Digit([1-9])$/.exec(e.code);
    if (m && !e.repeat) {
      const idx = Number(m[1]) - 1;
      const btn = dialogueOptionsEl.children[idx];
      if (btn) btn.click();
      e.preventDefault();
      return;
    }
  }




  const handledCodes = [
    'KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight',
    'Digit1','Digit2','Digit3','Digit4','KeyM','KeyE'
  ];
  if (handledCodes.includes(e.code)) e.preventDefault();




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
});
document.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });




// ---------------------------------------------------------------------------
// MOBILE LANDSCAPE CONTROLS v51.57
// Right fixed joystick = movement. Camera = direct swipe anywhere on gameplay canvas.
// This allows simultaneous move + look with two thumbs without a second virtual stick.
// ---------------------------------------------------------------------------
let mobileMoveX=0, mobileMoveY=0, mobileSprintIntent=false;
let mobileLookPointer=null, mobileLookLastX=0, mobileLookLastY=0;
let mobileLookTravel=0;
const MOBILE_LOOK_SENS_X = 0.00435;
const MOBILE_LOOK_SENS_Y = 0.00365;




function setupMobileStick(el, knob, onValue) {
  if (!el || !knob) return;
  const trail = el.querySelector('.stickTrail');
  let pid=null;
  const deadzone=.055;
  const set=(e) => {
    const r=el.getBoundingClientRect();
    const cx=r.left+r.width*.5, cy=r.top+r.height*.5;
    const size=Math.min(r.width,r.height);
    const walkRadius=size*.34;
    // Sprint begins only when the knob centre reaches the enlarged outer
    // boundary. Pointer capture lets the thumb and knob continue beyond it.
    const sprintRadius=size*.68;
    const maxTravel=size*.84;
    const rawDx=e.clientX-cx, rawDy=e.clientY-cy;
    const rawLen=Math.hypot(rawDx,rawDy);
    const dirX=rawLen>.001?rawDx/rawLen:0;
    const dirY=rawLen>.001?rawDy/rawLen:0;




    // The input reaches full walking speed on the inner ring, but the knob can
    // keep travelling beyond the base. Sprint only engages on the larger outer
    // boundary, matching the readable over-pull used by mobile shooters.
    const travel=Math.min(rawLen,maxTravel);
    knob.style.transform=`translate(${dirX*travel}px,${dirY*travel}px)`;
    if(trail){
      const trailLength=Math.max(0,travel-size*.13);
      trail.style.setProperty('--stick-trail-length',`${trailLength}px`);
      trail.style.setProperty('--stick-trail-angle',`${Math.atan2(dirY,dirX)}rad`);
      trail.style.setProperty(
        '--stick-trail-opacity',
        String(THREE.MathUtils.clamp((travel-size*.10)/(size*.30),0,.92))
      );
    }
    const sprintStrength=rawLen/sprintRadius;
    el.style.setProperty('--stick-pull',String(THREE.MathUtils.clamp(sprintStrength,0,1.35)));
    el.classList.toggle('sprintReady',sprintStrength>=.82 && sprintStrength<1);
    el.classList.toggle('isSprinting',sprintStrength>=1);




    let nx=dirX*Math.min(rawLen/walkRadius,1);
    let ny=dirY*Math.min(rawLen/walkRadius,1);
    const mag=Math.hypot(nx,ny);
    if (mag<=deadzone) { onValue(0,0,sprintStrength); return; }
    const remapped=THREE.MathUtils.clamp((mag-deadzone)/(1-deadzone),0,1);
    const response=THREE.MathUtils.clamp(Math.pow(remapped,.72)*1.06,0,1);
    nx=nx/mag*response; ny=ny/mag*response;
    onValue(nx,ny,sprintStrength);
  };
  el.addEventListener('pointerdown',e=>{
    if(!mobileInputAllowed())return;
    pid=e.pointerId; el.setPointerCapture(pid); set(e); e.preventDefault(); e.stopPropagation();
  });
  el.addEventListener('pointermove',e=>{ if(e.pointerId===pid){ set(e); e.preventDefault(); e.stopPropagation(); } });
  const end=e=>{
    if(e.pointerId!==pid)return;
    pid=null;
    knob.style.transform='translate(0,0)';
    if(trail){
      trail.style.setProperty('--stick-trail-length','0px');
      trail.style.setProperty('--stick-trail-opacity','0');
    }
    el.style.removeProperty('--stick-pull');
    el.classList.remove('sprintReady','isSprinting');
    onValue(0,0,0);
    e.preventDefault(); e.stopPropagation();
  };
  el.addEventListener('pointerup',end); el.addEventListener('pointercancel',end);
}
function mobileInputAllowed(){ return TOUCH_DEVICE && started && !shopOpen && !resultOpen && !dialogueOpen && !statsOpen; }
function mobileHaptic(ms=9){ try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(_){} }
function setupMobileSwipeLook(){
  const surface=renderer.domElement;
  if(!surface)return;
  const begin=e=>{
    if(!mobileInputAllowed() || qteActive || e.pointerType==='mouse')return;
    if(mobileLookPointer!==null)return;
    mobileLookPointer=e.pointerId;
    mobileLookLastX=e.clientX; mobileLookLastY=e.clientY; mobileLookTravel=0;
    try{ surface.setPointerCapture(e.pointerId); }catch(_){}
    e.preventDefault();
  };
  const move=e=>{
    if(e.pointerId!==mobileLookPointer || !mobileInputAllowed() || qteActive)return;
    const events=e.getCoalescedEvents?.() || [e];
    for(const pe of events){
      const dx=pe.clientX-mobileLookLastX;
      const dy=pe.clientY-mobileLookLastY;
      mobileLookLastX=pe.clientX; mobileLookLastY=pe.clientY;
      if(!Number.isFinite(dx)||!Number.isFinite(dy))continue;
      mobileLookTravel+=Math.hypot(dx,dy);
      yaw -= dx*MOBILE_LOOK_SENS_X;
      pitch -= dy*MOBILE_LOOK_SENS_Y;
      pitch=THREE.MathUtils.clamp(pitch,-FPS_PITCH_LIMIT,FPS_PITCH_LIMIT);
    }
    e.preventDefault();
  };
  const end=e=>{
    if(e.pointerId!==mobileLookPointer)return;
    mobileLookPointer=null; mobileLookTravel=0;
    try{ surface.releasePointerCapture(e.pointerId); }catch(_){}
    e.preventDefault();
  };
  surface.addEventListener('pointerdown',begin,{passive:false});
  surface.addEventListener('pointermove',move,{passive:false});
  surface.addEventListener('pointerup',end,{passive:false});
  surface.addEventListener('pointercancel',end,{passive:false});
}
function setMobileButtonVisible(btn, visible) {
  if (!btn) return;
  btn.classList.toggle('isHidden', !visible);
}
function updateMobileContextButtons(it) {
  if (!TOUCH_DEVICE) return;




  let interactVisible = false;
  if (it) {
    interactVisible = true;
    let label = 'ДЕЙСТВИЕ';
    if (it.kind === 'npc') label = 'ГОВОРИТЬ';
    else if (it.kind === 'shop') label = 'МАГАЗИН';
    else if (it.kind === 'worldPickup') label = 'ВЗЯТЬ';
    else if (it.kind === 'rakePickup') label = 'ВЗЯТЬ ГРАБЛИ';
    else if (it.kind === 'hose') label = hoseHeld ? 'БРОСИТЬ ШЛАНГ' : 'ВЗЯТЬ ШЛАНГ';
    if (mobileInteractBtn) mobileInteractBtn.textContent = label;
  }
  setMobileButtonVisible(mobileInteractBtn, interactVisible);




  let actionVisible = false;
  if (hoseHeld && jobState === 'active') {
    actionVisible = true;
    if (mobileActionBtn) mobileActionBtn.textContent = pumpBroken
      ? 'НАСОС СЛОМАН'
      : (pouring ? 'ВЫКЛ БЕТОН' : 'ВКЛ БЕТОН');
  } else if (rakeEquipped && jobState === 'active') {
    actionVisible = true;
    if (mobileActionBtn) mobileActionBtn.textContent = 'РАВНЯТЬ';
  }
  setMobileButtonVisible(mobileActionBtn, actionVisible);
}




function syncMobileHud() {
  if (!TOUCH_DEVICE || !mobileHudEl) return;
  if (mobileMoneyTextEl) mobileMoneyTextEl.textContent = `${money} ₽`;
  if (mobileStaminaFillEl) mobileStaminaFillEl.style.width = `${Math.min(100, stamina / staminaMax * 100)}%`;
  if (mobileStaminaTextEl) mobileStaminaTextEl.textContent = String(Math.round(stamina));
  if (mobileFillPercentEl) mobileFillPercentEl.textContent = fillPercentEl?.textContent || '0.0%';
  if (mobileLevelPercentEl) mobileLevelPercentEl.textContent = fillLevelEl?.textContent || '0%';
  if (mobileSmokeCountEl) mobileSmokeCountEl.textContent = String(cigarettes);
  if (mobileDrinkCountEl) mobileDrinkCountEl.textContent = String(energyCans);
  if (mobileBeerCountEl) mobileBeerCountEl.textContent = String(beerCans);
  if (mobileRakeStateEl) mobileRakeStateEl.textContent = rakeOwned ? (rakeEquipped ? 'ON' : '✓') : '—';




  mobileSmokeSlotEl?.classList.toggle('active', specialMode === 'smoke');
  mobileDrinkSlotEl?.classList.toggle('active', specialMode === 'drink');
  mobileBeerSlotEl?.classList.toggle('active', specialMode === 'beer');
  mobileRakeSlotEl?.classList.toggle('active', rakeEquipped);
  mobileSmokeSlotEl?.classList.toggle('empty', cigarettes <= 0);
  mobileDrinkSlotEl?.classList.toggle('empty', energyCans <= 0);
  mobileBeerSlotEl?.classList.toggle('empty', beerCans <= 0);
  mobileRakeSlotEl?.classList.toggle('empty', !rakeOwned);
}
if (TOUCH_DEVICE) {
  const debugToggle = document.querySelector('#mobileDebugToggle');
  const debugPanel = document.querySelector('#mobileDebugPanel');
  if (debugToggle && debugPanel) {
    debugToggle.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      debugPanel.classList.toggle('visible');
      debugPanel.textContent = buildMobileDebugReport();
    });
  }
  preloadEventUiAssets().catch(() => {});
  mobileDebugLog(`boot scene=${FINAL_SCENE_URL} safe=${MOBILE_SAFE_MODE}`);
  const moveStick=document.querySelector('#moveStick'), moveKnob=document.querySelector('#moveKnob');
  setupMobileStick(moveStick,moveKnob,(x,y,sprintStrength=0)=>{
    mobileMoveX=x;
    mobileMoveY=y;
    mobileSprintIntent=sprintStrength>=1;
  });
  setupMobileSwipeLook();
  const bindTap=(id,fn)=>document.querySelector(id)?.addEventListener('pointerdown',e=>{
    e.preventDefault(); e.stopPropagation();
    if(mobileInputAllowed()){ mobileHaptic(8); fn(); }
  });
  bindTap('#mobileInteract',interact);
  bindTap('#mobileSmokeSlot',smokeCigarette);
  bindTap('#mobileDrinkSlot',drinkEnergy);
  bindTap('#mobileBeerSlot',drinkBeer);
  bindTap('#mobileRakeSlot',()=>{ if(!rakeOwned) showToast('СНАЧАЛА ПОДБЕРИ ГРАБЛИ'); else setRakeEquipped(!rakeEquipped); });
  updateMobileContextButtons(null);
  const action=document.querySelector('#mobileAction');
  action?.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); if(mobileInputAllowed()){ mobileHaptic(10); primaryActionDown(); } });
  action?.addEventListener('pointerup',e=>{ e.preventDefault(); e.stopPropagation(); primaryActionUp(); });
  action?.addEventListener('pointercancel',e=>{ e.stopPropagation(); primaryActionUp(); });
  qteLayerEl.addEventListener('pointerdown',e=>{
    if(!qteActive)return;
    qteCursorX=e.clientX; qteCursorY=e.clientY;
    qteCursorEl.style.left=`${qteCursorX}px`; qteCursorEl.style.top=`${qteCursorY}px`;
    mobileHaptic(7); clickQTE(); e.preventDefault();
  });
}




// Gracefully recover from mobile GPU/context eviction instead of leaving a black canvas.
renderer.domElement.addEventListener('webglcontextlost',e=>{
  e.preventDefault();
  mobileDebugLog('WEBGL CONTEXT LOST');
  mobileDebugStage('context-lost');
  showToast('ВОССТАНАВЛИВАЮ ГРАФИКУ…');
  setTimeout(() => recoverBrokenScene('WebGL context lost'), 250);
});
renderer.domElement.addEventListener('webglcontextrestored',()=>{ if (!sceneRecoveryPending) location.reload(); });
window.addEventListener('orientationchange',()=>setTimeout(()=>{ try { window.scrollTo(0,1); } catch(_) {} },80));








function refreshMobileOrientationUI(){
  if (window.__betonViewport?.sync) { window.__betonViewport.sync(); return; }
  const landscape = MOBILE_LANDSCAPE();
  document.documentElement.classList.toggle('mobileLandscape', landscape);
  document.documentElement.classList.toggle('mobilePortrait', TOUCH_DEVICE && !landscape);
}
refreshMobileOrientationUI();
let viewportResizeTimer = 0;
function applyViewportResize() {
  const v = getViewportSize();
  camera.aspect = v.width / v.height; camera.updateProjectionMatrix();
  applyMainRendererSize(v.width, v.height);
  if (composer) {
    composer.setPixelRatio(Math.min(devicePixelRatio,1.15));
    composer.setSize(v.width, v.height);
    bloomPass?.setSize(v.width, v.height);
  }
  refreshMobileOrientationUI();
}
function scheduleViewportResize() {
  if (!TOUCH_DEVICE) { applyViewportResize(); return; }
  clearTimeout(viewportResizeTimer);
  viewportResizeTimer = setTimeout(applyViewportResize, 120);
}
window.addEventListener('resize', scheduleViewportResize, { passive:true });
window.visualViewport?.addEventListener('resize', scheduleViewportResize, { passive:true });




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




  const queryId = ++meshColliderQueryId;
  const minGX = Math.floor((x - PLAYER_R) / MESH_COLLIDER_CELL);
  const maxGX = Math.floor((x + PLAYER_R) / MESH_COLLIDER_CELL);
  const minGZ = Math.floor((z - PLAYER_R) / MESH_COLLIDER_CELL);
  const maxGZ = Math.floor((z + PLAYER_R) / MESH_COLLIDER_CELL);
  for (let gx=minGX; gx<=maxGX; gx++) for (let gz=minGZ; gz<=maxGZ; gz++) {
    const bucket = meshColliderGrid.get(meshColliderCellKey(gx,gz));
    if (!bucket) continue;
    for (const c of bucket) {
      if (c._queryId === queryId) continue;
      c._queryId = queryId;
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
  }
  return false;
}
function moveAxis(dx, dz) {
  const nx = playerPos.x + dx;
  if (!blocked(nx, playerPos.z)) playerPos.x = nx;
  const nz = playerPos.z + dz;
  if (!blocked(playerPos.x, nz)) playerPos.z = nz;
}
function showToast(t, duration = 2.2) {
  toastEl.textContent = t;
  toastEl.classList.add('show');
  if (mobileToastEl) {
    mobileToastEl.textContent = t;
    mobileToastEl.classList.add('show');
  }
  toastTimer = duration;
}




let dialogueOpen = false;
let dialogueNpcKey = null;
let shopOpen = false;
let resultOpen = false;
let statsOpen = false;
let settlementCutsceneActive = false;
let dialogueRewardTransitionActive = false;
let settlementRankRevealTimer = 0;




const settlementCameraState = {
  active: false,
  elapsed: 0,
  distance: 2.72,
  position: new THREE.Vector3(),
  target: new THREE.Vector3(),
  desired: new THREE.Vector3(),
  viewSide: new THREE.Vector3(0, 0, 1),
  quaternion: new THREE.Quaternion(),
  desiredQuaternion: new THREE.Quaternion(),
  lookMatrix: new THREE.Matrix4(),
};




const SETTLEMENT_GRADE_CAPTIONS = {
  S: 'АЛМАЗ · РОВНО 100%',
  A: 'ЗОЛОТО · ДО 105%',
  B: 'ЖЕЛЕЗО · ДО 115%',
  C: 'ЕСТЬ ЗАМЕЧАНИЯ',
  D: 'СЛАБАЯ РАБОТА',
  E: 'ПЛОХАЯ РАБОТА',
  F: 'ГОВНО · ПЕРЕЛИВ',
};




const BOOT_TIER_NAMES = ['Обычные', 'Сапоги новичка', 'Сапоги бетонщика', 'Мышеходы'];
const STAMINA_LEVEL_NAMES = ['Базовая', 'Рабочая I', 'Рабочая II', 'Максимальная'];
const CONCRETE_GRADE_NAMES = ['М200', 'М250', 'М300', 'М350'];




function updateCharacterStatsUI() {
  if (statJobsEl) statJobsEl.textContent = String(jobsCompleted);
  if (statConcreteEl) statConcreteEl.textContent = `${careerStats.concreteM3.toFixed(1)} м³`;
  if (statFloorEl) statFloorEl.textContent = `${careerStats.floorM2.toFixed(1)} м²`;
  if (statRakeEl) statRakeEl.textContent = Math.round(careerStats.rakeStrokes).toLocaleString('ru-RU');
  if (statMoneyEl) statMoneyEl.textContent = `${Math.round(careerStats.moneyEarned).toLocaleString('ru-RU')} ₽`;
  if (statEnergyEl) statEnergyEl.textContent = Math.round(careerStats.energyDrunk).toLocaleString('ru-RU');
  if (statBeerEl) statBeerEl.textContent = Math.round(careerStats.beerDrunk).toLocaleString('ru-RU');
  if (statCigarettesEl) statCigarettesEl.textContent = Math.round(careerStats.cigarettesSmoked).toLocaleString('ru-RU');
  if (statPerfectQteEl) statPerfectQteEl.textContent = Math.round(careerStats.perfectQte).toLocaleString('ru-RU');
  if (statBootsEl) statBootsEl.textContent = BOOT_TIER_NAMES[bootTier] || BOOT_TIER_NAMES[0];
  if (statStaminaLevelEl) statStaminaLevelEl.textContent = STAMINA_LEVEL_NAMES[staminaLevel] || STAMINA_LEVEL_NAMES[0];
  if (statConcreteGradeEl) statConcreteGradeEl.textContent = CONCRETE_GRADE_NAMES[pumpLevel] || CONCRETE_GRADE_NAMES[0];
}




function openCharacterStats() {
  if (!started || statsOpen || shopOpen || resultOpen || dialogueOpen) return;
  statsOpen = true;
  pouring = false;
  evaluateJob();
  updateCharacterStatsUI();
  characterStatsEl?.classList.remove('hidden');
  document.body.classList.add('statsActive');
  for (const key in keys) keys[key] = false;
  if (document.pointerLockElement) document.exitPointerLock();
}




function closeCharacterStats() {
  if (!statsOpen) return;
  statsOpen = false;
  characterStatsEl?.classList.add('hidden');
  document.body.classList.remove('statsActive');
  saveCareerStats();
  markPourProgressDirty();
  savePourProgress(true);
  requestMouseLock();
}




function markPourProgressDirty() {
  if (pourProgressLoading) return;
  pourProgressDirty = true;
}




function serialisePourZone(zone) {
  return {
    fill: Array.from(zone.fill, height => Math.round(
      THREE.MathUtils.clamp(Number(height) || 0, 0, zone.maxH) * 10000
    )),
    rakeTouched: Array.from(zone.rakeTouched, value => value ? 1 : 0),
    levelPrompted: Boolean(zone.levelPrompted),
    readyNotified: Boolean(zone.readyNotified),
    settledGrade: typeof zone.settledGrade === 'string' ? zone.settledGrade : null,
    eventType: POUR_EVENT_TYPES.includes(zone.eventType) ? zone.eventType : null,
    eventThreshold: THREE.MathUtils.clamp(Number(zone.eventThreshold) || .4, .12, .88),
    eventTriggered: Boolean(zone.eventTriggered),
  };
}




function savePourProgress(force = false) {
  if ((!pourProgressDirty && !force) || pourProgressLoading) return;




  try {
    const payload = {
      version: 2,
      savedAt: Date.now(),
      jobState: ['active', 'ready', 'accepted', 'failed'].includes(jobState)
        ? jobState
        : 'active',
      activePourZoneIndex: THREE.MathUtils.clamp(
        Math.round(Number(activePourZoneIndex) || 0),
        0,
        POUR_ZONES.length
      ),
      paidPourZoneCount: THREE.MathUtils.clamp(
        Math.round(Number(paidPourZoneCount) || 0),
        0,
        POUR_ZONES.length
      ),
      qteHits: Math.max(0, Math.round(Number(qteHits) || 0)),
      qteMisses: Math.max(0, Math.round(Number(qteMisses) || 0)),
      qtePerfects: Math.max(0, Math.round(Number(qtePerfects) || 0)),
      wastedVolume: Math.max(0, Number(wastedVolume) || 0),
      pumpBroken: Boolean(pumpBroken),
      zones: POUR_ZONES.map(serialisePourZone),
      spills: spillClumps
        .filter(spill => spill.volume > .001)
        .slice(0, SPILL_CLUMP_MAX)
        .map(spill => ({
          x: Number(spill.x) || 0,
          z: Number(spill.z) || 0,
          volume: Math.max(0, Number(spill.volume) || 0),
          vx: THREE.MathUtils.clamp(Number(spill.vx) || 0, -.75, .75),
          vz: THREE.MathUtils.clamp(Number(spill.vz) || 0, -.75, .75),
          mobility: THREE.MathUtils.clamp(Number(spill.mobility) || .18, .18, 1),
          spread: THREE.MathUtils.clamp(Number(spill.spread) || 1, .68, 1.35),
          age: Math.max(0, Number(spill.age) || 0),
        })),
    };




    localStorage.setItem(POUR_PROGRESS_KEY, JSON.stringify(payload));
    pourProgressDirty = false;
    pourProgressSaveTimer = 0;
  } catch (error) {
    console.warn('Pour progress save failed', error);
  }
}




function loadPourProgress() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(POUR_PROGRESS_KEY) || 'null');
  } catch (error) {
    console.warn('Pour progress parse failed', error);
    return false;
  }




  if (!saved || saved.version !== 2 || !Array.isArray(saved.zones)) return false;




  pourProgressLoading = true;
  try {
    for (let zoneIndex = 0; zoneIndex < POUR_ZONES.length; zoneIndex++) {
      const zone = POUR_ZONES[zoneIndex];
      const source = saved.zones[zoneIndex] || {};
      zone.fill.fill(0);
      zone.mobility.fill(0);
      zone.velX.fill(0);
      zone.velZ.fill(0);
      zone.flowDelta.fill(0);
      zone.flowBudget.fill(0);
      zone.rakeTouched.fill(0);




      if (Array.isArray(source.fill)) {
        const count = Math.min(zone.fill.length, source.fill.length);
        for (let i = 0; i < count; i++) {
          const height = THREE.MathUtils.clamp((Number(source.fill[i]) || 0) / 10000, 0, zone.maxH);
          zone.fill[i] = height;
          if (height > .00035) zone.mobility[i] = .22;
        }
      }




      if (Array.isArray(source.rakeTouched)) {
        const count = Math.min(zone.rakeTouched.length, source.rakeTouched.length);
        for (let i = 0; i < count; i++) zone.rakeTouched[i] = source.rakeTouched[i] ? 1 : 0;
      }




      zone.levelPrompted = Boolean(source.levelPrompted);
      zone.readyNotified = Boolean(source.readyNotified);
      zone.settledGrade = typeof source.settledGrade === 'string' ? source.settledGrade : null;
      zone.eventType = POUR_EVENT_TYPES.includes(source.eventType) ? source.eventType : null;
      zone.eventThreshold = THREE.MathUtils.clamp(Number(source.eventThreshold) || .4, .12, .88);
      zone.eventTriggered = Boolean(source.eventTriggered);
      if (!zone.eventType) prepareZoneRandomEvent(zone, zoneIndex);
      zone.hosePouredVolume = zoneVolume(zone);
      zone.piles.length = 0;
      zone.dirty = true;
    }




    clearSurfaceSpills();
    if (Array.isArray(saved.spills)) {
      for (const source of saved.spills.slice(0, SPILL_CLUMP_MAX)) {
        const x = THREE.MathUtils.clamp(Number(source.x) || 0, SLAB.minX, SLAB.maxX);
        const z = THREE.MathUtils.clamp(Number(source.z) || 0, SLAB.minZ, SLAB.maxZ);
        const volume = THREE.MathUtils.clamp(Number(source.volume) || 0, 0, 2.5);
        if (volume <= .001 || zoneAt(x, z)) continue;
        const spill = createSpillClump(x, z, volume);
        spill.vx = THREE.MathUtils.clamp(Number(source.vx) || 0, -.75, .75);
        spill.vz = THREE.MathUtils.clamp(Number(source.vz) || 0, -.75, .75);
        spill.mobility = THREE.MathUtils.clamp(Number(source.mobility) || .18, .18, 1);
        spill.spread = THREE.MathUtils.clamp(Number(source.spread) || 1, .68, 1.35);
        spill.age = Math.max(0, Number(source.age) || 0);
        refreshSpillClump(spill);
      }
    }




    jobState = ['active', 'ready', 'accepted', 'failed'].includes(saved.jobState)
      ? saved.jobState
      : 'active';
    activePourZoneIndex = THREE.MathUtils.clamp(
      Math.round(Number(saved.activePourZoneIndex) || 0),
      0,
      POUR_ZONES.length
    );
    paidPourZoneCount = THREE.MathUtils.clamp(
      Math.round(Number(saved.paidPourZoneCount) || 0),
      0,
      POUR_ZONES.length
    );




    // A session may have been closed immediately after the pump was switched
    // off. Recompute the next map from the restored physical surfaces instead
    // of leaving the outline on an already completed bay.
    if (jobState === 'active' || jobState === 'ready') {
      const firstIncomplete = POUR_ZONES.findIndex(zone => !zoneReadyForSequence(zone));
      activePourZoneIndex = firstIncomplete < 0 ? POUR_ZONES.length : firstIncomplete;
      if (activePourZoneIndex >= POUR_ZONES.length && surfaceSpillVolume() <= .015) {
        jobState = 'ready';
      } else if (jobState === 'ready') {
        jobState = 'active';
      }
    }




    qteHits = Math.max(0, Math.round(Number(saved.qteHits) || 0));
    qteMisses = Math.max(0, Math.round(Number(saved.qteMisses) || 0));
    qtePerfects = Math.max(0, Math.round(Number(saved.qtePerfects) || 0));
    wastedVolume = Math.max(0, Number(saved.wastedVolume) || 0);
    pumpBroken = Boolean(saved.pumpBroken);




    pouring = false;
    hoseHeld = false;
    pendingPourEvent = null;
    eventAlarmTimer = 0;
    pressureSpikePending = false;
    blindnessTimer = 0;
    outlinedPourZoneId = -1;
    activePourOutline.visible = false;
    refreshConcreteSurfaces();
    return true;
  } catch (error) {
    console.warn('Pour progress restore failed', error);
    return false;
  } finally {
    pourProgressLoading = false;
    pourProgressDirty = false;
    pourProgressSaveTimer = 0;
  }
}




function updatePourProgressPersistence(dt) {
  if (!pourProgressDirty) return;
  pourProgressSaveTimer += dt;
  if (pourProgressSaveTimer >= 1.8) savePourProgress();
}




loadPourProgress();
window.addEventListener('pagehide', () => savePourProgress(true));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') savePourProgress(true);
});




characterStatsButtonEl?.addEventListener('click', openCharacterStats);
mobileCharacterStatsButtonEl?.addEventListener('pointerdown', e => {
  e.preventDefault();
  e.stopPropagation();
  openCharacterStats();
});
characterStatsCloseEl?.addEventListener('click', closeCharacterStats);




const DIALOGUE_NAMES = {
  pavel: 'Павел Петрович',
  mandarin: 'Серёга',
  george: 'Джордж',
  baba: 'Баба Капа',
};




const DIALOGUE_SKINS = {
  pavel: {
    // Restore the approved square Pavel art with its original blue
    // construction backdrop baked into the portrait.
    portrait: './assets/dialogue_v7/pavel_card.webp',
    paint: null,
    accent: '#4f9ee8',
    accentDark: '#265f9a',
    accentSoft: 'rgba(79,158,232,.24)',
  },
  mandarin: {
    // The supplied square art already contains the correctly cropped
    // construction brush behind the portrait.
    portrait: './assets/dialogue_v7/serega_card.webp',
    paint: null,
    accent: '#ef8a34',
    accentDark: '#9f4e19',
    accentSoft: 'rgba(239,138,52,.25)',
  },
  george: {
    portrait: './assets/dialogue_v7/george_card.webp',
    paint: null,
    accent: '#4ea9d8',
    accentDark: '#23698e',
    accentSoft: 'rgba(78,169,216,.24)',
  },
  baba: {
    portrait: './assets/dialogue_v7/baba_card.webp',
    paint: null,
    accent: '#e4c14a',
    accentDark: '#997c1a',
    accentSoft: 'rgba(228,193,74,.24)',
  },
};




function applyDialogueSkin(npcKey) {
  const skin = DIALOGUE_SKINS[npcKey] || DIALOGUE_SKINS.pavel;
  dialogueEl.dataset.npc = npcKey || 'pavel';
  dialogueEl.style.setProperty('--dialog-accent', skin.accent);
  dialogueEl.style.setProperty('--dialog-accent-soft', skin.accentSoft);
  dialogueEl.style.setProperty('--dialog-accent-dark', skin.accentDark || skin.accent);
  if (skin.paint) dialogueEl.style.setProperty('--dialog-paint', `url("${skin.paint}")`);
  else dialogueEl.style.setProperty('--dialog-paint', 'none');
  if (dialoguePortraitEl) {
    dialoguePortraitEl.hidden = false;
    dialoguePortraitEl.style.removeProperty('display');
    dialoguePortraitEl.style.removeProperty('opacity');
    dialoguePortraitEl.onerror = () => {
      if (npcKey === 'pavel' && !dialoguePortraitEl.src.endsWith('/assets/dialogue_v7/pavel_card.webp')) {
        dialoguePortraitEl.src = './assets/dialogue_v7/pavel_card.webp';
      }
    };
    dialoguePortraitEl.src = skin.portrait;
  }
}




function dialogueWalletTarget() {
  return TOUCH_DEVICE ? (mobileMoneyEl || economyEl) : (economyEl || mobileMoneyEl);
}




function pulseDialogueWallet(target = dialogueWalletTarget()) {
  if (!target) return;
  target.classList.remove('walletRewardPulse');
  void target.offsetWidth;
  target.classList.add('walletRewardPulse');
  window.setTimeout(() => target.classList.remove('walletRewardPulse'), 520);
}




function animateDialogueRewardToWallet(sourceEl, amount) {
  const targetEl = dialogueWalletTarget();
  if (!sourceEl || !targetEl) return Promise.resolve();




  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();
  if (!sourceRect.width || !targetRect.width) return Promise.resolve();




  const flyer = sourceEl.cloneNode(true);
  flyer.classList.add('dialogueRewardFlyer');
  flyer.textContent = `+${Math.max(0, Math.round(amount)).toLocaleString('ru-RU')} ₽`;
  Object.assign(flyer.style, {
    left: `${sourceRect.left}px`,
    top: `${sourceRect.top}px`,
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
  });
  document.body.appendChild(flyer);




  const dx = targetRect.left + targetRect.width * .5 - (sourceRect.left + sourceRect.width * .5);
  const dy = targetRect.top + targetRect.height * .5 - (sourceRect.top + sourceRect.height * .5);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reducedMotion ? 230 : 720;
  const animation = flyer.animate([
    { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, offset: 0 },
    { transform: `translate3d(${dx * .34}px,${dy * .18 - 24}px,0) scale(1.08)`, opacity: 1, offset: .38 },
    { transform: `translate3d(${dx}px,${dy}px,0) scale(.28)`, opacity: .16, offset: 1 },
  ], {
    duration,
    easing: 'cubic-bezier(.2,.78,.18,1)',
    fill: 'forwards',
  });




  return animation.finished
    .catch(() => undefined)
    .finally(() => flyer.remove());
}




function setDialogue(name, text, options = []) {
  dialogueNameEl.textContent = DIALOGUE_NAMES[dialogueNpcKey] || name;
  dialogueTextEl.textContent = text;
  dialogueOptionsEl.innerHTML = '';
  options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className = 'dialogueOption';
    btn.type = 'button';
    btn.dataset.optionIndex = String(index + 1);
    const key = document.createElement('span');
    key.className = 'dialogueOptionKey';
    key.textContent = String(index + 1);
    const label = document.createElement('span');
    label.className = 'dialogueOptionLabel';
    label.textContent = opt.label;
    btn.append(key, label);




    const rewardAmount = Math.max(0, Math.round(Number(opt.reward) || 0));
    let rewardBadge = null;
    if (rewardAmount > 0) {
      btn.classList.add('hasReward');
      rewardBadge = document.createElement('span');
      rewardBadge.className = 'dialogueRewardBadge';
      rewardBadge.textContent = `+${rewardAmount.toLocaleString('ru-RU')} ₽`;
      rewardBadge.setAttribute('aria-label', `Награда ${rewardAmount.toLocaleString('ru-RU')} рублей`);
      btn.appendChild(rewardBadge);
    }




    btn.addEventListener('click', async () => {
      if (btn.dataset.processing === '1') return;
      btn.dataset.processing = '1';




      if (rewardAmount > 0) {
        dialogueRewardTransitionActive = true;
        btn.classList.add('isRewardSelected');
        dialogueOptionsEl.querySelectorAll('button').forEach(button => { button.disabled = true; });
        await animateDialogueRewardToWallet(rewardBadge, rewardAmount);
      }




      try {
        await Promise.resolve(opt.action?.());
        if (rewardAmount > 0) {
          updateEconomyUI();
          syncMobileHud();
          pulseDialogueWallet();
          // A settlement starts its cutscene after the wallet hit. This fallback
          // keeps future reward options from ever leaving dialogue input locked.
          window.setTimeout(() => {
            if (!settlementCutsceneActive && dialogueRewardTransitionActive) {
              dialogueRewardTransitionActive = false;
              if (dialogueOpen && dialogueOptionsEl.contains(btn)) {
                dialogueOptionsEl.querySelectorAll('button').forEach(button => { button.disabled = false; });
                btn.dataset.processing = '0';
              }
            }
          }, 560);
        }
      } catch (error) {
        console.warn('Dialogue option failed', error);
        dialogueRewardTransitionActive = false;
        if (dialogueOptionsEl.contains(btn)) {
          dialogueOptionsEl.querySelectorAll('button').forEach(button => { button.disabled = false; });
          btn.dataset.processing = '0';
        }
      }
    });
    dialogueOptionsEl.appendChild(btn);
  });
}




function openDialogue(npcKey) {
  if (dialogueOpen || shopOpen || resultOpen || statsOpen || settlementCutsceneActive) return;
  dialogueOpen = true;
  dialogueNpcKey = npcKey;
  applyDialogueSkin(npcKey);
  document.body.classList.add('dialogueActive');
  pouring = false;
  evaluateJob();
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
  if (!dialogueOpen || settlementCutsceneActive || dialogueRewardTransitionActive) return;




  const closingNpcKey = dialogueNpcKey;




  dialogueOpen = false;
  dialogueNpcKey = null;
  dialogueEl.classList.add('hidden');
  document.body.classList.remove('dialogueActive');




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




function unpaidReadyZones() {
  const completed = completedPourZoneCount();
  return POUR_ZONES.slice(paidPourZoneCount, completed);
}




function settlementBreakdown() {
  return unpaidReadyZones().map(zone => ({ zone, ...gradePourZone(zone) }));
}




function createSettlementStats(breakdown, reward) {
  const entries = Array.isArray(breakdown) ? breakdown : [];
  const count = Math.max(1, entries.length);
  const fillPercent = entries.reduce((sum, entry) => (
    sum + zoneVolume(entry.zone) / Math.max(.000001, entry.zone.targetVolume) * 100
  ), 0) / count;
  const levelPercent = entries.reduce((sum, entry) => {
    const level = zoneLevelStats(entry.zone);
    return sum + THREE.MathUtils.clamp(
      level.score / Math.max(.001, entry.zone.levelRequired),
      0,
      1
    ) * 100;
  }, 0) / count;
  const overpour = entries.reduce((worst, entry) => Math.max(worst, entry.overpour || 0), 0);
  return {
    maps: entries.length,
    fillPercent,
    levelPercent,
    overpour,
    qtePerfects,
    qteMisses,
    reward: Math.max(0, Math.round(reward || 0)),
  };
}




function currentJobReward() {
  return settlementBreakdown().reduce((sum, entry) => sum + entry.reward, 0);
}




async function loadDanceSource(url) {
  if (!npcDanceCache.has(url)) npcDanceCache.set(url, loadFBX(url));
  return npcDanceCache.get(url);
}




function waitForMs(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}




function getPavelCutsceneTarget(out) {
  const rt = npcRuntime.get('pavel');
  if (!rt?.wrap) return false;
  rt.wrap.getWorldPosition(out);
  out.y += Math.max(.9, (rt.pose?.height || 1.78) * .62);
  return true;
}




function beginSettlementCamera() {
  syncCameraToPlayer();
  settlementCameraState.position.copy(camera.position);
  settlementCameraState.quaternion.copy(camera.quaternion);
  settlementCameraState.elapsed = 0;




  if (!getPavelCutsceneTarget(settlementCameraState.target)) {
    settlementCameraState.active = false;
    return;
  }




  settlementCameraState.viewSide
    .copy(settlementCameraState.position)
    .sub(settlementCameraState.target);
  settlementCameraState.viewSide.y = 0;




  const currentDistance = settlementCameraState.viewSide.length();
  if (currentDistance < .35) {
    const rt = npcRuntime.get('pavel');
    const worldQuaternion = rt?.wrap?.getWorldQuaternion(new THREE.Quaternion()) || new THREE.Quaternion();
    settlementCameraState.viewSide.set(0, 0, 1).applyQuaternion(worldQuaternion);
    settlementCameraState.viewSide.y = 0;
  }
  settlementCameraState.viewSide.normalize();
  settlementCameraState.distance = THREE.MathUtils.clamp(currentDistance + .46, 2.48, 3.05);
  settlementCameraState.active = true;
}




function updateSettlementCamera(dt) {
  if (!settlementCutsceneActive || !settlementCameraState.active) return;
  if (!getPavelCutsceneTarget(settlementCameraState.target)) return;




  settlementCameraState.elapsed += dt;
  settlementCameraState.desired
    .copy(settlementCameraState.target)
    .addScaledVector(settlementCameraState.viewSide, settlementCameraState.distance);
  settlementCameraState.desired.y = settlementCameraState.target.y + .32;




  // A tiny sideways drift keeps the shot alive without fighting Pavel's dance.
  const drift = Math.sin(settlementCameraState.elapsed * .62) * .075;
  settlementCameraState.desired.x += settlementCameraState.viewSide.z * drift;
  settlementCameraState.desired.z -= settlementCameraState.viewSide.x * drift;




  settlementCameraState.position.x = THREE.MathUtils.damp(
    settlementCameraState.position.x,
    settlementCameraState.desired.x,
    4.8,
    dt
  );
  settlementCameraState.position.y = THREE.MathUtils.damp(
    settlementCameraState.position.y,
    settlementCameraState.desired.y,
    4.8,
    dt
  );
  settlementCameraState.position.z = THREE.MathUtils.damp(
    settlementCameraState.position.z,
    settlementCameraState.desired.z,
    4.8,
    dt
  );




  settlementCameraState.lookMatrix.lookAt(
    settlementCameraState.position,
    settlementCameraState.target,
    camera.up
  );
  settlementCameraState.desiredQuaternion.setFromRotationMatrix(settlementCameraState.lookMatrix);
  settlementCameraState.quaternion.slerp(
    settlementCameraState.desiredQuaternion,
    1 - Math.exp(-7.5 * dt)
  );




  camera.position.copy(settlementCameraState.position);
  camera.quaternion.copy(settlementCameraState.quaternion);
}




function revealSettlementRank(grade, reward) {
  const safeGrade = SETTLEMENT_GRADE_CAPTIONS[grade] ? grade : 'F';
  settlementRankCardEl.dataset.grade = safeGrade;
  settlementRankTextEl.textContent = safeGrade;
  settlementRankCaptionEl.textContent = SETTLEMENT_GRADE_CAPTIONS[safeGrade];
  settlementRankRewardEl.textContent = `+${Math.max(0, Math.round(reward)).toLocaleString('ru-RU')} ₽`;
  // The supplied material sheet is ordered A=diamond, B=gold, C=iron.
  // Our gameplay ladder is S/A/B, so replace those baked letters while
  // retaining the correct material artwork underneath.
  settlementRankOverrideEl.textContent = '';
  settlementRankCardEl.classList.remove('isVisible');
  void settlementRankCardEl.offsetWidth;
  settlementRankCardEl.classList.add('isVisible');
}




function revealSettlementStats(stats, grade, reward) {
  const safeGrade = SETTLEMENT_GRADE_CAPTIONS[grade] ? grade : 'F';
  const data = stats || {};
  settlementStatsCardEl.dataset.grade = safeGrade;
  settlementStatsGradeEl.textContent = safeGrade;
  settlementStatsMapsEl.textContent = String(Math.max(1, Math.round(data.maps || 1)));
  settlementStatsFillEl.textContent = `${Number(data.fillPercent || 0).toFixed(1)}%`;
  settlementStatsLevelEl.textContent = `${Math.round(data.levelPercent || 0)}%`;
  settlementStatsOverpourEl.textContent = `${Number(data.overpour || 0).toFixed(1)}%`;
  settlementStatsQteEl.textContent = `${Math.round(data.qtePerfects || 0)} PERFECT · ${Math.round(data.qteMisses || 0)} MISS`;
  settlementStatsRewardEl.textContent = `+${Math.max(0, Math.round(data.reward ?? reward ?? 0)).toLocaleString('ru-RU')} ₽`;
  settlementStatsCardEl.classList.remove('isVisible');
  void settlementStatsCardEl.offsetWidth;
  settlementStatsCardEl.classList.add('isVisible');
}




async function showSettlementStatsPhase(stats, grade, reward, duration = 3200) {
  settlementRankCardEl.classList.remove('isVisible');
  await waitForMs(140);
  if (!settlementCutsceneActive) return;
  revealSettlementStats(stats, grade, reward);
  await waitForMs(duration);
}




async function startPavelSettlementCutscene(grade, reward, stats, restoreResultDialogue) {
  if (settlementCutsceneActive) return false;
  dialogueRewardTransitionActive = false;
  settlementCutsceneActive = true;
  settlementRankRevealTimer = 0;
  preloadSettlementRankSheet();




  pouring = false;
  mobileMoveX = 0;
  mobileMoveY = 0;
  mobileSprintIntent = false;
  for (const key in keys) keys[key] = false;
  if (specialMode) finishSpecial();
  armsRig.visible = false;




  dialogueOptionsEl.querySelectorAll('button').forEach(button => { button.disabled = true; });
  dialogueEl.classList.add('hidden');
  document.body.classList.remove('dialogueActive');
  document.body.classList.add('settlementCutsceneActive');
  settlementCutsceneEl.classList.remove('hidden');
  settlementRankCardEl.classList.remove('isVisible');
  settlementStatsCardEl.classList.remove('isVisible');
  beginSettlementCamera();




  let danceStarted = false;
  try {
    const dancePlayed = await playPavelDance(() => {
      danceStarted = true;
      settlementRankRevealTimer = window.setTimeout(() => {
        if (settlementCutsceneActive) revealSettlementRank(grade, reward);
      }, 650);
    });




    // If an animation file ever fails to load, still show the earned rank and
    // return cleanly to dialogue instead of trapping the player in a cutscene.
    if (!dancePlayed || !danceStarted) {
      revealSettlementRank(grade, reward);
      await waitForMs(3300);
    }
    await showSettlementStatsPhase(stats, grade, reward, 3200);
  } catch (error) {
    console.warn('Pavel settlement cutscene failed', error);
    revealSettlementRank(grade, reward);
    await waitForMs(2200);
    await showSettlementStatsPhase(stats, grade, reward, 2800);
  } finally {
    if (settlementRankRevealTimer) window.clearTimeout(settlementRankRevealTimer);
    settlementRankRevealTimer = 0;
    settlementRankCardEl.classList.remove('isVisible');
    settlementStatsCardEl.classList.remove('isVisible');
    settlementCutsceneEl.classList.add('hidden');
    document.body.classList.remove('settlementCutsceneActive');
    settlementCameraState.active = false;
    settlementCutsceneActive = false;
    armsRig.visible = armsReady;
    syncCameraToPlayer();




    try {
      restoreResultDialogue?.();
    } catch (error) {
      console.warn('Settlement result dialogue failed', error);
      setDialogue('ПАВЕЛ ПЕТРОВИЧ', 'Рассчитались. Дальше работай.', [
        { label: 'Понял.', action: closeDialogue }
      ]);
    }
    dialogueEl.classList.remove('hidden');
    document.body.classList.add('dialogueActive');
  }
  return true;
}




async function playPavelDance(onStarted = null) {
  const rt = npcRuntime.get('pavel');
  if (!rt?.mixer || !rt.character) return false;
  let action = null;




  try {
    let danceIndex = Math.floor(Math.random() * PAVEL_DANCES.length);
    // Random every settlement, but avoid an immediate repeat so the variety is visible.
    if (PAVEL_DANCES.length > 1 && danceIndex === pavelLastDanceIndex) {
      danceIndex = (danceIndex + 1 + Math.floor(Math.random() * (PAVEL_DANCES.length - 1))) % PAVEL_DANCES.length;
    }
    pavelLastDanceIndex = danceIndex;
    const url = PAVEL_DANCES[danceIndex];
    const source = await loadDanceSource(url);
    if (!source.animations?.length) return false;




    const clip = retargetClip(rt.character, source.animations[0], `Pavel_Dance_${Date.now()}`);
    if (!clip.tracks.length) return false;




    if (rt.busyAction) {
      rt.busyAction.stop();
      rt.busyAction = null;
    }
    rt.idleAction?.fadeOut(.15);




    action = rt.mixer.clipAction(clip);
    rt.busyAction = action;
    action.reset();
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = false;




    // Keep the authored Mixamo tempo. setDuration() used to stretch every
    // source clip to six seconds, so short dances looked unnaturally slow and
    // long dances looked sped up. Loop at native speed for the celebration
    // window instead.
    action.setEffectiveTimeScale(1.0);




    action.fadeIn(.12);
    action.play();




    // Voice and music belong to this exact success moment.
    playPavelSuccessMusic();
    playPavelSuccessDanceVoice();




    onStarted?.(action);
    await waitForMs(PAVEL_SUCCESS_DANCE_SECONDS * 1000);




    if (rt.busyAction === action) {
      action.fadeOut(.18);
      stopPavelSuccessMusic(.10);
      rt.busyAction = null;
      rt.idleAction?.reset().fadeIn(.18).play();
      window.setTimeout(() => action.stop(), 220);
    }
    return true;
  } catch (e) {
    console.warn('Pavel dance failed', e);
    stopPavelSuccessMusic(.08);
    if (action) {
      try { action.stop(); } catch (_) {}
    }
    rt.busyAction = null;
    rt.idleAction?.reset().fadeIn(.12).play();
    return false;
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




  const handoverReady = jobReadyForHandover();
  const pendingReward = handoverReady ? currentJobReward() : 0;




  setDialogue(
    'ПАВЕЛ ПЕТРОВИЧ',
    handoverReady
      ? 'Готовая карта есть. Сдаёшь?'
      : 'Ну? Как там квадрат?',
    [
      {
        label: 'Я залился.',
        reward: pendingReward,
        action: () => {
          if (settlementCutsceneActive) return;
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
                : `Карта №${worstZone.id}: слой кривой — ровность ${Math.round(THREE.MathUtils.clamp(level.score / Math.max(.001, worstZone.levelRequired), 0, 1) * 100)}%. Нужно 100%.`;
            } else {
              note = `Не гони. Готово ${done} из 6 карт.`;
            }
            setDialogue('ПАВЕЛ ПЕТРОВИЧ', note, [
              { label: 'Ладно.', action: closeDialogue }
            ]);
            return;
          }




          const completed = completedPourZoneCount();
          const breakdown = settlementBreakdown();
          const unpaid = breakdown.length;




          if (unpaid <= 0) {
            setDialogue('ПАВЕЛ ПЕТРОВИЧ', 'За готовые карты я уже рассчитался. Доделывай следующую.', [
              { label: 'Понял.', action: closeDialogue }
            ]);
            return;
          }




          const reward = breakdown.reduce((sum, entry) => sum + entry.reward, 0);
          const settlementStats = createSettlementStats(breakdown, reward);
          const worst = breakdown.reduce((current, entry) => {
            if (!current) return entry;
            const currentIndex = POUR_GRADE_RULES.findIndex(rule => rule.grade === current.grade);
            const entryIndex = POUR_GRADE_RULES.findIndex(rule => rule.grade === entry.grade);
            return entryIndex > currentIndex ? entry : current;
          }, null);
          const gradeList = breakdown.length <= 2
            ? breakdown
              .map(entry => `№${entry.zone.id}: ${entry.grade}, перелив ${entry.overpour.toFixed(1)}%`)
              .join(' · ')
            : breakdown.map(entry => `№${entry.zone.id} — ${entry.grade}`).join(' · ');




          for (const entry of breakdown) {
            entry.zone.settledGrade = entry.grade;
            recordCareerStat('floorM2', entry.zone.w * entry.zone.d);
          }
          addMoney(reward);
          paidPourZoneCount += unpaid;
          saveProgression();
          saveCareerStats();
          markPourProgressDirty();
          savePourProgress(true);




          // A successful map settlement should not trigger Pavel's ordinary farewell.
          pavelFarewellAllowedThisDialogue = false;




          const allSixReady = completed >= POUR_ZONES.length;
          const spillsClean = surfaceSpillVolume() <= .015;
          const finalGrade = worst?.grade || 'F';
          let restoreResultDialogue;




          if (allSixReady && spillsClean) {
            jobState = 'accepted';
            jobsCompleted++;
            saveProgression();
            savePourProgress(true);




            restoreResultDialogue = () => {
              setDialogue(
                'ПАВЕЛ ПЕТРОВИЧ',
                `Все шесть принял. Оценка ${finalGrade}. ${gradeList}. Объект закрыт.`,
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
            };
          } else {
            const lastPaid = paidPourZoneCount;
            restoreResultDialogue = () => {
              setDialogue(
                'ПАВЕЛ ПЕТРОВИЧ',
                `${gradeList}. Оценка Паши: ${finalGrade}. Рассчитано карт: ${lastPaid}/6.`,
                [
                  { label: 'Дальше работаю.', action: closeDialogue }
                ]
              );
            };
          }




          // Payment is committed once above; dialogue is then suspended while
          // the camera focuses Pavel, his dance plays and the rank flies in.
          // The prepared result dialogue returns only after the cutscene ends.
          window.setTimeout(() => {
            dialogueRewardTransitionActive = false;
            void startPavelSettlementCutscene(finalGrade, reward, settlementStats, restoreResultDialogue);
          }, 260);
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
  if (pumpBroken) {
    setDialogue('Джордж', 'Насос встал. Предохранитель выбило — могу вернуть подачу.', [
      {
        label: 'Открыть щиток насоса',
        action: () => {
          openPumpWirePuzzle();
        }
      },
      { label: 'Потом.', action: closeDialogue }
    ]);
    return;
  }




  const levels = [
    { cost: 900,  mult: PUMP_RATE_MULT[1], text: 'Чуть подкрутил насос. Бетон пойдёт бодрее.' },
    { cost: 2200, mult: PUMP_RATE_MULT[2], text: 'Теперь подача уже серьёзная. Следи за переливом.' },
    { cost: 4800, mult: PUMP_RATE_MULT[3], text: 'Это максимум. Шланг теперь льёт очень быстро.' },
  ];




  if (pumpLevel >= 3) {
    setDialogue('Джордж', 'Насос уже выкручен как надо. Быстрее — только проблемы искать.', [
      { label: 'Выход', action: closeDialogue }
    ]);
    return;
  }




  const next = levels[pumpLevel];
  const percent = Math.round((next.mult - 1) * 100);
  setDialogue('Джордж', 'Могу разбавить бетон, но не просто так.', [
    {
      label: `Ускорить подачу +${percent}% — ${next.cost.toLocaleString('ru-RU')} ₽`,
      action: () => {
        if (money < next.cost) {
          playGeorgeNoMoneyVoice();




          setDialogue('Джордж', 'Не хватает денег. Подкопи и приходи.', [
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
        setDialogue('Джордж', next.text, [
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
  document.body.classList.remove('dialogueActive');




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
  if (shopOpen || resultOpen || dialogueOpen || statsOpen) return;




  shopOpenedFromBaba = !!fromBaba;
  shopOpen = true;
  pouring = false;
  evaluateJob();
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




function worldPos(obj, out = interactionWorldPos) { return obj.getWorldPosition(out); }




const interactionRaycaster = new THREE.Raycaster();
const interactionNDC = new THREE.Vector2(0, 0);
const interactionWorldPos = new THREE.Vector3();
const interactionPlayerPoint = new THREE.Vector3();
const interactionCamPos = new THREE.Vector3();
const interactionCamDir = new THREE.Vector3();
const interactionAimPoint = new THREE.Vector3();
const interactionAimVec = new THREE.Vector3();
const interactionAimBox = new THREE.Box3();
const interactionHitPoint = new THREE.Vector3();
const interactionNpcCapsuleBottom = new THREE.Vector3();
const interactionNpcCapsuleTop = new THREE.Vector3();
const interactionNpcRayPoint = new THREE.Vector3();
const interactionNpcBodyPoint = new THREE.Vector3();




// NPC interaction uses a vertical capsule instead of one tiny point in the
// chest.  Looking at the torso OR the head now produces the dialogue action,
// while aiming beside the character still does not.
function npcIsUnderCrosshair(it) {
  if (!it?.obj) return false;
  camera.getWorldPosition(interactionCamPos);
  camera.getWorldDirection(interactionCamDir).normalize();
  interactionRaycaster.ray.set(interactionCamPos, interactionCamDir);




  it.obj.getWorldPosition(interactionAimPoint);
  interactionNpcCapsuleBottom.copy(interactionAimPoint).addScaledVector(THREE.Object3D.DEFAULT_UP, -.64);
  interactionNpcCapsuleTop.copy(interactionAimPoint).addScaledVector(THREE.Object3D.DEFAULT_UP, .84);
  const distanceSq = interactionRaycaster.ray.distanceSqToSegment(
    interactionNpcCapsuleBottom,
    interactionNpcCapsuleTop,
    interactionNpcRayPoint,
    interactionNpcBodyPoint,
  );
  const alongRay = interactionCamPos.distanceTo(interactionNpcRayPoint);
  if (alongRay > (it.radius || 2.6) + .65) return false;
  return distanceSq <= .50 * .50;
}




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
  if (it.kind === 'npc') return npcIsUnderCrosshair(it);
  const target = it.source || it.rakeSource || null;
  if (!target || !target.visible) {
    const aimObj = it.obj || null;
    if (!aimObj) return false;
    camera.getWorldPosition(interactionCamPos);
    camera.getWorldDirection(interactionCamDir).normalize();
    if (it.bounds) it.bounds.getCenter(interactionAimPoint);
    else aimObj.getWorldPosition(interactionAimPoint);
    interactionAimVec.copy(interactionAimPoint).sub(interactionCamPos);
    const dist = interactionAimVec.length();
    if (dist > (it.radius || 2.6) + .45 || dist < .01) return false;
    interactionAimVec.multiplyScalar(1 / dist);
    return interactionCamDir.dot(interactionAimVec) >= (it.kind === 'npc' ? 0.965 : 0.955);
  }




  interactionRaycaster.setFromCamera(interactionNDC, camera);
  interactionRaycaster.near = 0;
  interactionRaycaster.far = Math.max(0.5, (it.radius || 2.0) + .55);




  // Thin props (especially the rake handle/head) can be one-sided. A raycast from
  // the back then returns no triangle hit even though the crosshair is visually on
  // the object. First test a very slightly padded *actual world bbox*; this still
  // requires looking directly at the object, but is robust from either side.
  if (it.bounds) {
    const pad = it.kind === 'rakePickup' ? 0.22 : 0.07;
    interactionAimBox.copy(it.bounds).expandByScalar(pad);
    if (interactionRaycaster.ray.intersectBox(interactionAimBox, interactionHitPoint)) {
      camera.getWorldPosition(interactionCamPos);
      if (interactionCamPos.distanceTo(interactionHitPoint) <= interactionRaycaster.far) return true;
    }
    if (it.kind === 'rakePickup' && rakePickupAimOK(it)) return true;
  }




  // Mobile FINAL releases CPU vertex arrays after their first GPU upload. All
  // physical pickups already have accurate cached world bounds, so a second
  // triangle-level raycast is both redundant and incompatible with that release.
  if (TOUCH_DEVICE) return false;




  const hits = interactionRaycaster.intersectObject(target, true);
  if (hits.some(hit => hit.distance <= interactionRaycaster.far)) return true;
  return it.kind === 'rakePickup' ? rakePickupAimOK(it) : false;
}




function nearestInteractive() {
  let best = null, bd = Infinity;
  const pp = interactionPlayerPoint.set(
    playerPos.x,
    groundHeightAt(playerPos.x, playerPos.z) + 1.0,
    playerPos.z
  );
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
      d = worldPos(it.obj, interactionWorldPos).distanceTo(pp);
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
  recordCareerStat('cigarettesSmoked');
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
  recordCareerStat('energyDrunk');
  saveEconomy();
  specialMode = 'drink';
  specialTimer = startProceduralSpecial('drink');
  energyVM.visible = !!energyProp;
  playCanDrinkAudio();
  energyBoost = 100;
  showToast('Перемотка: спринт усилен.');
}
function drinkBeer() {
  if (!started || specialMode) return;
  if (beerCans <= 0) { showToast('Пиво закончилось.'); return; }
  if (!armsReady) { showToast('FPS-руки ещё загружаются…'); return; }
  beerCans--;
  recordCareerStat('beerDrunk');
  saveEconomy();
  specialMode = 'beer';
  specialTimer = startProceduralSpecial('beer');
  beerVM.visible = !!beerProp;
  playCanDrinkAudio();
  showToast('Балтика 9.');
}
function finishSpecial() {
  stopDrinkAudio();
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
  if (armsMixer) armsMixer.update(dt);




  if (armsReady && !armsRig.visible && !settlementCutsceneActive) {
    armsRig.visible = true;
  }
  if (!specialMode && armsReady) {
    setPlayerLocomotion(playerMovingNow, playerSprintingNow);
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
    // Pinch the cigarette between index and middle fingers.  Its orientation
    // still follows the palm, so finger animation cannot roll it sideways.
    followGripBetweenBones(
      cigaretteVM,
      rightIndexBone || rightHandBone,
      rightMiddleBone || rightIndexBone || rightHandBone,
      propConfigs.cigarette.pos,
      propConfigs.cigarette.quat,
      rightHandBone || rightIndexBone,
    );
    if (lighterProp && lighterVM.visible) {
      followBoneWithProp(lighterVM, leftHandBone, propConfigs.lighter.pos, propConfigs.lighter.quat);
    }
  } else if (specialMode === 'drink' && energyProp) {
    // Wrist-to-knuckle midpoint is the centre of the palm.  The previous
    // 11 cm offset placed the can beside the hand instead of inside the grip.
    followGripBetweenBones(
      energyVM,
      leftHandBone,
      leftMiddleBone || leftIndexBone || leftHandBone,
      propConfigs.energy.pos,
      propConfigs.energy.quat,
      leftHandBone,
    );
  } else if (specialMode === 'beer' && beerProp) {
    followGripBetweenBones(
      beerVM,
      leftHandBone,
      leftMiddleBone || leftIndexBone || leftHandBone,
      propConfigs.beer.pos,
      propConfigs.beer.quat,
      leftHandBone,
    );
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
    if (hoseRecoveryNeeded && !hoseHeld) {
      if (!hoseControlActive) startHoseControlQTE();
      return;
    }
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
      if (!hoseHeldAtLeastOnce) {
        hoseHeldAtLeastOnce = true;
        localStorage.setItem(HOSE_FIRST_PICKUP_KEY, '1');
        hoseOutline.visible = false;
      }
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
let mobileLowFpsWindows=0, mobileDprDropCount=0;
let mobileUiAccumulator=0, mobileRenderAccumulator=0;
const MOBILE_RENDER_INTERVAL = 1 / 45;
function updateMobileRenderBudget(dt){
  if(!TOUCH_DEVICE)return;
  mobilePerfTimer+=dt; mobileFpsFrames++; mobileFpsAccum+=dt;
  if(mobilePerfTimer<8)return;
  const fps=mobileFpsFrames/Math.max(.001,mobileFpsAccum);
  if(fps<35) mobileLowFpsWindows=2;
  else if(fps<41) mobileLowFpsWindows++;
  else mobileLowFpsWindows=0;




  // At most three lifetime downshifts, never an upshift. This removes the old
  // DPR oscillation/reallocation loop while retaining a safety valve for weak GPUs.
  if(mobileLowFpsWindows>=2 && mobileDprDropCount<3 && mobileRenderScale>MOBILE_DPR_MIN+.001){
    mobileRenderScale=Math.max(MOBILE_DPR_MIN,mobileRenderScale-.08);
    mobileDprDropCount++;
    mobileLowFpsWindows=0;
    applyMainRendererSize(innerWidth,innerHeight,true);
    mobileDebugLog(`DPR downshift ${mobileRenderScale.toFixed(2)} at ${fps.toFixed(0)} fps`);
  }
  mobilePerfTimer=0; mobileFpsFrames=0; mobileFpsAccum=0;
}
function loop() {
  const dt = Math.min(clock.getDelta(), .05);
  // The menu is a static image. Do not burn CPU/GPU or run gameplay systems while
  // the scene is downloading or while the player is still on the PLAY screen.
  if (!started) {
    requestAnimationFrame(loop);
    return;
  }
  updateMobileRenderBudget(dt);
  updateCareerStatsPersistence(dt);
  updatePourProgressPersistence(dt);
  mobileUiAccumulator += dt;
  const updateUiNow = !TOUCH_DEVICE || mobileUiAccumulator >= .10;
  if (updateUiNow) mobileUiAccumulator = 0;




  let renderThisFrame = true;
  if (TOUCH_DEVICE) {
    mobileRenderAccumulator = Math.min(
      MOBILE_RENDER_INTERVAL * 2,
      mobileRenderAccumulator + dt
    );
    renderThisFrame = mobileRenderAccumulator >= MOBILE_RENDER_INTERVAL;
    if (renderThisFrame) mobileRenderAccumulator -= MOBILE_RENDER_INTERVAL;
  }
  for (const mixer of npcMixers) mixer.update(dt);
  lockBabaToGround();
  updateBabaProceduralIdle(dt);
  updateConstructionMachines(dt);




  if (started) {
    const inputBlocked = shopOpen || resultOpen || dialogueOpen || statsOpen;
    const kbForward = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
    const kbStrafe = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    const forwardInput = inputBlocked ? 0 : THREE.MathUtils.clamp(kbForward - mobileMoveY, -1, 1);
    const strafeInput = inputBlocked ? 0 : THREE.MathUtils.clamp(kbStrafe + mobileMoveX, -1, 1);




    // Direct yaw-based vectors. This does not depend on camera interpolation and cannot flip
    // direction as the previous third-person implementation did.
    const moveYaw = yaw;
    moveForward.set(-Math.sin(moveYaw), 0, -Math.cos(moveYaw));
    moveRight.set(Math.cos(moveYaw), 0, -Math.sin(moveYaw));
    moveWorld.set(0, 0, 0)
      .addScaledVector(moveForward, forwardInput)
      .addScaledVector(moveRight, strafeInput);
    if (moveWorld.lengthSq() > 1) moveWorld.normalize();




    const moving = moveWorld.lengthSq() > .0001;
    const sprint = !inputBlocked && (!!(keys.ShiftLeft || keys.ShiftRight) || (TOUCH_DEVICE && mobileSprintIntent));
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
      const bobSpeed = (sprint ? 12.5 : 9.0) * Math.max(.55, concreteSlow);
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
    updateFirstPersonProps(dt);
    updateCigaretteSmoke(dt);
    updateRake(dt);
    updatePourAudio();
    updateMachineAudio();
    updatePhysicalHose(dt);
    updateActivePourOutline(dt);




    if (!layoutRoot || !layoutRoot.parent) {
      sceneMissingTimer += dt;
      if (sceneMissingTimer > .45) recoverBrokenScene('layout root disappeared');
    } else {
      sceneMissingTimer = 0;
    }
    const it = nearestInteractive();
    // Beginner guide: the hose glows continuously until the first successful
    // pickup. Once collected, it never glows again — including after drops/QTE.
    hoseOutline.visible = !hoseHeldAtLeastOnce && !hoseHeld && hoseGroup.visible;
    if (hoseOutline.visible) {
      const pulse = .5 + .5 * Math.sin(performance.now() * .006);
      hoseOutlineMat.uniforms.uOpacity.value = .72 + pulse * .24;
      hoseOutlineMat.uniforms.uExpand.value = .024 + pulse * .010;
    }
    if (updateUiNow) {
      promptEl.textContent = it ? it.text : '';
      updateMobileContextButtons(it);
      zoneLabel.textContent = currentZone();
    }
  } else {
    syncCameraToPlayer();
    syncPlayerBodyToWorld();
    updateCigaretteSmoke(dt);
    stopPourAudio();
    hoseOutline.visible = false;
    if (updateUiNow) updateMobileContextButtons(null);
  }




  // Gameplay systems use the normal FPS transform above. Only the final shot
  // is replaced, so the hose, player collision and world state stay stable.
  updateSettlementCamera(dt);




  if (!TOUCH_DEVICE) renderHotbar3DPreviews(dt);




  if (updateUiNow) {
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
    syncMobileHud();
    hotbarRakeSlotEl.classList.toggle('active', rakeEquipped);
    hotbarSmokeSlotEl.classList.toggle('empty', cigarettes <= 0);
    hotbarDrinkSlotEl.classList.toggle('empty', energyCans <= 0);
    hotbarBeerSlotEl.classList.toggle('empty', beerCans <= 0);
    hotbarRakeSlotEl.classList.toggle('locked', !rakeOwned);
    rakeHotbarStateEl.textContent = !rakeOwned ? '—' : (rakeEquipped ? '●' : '✓');
    updateEconomyUI();
    updatePourHUD();
    updateTaskTracker();
  }
  if (toastTimer > 0) {
    toastTimer -= dt;
    if (toastTimer <= 0) toastEl.classList.remove('show'); if (mobileToastEl) mobileToastEl.classList.remove('show');
  }
  if (!TOUCH_DEVICE && minimap.style.display !== 'none') drawMap();
  if (!TOUCH_DEVICE || renderer.shadowMap.enabled) updateSunShadowFollow();
  if (TOUCH_DEVICE && renderer.shadowMap.enabled) {
    // Only touch the shadow atlas when mobile shadows are actually enabled.
    mobileFrameCounter++;
    renderer.shadowMap.autoUpdate = false;
    const shadowStride = playerMovingNow ? 3 : 10;
    renderer.shadowMap.needsUpdate = (mobileFrameCounter % shadowStride) === 0;
  }
  if (TOUCH_DEVICE && renderThisFrame) {
    camera.layers.set(0);
    renderer.render(scene, camera);
  } else if (!TOUCH_DEVICE) {
    camera.layers.set(0);
    renderPass.camera = camera;
    composer?.render(dt);
  }




  // Dedicated FPS rake pass.
  // World depth is cleared so the tool always stays visible, but the rake has
  // its own depthTest/depthWrite, so its rear faces can no longer overdraw its
  // front faces and fake transparency.
  if (renderThisFrame && !settlementCutsceneActive && rakeEquipped && !rakeHiddenBySpecial && rakeVM.visible) {
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




  if (shopOpen && renderThisFrame) {
    shopPreviewSpin += dt * .78;
    shopPreviewRoot.rotation.y = shopPreviewSpin;
    ensureShopPreviewRenderer().render(shopPreviewScene, shopPreviewCamera);
  }
  requestAnimationFrame(loop);
}
loop();
// v51.127 event result row — scoped observer only.
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
  const el = row.querySelector('b');
  if (el) { el.textContent = value; el.dataset.state = value; }
}
const settlementStatsNode = document.querySelector('#settlementStatsCard');
if (settlementStatsNode) {
  new MutationObserver(syncEventSettlementStat).observe(settlementStatsNode, { attributes:true, attributeFilter:['class','data-grade'] });
}
syncEventSettlementStat();

