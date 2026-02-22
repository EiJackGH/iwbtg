const canvas = typeof document !== 'undefined' ? document.getElementById('gameCanvas') : null;
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas) {
    canvas.width = 800;
    canvas.height = 600;
}

const GRAVITY = 0.15;
const PLAYER_SPEED = 2.5;
const PLAYER_SIZE = 10;
const JUMP_FORCE = -4.5;
const DOUBLE_JUMP_FORCE = -3.5;

let spawnPoint = { x: 100, y: 100 };
let deaths = 0;

let player = {
    x: spawnPoint.x,
    y: spawnPoint.y,
    vx: 0,
    vy: 0,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    color: 'red',
    onGround: false,
    jumpCount: 0
};

const platforms = [
    { x: 0, y: 580, width: 800, height: 20 },
    { x: 200, y: 500, width: 100, height: 20 },
    { x: 400, y: 400, width: 100, height: 20 },
    { x: 600, y: 300, width: 100, height: 20 },
    { x: 400, y: 200, width: 100, height: 20 },
    { x: 200, y: 150, width: 100, height: 20 },
    { x: 50, y: 100, width: 50, height: 20 }
];

const spikes = [
    { x: 220, y: 480, width: 20, height: 20 },
    { x: 240, y: 480, width: 20, height: 20 },
    { x: 420, y: 380, width: 20, height: 20 },
    { x: 620, y: 280, width: 20, height: 20 },
    { x: 420, y: 180, width: 20, height: 20 },
    { x: 220, y: 130, width: 20, height: 20 }
];

const traps = [
    { x: 300, y: 0, initialY: 0, width: 40, height: 40, type: 'falling', triggered: false, vy: 0 },
    { x: 500, y: 380, width: 20, height: 20, type: 'hidden-spike', triggered: false }
];

const savePoints = [
    { x: 20, y: 530, width: 30, height: 50, active: false },
    { x: 60, y: 50, width: 30, height: 50, active: false }
];

const victoryPoint = { x: 700, y: 530, width: 50, height: 50 };
let gameWon = false;

const keys = {};

if (typeof window !== 'undefined') {
window.addEventListener('keydown', e => {
    if (!keys[e.code]) {
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyZ') {
            jump();
        }
        if (e.code === 'KeyR') {
            die();
        }
    }
    keys[e.code] = true;
});

window.addEventListener('keyup', e => {
    keys[e.code] = false;
});
}

function jump() {
    if (player.onGround) {
        player.vy = JUMP_FORCE;
        player.onGround = false;
        player.jumpCount = 1;
    } else if (player.jumpCount < 2) {
        player.vy = DOUBLE_JUMP_FORCE;
        player.jumpCount = 2;
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function die() {
    player.x = spawnPoint.x;
    player.y = spawnPoint.y;
    player.vy = 0;
    player.vx = 0;
    player.jumpCount = 0;
    deaths++;
    // Reset traps
    for (let trap of traps) {
        if (trap.type === 'falling') {
            trap.y = trap.initialY;
            trap.vy = 0;
            trap.triggered = false;
        } else if (trap.type === 'hidden-spike') {
            trap.triggered = false;
        }
    }
}

function save() {
    spawnPoint.x = player.x;
    spawnPoint.y = player.y;
}

function update() {
    // Horizontal movement
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.vx = -PLAYER_SPEED;
    } else if (keys['ArrowRight'] || keys['KeyD']) {
        player.vx = PLAYER_SPEED;
    } else {
        player.vx = 0;
    }

    // Move horizontally
    player.x += player.vx;
    for (let platform of platforms) {
        if (checkCollision(player, platform)) {
            if (player.vx > 0) {
                player.x = platform.x - player.width;
            } else if (player.vx < 0) {
                player.x = platform.x + platform.width;
            }
        }
    }

    // Apply gravity
    player.vy += GRAVITY;

    // Move vertically
    player.y += player.vy;
    player.onGround = false;
    for (let platform of platforms) {
        if (checkCollision(player, platform)) {
            if (player.vy > 0) {
                player.y = platform.y - player.height;
                player.vy = 0;
                player.onGround = true;
                player.jumpCount = 0;
            } else if (player.vy < 0) {
                player.y = platform.y + platform.height;
                player.vy = 0;
            }
        }
    }

    // Wall constraints
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y > canvas.height) {
        die();
    }

    // Spike collision
    for (let spike of spikes) {
        if (checkCollision(player, spike)) {
            die();
        }
    }

    // Update traps
    for (let trap of traps) {
        if (trap.type === 'falling') {
            if (!trap.triggered && Math.abs(player.x - trap.x) < 50) {
                trap.triggered = true;
            }
            if (trap.triggered) {
                trap.vy += 0.5;
                trap.y += trap.vy;
            }
        } else if (trap.type === 'hidden-spike') {
            if (!trap.triggered && Math.abs(player.x - trap.x) < 40 && Math.abs(player.y - trap.y) < 100) {
                trap.triggered = true;
            }
        }

        if (trap.triggered && checkCollision(player, trap)) {
            die();
        }
    }

    // Save point collision
    for (let sp of savePoints) {
        if (checkCollision(player, sp)) {
            if (keys['KeyS']) {
                save();
                sp.active = true;
            }
        }
    }

    // Victory collision
    if (checkCollision(player, victoryPoint)) {
        gameWon = true;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Deaths
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Deaths: ${deaths}`, 10, 25);

    // Draw Platforms
    ctx.fillStyle = '#444';
    for (let platform of platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Draw Spikes
    ctx.fillStyle = '#f00';
    for (let spike of spikes) {
        ctx.beginPath();
        ctx.moveTo(spike.x, spike.y + spike.height);
        ctx.lineTo(spike.x + spike.width / 2, spike.y);
        ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
        ctx.fill();
    }

    // Draw Traps
    for (let trap of traps) {
        if (trap.type === 'falling') {
            ctx.fillStyle = '#ff0';
            ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
        } else if (trap.type === 'hidden-spike' && trap.triggered) {
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.moveTo(trap.x, trap.y + trap.height);
            ctx.lineTo(trap.x + trap.width / 2, trap.y);
            ctx.lineTo(trap.x + trap.width, trap.y + trap.height);
            ctx.fill();
        }
    }

    // Draw Victory Point
    ctx.fillStyle = 'gold';
    ctx.fillRect(victoryPoint.x, victoryPoint.y, victoryPoint.width, victoryPoint.height);
    ctx.fillStyle = 'black';
    ctx.font = '10px Arial';
    ctx.fillText('WIN', victoryPoint.x + 15, victoryPoint.y + 30);

    // Draw Save Points
    for (let sp of savePoints) {
        ctx.fillStyle = sp.active ? '#0f0' : '#888';
        ctx.fillRect(sp.x, sp.y, sp.width, sp.height);
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText('SAVE', sp.x, sp.y - 5);
    }

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop() {
    if (ctx) {
        if (!gameWon) {
            update();
            draw();
        } else {
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.fillText('YOU ARE THE GUY!', 200, 300);
            ctx.font = '24px Arial';
            ctx.fillText(`Final Deaths: ${deaths}`, 300, 350);
            ctx.fillText('Press R to play again', 300, 400);
            if (keys['KeyR']) {
                gameWon = false;
                deaths = 0;
                spawnPoint = { x: 100, y: 100 };
            player.x = spawnPoint.x;
            player.y = spawnPoint.y;
            player.vy = 0;
            player.vx = 0;
            player.jumpCount = 0;
            // Reset traps
            for (let trap of traps) {
                if (trap.type === 'falling') {
                    trap.y = trap.initialY;
                    trap.vy = 0;
                    trap.triggered = false;
                } else if (trap.type === 'hidden-spike') {
                    trap.triggered = false;
                }
            }
            }
        }
        requestAnimationFrame(gameLoop);
    }
}

if (typeof window !== 'undefined') {
    gameLoop();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkCollision };
}
