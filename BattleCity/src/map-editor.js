import { DestructibleBlock } from './blocks/DestructibleBlock.js';
import { IndestructibleBlock } from './blocks/IndestructibleBlock.js';
import { TreeBlock } from './blocks/TreeBlock.js';
import { WoodBlock } from './blocks/WoodBlock.js';
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

class MapEditor {
    constructor() {
        this.canvas = document.getElementById('editorCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.blocks = [];
        this.selectedBlockType = null;
        this.gridSize = 48;
        this.cols = 30;
        this.rows = 15;
        this.currentEditingMap = null;
        this.currentMapCreatedAt = null;
        
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
                
                // Update editor info to show editing state
                this.updateEditorInfo();
            });
        });

        // Setup control buttons
        document.getElementById('saveButton').addEventListener('click', () => this.saveToLocalStorage());
        document.getElementById('downloadButton').addEventListener('click', () => this.saveMap());
        document.getElementById('loadFromLibraryButton').addEventListener('click', () => this.loadFromLibrary());
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
            case 'WoodBlock':
                return new WoodBlock(x, y);
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
            case 'FlowersBlock':
                return new FlowersBlock(x, y);
            case 'Grass1Block':
                return new Grass1Block(x, y);
            case 'Grass2Block':
                return new Grass2Block(x, y);
            case 'GravelBlock':
                return new GravelBlock(x, y);
            case 'GroundBlock':
                return new GroundBlock(x, y);
            case 'SandBlock':
                return new SandBlock(x, y);
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
        // Check if we're editing an existing map
        const currentMapName = this.currentEditingMap;
        
        let mapName;
        if (currentMapName) {
            // We're editing an existing map
            mapName = currentMapName;
        } else {
            // We're creating a new map
            mapName = prompt('Enter a name for your map:');
            if (!mapName || mapName.trim() === '') {
                alert('Please enter a valid map name');
                return;
            }
            mapName = mapName.trim();
        }

        const mapData = {
            name: mapName,
            blocks: this.blocks.map(block => ({
                type: block.constructor.name,
                x: block.x,
                y: block.y
            })),
            createdAt: currentMapName ? this.currentMapCreatedAt : new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        // Get existing maps from localStorage
        const existingMaps = JSON.parse(localStorage.getItem('battlecity_maps') || '[]');
        
        // Check if map with this name already exists (for new maps)
        if (!currentMapName) {
            const existingIndex = existingMaps.findIndex(map => map.name === mapName);
            if (existingIndex !== -1) {
                if (!confirm(`A map named "${mapName}" already exists. Do you want to overwrite it?`)) {
                    return;
                }
                existingMaps[existingIndex] = mapData;
            } else {
                existingMaps.push(mapData);
            }
        } else {
            // Update existing map
            const existingIndex = existingMaps.findIndex(map => map.name === currentMapName);
            if (existingIndex !== -1) {
                existingMaps[existingIndex] = mapData;
            } else {
                existingMaps.push(mapData);
            }
        }

        // Save to localStorage
        localStorage.setItem('battlecity_maps', JSON.stringify(existingMaps));
        
        if (currentMapName) {
            alert(`Map "${mapName}" updated successfully!`);
        } else {
            alert(`Map "${mapName}" saved successfully!`);
        }
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

    loadFromLibrary() {
        // Get saved maps from localStorage
        const savedMaps = JSON.parse(localStorage.getItem('battlecity_maps') || '[]');
        
        if (savedMaps.length === 0) {
            alert('No saved maps found in library. Create and save a map first.');
            return;
        }
        
        // Create a modal to select a map
        this.showMapSelectionModal(savedMaps);
    }

    showMapSelectionModal(maps) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #2c3e50;
            border: 2px solid #FFD700;
            border-radius: 10px;
            padding: 20px;
            max-width: 500px;
            max-height: 400px;
            overflow-y: auto;
            color: white;
        `;
        
        // Create title
        const title = document.createElement('h3');
        title.textContent = 'Select a Map to Edit';
        title.style.cssText = `
            color: #FFD700;
            margin-bottom: 20px;
            text-align: center;
        `;
        
        // Create map list
        const mapList = document.createElement('div');
        mapList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        
        maps.forEach((map, index) => {
            const mapItem = document.createElement('div');
            mapItem.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: rgba(52, 152, 219, 0.2);
                border: 1px solid #3498db;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            `;
            
            mapItem.onmouseenter = () => {
                mapItem.style.backgroundColor = 'rgba(52, 152, 219, 0.4)';
            };
            
            mapItem.onmouseleave = () => {
                mapItem.style.backgroundColor = 'rgba(52, 152, 219, 0.2)';
            };
            
            const mapInfo = document.createElement('div');
            mapInfo.innerHTML = `
                <div style="font-weight: bold; color: #FFD700;">${map.name}</div>
                <div style="font-size: 0.9em; color: #bdc3c7;">
                    Blocks: ${map.blocks ? map.blocks.length : 0} | 
                    Created: ${new Date(map.createdAt).toLocaleDateString()}
                </div>
            `;
            
            const loadButton = document.createElement('button');
            loadButton.textContent = 'Load';
            loadButton.style.cssText = `
                background: #27ae60;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            `;
            
            loadButton.onclick = (e) => {
                e.stopPropagation();
                this.loadMapFromLibrary(map);
                document.body.removeChild(modal);
            };
            
            mapItem.appendChild(mapInfo);
            mapItem.appendChild(loadButton);
            mapList.appendChild(mapItem);
        });
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cancel';
        closeButton.style.cssText = `
            background: #e74c3c;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 20px;
            width: 100%;
        `;
        
        closeButton.onclick = () => {
            document.body.removeChild(modal);
        };
        
        modalContent.appendChild(title);
        modalContent.appendChild(mapList);
        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }

    loadMapFromLibrary(mapData) {
        // Clear current map
        this.blocks = [];
        
        // Set editing state
        this.currentEditingMap = mapData.name;
        this.currentMapCreatedAt = mapData.createdAt;
        
        // Load blocks from the selected map
        if (mapData.blocks) {
            mapData.blocks.forEach(blockData => {
                const block = this.createBlock(blockData.type, blockData.x, blockData.y);
                if (block) {
                    this.blocks.push(block);
                }
            });
        }
        
        // Render the loaded map
        this.render();
        this.updateEditorInfo();
        
        // Show success message
        alert(`Map "${mapData.name}" loaded successfully! You can now edit it.`);
    }

    updateEditorInfo() {
        const editorInfo = document.querySelector('.editor-info');
        if (editorInfo) {
            const infoText = editorInfo.querySelector('p:last-child');
            if (infoText) {
                if (this.currentEditingMap) {
                    infoText.textContent = `Editing: ${this.currentEditingMap} | Click on the map to place blocks`;
                } else {
                    infoText.textContent = 'Click on the map to place blocks';
                }
            }
        }
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
            this.currentEditingMap = null;
            this.currentMapCreatedAt = null;
            this.render();
        }
    }
}

// Initialize the map editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MapEditor();
}); 