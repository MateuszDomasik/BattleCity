import { state } from './state.js';

export function setupInputHandlers() {
  window.addEventListener('keydown', (e) => {
    if ([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
    ].includes(e.key)) state.keysPressed[e.key] = true;
    if (e.code === 'Space') state.player.shoot = true;
  });
  window.addEventListener('keyup', (e) => {
    if ([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
    ].includes(e.key)) state.keysPressed[e.key] = false;
    if (e.code === 'Space') state.player.shoot = false;
  });

  // Mouse click for block placement
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.addEventListener('click', function(e) {
      if (state.gameMode === 'placingBlock' && state.placingBlockIndex !== null) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / state.player.size) * state.player.size;
        const y = Math.floor((e.clientY - rect.top) / state.player.size) * state.player.size;
        state._placeBlockPos = { x, y };
      }
    });
  }
} 