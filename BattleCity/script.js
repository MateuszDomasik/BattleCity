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

function shootBullet() {
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

function drawPlayer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlocks();
    drawBullets();
    if (tankImgLoaded) {
        ctx.save();
        // Move to the center of the tank
        ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
        // Rotate so 0 is up
        ctx.rotate(player.angle);
        // Draw the tank image centered
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

let lastMoveTime = 0;
const MOVE_INTERVAL = 500; // ms, 2 cells per second

let moveTarget = null;
let moveStart = null;
let moveFrom = null;
const MOVE_DURATION = 500; // ms

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

let movingDirection = null;
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