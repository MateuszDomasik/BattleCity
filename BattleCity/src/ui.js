import { state } from './state.js';
import { LightBrownBlock } from './blocks/LightBrownBlock.js';
import { ShootingTower } from './blocks/ShootingTower.js';

export function renderUI(state) {
  // Update health bar
  const healthBar = document.querySelector('.health-fill');
  const healthText = document.querySelector('.health-text');
  if (healthBar && healthText) {
    const healthPercent = (state.player.health / state.player.maxHealth) * 100;
    healthBar.style.width = healthPercent + '%';
    healthText.textContent = `${state.player.health}/${state.player.maxHealth}`;
  }

  // Update bullet counter
  const bulletCount = document.getElementById('bulletCount');
  if (bulletCount) {
    bulletCount.textContent = state.player.bullets;
  }

  // Update wood counter
  const woodCount = document.getElementById('woodCount');
  if (woodCount) {
    woodCount.textContent = state.player.wood;
  }

  // Update steel counter
  const steelCount = document.getElementById('steelCount');
  if (steelCount) {
    steelCount.textContent = state.player.steel;
  }

  // Update stones counter
  const stonesCount = document.getElementById('stonesCount');
  if (stonesCount) {
    stonesCount.textContent = state.player.stones;
  }

  // Update gold counter
  const goldCount = document.getElementById('goldCount');
  if (goldCount) {
    goldCount.textContent = state.player.gold;
  }

  // Show edit mode indicator
  const shopButton = document.getElementById('shopButton');
  if (shopButton) {
    if (state.gameMode === 'edit') {
      shopButton.textContent = 'Edit Mode - Click map to place block';
      shopButton.style.backgroundColor = '#e74c3c';
    } else {
      shopButton.textContent = 'Shop';
      shopButton.style.backgroundColor = '#3498db';
    }
  }

  // Render backpack
  renderBackpack();
}

function renderBackpack() {
  const backpack = document.getElementById('backpack');
  if (!backpack) return;

  const slots = backpack.querySelectorAll('.slot');
  slots.forEach((slot, index) => {
    // Clear the slot completely
    slot.innerHTML = '';
    slot.className = 'slot';
    slot.style.backgroundColor = ''; // Reset background color
    slot.title = ''; // Reset title
    
    const item = state.backpack[index];
    if (item) {
      slot.style.backgroundColor = item.color;
      slot.title = item.name || 'Block';
    }
  });
}

// Shop functionality
export function setupShopHandlers() {
  const shopButton = document.getElementById('shopButton');
  const shopModal = document.getElementById('shopModal');
  const closeButton = shopModal.querySelector('.close');
  const buyButtons = shopModal.querySelectorAll('.buy-button');

  // Open shop
  shopButton.addEventListener('click', () => {
    shopModal.style.display = 'block';
    state.shopOpen = true;
    updateBuyButtons();
  });

  // Close shop
  closeButton.addEventListener('click', () => {
    shopModal.style.display = 'none';
    state.shopOpen = false;
  });

  // Close shop when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === shopModal) {
      shopModal.style.display = 'none';
      state.shopOpen = false;
    }
  });

  // Buy items
  buyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const itemType = button.dataset.item;
      const cost = parseInt(button.dataset.cost);
      const currency = button.dataset.currency || 'wood';
      
      let canAfford = false;
      if (currency === 'wood' && state.player.wood >= cost) {
        canAfford = true;
        state.player.wood -= cost;
      } else if (currency === 'gold' && state.player.gold >= cost) {
        canAfford = true;
        state.player.gold -= cost;
      }
      
      if (canAfford) {
        // Add item to backpack
        addItemToBackpack(itemType);
        
        // Update UI
        renderUI(state);
        updateBuyButtons();
      }
    });
  });
}

function updateBuyButtons() {
  const buyButtons = document.querySelectorAll('.buy-button');
  buyButtons.forEach(button => {
    const cost = parseInt(button.dataset.cost);
    const currency = button.dataset.currency || 'wood';
    
    let canAfford = false;
    if (currency === 'wood' && state.player.wood >= cost) {
      canAfford = true;
    } else if (currency === 'gold' && state.player.gold >= cost) {
      canAfford = true;
    }
    
    if (canAfford) {
      button.disabled = false;
      button.textContent = 'Buy';
    } else {
      button.disabled = true;
      button.textContent = `Not enough ${currency}`;
    }
  });
}

function addItemToBackpack(itemType) {
  // Find first empty slot
  const emptyIndex = state.backpack.findIndex(item => item === null);
  if (emptyIndex !== -1) {
    let item;
    switch (itemType) {
      case 'lightBrownBlock':
        item = {
          type: 'lightBrownBlock',
          name: 'Light Brown Block',
          color: '#d4a574',
          class: LightBrownBlock
        };
        break;
      case 'shootingTower':
        item = {
          type: 'shootingTower',
          name: 'Shooting Tower',
          color: '#8B4513',
          class: ShootingTower
        };
        break;
      default:
        return;
    }
    
    state.backpack[emptyIndex] = item;
    renderBackpack();
  }
}

// Backpack click handlers
export function setupBackpackHandlers() {
  const slots = document.querySelectorAll('.slot');
  
  slots.forEach((slot, index) => {
    slot.addEventListener('click', () => {
      const item = state.backpack[index];
      if (item) {
        // Select item for placement
        state.gameMode = 'edit';
        state.placingBlockIndex = index;
        
        // Update visual selection
        slots.forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        
      }
    });
  });
  
  // Add map click handler for placing blocks
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    // Add cursor tracking for preview
    canvas.addEventListener('mousemove', (event) => {
      if (state.gameMode === 'edit' && state.placingBlockIndex !== null) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if cursor is within canvas bounds
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          // Convert to grid position
          const gridX = Math.floor(x / 48) * 48;
          const gridY = Math.floor(y / 48) * 48;
          
          state.cursorPosition = { x: gridX, y: gridY };
          
          // Create preview block
          const selectedItem = state.backpack[state.placingBlockIndex];
          if (selectedItem && selectedItem.class) {
            state.previewBlock = new selectedItem.class(gridX, gridY);
          }
        } else {
          // Clear preview when cursor is outside canvas
          state.previewBlock = null;
        }
      }
    });
    
    // Clear preview when mouse leaves canvas
    canvas.addEventListener('mouseleave', () => {
      if (state.gameMode === 'edit') {
        state.previewBlock = null;
      }
    });
    
    canvas.addEventListener('click', (event) => {
      if (state.gameMode === 'edit' && state.placingBlockIndex !== null) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert to grid position
        const gridX = Math.floor(x / 48) * 48;
        const gridY = Math.floor(y / 48) * 48;
        
        // Check if position is empty (not occupied by any block)
        const isOccupied = state.blocks.some(block => 
          block.x === gridX && block.y === gridY
        );
        
        if (!isOccupied) {
          const selectedItem = state.backpack[state.placingBlockIndex];
          if (selectedItem && selectedItem.class) {
            // Create new block or tower at the clicked position
            const newItem = new selectedItem.class(gridX, gridY);
            
            if (selectedItem.type === 'shootingTower') {
              // Add to shooting towers array
              state.shootingTowers.push(newItem);
            } else {
              // Add to blocks array
              state.blocks.push(newItem);
            }
            
            // Remove item from backpack
            state.backpack[state.placingBlockIndex] = null;
            
            // Exit edit mode
            state.gameMode = 'play';
            state.placingBlockIndex = null;
            state.previewBlock = null; // Clear preview block
            
            // Remove visual selection
            slots.forEach(s => s.classList.remove('selected'));
            
            // Update UI
            renderUI(state);
            renderBackpack(); // Explicit call to update backpack display
          }
        } else {
          // console.log('Position occupied, cannot place block'); // Removed debugging
        }
      }
    });
  }
}

// Initialize UI handlers
export function initializeUI() {
  setupShopHandlers();
  setupBackpackHandlers();
  setupMenuHandlers();
}

// Menu functionality
function setupMenuHandlers() {
  const menuButton = document.getElementById('menuButton');
  if (menuButton) {
    menuButton.addEventListener('click', () => {
      // Navigate back to menu
      window.location.href = 'menu.html';
    });
  }
} 