const BACKPACK_SIZE = 5;
let moveTarget = null;
let backpack = new Array(BACKPACK_SIZE).fill(null);
let movingDirection = null;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set up grid
const GRID_COLS = 30;
const GRID_ROWS = 15;
const CELL_SIZE = 48; // 1.5 times bigger than 32

// Update canvas size
canvas.width = GRID_COLS * CELL_SIZE;
canvas.height = GRID_ROWS * CELL_SIZE;

const player = {
    x: Math.floor(GRID_COLS / 2) * CELL_SIZE,
    y: Math.floor(GRID_ROWS / 2) * CELL_SIZE,
    size: CELL_SIZE,
    color: 'yellow', // not used anymore
    speed: CELL_SIZE, // snap to grid
    angle: 0 // 0 = up, in radians
};

const keysPressed = {};

// Tank image
const tankImg = document.getElementById('tankSprite');
let tankImgLoaded = false;
tankImg.onload = () => {
    tankImgLoaded = true;
    gameLoop();
};
tankImg.onerror = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.font = '20px Arial';
    ctx.fillText('Failed to load tank image!', 100, 250);
};

// Generate random blocks
const blockCount = 20;
const blocks = [];
function getRandomGridPosition() {
    return {
        x: Math.floor(Math.random() * GRID_COLS) * CELL_SIZE,
        y: Math.floor(Math.random() * GRID_ROWS) * CELL_SIZE
    };
}
for (let i = 0; i < blockCount; i++) {
    let pos, overlap;
    do {
        pos = getRandomGridPosition();
        // Avoid placing a block on the player's starting position or overlapping another block
        overlap = (pos.x === player.x && pos.y === player.y) || blocks.some(b => b.x === pos.x && b.y === pos.y);
    } while (overlap);
    blocks.push({ x: pos.x, y: pos.y, size: CELL_SIZE, color: 'gray', hp: 3, maxHp: 3 });
}

function drawBlocks() {
    for (const block of blocks) {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.size, block.size);
        // Draw health bar
        const barWidth = block.size * 0.8;
        const barHeight = 6;
        const barX = block.x + (block.size - barWidth) / 2;
        const barY = block.y + 4;
        // Border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        // Health fill
        ctx.fillStyle = 'green';
        ctx.fillRect(barX, barY, barWidth * (block.hp / block.maxHp), barHeight);
        // Draw health points as white number in center
        ctx.fillStyle = 'white';
        ctx.font = `${Math.floor(block.size / 2)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(block.hp, block.x + block.size / 2, block.y + block.size / 2);
    }
}

function isColliding(x, y) {
    for (const block of blocks) {
        if (
            x < block.x + block.size &&
            x + player.size > block.x &&
            y < block.y + block.size &&
            y + player.size > block.y
        ) {
            return true;
        }
    }
    return false;
}

const bullets = [];
const BULLET_SPEED = 6;
const BULLET_SIZE = 10;

// Player stats
let playerHealth = 10;
let playerMaxHealth = 10;
let playerBullets = 10;
let playerWood = 5;

function updateUI() {
    const ui = document.getElementById('ui');
    // Health bar
    const barWidth = 300;
    const barHeight = 20;
    const healthPercent = playerHealth / playerMaxHealth;
    let healthBar = `<div style='display:flex;align-items:center;gap:10px;'>`
        + `<span style='color:white;font-family:Arial;font-size:18px;'>Health:</span>`
        + `<div style='position:relative;width:${barWidth}px;height:${barHeight}px;background:#222;border:2px solid white;'>`
        + `<div style='background:green;width:${Math.max(0, barWidth * healthPercent)}px;height:${barHeight}px;'></div>`
        + `<span style='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:white;font-family:Arial;font-size:16px;'>${playerHealth} / ${playerMaxHealth}</span>`
        + `</div></div>`;
    // Bullet counter
    let bulletCounter = `<div style='display:flex;align-items:center;gap:10px;'>`
        + `<span style='color:white;font-family:Arial;font-size:18px;'>Bullets:</span>`
        + `<span style='color:white;font-family:Arial;font-size:20px;'>${playerBullets}</span>`
        + `</div>`;
    // Wood counter
    let woodCounter = `<div style='display:flex;align-items:center;gap:10px;'>`
        + `<span style='color:white;font-family:Arial;font-size:18px;'>Wood:</span>`
        + `<span style='color:saddlebrown;font-family:Arial;font-size:20px;'>${playerWood}</span>`
        + `</div>`;
    ui.innerHTML = healthBar + bulletCounter + woodCounter;
    renderBackpack();
}

// Call updateUI at start
updateUI();

// Update shootBullet to check and decrease bullet count
function shootBullet() {
    if (playerBullets <= 0) return;
    playerBullets--;
    updateUI();
    // Adjust angle so 0 is up (canvas 0 is right)
    const angle = getNormalizedAngle(player.angle) - Math.PI / 2;
    const cx = player.x + player.size / 2;
    const cy = player.y + player.size / 2;
    // Offset so bullet appears just outside the tank, in the direction of the angle
    const bx = cx + Math.cos(angle) * (player.size / 2);
    const by = cy + Math.sin(angle) * (player.size / 2);
    bullets.push({
        x: bx,
        y: by,
        angle: angle
    });
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += Math.cos(bullet.angle) * BULLET_SPEED;
        bullet.y += Math.sin(bullet.angle) * BULLET_SPEED;
        // Remove bullet if out of bounds
        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height
        ) {
            bullets.splice(i, 1);
            continue;
        }
        // Check collision with blocks
        for (let j = blocks.length - 1; j >= 0; j--) {
            const block = blocks[j];
            if (
                bullet.x > block.x &&
                bullet.x < block.x + block.size &&
                bullet.y > block.y &&
                bullet.y < block.y + block.size
            ) {
                bullets.splice(i, 1);
                block.hp -= 1;
                if (block.hp <= 0) {
                    blocks.splice(j, 1);
                }
                break;
            }
        }
    }
}

function drawBullets() {
    ctx.fillStyle = 'white';
    for (const bullet of bullets) {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(bullet.angle);
        ctx.fillRect(-BULLET_SIZE / 2, -BULLET_SIZE / 2, BULLET_SIZE, 4);
        ctx.restore();
    }
}

// Place bulletBlocks and related functions before drawPlayer
const bulletBlockCount = 5;
const bulletBlocks = [];
function getRandomBulletBlockPosition() {
    return {
        x: Math.floor(Math.random() * GRID_COLS) * CELL_SIZE,
        y: Math.floor(Math.random() * GRID_ROWS) * CELL_SIZE
    };
}
for (let i = 0; i < bulletBlockCount; i++) {
    let pos, overlap;
    do {
        pos = getRandomBulletBlockPosition();
        // Avoid placing on player, other blocks, or other bullet blocks
        overlap = (pos.x === player.x && pos.y === player.y)
            || blocks.some(b => b.x === pos.x && b.y === pos.y)
            || bulletBlocks.some(b => b.x === pos.x && b.y === pos.y);
    } while (overlap);
    bulletBlocks.push({ x: pos.x, y: pos.y, size: CELL_SIZE, color: 'orange' });
}

function drawBulletBlocks() {
    for (const block of bulletBlocks) {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.size, block.size);
        // Draw bullet icon or number
        ctx.fillStyle = 'white';
        ctx.font = `${Math.floor(block.size / 2.5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+5', block.x + block.size / 2, block.y + block.size / 2);
    }
}

function checkPlayerBulletBlockCollision() {
    for (let i = bulletBlocks.length - 1; i >= 0; i--) {
        const block = bulletBlocks[i];
        if (
            player.x < block.x + block.size &&
            player.x + player.size > block.x &&
            player.y < block.y + block.size &&
            player.y + player.size > block.y
        ) {
            bulletBlocks.splice(i, 1);
            playerBullets += 5;
            updateUI();
        }
    }
}

const purpleBlockCount = 5;
const purpleBlocks = [];
function getRandomPurpleBlockPosition() {
    return {
        x: Math.floor(Math.random() * GRID_COLS) * CELL_SIZE,
        y: Math.floor(Math.random() * GRID_ROWS) * CELL_SIZE
    };
}
for (let i = 0; i < purpleBlockCount; i++) {
    let pos, overlap;
    do {
        pos = getRandomPurpleBlockPosition();
        // Avoid placing on player, other blocks, bullet blocks, or other purple blocks
        overlap = (pos.x === player.x && pos.y === player.y)
            || blocks.some(b => b.x === pos.x && b.y === pos.y)
            || bulletBlocks.some(b => b.x === pos.x && b.y === pos.y)
            || purpleBlocks.some(b => b.x === pos.x && b.y === pos.y);
    } while (overlap);
    purpleBlocks.push({ x: pos.x, y: pos.y, size: CELL_SIZE, color: 'purple' });
}

function drawPurpleBlocks() {
    for (const block of purpleBlocks) {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.size, block.size);
    }
}

function drawPlayer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlocks();
    drawBulletBlocks();
    drawPurpleBlocks();
    drawBullets();
    if (tankImgLoaded) {
        ctx.save();
        ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
        ctx.rotate(player.angle);
        ctx.drawImage(
            tankImg,
            -player.size / 2,
            -player.size / 2,
            player.size,
            player.size
        );
        ctx.restore();
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }
}

// Map arrow keys to angles (in radians) so that up is 0, right is Math.PI/2, down is Math.PI, left is 3*Math.PI/2
const directionAngles = {
    'ArrowUp': 0,
    'ArrowRight': Math.PI / 2,
    'ArrowDown': Math.PI,
    'ArrowLeft': 3 * Math.PI / 2
};

function getNormalizedAngle(angle) {
    // Normalize angle to one of the four directions
    angle = angle % (2 * Math.PI);
    if (angle < 0) angle += 2 * Math.PI;
    if (Math.abs(angle - 0) < 0.01) return 0;
    if (Math.abs(angle - Math.PI / 2) < 0.01) return Math.PI / 2;
    if (Math.abs(angle - Math.PI) < 0.01) return Math.PI;
    if (Math.abs(angle - 3 * Math.PI / 2) < 0.01) return 3 * Math.PI / 2;
    return angle;
}

let lastWaterDamageTime = 0;

let lastMoveTime = 0;
const MOVE_INTERVAL = 500; // ms, 2 cells per second

let moveStart = null;
let moveFrom = null;
const MOVE_DURATION = 500; // ms

let prevPlayerPos = { x: player.x, y: player.y };

// Update tryMove to store previous position before moving
function tryMove(dir) {
    if (moveTarget) return; // Already moving
    let targetX = player.x;
    let targetY = player.y;
    if (dir === 'up') {
        targetY = Math.max(0, player.y - player.size);
        if (isColliding(player.x, targetY)) return;
    } else if (dir === 'down') {
        targetY = Math.min(canvas.height - player.size, player.y + player.size);
        if (isColliding(player.x, targetY)) return;
    } else if (dir === 'left') {
        targetX = Math.max(0, player.x - player.size);
        if (isColliding(targetX, player.y)) return;
    } else if (dir === 'right') {
        targetX = Math.min(canvas.width - player.size, player.x + player.size);
        if (isColliding(targetX, player.y)) return;
    }
    if (targetX !== player.x || targetY !== player.y) {
        prevPlayerPos = { x: player.x, y: player.y };
        moveFrom = { x: player.x, y: player.y };
        moveTarget = { x: targetX, y: targetY };
        moveStart = performance.now();
    }
}

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const PRESS_THRESHOLD = 300; // ms
let arrowKeyTimers = {};

// On keydown, start timer if not already started
// On keyup, if held less than threshold, only rotate; if held longer, rotate and move

let moveHoldTimer = null;

function startMoveHold(dirKey) {
    if (moveHoldTimer) clearTimeout(moveHoldTimer);
    moveHoldTimer = setTimeout(() => {
        movingDirection = dirKey;
        if (!moveTarget) {
            if (dirKey === 'ArrowUp') tryMove('up');
            else if (dirKey === 'ArrowDown') tryMove('down');
            else if (dirKey === 'ArrowLeft') tryMove('left');
            else if (dirKey === 'ArrowRight') tryMove('right');
        }
    }, PRESS_THRESHOLD);
}

document.addEventListener('keydown', (e) => {
    if (directionAngles.hasOwnProperty(e.key)) {
        const desiredAngle = directionAngles[e.key];
        // Rotate immediately
        if (getNormalizedAngle(player.angle) !== desiredAngle) {
            player.angle = desiredAngle;
        }
        // Start timer for movement if not already started
        if (!arrowKeyTimers[e.key]) {
            arrowKeyTimers[e.key] = { start: Date.now(), moved: false };
            startMoveHold(e.key);
        }
        keysPressed[e.key] = true;
    }
    if (e.code === 'Space' && !keysPressed['Space']) {
        shootBullet();
        keysPressed['Space'] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (directionAngles.hasOwnProperty(e.key)) {
        if (moveHoldTimer) clearTimeout(moveHoldTimer);
        if (movingDirection === e.key) movingDirection = null;
        delete arrowKeyTimers[e.key];
        keysPressed[e.key] = false;
    }
    if (e.code === 'Space') {
        keysPressed['Space'] = false;
    }
});

function updatePlayer() {
    if (!moveTarget && movingDirection) {
        if (movingDirection === 'ArrowUp') tryMove('up');
        else if (movingDirection === 'ArrowDown') tryMove('down');
        else if (movingDirection === 'ArrowLeft') tryMove('left');
        else if (movingDirection === 'ArrowRight') tryMove('right');
    }
    if (!moveTarget) return;
    const now = performance.now();
    const elapsed = now - moveStart;
    let t = Math.min(1, elapsed / MOVE_DURATION);
    // Interpolate position
    player.x = moveFrom.x + (moveTarget.x - moveFrom.x) * t;
    player.y = moveFrom.y + (moveTarget.y - moveFrom.y) * t;
    if (t >= 1) {
        player.x = moveTarget.x;
        player.y = moveTarget.y;
        moveTarget = null;
        moveFrom = null;
        moveStart = null;
    }
}

function gameLoop() {
    updatePlayer();
    updateBullets();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

// Show loading message until image is loaded
if (!tankImg.complete) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Loading tank image...', 150, 250);
}
// If already loaded (from cache), start game loop
if (tankImg.complete && tankImg.naturalWidth !== 0) {
    tankImgLoaded = true;
    gameLoop();
} 

// Call checkPlayerBulletBlockCollision in updatePlayer
const originalUpdatePlayer = updatePlayer;
updatePlayer = function() {
    if (typeof originalUpdatePlayer === 'function') originalUpdatePlayer();
    checkPlayerBulletBlockCollision();
} 

// Update isColliding to include purpleBlocks
const originalIsColliding = isColliding;
isColliding = function(x, y) {
    if (typeof originalIsColliding === 'function' && originalIsColliding(x, y)) return true;
    for (const block of purpleBlocks) {
        if (
            x < block.x + block.size &&
            x + player.size > block.x &&
            y < block.y + block.size &&
            y + player.size > block.y
        ) {
            return true;
        }
    }
    return false;
}

// Update updateBullets to prevent bullets from destroying purpleBlocks
const originalUpdateBullets = updateBullets;
updateBullets = function() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += Math.cos(bullet.angle) * BULLET_SPEED;
        bullet.y += Math.sin(bullet.angle) * BULLET_SPEED;
        // Remove bullet if out of bounds
        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height
        ) {
            bullets.splice(i, 1);
            continue;
        }
        // Check collision with purple blocks (indestructible)
        let hitPurple = false;
        for (const block of purpleBlocks) {
            if (
                bullet.x > block.x &&
                bullet.x < block.x + block.size &&
                bullet.y > block.y &&
                bullet.y < block.y + block.size
            ) {
                bullets.splice(i, 1);
                hitPurple = true;
                break;
            }
        }
        if (hitPurple) continue;
        // Continue with normal block collision
        for (let j = blocks.length - 1; j >= 0; j--) {
            const block = blocks[j];
            if (
                bullet.x > block.x &&
                bullet.x < block.x + block.size &&
                bullet.y > block.y &&
                bullet.y < block.y + block.size
            ) {
                bullets.splice(i, 1);
                block.hp -= 1;
                if (block.hp <= 0) {
                    blocks.splice(j, 1);
                }
                break;
            }
        }
    }
} 

// Place 5 green tree blocks
const treeBlockCount = 5;
const treeBlocks = [];
const woodBlocks = [];
function getRandomTreeBlockPosition() {
    return {
        x: Math.floor(Math.random() * GRID_COLS) * CELL_SIZE,
        y: Math.floor(Math.random() * GRID_ROWS) * CELL_SIZE
    };
}
for (let i = 0; i < treeBlockCount; i++) {
    let pos, overlap;
    do {
        pos = getRandomTreeBlockPosition();
        overlap = (pos.x === player.x && pos.y === player.y)
            || blocks.some(b => b.x === pos.x && b.y === pos.y)
            || bulletBlocks.some(b => b.x === pos.x && b.y === pos.y)
            || purpleBlocks.some(b => b.x === pos.x && b.y === pos.y)
            || treeBlocks.some(b => b.x === pos.x && b.y === pos.y);
    } while (overlap);
    treeBlocks.push({ x: pos.x, y: pos.y, size: CELL_SIZE, color: 'green', hp: 5, maxHp: 5 });
}

function drawTreeBlocks() {
    for (const block of treeBlocks) {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.size, block.size);
        // Draw health bar
        const barWidth = block.size * 0.8;
        const barHeight = 6;
        const barX = block.x + (block.size - barWidth) / 2;
        const barY = block.y + 4;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = 'limegreen';
        ctx.fillRect(barX, barY, barWidth * (block.hp / block.maxHp), barHeight);
        // Draw health points as white number in center
        ctx.fillStyle = 'white';
        ctx.font = `${Math.floor(block.size / 2)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(block.hp, block.x + block.size / 2, block.y + block.size / 2);
    }
}

function drawWoodBlocks() {
    for (const block of woodBlocks) {
        ctx.fillStyle = 'saddlebrown';
        ctx.fillRect(block.x, block.y, block.size, block.size);
        // Draw wood icon or number
        ctx.fillStyle = 'white';
        ctx.font = `${Math.floor(block.size / 2.5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('W', block.x + block.size / 2, block.y + block.size / 2);
    }
}

// In drawPlayer, after drawBlocks, drawBulletBlocks, drawPurpleBlocks:
// drawTreeBlocks(); drawWoodBlocks();
const originalDrawPlayer3 = drawPlayer;
drawPlayer = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlocks();
    drawBulletBlocks();
    drawPurpleBlocks();
    drawTreeBlocks();
    drawWoodBlocks();
    drawBullets();
    if (tankImgLoaded) {
        ctx.save();
        ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
        ctx.rotate(player.angle);
        ctx.drawImage(
            tankImg,
            -player.size / 2,
            -player.size / 2,
            player.size,
            player.size
        );
        ctx.restore();
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }
}

// Update isColliding to NOT include woodBlocks (so player can collect them)
const originalIsColliding2 = isColliding;
isColliding = function(x, y) {
    if (typeof originalIsColliding2 === 'function' && originalIsColliding2(x, y)) return true;
    for (const block of treeBlocks) {
        if (
            x < block.x + block.size &&
            x + player.size > block.x &&
            y < block.y + block.size &&
            y + player.size > block.y
        ) {
            return true;
        }
    }
    // Do NOT block movement for woodBlocks
    return false;
}

// Update updateBullets to allow damaging treeBlocks, and turn to wood when destroyed
const originalUpdateBullets2 = updateBullets;
updateBullets = function() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += Math.cos(bullet.angle) * BULLET_SPEED;
        bullet.y += Math.sin(bullet.angle) * BULLET_SPEED;
        // Remove bullet if out of bounds
        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height
        ) {
            bullets.splice(i, 1);
            continue;
        }
        // Check collision with purple blocks (indestructible)
        let hitPurple = false;
        for (const block of purpleBlocks) {
            if (
                bullet.x > block.x &&
                bullet.x < block.x + block.size &&
                bullet.y > block.y &&
                bullet.y < block.y + block.size
            ) {
                bullets.splice(i, 1);
                hitPurple = true;
                break;
            }
        }
        if (hitPurple) continue;
        // Check collision with tree blocks
        let hitTree = false;
        for (let j = treeBlocks.length - 1; j >= 0; j--) {
            const block = treeBlocks[j];
            if (
                bullet.x > block.x &&
                bullet.x < block.x + block.size &&
                bullet.y > block.y &&
                bullet.y < block.y + block.size
            ) {
                bullets.splice(i, 1);
                block.hp -= 1;
                if (block.hp <= 0) {
                    // Turn into wood block
                    woodBlocks.push({ x: block.x, y: block.y, size: block.size });
                    treeBlocks.splice(j, 1);
                }
                hitTree = true;
                break;
            }
        }
        if (hitTree) continue;
        // Continue with normal block collision
        for (let j = blocks.length - 1; j >= 0; j--) {
            const block = blocks[j];
            if (
                bullet.x > block.x &&
                bullet.x < block.x + block.size &&
                bullet.y > block.y &&
                bullet.y < block.y + block.size
            ) {
                bullets.splice(i, 1);
                block.hp -= 1;
                if (block.hp <= 0) {
                    blocks.splice(j, 1);
                }
                break;
            }
        }
    }
}

// Check for player-woodBlock collision in updatePlayer
function checkPlayerWoodBlockCollision() {
    for (let i = woodBlocks.length - 1; i >= 0; i--) {
        const block = woodBlocks[i];
        if (
            player.x < block.x + block.size &&
            player.x + player.size > block.x &&
            player.y < block.y + block.size &&
            player.y + player.size > block.y
        ) {
            woodBlocks.splice(i, 1);
            playerWood += 1;
            updateUI();
        }
    }
}

// Call checkPlayerWoodBlockCollision in updatePlayer
const originalUpdatePlayer3 = updatePlayer;
updatePlayer = function() {
    if (typeof originalUpdatePlayer3 === 'function') originalUpdatePlayer3();
    checkPlayerBulletBlockCollision();
} 

const waterBlockCount = 8;
const waterBlocks = [];
function getRandomWaterStartPosition() {
    return {
        x: Math.floor(Math.random() * (GRID_COLS - 2)) * CELL_SIZE,
        y: Math.floor(Math.random() * (GRID_ROWS - 2)) * CELL_SIZE
    };
}
// Place a connected group of water blocks
(function placeWaterBlocks() {
    let start = getRandomWaterStartPosition();
    let positions = [start];
    let placed = 0;
    while (placed < waterBlockCount) {
        let pos = positions[placed];
        // Avoid overlap with player, other blocks, bullet, purple, tree, wood blocks
        let overlap =
            (pos.x === player.x && pos.y === player.y)
            || blocks.some(b => b.x === pos.x && b.y === pos.y)
            || bulletBlocks.some(b => b.x === pos.x && b.y === pos.y)
            || purpleBlocks.some(b => b.x === pos.x && b.y === pos.y)
            || treeBlocks.some(b => b.x === pos.x && b.y === pos.y)
            || woodBlocks.some(b => b.x === pos.x && b.y === pos.y)
            || waterBlocks.some(b => b.x === pos.x && b.y === pos.y);
        if (!overlap) {
            waterBlocks.push({ x: pos.x, y: pos.y, size: CELL_SIZE, color: 'deepskyblue' });
            placed++;
            // Add a neighbor for the next block
            if (placed < waterBlockCount) {
                let neighbors = [
                    { x: pos.x + CELL_SIZE, y: pos.y },
                    { x: pos.x - CELL_SIZE, y: pos.y },
                    { x: pos.x, y: pos.y + CELL_SIZE },
                    { x: pos.x, y: pos.y - CELL_SIZE }
                ];
                // Only add valid, not already in positions
                for (let n of neighbors) {
                    if (
                        n.x >= 0 && n.x < GRID_COLS * CELL_SIZE &&
                        n.y >= 0 && n.y < GRID_ROWS * CELL_SIZE &&
                        !positions.some(p => p.x === n.x && p.y === n.y)
                    ) {
                        positions.push(n);
                        break;
                    }
                }
            }
        } else {
            // If overlap, try a new random start
            start = getRandomWaterStartPosition();
            positions = [start];
            placed = 0;
            waterBlocks.length = 0;
        }
    }
})();

function drawWaterBlocks() {
    for (const block of waterBlocks) {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.size, block.size);
    }
}

// In drawPlayer, after drawWoodBlocks:
// drawWaterBlocks();
const originalDrawPlayer4 = drawPlayer;
drawPlayer = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlocks();
    drawBulletBlocks();
    drawPurpleBlocks();
    drawTreeBlocks();
    drawWoodBlocks();
    drawWaterBlocks();
    drawBullets();
    if (tankImgLoaded) {
        ctx.save();
        ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
        ctx.rotate(player.angle);
        ctx.drawImage(
            tankImg,
            -player.size / 2,
            -player.size / 2,
            player.size,
            player.size
        );
        ctx.restore();
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }
}

// Check for player-waterBlock collision in updatePlayer
function checkPlayerWaterBlockCollision() {
    const now = Date.now();
    for (const block of waterBlocks) {
        if (
            player.x < block.x + block.size &&
            player.x + player.size > block.x &&
            player.y < block.y + block.size &&
            player.y + player.size > block.y
        ) {
            // Remove 1 HP if not already at 0 and cooldown passed
            if (playerHealth > 0 && now - lastWaterDamageTime > 1000) {
                playerHealth--;
                updateUI();
                lastWaterDamageTime = now;
                startTankFlicker();
            }
            // Teleport tank back to previous position
            let safe = true;
            for (const w of waterBlocks) {
                if (
                    prevPlayerPos.x < w.x + w.size &&
                    prevPlayerPos.x + player.size > w.x &&
                    prevPlayerPos.y < w.y + w.size &&
                    prevPlayerPos.y + player.size > w.y
                ) {
                    safe = false;
                    break;
                }
            }
            if (safe) {
                player.x = prevPlayerPos.x;
                player.y = prevPlayerPos.y;
            } else {
                player.x = Math.floor(GRID_COLS / 2) * CELL_SIZE;
                player.y = Math.floor(GRID_ROWS / 2) * CELL_SIZE;
            }
            moveTarget = null;
            moveFrom = null;
            moveStart = null;
            movingDirection = null;
            // Reset all arrow key states so movement can resume
            for (const k of Object.keys(keysPressed)) {
                keysPressed[k] = false;
            }
            break;
        }
    }
}

// Call checkPlayerWaterBlockCollision in updatePlayer
const originalUpdatePlayer4 = updatePlayer;
updatePlayer = function() {
    if (typeof originalUpdatePlayer4 === 'function') originalUpdatePlayer4();
    checkPlayerBulletBlockCollision();
    checkPlayerWoodBlockCollision();
    checkPlayerWaterBlockCollision();
} 

let tankFlicker = false;
let tankFlickerEnd = 0;
let tankFlickerToggle = false;

function startTankFlicker() {
    tankFlicker = true;
    tankFlickerEnd = Date.now() + 1000;
    tankFlickerToggle = false;
}

// Update drawPlayer to flicker tank if tankFlicker is true
const originalDrawPlayerFlicker = drawPlayer;
drawPlayer = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlocks();
    drawBulletBlocks();
    drawPurpleBlocks();
    drawTreeBlocks();
    drawWoodBlocks();
    drawWaterBlocks();
    drawShopBlocks();
    drawBullets();
    let showTank = true;
    if (tankFlicker) {
        if (Date.now() < tankFlickerEnd) {
            if (Math.floor(Date.now() / 100) % 2 === 0) {
                showTank = false;
            }
        } else {
            tankFlicker = false;
        }
    }
    if (showTank) {
        if (tankImgLoaded) {
            ctx.save();
            ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
            ctx.rotate(player.angle);
            ctx.drawImage(
                tankImg,
                -player.size / 2,
                -player.size / 2,
                player.size,
                player.size
            );
            ctx.restore();
        } else {
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y, player.size, player.size);
        }
    }
} 

let placingBlockIndex = null;
let editModeBanner = null;
let blockCursorOverlay = null;

function showEditModeBanner() {
    if (!editModeBanner) {
        editModeBanner = document.createElement('div');
        editModeBanner.id = 'edit-mode-banner';
        editModeBanner.style.position = 'fixed';
        editModeBanner.style.top = '20px';
        editModeBanner.style.left = '50%';
        editModeBanner.style.transform = 'translateX(-50%)';
        editModeBanner.style.background = 'rgba(255,255,0,0.95)';
        editModeBanner.style.color = '#222';
        editModeBanner.style.fontFamily = 'Arial';
        editModeBanner.style.fontWeight = 'bold';
        editModeBanner.style.fontSize = '22px';
        editModeBanner.style.padding = '10px 32px';
        editModeBanner.style.borderRadius = '8px';
        editModeBanner.style.zIndex = 2000;
        editModeBanner.innerText = 'Edit mode: Click on the map to place your block';
        document.body.appendChild(editModeBanner);
    }
}
function hideEditModeBanner() {
    if (editModeBanner && editModeBanner.parentNode) {
        editModeBanner.parentNode.removeChild(editModeBanner);
        editModeBanner = null;
    }
}

function showBlockCursorOverlay() {
    if (!blockCursorOverlay) {
        blockCursorOverlay = document.createElement('div');
        blockCursorOverlay.id = 'block-cursor-overlay';
        blockCursorOverlay.style.position = 'fixed';
        blockCursorOverlay.style.pointerEvents = 'none';
        blockCursorOverlay.style.width = player.size + 'px';
        blockCursorOverlay.style.height = player.size + 'px';
        blockCursorOverlay.style.background = 'rgba(210,180,140,0.5)'; // sandybrown semi-transparent
        blockCursorOverlay.style.border = '2px solid #b97a56';
        blockCursorOverlay.style.borderRadius = '8px';
        blockCursorOverlay.style.zIndex = 2001;
        document.body.appendChild(blockCursorOverlay);
    }
    document.body.style.cursor = 'none';
    document.addEventListener('mousemove', moveBlockCursorOverlay);
}
function moveBlockCursorOverlay(e) {
    const canvasRect = canvas.getBoundingClientRect();
    let x = Math.floor((e.clientX - canvasRect.left) / player.size) * player.size + canvasRect.left;
    let y = Math.floor((e.clientY - canvasRect.top) / player.size) * player.size + canvasRect.top;
    blockCursorOverlay.style.left = x + 'px';
    blockCursorOverlay.style.top = y + 'px';
}
function hideBlockCursorOverlay() {
    if (blockCursorOverlay && blockCursorOverlay.parentNode) {
        blockCursorOverlay.parentNode.removeChild(blockCursorOverlay);
        blockCursorOverlay = null;
    }
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', moveBlockCursorOverlay);
}

function renderBackpack() {
    console.log('renderBackpack called');
    const backpackDiv = document.getElementById('backpack');
    if (!backpackDiv) return;
    backpackDiv.innerHTML = '';
    for (let i = 0; i < BACKPACK_SIZE; i++) {
        const slot = document.createElement('div');
        slot.style.width = '48px';
        slot.style.height = '48px';
        slot.style.border = '2px solid #aaa';
        slot.style.background = '#222';
        slot.style.borderRadius = '8px';
        slot.style.display = 'flex';
        slot.style.justifyContent = 'center';
        slot.style.alignItems = 'center';
        slot.style.fontSize = '24px';
        slot.style.color = '#888';
        if (backpack[i] === 'block') {
            slot.style.background = 'sandybrown';
            slot.style.border = '2px solid #b97a56';
            slot.style.color = 'white';
            slot.innerText = 'B';
            slot.style.cursor = 'pointer';
            slot.onclick = function() {
                console.log('Backpack slot clicked', i);
                placingBlockIndex = i;
                backpackDiv.childNodes.forEach((el, idx) => {
                    el.style.outline = idx === i ? '2px solid yellow' : '';
                });
                showEditModeBanner();
                showBlockCursorOverlay();
            };
        } else {
            slot.innerText = '';
            slot.onclick = null;
        }
        backpackDiv.appendChild(slot);
    }
}

if (canvas) {
    canvas.addEventListener('click', function(e) {
        if (placingBlockIndex === null) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / player.size) * player.size;
        const y = Math.floor((e.clientY - rect.top) / player.size) * player.size;
        // Check if cell is empty (no block, no player)
        const occupied = blocks.some(b => b.x === x && b.y === y)
            || shopBlocks.some(b => b.x === x && b.y === y)
            || waterBlocks.some(b => b.x === x && b.y === y)
            || treeBlocks.some(b => b.x === x && b.y === y)
            || woodBlocks.some(b => b.x === x && b.y === y)
            || bulletBlocks.some(b => b.x === x && b.y === y)
            || purpleBlocks.some(b => b.x === x && b.y === y)
            || (player.x === x && player.y === y);
        if (!occupied) {
            blocks.push({ x, y, size: player.size, color: 'gray', hp: 3, maxHp: 3 });
            backpack[placingBlockIndex] = null;
            placingBlockIndex = null;
            renderBackpack();
            drawPlayer();
            hideEditModeBanner();
            hideBlockCursorOverlay();
        }
    });
}

// Call at start
renderBackpack(); 

// Call renderBackpack after page load and after every UI update
window.addEventListener('DOMContentLoaded', function() {
    // Add a test button for debugging
    const testBtn = document.createElement('button');
    testBtn.innerText = 'Test renderBackpack()';
    testBtn.style.position = 'fixed';
    testBtn.style.top = '10px';
    testBtn.style.left = '10px';
    testBtn.onclick = function() {
        console.log('Test button clicked, calling renderBackpack');
        renderBackpack();
    };
    document.body.appendChild(testBtn);
    renderBackpack();
});

const shopBlockCount = 2;
const shopBlocks = [];
function getRandomShopBlockPosition() {
    return {
        x: Math.floor(Math.random() * GRID_COLS) * CELL_SIZE,
        y: Math.floor(Math.random() * GRID_ROWS) * CELL_SIZE
    };
}
for (let i = 0; i < shopBlockCount; i++) {
    let pos, overlap;
    do {
        pos = getRandomShopBlockPosition();
        overlap = (pos.x === player.x && pos.y === player.y)
            || blocks.some(b => b.x === pos.x && b.y === pos.y)
            || bulletBlocks.some(b => b.x === pos.x && b.y === pos.y)
            || purpleBlocks.some(b => b.x === pos.x && b.y === pos.y)
            || treeBlocks.some(b => b.x === pos.x && b.y === pos.y)
            || woodBlocks.some(b => b.x === pos.x && b.y === pos.y)
            || waterBlocks.some(b => b.x === pos.x && b.y === pos.y)
            || shopBlocks.some(b => b.x === pos.x && b.y === pos.y);
    } while (overlap);
    shopBlocks.push({ x: pos.x, y: pos.y, size: CELL_SIZE, color: 'red' });
}

function drawShopBlocks() {
    for (const block of shopBlocks) {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.size, block.size);
        ctx.fillStyle = 'white';
        ctx.font = `${Math.floor(block.size / 2.5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', block.x + block.size / 2, block.y + block.size / 2);
    }
}

// Shop popup logic
let shopOpen = false;
let shopCloseCooldown = false;
let lastShopBlockTouched = null;
function openShop(block) {
    if (shopOpen || shopCloseCooldown || lastShopBlockTouched === block) return;
    shopOpen = true;
    lastShopBlockTouched = block;
    // Remove any existing popup
    const existing = document.getElementById('shop-popup');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    const popup = document.createElement('div');
    popup.id = 'shop-popup';
    popup.style.position = 'fixed';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = '#222';
    popup.style.border = '3px solid #a00';
    popup.style.borderRadius = '12px';
    popup.style.padding = '32px 40px';
    popup.style.zIndex = '1000';
    popup.style.color = 'white';
    popup.style.fontFamily = 'Arial';
    popup.innerHTML = `<h2 style='margin-top:0;color:#f55;'>Shop</h2>
        <div style='display:flex;align-items:center;gap:16px;margin-bottom:16px;'>
            <div style='width:48px;height:48px;background:sandybrown;border:2px solid #b97a56;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;'>B</div>
            <div>Light Brown Block<br><span style='color:#ccc;font-size:16px;'>Cost: 2 wood</span></div>
            <button id='buy-block-btn' style='margin-left:16px;padding:8px 16px;font-size:16px;border-radius:6px;border:none;background:#b97a56;color:white;cursor:pointer;'>Buy</button>
        </div>
        <button id='close-shop-btn' style='margin-top:8px;padding:6px 18px;font-size:16px;border-radius:6px;border:none;background:#444;color:white;cursor:pointer;'>Close</button>`;
    document.body.appendChild(popup);
    document.getElementById('close-shop-btn').onclick = function(e) {
        e.stopPropagation();
        shopOpen = false;
        shopCloseCooldown = true;
        const pop = document.getElementById('shop-popup');
        if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
        setTimeout(() => { shopCloseCooldown = false; }, 500);
    };
    document.getElementById('buy-block-btn').onclick = function(e) {
        e.stopPropagation();
        if (playerWood >= 2) {
            const idx = backpack.findIndex(x => x === null);
            if (idx !== -1) {
                playerWood -= 2;
                backpack[idx] = 'block';
                updateUI();
                renderBackpack();
                alert('You bought a light brown block!');
            } else {
                alert('Backpack is full!');
            }
        } else {
            alert('Not enough wood!');
        }
    };
}

// Check for player-shopBlock collision in updatePlayer
function checkPlayerShopBlockCollision() {
    let onShop = false;
    for (const block of shopBlocks) {
        if (
            player.x < block.x + block.size &&
            player.x + player.size > block.x &&
            player.y < block.y + block.size &&
            player.y + player.size > block.y
        ) {
            onShop = true;
            openShop(block);
            break;
        }
    }
    if (!onShop) {
        lastShopBlockTouched = null;
    }
}

// Update renderBackpack to show block if present
const originalRenderBackpack = renderBackpack;
renderBackpack = function() {
    const backpackDiv = document.getElementById('backpack');
    if (!backpackDiv) return;
    backpackDiv.innerHTML = '';
    for (let i = 0; i < BACKPACK_SIZE; i++) {
        const slot = document.createElement('div');
        slot.style.width = '48px';
        slot.style.height = '48px';
        slot.style.border = '2px solid #aaa';
        slot.style.background = '#222';
        slot.style.borderRadius = '8px';
        slot.style.display = 'flex';
        slot.style.justifyContent = 'center';
        slot.style.alignItems = 'center';
        slot.style.fontSize = '24px';
        slot.style.color = '#888';
        if (backpack[i] === 'block') {
            slot.style.background = 'sandybrown';
            slot.style.border = '2px solid #b97a56';
            slot.style.color = 'white';
            slot.innerText = 'B';
        } else {
            slot.innerText = '';
        }
        backpackDiv.appendChild(slot);
    }
}

// In drawPlayer, after drawWaterBlocks:
drawShopBlocks();

// Call checkPlayerShopBlockCollision in updatePlayer
const originalUpdatePlayerShop = updatePlayer;
updatePlayer = function() {
    if (typeof originalUpdatePlayerShop === 'function') originalUpdatePlayerShop();
    checkPlayerBulletBlockCollision();
    checkPlayerWoodBlockCollision();
    checkPlayerWaterBlockCollision();
    checkPlayerShopBlockCollision();
} 