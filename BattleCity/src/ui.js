export function renderUI(state) {
  const ui = document.getElementById('ui');
  if (!ui) return;
  // Health, bullets, wood
  ui.innerHTML = `
    <div style='color:white;'>Health: ${state.player.health} / ${state.player.maxHealth}</div>
    <div style='color:white;'>Bullets: ${state.player.bullets}</div>
    <div style='color:saddlebrown;'>Wood: ${state.player.wood}</div>
  `;
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