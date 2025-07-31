import { state } from './state.js';
import { renderUI } from './ui.js';
import { setupInputHandlers } from './input.js';
import { startGameLoop } from './game.js';

window.addEventListener('DOMContentLoaded', function() {
  renderUI(state);
  setupInputHandlers();
  startGameLoop();
}); 