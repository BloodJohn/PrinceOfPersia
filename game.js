// Prince of Persia Style Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.8;
    
    // 16:9 aspect ratio
    let width = maxWidth;
    let height = maxWidth * 9 / 16;
    
    if (height > maxHeight) {
        height = maxHeight;
        width = maxHeight * 16 / 9;
    }
    
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
let gameState = {
    current: 'MENU', // MENU, PLAYING, PAUSED, GAME_OVER, LEVEL_COMPLETE
    score: 0,
    level: 1,
    time: 0,
    health: 100
};

// Player object
const player = {
    x: 100,
    y: 300,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 15,
    isJumping: false,
    facingRight: true,
    health: 100,
    maxHealth: 100,
    isAttacking: false,
    attackTimer: 0,
    color: '#FFD700' // Gold color for prince
};

// Game objects
let platforms = [];
let ladders = [];
let enemies = [];
let traps = [];
let particles = [];
let levelExit = { x: 0, y: 0, width: 40, height: 40 };

// Input handling
const keys = {};
let autoPlayMode = false;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Pause game
    if (e.key === 'Escape' && gameState.current === 'PLAYING') {
        pauseGame();
    }
    
    // Toggle auto play mode
    if (e.key === 'a' || e.key === 'A') {
        autoPlayMode = !autoPlayMode;
    }
    
    // Attack
    if (e.key === 'z' || e.key === 'Z') {
        player.isAttacking = true;
        player.attackTimer = 10; // Attack animation frames
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game functions
function startGame() {
    document.getElementById('menuScreen').style.display = 'none';
    gameState.current = 'PLAYING';
    resetLevel(gameState.level);
    gameLoop();
}

function pauseGame() {
    gameState.current = 'PAUSED';
    document.getElementById('pauseScreen').style.display = 'flex';
}

function resumeGame() {
    gameState.current = 'PLAYING';
    document.getElementById('pauseScreen').style.display = 'none';
}

function restartLevel() {
    document.getElementById('pauseScreen').style.display = 'none';
    resetLevel(gameState.level);
    gameState.current = 'PLAYING';
}

function nextLevel() {
    gameState.level++;
    document.getElementById('levelCompleteScreen').style.display = 'none';
    resetLevel(gameState.level);
    gameState.current = 'PLAYING';
}

function showMenu() {
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('levelCompleteScreen').style.display = 'none';
    document.getElementById('menuScreen').style.display = 'flex';
    gameState.current = 'MENU';
}

function restartGame() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.time = 0;
    document.getElementById('gameOverScreen').style.display = 'none';
    resetLevel(gameState.level);
    gameState.current = 'PLAYING';
}

function resetLevel(levelNum) {
    // Reset player
    player.x = 100;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;
    player.health = player.maxHealth;
    
    // Reset game objects based on level
    platforms = [];
    enemies = [];
    traps = [];
    particles = [];
    
    // Create level layout
    switch(levelNum) {
        case 1:
            // Ground platform
            platforms.push({x: 0, y: canvas.height - 40, width: canvas.width, height: 40});
            
            // Some platforms
            platforms.push({x: 200, y: canvas.height - 120, width: 100, height: 20});
            platforms.push({x: 400, y: canvas.height - 200, width: 100, height: 20});
            platforms.push({x: 600, y: canvas.height - 280, width: 100, height: 20});
            
            // Enemies
            enemies.push({
                x: 300,
                y: canvas.height - 80,
                width: 30,
                height: 40,
                velocityX: 2,
                direction: 1,
                speed: 2,
                health: 50,
                maxHealth: 50,
                color: '#8B0000'
            });
            
            // Traps (spikes)
            traps.push({x: 250, y: canvas.height - 60, width: 30, height: 20, type: 'spikes'});
            
            // Level exit
            levelExit.x = canvas.width - 100;
            levelExit.y = canvas.height - 80;
            break;
            
        case 2:
            // More complex level
            platforms.push({x: 0, y: canvas.height - 40, width: canvas.width, height: 40});
            
            platforms.push({x: 150, y: canvas.height - 100, width: 80, height: 20});
            platforms.push({x: 300, y: canvas.height - 180, width: 80, height: 20});
            platforms.push({x: 450, y: canvas.height - 260, width: 80, height: 20});
            platforms.push({x: 600, y: canvas.height - 340, width: 80, height: 20});
            
            // Moving platform
            platforms.push({x: 250, y: canvas.height - 140, width: 60, height: 20, moving: true, startX: 250, endX: 350, speed: 1, direction: 1});
            
            // Enemies
            enemies.push({
                x: 400,
                y: canvas.height - 80,
                width: 30,
                height: 40,
                velocityX: 2,
                direction: 1,
                speed: 2,
                health: 50,
                maxHealth: 50,
                color: '#8B0000'
            });
            
            enemies.push({
                x: 600,
                y: canvas.height - 380,
                width: 30,
                height: 40,
                velocityX: 1.5,
                direction: -1,
                speed: 1.5,
                health: 50,
                maxHealth: 50,
                color: '#8B0000'
            });
            
            // Traps
            traps.push({x: 200, y: canvas.height - 60, width: 40, height: 20, type: 'spikes'});
            traps.push({x: 500, y: canvas.height - 60, width: 40, height: 20, type: 'spikes'});
            
            // Falling trap
            traps.push({x: 350, y: 100, width: 30, height: 30, type: 'falling', active: false, falling: false});
            
            levelExit.x = canvas.width - 100;
            levelExit.y = canvas.height - 380;
            break;
            
        default:
            // Same as level 2 for now
            resetLevel(2);
            break;
    }
    
    // Update UI
    document.getElementById('healthDisplay').textContent = player.health;
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('levelDisplay').textContent = gameState.level;
    document.getElementById('timeDisplay').textContent = Math.floor(gameState.time);
}

function updatePlayer() {
    // Apply gravity
    player.velocityY += 0.8; // Gravity
    
    // Handle input
    player.velocityX = 0;
    
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.velocityX = -player.speed;
        player.facingRight = false;
    }
    
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.velocityX = player.speed;
        player.facingRight = true;
    }
    
    if ((keys[' '] || keys['ArrowUp'] || keys['w'] || keys['W']) && !player.isJumping) {
        player.velocityY = -player.jumpPower;
        player.isJumping = true;
    }
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Boundary checks
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Check if player fell off the screen
    if (player.y > canvas.height) {
        playerDie();
    }
    
    // Platform collision
    player.isJumping = true;
    for (let platform of platforms) {
        if (checkCollision(player, platform)) {
            // Landing on top of platform
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
            }
            // Hitting platform from below
            else if (player.velocityY < 0 && player.y > platform.y) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Hitting platform from the side
            else if (player.velocityX > 0 && player.x < platform.x) {
                player.x = platform.x - player.width;
            }
            else if (player.velocityX < 0 && player.x > platform.x) {
                player.x = platform.x + platform.width;
            }
        }
    }
    
    // Update attack timer
    if (player.isAttacking) {
        player.attackTimer--;
        if (player.attackTimer <= 0) {
            player.isAttacking = false;
        }
    }
    
    // Check enemy collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        if (checkCollision(player, enemy)) {
            // If player is attacking and above enemy
            if (player.isAttacking && player.y + player.height < enemy.y + enemy.height/2) {
                // Kill enemy
                createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 10, '#FF0000');
                enemies.splice(i, 1);
                gameState.score += 100;
                updateUI();
            } else {
                // Player takes damage
                player.health -= 10;
                createParticles(player.x + player.width/2, player.y + player.height/2, 5, '#FFFF00');
                
                if (player.health <= 0) {
                    playerDie();
                }
                updateUI();
            }
        }
    }
    
    // Check trap collisions
    for (let trap of traps) {
        if (trap.type === 'spikes' && checkCollision(player, trap)) {
            player.health -= 20;
            createParticles(player.x + player.width/2, player.y + player.height/2, 5, '#FF0000');
            
            if (player.health <= 0) {
                playerDie();
            }
            updateUI();
        }
        
        // Falling trap logic
        if (trap.type === 'falling') {
            // Activate when player is near
            if (!trap.active && Math.abs(player.x - trap.x) < 100) {
                trap.active = true;
            }
            
            if (trap.active && !trap.falling) {
                // Start falling after delay
                setTimeout(() => {
                    trap.falling = true;
                }, 1000); // 1 second delay
            }
            
            if (trap.falling) {
                trap.y += 5; // Fall speed
                
                if (checkCollision(player, trap)) {
                    player.health -= 30;
                    createParticles(player.x + player.width/2, player.y + player.height/2, 8, '#FF0000');
                    
                    if (player.health <= 0) {
                        playerDie();
                    }
                    updateUI();
                }
                
                // Remove trap if it falls off screen
                if (trap.y > canvas.height) {
                    traps = traps.filter(t => t !== trap);
                }
            }
        }
    }
    
    // Check level exit
    if (checkCollision(player, levelExit)) {
        completeLevel();
    }
    
    // Update enemies
    for (let enemy of enemies) {
        // Simple AI: move back and forth
        enemy.x += enemy.velocityX * enemy.direction;
        
        // Reverse direction at edges or when hitting walls
        let willCollide = false;
        for (let platform of platforms) {
            // Check if enemy would collide with wall
            const futureX = enemy.x + (enemy.velocityX * enemy.direction);
            const testRect = {x: futureX, y: enemy.y, width: enemy.width, height: enemy.height};
            if (checkCollision(testRect, platform)) {
                willCollide = true;
                break;
            }
        }
        
        // Also reverse at screen edges
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            willCollide = true;
        }
        
        if (willCollide) {
            enemy.direction *= -1;
        }
        
        // Apply gravity to enemies too
        enemy.y += 5; // For simplicity, enemies don't have complex physics
        
        // Check if enemy falls off platform
        let onPlatform = false;
        for (let platform of platforms) {
            if (Math.abs(enemy.y + enemy.height - platform.y) < 5 && 
                enemy.y + enemy.height <= platform.y &&
                enemy.x + enemy.width > platform.x && 
                enemy.x < platform.x + platform.width) {
                enemy.y = platform.y - enemy.height;
                onPlatform = true;
                break;
            }
        }
        
        if (!onPlatform) {
            // Enemy falls off platform
            enemy.y += 5;
        }
        
        // Remove enemy if it falls off screen
        if (enemy.y > canvas.height) {
            enemies.splice(enemies.indexOf(enemy), 1);
        }
    }
    
    // Update moving platforms
    for (let platform of platforms) {
        if (platform.moving) {
            platform.x += platform.speed * platform.direction;
            
            if (platform.x <= platform.startX || platform.x + platform.width >= platform.endX) {
                platform.direction *= -1;
            }
        }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Auto-play navigation function
function autoNavigate() {
    // Simple AI to navigate the level
    // This is a basic implementation - could be improved with pathfinding algorithms
    
    // Calculate direction to exit
    const exitDirection = levelExit.x > player.x ? 1 : -1;
    
    // Check if we need to jump over obstacles or gaps
    let needsToJump = false;
    let needsToMove = true;
    
    // Look ahead to see if there's a gap
    const lookAheadDistance = player.width + 20;
    const testPoint = {
        x: player.x + lookAheadDistance * exitDirection,
        y: player.y + player.height + 10, // slightly below player feet
        width: 10,
        height: 10
    };
    
    // Check if there's ground ahead
    let groundAhead = false;
    for (let platform of platforms) {
        if (checkCollision(testPoint, platform)) {
            groundAhead = true;
            break;
        }
    }
    
    // If no ground ahead and we're not already jumping, we need to jump over the gap
    if (!groundAhead && !player.isJumping) {
        needsToJump = true;
    }
    
    // Check if there's an obstacle (like a wall) that requires jumping
    const obstacleCheck = {
        x: player.x + (exitDirection > 0 ? player.width : -10),
        y: player.y,
        width: 10,
        height: player.height
    };
    
    for (let platform of platforms) {
        if (checkCollision(obstacleCheck, platform)) {
            // There's a platform/wall in front, check if we can go under it or need to jump over
            if (platform.y < player.y + player.height) {
                needsToJump = true;
            }
        }
    }
    
    // Check for ladders near the player when needed
    for (let ladder of ladders) {
        if (Math.abs(player.x - ladder.x) < 50 && Math.abs(player.y - ladder.y) < 100) {
            // If player is near a ladder and needs to go up/down
            if (levelExit.y < player.y - 50) {
                // Need to climb up
                player.velocityY = -player.speed;
                player.velocityX = 0;
                return; // Skip other movement controls
            } else if (levelExit.y > player.y + 50) {
                // Need to climb down
                player.velocityY = player.speed;
                player.velocityX = 0;
                return; // Skip other movement controls
            }
        }
    }
    
    // Check for enemies that need to be attacked
    for (let enemy of enemies) {
        const distToEnemy = Math.abs(player.x - enemy.x);
        if (distToEnemy < 50 && Math.abs(player.y - enemy.y) < 30) {
            // If enemy is above, attack it
            if (enemy.y < player.y && enemy.y > player.y - 40) {
                player.isAttacking = true;
                player.attackTimer = 10;
            }
            // If enemy is at same level, try to avoid or jump over
            else if (Math.abs(player.y - enemy.y) < 20) {
                // Jump over enemy if possible
                needsToJump = true;
            }
        }
    }
    
    // Set movement based on calculated needs
    player.velocityX = exitDirection * player.speed;
    player.facingRight = exitDirection > 0;
    
    if (needsToJump) {
        if (!player.isJumping) {
            player.velocityY = -player.jumpPower;
            player.isJumping = true;
        }
    }
}

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 10,
            velocityY: (Math.random() - 0.5) * 10,
            life: 30,
            color: color
        });
    }
}

function playerDie() {
    player.health = 0;
    updateUI();
    gameState.current = 'GAME_OVER';
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

function completeLevel() {
    gameState.score += Math.floor(1000 / gameState.time) + player.health * 10; // Bonus points
    document.getElementById('levelScore').textContent = gameState.score;
    document.getElementById('levelCompleteScreen').style.display = 'flex';
    gameState.current = 'LEVEL_COMPLETE';
}

function updateUI() {
    document.getElementById('healthDisplay').textContent = player.health;
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('levelDisplay').textContent = gameState.level;
    document.getElementById('timeDisplay').textContent = Math.floor(gameState.time);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#8b4513'; // Brown background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw decorative background elements (Persian style)
    drawBackground();
    
    // Draw platforms
    ctx.fillStyle = '#5d4037'; // Dark brown
    for (let platform of platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add some texture to platforms
        ctx.strokeStyle = '#4e342e';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    // Draw traps
    for (let trap of traps) {
        if (trap.type === 'spikes') {
            ctx.fillStyle = '#2c2c2c'; // Dark gray for spikes
            // Draw triangle spikes
            ctx.beginPath();
            for (let i = 0; i < trap.width; i += 10) {
                ctx.moveTo(trap.x + i, trap.y + trap.height);
                ctx.lineTo(trap.x + i + 5, trap.y);
                ctx.lineTo(trap.x + i + 10, trap.y + trap.height);
            }
            ctx.closePath();
            ctx.fill();
        } else if (trap.type === 'falling') {
            ctx.fillStyle = '#795548'; // Brown for falling rocks
            ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
        }
    }
    
    // Draw exit
    ctx.fillStyle = '#4CAF50'; // Green for exit
    ctx.fillRect(levelExit.x, levelExit.y, levelExit.width, levelExit.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('EXIT', levelExit.x + 5, levelExit.y + 25);
    
    // Draw enemies
    for (let enemy of enemies) {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Draw simple face
        ctx.fillStyle = '#000';
        ctx.fillRect(enemy.x + 8, enemy.y + 10, 4, 4); // Left eye
        ctx.fillRect(enemy.x + 18, enemy.y + 10, 4, 4); // Right eye
        ctx.fillRect(enemy.x + 10, enemy.y + 20, 10, 2); // Mouth
    }
    
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player details (simple)
    ctx.fillStyle = '#000';
    // Eyes - adjust based on facing direction
    if (player.facingRight) {
        ctx.fillRect(player.x + 20, player.y + 10, 4, 4); // Right eye
        ctx.fillRect(player.x + 10, player.y + 10, 4, 4); // Left eye
    } else {
        ctx.fillRect(player.x + 10, player.y + 10, 4, 4); // Left eye
        ctx.fillRect(player.x + 20, player.y + 10, 4, 4); // Right eye
    }
    
    // Draw sword when attacking
    if (player.isAttacking) {
        ctx.fillStyle = '#C0C0C0'; // Silver
        if (player.facingRight) {
            ctx.fillRect(player.x + player.width, player.y + 15, 20, 5);
        } else {
            ctx.fillRect(player.x - 20, player.y + 15, 20, 5);
        }
    }
    
    // Draw particles
    for (let particle of particles) {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 30; // Fade out
        ctx.fillRect(particle.x, particle.y, 4, 4);
        ctx.globalAlpha = 1.0;
    }
    
    // Draw health bar
    const barWidth = 100;
    const barHeight = 10;
    const barX = 10;
    const barY = 10;
    
    // Background
    ctx.fillStyle = '#555';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Health fill
    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : (healthPercent > 0.25 ? '#FF9800' : '#F44336');
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Border
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}

function drawBackground() {
    // Draw some decorative Persian-style patterns
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Decorative arcs
    ctx.strokeStyle = '#8d6e63';
    for (let x = 50; x < canvas.width; x += 100) {
        for (let y = 50; y < canvas.height; y += 100) {
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI, true);
            ctx.stroke();
        }
    }
}

function gameLoop() {
    if (gameState.current !== 'PLAYING') {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Update game time
    gameState.time += 1/60; // Assuming 60fps
    if (Math.floor(gameState.time) % 5 === 0) {
        gameState.score++; // Small time bonus
    }
    
    updatePlayer();
    draw();
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

// Initialize the game
resetLevel(gameState.level);
updateUI();