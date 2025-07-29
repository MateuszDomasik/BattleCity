export function renderUI(state) {
  const ui = document.getElementById('ui');
  if (!ui) return;
  // Health bar (green rectangle with white border, classic style)
  const healthPercent = state.player.health / state.player.maxHealth;
  const barWidth = 200;
  const barHeight = 20;
  const healthBar = `
    <div style="display:flex;flex-direction:column;align-items:center;width:${barWidth}px;">
      <div style="position:relative;width:${barWidth}px;height:${barHeight}px;background:#222;border:2px solid white;border-radius:8px;overflow:hidden;">
        <div style="position:absolute;left:0;top:0;height:100%;width:${Math.max(0, healthPercent * 100)}%;background:linear-gradient(90deg,#00ff00 60%,#66ff66 100%);transition:width 0.2s;"></div>
        <div style="position:absolute;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;text-shadow:1px 1px 2px #000;">${state.player.health} / ${state.player.maxHealth}</div>
      </div>
    </div>
  `;
  // Bullets and wood
  const stats = `
    <div style='color:white;'>Bullets: ${state.player.bullets}</div>
    <div style='color:saddlebrown;'>Wood: ${state.player.wood}</div>
  `;
  ui.innerHTML = healthBar + stats;
  // Backpack
  const backpackDiv = document.getElementById('backpack');
  if (!backpackDiv) return;
  backpackDiv.innerHTML = '';
  for (let i = 0; i < state.backpack.length; i++) {
    const slot = document.createElement('div');
    slot.style.width = '48px';
    slot.style.height = '48px';
    slot.style.border = '2px solid #aaa';
    slot.style.background = '#222';
    slot.style.borderRadius = '8px';
    slot.style.display = 'flex';
    slot.style.justifyContent = 'center';
    slot.style.alignItems = 'center';
    slot.style.fontSize = '24px';
    slot.style.color = '#888';
    if (state.gameMode === 'placingBlock' && state.placingBlockIndex === i) {
      slot.style.outline = '2px solid yellow';
    }
    slot.innerText = state.backpack[i] ? state.backpack[i] : '';
    if (state.backpack[i]) {
      slot.style.cursor = 'pointer';
      slot.onclick = function() {
        state.gameMode = 'placingBlock';
        state.placingBlockIndex = i;
        // Re-render to highlight
        renderUI(state);
      };
    }
    backpackDiv.appendChild(slot);
  }
} 