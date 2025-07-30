import { state, updateState } from './state.js';
import { renderGame } from './render.js';
import { renderUI, initializeUI } from './ui.js';
import { setupInputHandlers } from './input.js';
import { DestructibleBlock } from './blocks/DestructibleBlock.js';
import { IndestructibleBlock } from './blocks/IndestructibleBlock.js';
import { TreeBlock } from './blocks/TreeBlock.js';
import { SteelBlock } from './blocks/SteelBlock.js';
import { StoneBlock } from './blocks/StoneBlock.js';
import { WaterBlock } from './blocks/WaterBlock.js';
import { BulletBlock } from './blocks/BulletBlock.js';
import { ShootingTower } from './blocks/ShootingTower.js';

let animationId = null;

// Load custom level data
function loadCustomLevel() {
    const customLevelData = localStorage.getItem('battlecity-current-custom-level');
    if (customLevelData) {
        try {
            const levelData = JSON.parse(customLevelData);
            return levelData;
        } catch (error) {
            console.error('Error loading custom level:', error);
            return null;
        }
    }
    return null;
}

// Create blocks from custom level data
function createBlocksFromData(levelData) {
    const blocks = [];
    
    if (levelData && levelData.blocks) {
        levelData.blocks.forEach(blockData => {
            let block = null;
            
            switch (blockData.type) {
                case 'DestructibleBlock':
                    block = new DestructibleBlock(blockData.x, blockData.y);
                    break;
                case 'IndestructibleBlock':
                    block = new IndestructibleBlock(blockData.x, blockData.y);
                    break;
                case 'TreeBlock':
                    block = new TreeBlock(blockData.x, blockData.y);
                    break;
                case 'SteelBlock':
                    block = new SteelBlock(blockData.x, blockData.y);
                    break;
                case 'StoneBlock':
                    block = new StoneBlock(blockData.x, blockData.y);
                    break;
                case 'WaterBlock':
                    block = new WaterBlock(blockData.x, blockData.y);
                    break;
                case 'BulletBlock':
                    block = new BulletBlock(blockData.x, blockData.y);
                    break;
                case 'ShootingTower':
                    block = new ShootingTower(blockData.x, blockData.y);
                    break;
            }
            
            if (block) {
                blocks.push(block);
            }
        });
    }
    
    return blocks;
}

// Initialize custom level game
function initializeCustomLevelGame() {
    const customLevelData = loadCustomLevel();
    
    if (!customLevelData) {
        alert('No custom level data found. Redirecting to menu.');
        window.location.href = '../menu.html';
        return;
    }
    
    // Create blocks from custom level data
    const customBlocks = createBlocksFromData(customLevelData);
    
    // Update state with custom blocks
    state.blocks = customBlocks;
    
    // Clear any existing custom level data to prevent conflicts
    localStorage.removeItem('battlecity-current-custom-level');
    
    console.log(`Loaded custom level with ${customBlocks.length} blocks`);
}

export function startCustomLevelGameLoop() {
    function loop() {
        updateState(state);
        renderGame(state);
        renderUI(state);
        animationId = requestAnimationFrame(loop);
    }
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(loop);
}

// Initialize the custom level game
initializeCustomLevelGame();
setupInputHandlers();
initializeUI();
startCustomLevelGameLoop(); 