// BETONSHCHIK emergency main.js hotfix v51.161
// This small replacement loads the last full known source from the pinned GitHub commit,
// patches the broken frame loop in memory, then starts the game.
// Rename this file from main.js.txt -> main.js before uploading.

(async () => {
  const PINNED_SOURCE =
    'https://raw.githubusercontent.com/alexunderpetlya-del/betonshik/579faa33ca44ec23412cd1377592c6978ade1e4c/main.js';

  const loadState = document.querySelector('#loadState');

  function bootFail(message) {
    const text = String(message || 'unknown hotfix error');
    console.error('[BETON HOTFIX v51.161]', text);
    if (loadState) {
      loadState.textContent = 'ОШИБКА HOTFIX: ' + text;
      loadState.style.color = '#ff7777';
      loadState.style.whiteSpace = 'pre-wrap';
      loadState.style.maxWidth = '900px';
    }
    document.querySelector('#menuLoadingSpinner')?.classList.add('isError');
  }

  try {
    const res = await fetch(PINNED_SOURCE, { cache: 'no-store', mode: 'cors' });
    if (!res.ok) throw new Error(`source HTTP ${res.status}`);

    let src = await res.text();

    const once = (oldText, newText, label) => {
      if (!src.includes(oldText)) {
        throw new Error(`patch marker not found: ${label}`);
      }
      src = src.replace(oldText, newText);
    };

    const last = (oldText, newText, label) => {
      const i = src.lastIndexOf(oldText);
      if (i < 0) throw new Error(`patch marker not found: ${label}`);
      src = src.slice(0, i) + newText + src.slice(i + oldText.length);
    };

    const helper = `
function safeFrameStep(label, fn) {
  try { return fn(); }
  catch (err) {
    console.error(\`[FRAME:\${label}] recovered\`, err);
    try {
      mobileDebugLog(
        \`FRAME \${label} ERROR \${err?.name || 'Error'}: \${err?.message || err}\`
      );
    } catch (_) {}
    return null;
  }
}
`;

    // CRITICAL FIX:
    // request the NEXT frame before doing gameplay work.
    // Previously requestAnimationFrame(loop) was only at the very end,
    // so one exception froze movement/camera/render forever while DOM controls still reacted.
    once(
      `function loop() {
  const dt = Math.min(clock.getDelta(), .05);`,
      helper + `function loop() {
  requestAnimationFrame(loop);
  try {
  const dt = Math.min(clock.getDelta(), .05);`,
      'loop entry'
    );

    // Do not schedule a second frame from the menu branch.
    once(
      `  if (!started) {
    requestAnimationFrame(loop);
    return;
  }`,
      `  if (!started) return;`,
      'menu RAF'
    );

    // Protect systems that run BEFORE player movement.
    // A broken decorative/NPC/persistence system must never stop joystick movement.
    const guards = [
      [
        `  updateMobileRenderBudget(dt);`,
        `  safeFrameStep('mobile-budget', () => updateMobileRenderBudget(dt));`
      ],
      [
        `  updateCareerStatsPersistence(dt);`,
        `  safeFrameStep('career-save', () => updateCareerStatsPersistence(dt));`
      ],
      [
        `  updatePourProgressPersistence(dt);`,
        `  safeFrameStep('pour-save', () => updatePourProgressPersistence(dt));`
      ],
      [
        `  updatePendingZoneCures();`,
        `  safeFrameStep('zone-cure', () => updatePendingZoneCures());`
      ],
      [
        `  for (const mixer of npcMixers) mixer.update(dt);`,
        `  safeFrameStep('npc-mixers', () => {
    for (const mixer of npcMixers) mixer.update(dt);
  });`
      ],
      [
        `  lockBabaToGround();`,
        `  safeFrameStep('baba-ground', () => lockBabaToGround());`
      ],
      [
        `  updateBabaProceduralIdle(dt);`,
        `  safeFrameStep('baba-idle', () => updateBabaProceduralIdle(dt));`
      ],
      [
        `  updateConstructionMachines(dt);`,
        `  safeFrameStep('machines', () => updateConstructionMachines(dt));`
      ],

      // Systems changed around the delivery-route update.
      [
        `    updateActivePourOutline(dt);`,
        `    safeFrameStep('pour-outline', () => updateActivePourOutline(dt));`
      ],
      [
        `    updateMultiplayer(dt);`,
        `    safeFrameStep('multiplayer', () => updateMultiplayer(dt));`
      ],
      [
        `    const it = nearestInteractive();`,
        `    const it = safeFrameStep('interactive', () => nearestInteractive());`
      ],
      [
        `  updateSettlementCamera(dt);`,
        `  safeFrameStep('settlement-camera', () => updateSettlementCamera(dt));`
      ],
      [
        `  if (!TOUCH_DEVICE) renderHotbar3DPreviews(dt);`,
        `  if (!TOUCH_DEVICE) {
    safeFrameStep('hotbar-preview', () => renderHotbar3DPreviews(dt));
  }`
      ],
      [
        `  if (!TOUCH_DEVICE || renderer.shadowMap.enabled) updateSunShadowFollow();`,
        `  if (!TOUCH_DEVICE || renderer.shadowMap.enabled) {
    safeFrameStep('sun-shadow', () => updateSunShadowFollow());
  }`
      ],
    ];

    for (const [oldText, newText] of guards) {
      if (src.includes(oldText)) src = src.replace(oldText, newText);
    }

    // The new delivery route is called from updateDeliveryHud() and updateTaskTracker().
    // Protect the WHOLE UI update block so route/HUD failures cannot stop rendering.
    once(
      `  if (updateUiNow) {
    staminaBar.style.width`,
      `  if (updateUiNow) safeFrameStep('hud', () => {
    staminaBar.style.width`,
      'HUD open'
    );

    once(
      `    updateTaskTracker();
  }
  if (toastTimer > 0) {`,
      `    updateTaskTracker();
  });
  if (toastTimer > 0) {`,
      'HUD close'
    );

    // Remove the old end-of-loop RAF and close the root frame guard.
    // If an unknown subsystem still fails, next frame is already queued.
    // We also attempt a minimal render so camera/player movement remains visible.
    last(
      `
  requestAnimationFrame(loop);
}
loop();`,
      `
  } catch (err) {
    console.error('[FRAME ROOT] recovered', err);
    try {
      mobileDebugLog(
        \`FRAME ROOT ERROR \${err?.name || 'Error'}: \${err?.message || err}\`
      );
    } catch (_) {}

    try {
      syncCameraToPlayer();
      syncPlayerBodyToWorld();
      camera.layers.set(0);
      renderer.render(scene, camera);
    } catch (_) {}
  }
}
loop();`,
      'loop tail'
    );

    src += '\n//# sourceURL=betonshik-main-v51.161-patched.js\n';

    const blob = new Blob([src], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);

    try {
      await import(url);
      console.info('[BETON HOTFIX v51.161] ACTIVE');
    } finally {
      // Give Safari enough time to finish resolving the module graph.
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    }
  } catch (err) {
    bootFail(err?.stack || err?.message || err);
    throw err;
  }
})();
