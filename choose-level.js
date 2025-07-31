class LevelSelector {
    constructor() {
        this.customLevels = [];
        this.initializeEventListeners();
        this.loadCustomLevels();
    }

    initializeEventListeners() {
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            window.location.href = 'menu.html';
        });

        // Upload button
        document.getElementById('uploadButton').addEventListener('click', () => {
            this.uploadLevel();
        });

        // Refresh button
        document.getElementById('refreshButton').addEventListener('click', () => {
            this.loadCustomLevels();
        });

        // Default level play button
        document.querySelector('[data-level="default"] .play-button').addEventListener('click', () => {
            this.playLevel('default');
        });
    }

    uploadLevel() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const levelData = JSON.parse(e.target.result);
                        this.addCustomLevel(file.name, levelData);
                    } catch (error) {
                        alert('Error loading level file. Please make sure it\'s a valid BattleCity map file.');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    addCustomLevel(filename, levelData) {
        // Remove .json extension from filename
        const levelName = filename.replace('.json', '');
        
        const level = {
            name: levelName,
            description: `Custom level with ${levelData.blocks ? levelData.blocks.length : 0} blocks`,
            data: levelData,
            filename: filename
        };

        // Check if level already exists
        const existingIndex = this.customLevels.findIndex(l => l.name === levelName);
        if (existingIndex !== -1) {
            this.customLevels[existingIndex] = level;
        } else {
            this.customLevels.push(level);
        }

        // Save to localStorage
        this.saveCustomLevels();
        
        // Refresh display
        this.displayCustomLevels();
    }

    loadCustomLevels() {
        // Load custom levels from localStorage (new format from map editor)
        const savedMaps = JSON.parse(localStorage.getItem('battlecity_maps') || '[]');
        
        // Convert saved maps to the expected format
        this.customLevels = savedMaps.map(map => ({
            name: map.name,
            description: `Custom level with ${map.blocks ? map.blocks.length : 0} blocks`,
            data: { blocks: map.blocks },
            createdAt: map.createdAt
        }));
        
        this.displayCustomLevels();
    }

    saveCustomLevels() {
        localStorage.setItem('battlecity-custom-levels', JSON.stringify(this.customLevels));
    }

    displayCustomLevels() {
        const container = document.getElementById('customLevelsGrid');
        
        if (this.customLevels.length === 0) {
            container.innerHTML = `
                <div class="no-levels-message">
                    <p>No custom levels found</p>
                    <p>Create levels in the Map Editor and they will appear here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.customLevels.map((level, index) => `
            <div class="level-item" data-level="custom-${index}">
                <div class="level-preview">
                    <div class="level-name">${level.name}</div>
                    <div class="level-description">${level.description}</div>
                </div>
                <div class="level-actions">
                    <button class="play-button" onclick="levelSelector.playLevel('custom-${index}')">Play</button>
                    <button class="delete-button" onclick="levelSelector.deleteLevel(${index})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    deleteLevel(index) {
        if (confirm(`Are you sure you want to delete "${this.customLevels[index].name}"?`)) {
            // Remove from localStorage
            const savedMaps = JSON.parse(localStorage.getItem('battlecity_maps') || '[]');
            savedMaps.splice(index, 1);
            localStorage.setItem('battlecity_maps', JSON.stringify(savedMaps));
            
            // Update local array
            this.customLevels.splice(index, 1);
            this.displayCustomLevels();
        }
    }

    playLevel(levelId) {
        if (levelId === 'default') {
            // Play the default game
            window.location.href = 'index.html';
        } else if (levelId.startsWith('custom-')) {
            // Play custom level
            const index = parseInt(levelId.split('-')[1]);
            const level = this.customLevels[index];
            if (level) {
                // Store the custom level data in localStorage for the game to load
                localStorage.setItem('battlecity-current-custom-level', JSON.stringify(level.data));
                window.location.href = 'custom-level.html';
            }
        }
    }
}

// Initialize the level selector when the page loads
let levelSelector;
document.addEventListener('DOMContentLoaded', () => {
    levelSelector = new LevelSelector();
}); 