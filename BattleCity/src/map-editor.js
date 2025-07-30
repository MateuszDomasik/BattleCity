import { DestructibleBlock } from './blocks/DestructibleBlock.js';
import { IndestructibleBlock } from './blocks/IndestructibleBlock.js';
import { TreeBlock } from './blocks/TreeBlock.js';
import { SteelBlock } from './blocks/SteelBlock.js';
import { StoneBlock } from './blocks/StoneBlock.js';
import { WaterBlock } from './blocks/WaterBlock.js';
import { BulletBlock } from './blocks/BulletBlock.js';
import { ShootingTower } from './blocks/ShootingTower.js';

class MapEditor {
    constructor() {
        this.canvas = document.getElementById('editorCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.blocks = [];
        this.selectedBlockType = null;
        this.gridSize = 48;
        this.cols = 30;
        this.rows = 15;
        
        this.initializeUI();
        this.setupEventListeners();
        this.render();
    }

    initializeUI() {
        // Setup palette selection
        const paletteItems = document.querySelectorAll('.palette-item');
        paletteItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove previous selection
                paletteItems.forEach(i => i.classList.remove('selected'));
                // Add selection to clicked item
                item.classList.add('selected');
                
                const blockType = item.dataset.block;
                this.selectedBlockType = blockType;
                
                // Update selected block display
                const selectedBlockSpan = document.getElementById('selectedBlock');
                if (blockType === 'eraser') {
                    selectedBlockSpan.textContent = 'Eraser';
                } else {
                    selectedBlockSpan.textContent = blockType;
                }
            });
        });

        // Setup control buttons
        document.getElementById('saveButton').addEventListener('click', () => this.saveToLocalStorage());
        document.getElementById('downloadButton').addEventListener('click', () => this.saveMap());
        document.getElementById('loadButton').addEventListener('click', () => this.loadMap());
        document.getElementById('clearButton').addEventListener('click', () => this.clearMap());
        document.getElementById('menuButton').addEventListener('click', () => {
            window.location.href = '../menu.html';
        });
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    handleCanvasClick(e) {
        if (!this.selectedBlockType) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert to grid coordinates
        const gridX = Math.floor(x / this.gridSize) * this.gridSize;
        const gridY = Math.floor(y / this.gridSize) * this.gridSize;

        // Ensure coordinates are within bounds
        if (gridX < 0 || gridX >= this.cols * this.gridSize || 
            gridY < 0 || gridY >= this.rows * this.gridSize) {
            return;
        }

        if (this.selectedBlockType === 'eraser') {
            // Remove block at this position
            this.blocks = this.blocks.filter(block => 
                !(block.x === gridX && block.y === gridY)
            );
        } else {
            // Remove existing block at this position
            this.blocks = this.blocks.filter(block => 
                !(block.x === gridX && block.y === gridY)
            );

            // Add new block
            const newBlock = this.createBlock(this.selectedBlockType, gridX, gridY);
            if (newBlock) {
                this.blocks.push(newBlock);
            }
        }

        this.render();
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert to grid coordinates
        const gridX = Math.floor(x / this.gridSize) * this.gridSize;
        const gridY = Math.floor(y / this.gridSize) * this.gridSize;

        // Update cursor style based on whether position is valid
        if (gridX >= 0 && gridX < this.cols * this.gridSize && 
            gridY >= 0 && gridY < this.rows * this.gridSize) {
            this.canvas.style.cursor = 'pointer';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }

    createBlock(blockType, x, y) {
        switch (blockType) {
            case 'DestructibleBlock':
                return new DestructibleBlock(x, y);
            case 'IndestructibleBlock':
                return new IndestructibleBlock(x, y);
            case 'TreeBlock':
                return new TreeBlock(x, y);
            case 'SteelBlock':
                return new SteelBlock(x, y);
            case 'StoneBlock':
                return new StoneBlock(x, y);
            case 'WaterBlock':
                return new WaterBlock(x, y);
            case 'BulletBlock':
                return new BulletBlock(x, y);
            case 'ShootingTower':
                return new ShootingTower(x, y);
            default:
                return null;
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Draw blocks
        this.blocks.forEach(block => {
            if (block.render) {
                block.render(this.ctx);
            } else if (block.draw) {
                block.draw(this.ctx);
            }
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= this.cols * this.gridSize; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.rows * this.gridSize);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= this.rows * this.gridSize; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.cols * this.gridSize, y);
            this.ctx.stroke();
        }
    }

    saveToLocalStorage() {
        const mapName = prompt('Enter a name for your map:');
        if (!mapName || mapName.trim() === '') {
            alert('Please enter a valid map name');
            return;
        }

        const mapData = {
            name: mapName.trim(),
            blocks: this.blocks.map(block => ({
                type: block.constructor.name,
                x: block.x,
                y: block.y
            })),
            createdAt: new Date().toISOString()
        };

        // Get existing maps from localStorage
        const existingMaps = JSON.parse(localStorage.getItem('battlecity_maps') || '[]');
        
        // Check if map with this name already exists
        const existingIndex = existingMaps.findIndex(map => map.name === mapName.trim());
        if (existingIndex !== -1) {
            if (!confirm(`A map named "${mapName}" already exists. Do you want to overwrite it?`)) {
                return;
            }
            existingMaps[existingIndex] = mapData;
        } else {
            existingMaps.push(mapData);
        }

        // Save to localStorage
        localStorage.setItem('battlecity_maps', JSON.stringify(existingMaps));
        alert(`Map "${mapName}" saved successfully!`);
    }

    saveMap() {
        const mapData = {
            blocks: this.blocks.map(block => ({
                type: block.constructor.name,
                x: block.x,
                y: block.y
            }))
        };

        const dataStr = JSON.stringify(mapData);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'battlecity-map.json';
        link.click();
    }

    loadMap() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const mapData = JSON.parse(e.target.result);
                        this.loadMapData(mapData);
                    } catch (error) {
                        alert('Error loading map file');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    loadMapData(mapData) {
        this.blocks = [];
        
        mapData.blocks.forEach(blockData => {
            const block = this.createBlock(blockData.type, blockData.x, blockData.y);
            if (block) {
                this.blocks.push(block);
            }
        });
        
        this.render();
    }

    clearMap() {
        if (confirm('Are you sure you want to clear the entire map?')) {
            this.blocks = [];
            this.render();
        }
    }
}

// Initialize the map editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MapEditor();
}); 