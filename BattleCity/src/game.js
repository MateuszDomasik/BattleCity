import { state, updateState } from './state.js';
import { renderGame } from './render.js';
import { renderUI } from './ui.js';

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

export function stopGameLoop() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
} 