import { state, updateState } from './state.js';
import { renderGame } from './render.js';
import { renderUI, initializeUI } from './ui.js';
import { setupInputHandlers } from './input.js';

let animationId = null;

export function startGameLoop() {
  function loop() {
    updateState(state);
    renderGame(state);
    renderUI(state);
    animationId = requestAnimationFrame(loop);
  }
  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(loop);
}

// Initialize the game
setupInputHandlers();
initializeUI();
startGameLoop(); 