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
import { FlowersBlock } from './blocks/FlowersBlock.js';
import { Grass1Block } from './blocks/Grass1Block.js';
import { Grass2Block } from './blocks/Grass2Block.js';
import { GravelBlock } from './blocks/GravelBlock.js';
import { GroundBlock } from './blocks/GroundBlock.js';
import { SandBlock } from './blocks/SandBlock.js';

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

// Create blocks and towers from custom level data
function createBlocksAndTowersFromData(levelData) {
    const blocks = [];
    const towers = [];
    
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
                    towers.push(block); // Add to towers array instead
                    break;
                case 'FlowersBlock':
                    block = new FlowersBlock(blockData.x, blockData.y);
                    break;
                case 'Grass1Block':
                    block = new Grass1Block(blockData.x, blockData.y);
                    break;
                case 'Grass2Block':
                    block = new Grass2Block(blockData.x, blockData.y);
                    break;
                case 'GravelBlock':
                    block = new GravelBlock(blockData.x, blockData.y);
                    break;
                case 'GroundBlock':
                    block = new GroundBlock(blockData.x, blockData.y);
                    break;
                case 'SandBlock':
                    block = new SandBlock(blockData.x, blockData.y);
                    break;
            }
            
            if (block && blockData.type !== 'ShootingTower') {
                blocks.push(block);
            }
        });
    }
    
    return { blocks, towers };
}

// Initialize custom level game
function initializeCustomLevelGame() {
    const customLevelData = loadCustomLevel();
    
    if (!customLevelData) {
        alert('No custom level data found. Redirecting to menu.');
        window.location.href = '../menu.html';
        return;
    }
    
    // Create blocks and towers from custom level data
    const { blocks: customBlocks, towers: customTowers } = createBlocksAndTowersFromData(customLevelData);
    
    // Update state with custom blocks and towers
    state.blocks = customBlocks;
    state.shootingTowers = customTowers;
    
    // Clear any existing custom level data to prevent conflicts
    localStorage.removeItem('battlecity-current-custom-level');
    
    console.log(`Loaded custom level with ${customBlocks.length} blocks and ${customTowers.length} towers`);
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