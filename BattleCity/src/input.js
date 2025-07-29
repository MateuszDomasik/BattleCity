import { state } from './state.js';

export function setupInputHandlers() {
  window.addEventListener('keydown', (e) => {
    // Only handle input in play mode
    if (state.gameMode !== 'play') return;
    
    if ([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
    ].includes(e.key)) state.keysPressed[e.key] = true;
    if (e.code === 'Space') state.player.shoot = true;
  });
  
  window.addEventListener('keyup', (e) => {
    // Only handle input in play mode
    if (state.gameMode !== 'play') return;
    
    if ([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
    ].includes(e.key)) state.keysPressed[e.key] = false;
    if (e.code === 'Space') state.player.shoot = false;
  });
} 