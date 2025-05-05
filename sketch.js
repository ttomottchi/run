// sketch.js 完全版

let bgImage, playerImage, enemyFrontImage, enemyLeftImage, enemyRightImage;
let startImage, clearImage, gameoverImage, retryImage;
let leftButtonImage, rightButtonImage;

let seStart, seHit, seClear, seGameover;

let playerX, playerY;
let enemies = [];
let particles = [];
let gameState = "start";
let startTime, countdownStart, hp = 3;
let virtualLeftPressed = false;
let virtualRightPressed = false;

const GAME_DURATION = 66.6;
const COUNTDOWN = 3;
const PLAYER_SPEED = 7;
const ENEMY_INTERVAL = 40;
const BACKGROUND_SPEED = 6;
const ENEMY_SPEED_BASE = 4;

let bgOffset = 0;
let rushMode = false;
let rushStartTime = 0;

function preload() {
  bgImage = loadImage("images/bg.png");
  playerImage = loadImage("images/player.png");
  enemyFrontImage = loadImage("images/enemy_front.png");
  enemyLeftImage = loadImage("images/enemy_left.png");
  enemyRightImage = loadImage("images/enemy_right.png");
  startImage = loadImage("images/start.png");
  clearImage = loadImage("images/clear.png");
  gameoverImage = loadImage("images/gameover.png");
  retryImage = loadImage("images/retry.png");
  leftButtonImage = loadImage("images/left_button.png");
  rightButtonImage = loadImage("images/right_button.png");

  seStart = loadSound("sounds/start.mp3");
  seHit = loadSound("sounds/hit.mp3");
  seClear = loadSound("sounds/clear.mp3");
  seGameover = loadSound("sounds/gameover.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  playerX = width / 2;
  playerY = height - 100;
  setInterval(() => {
    rushMode = true;
    rushStartTime = millis();
  }, 20000);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  if (["start", "clear", "gameover"].includes(gameState)) {
    drawStaticBackground();
  } else {
    drawScrollingBackground();
  }

  if (gameState === "start") {
    image(startImage, width / 2, height / 2);
  } else if (gameState === "countdown") {
    let elapsed = (millis() - countdownStart) / 1000;
    let count = 3 - floor(elapsed);
    drawHUD();
    if (count > 0) {
      drawText(count.toString(), width / 2, height / 2);
    } else {
      gameState = "playing";
      startTime = millis();
    }
  } else if (gameState === "playing") {
    movePlayer();
    drawPlayer();
    handleEnemies();
    drawHUD();
    spawnEnemies();
    if ((millis() - startTime) / 1000 >= GAME_DURATION) {
      gameState = "clear";
      seClear.play();
      createGoalParticles();
    }
    drawVirtualButtons();
  } else if (gameState === "clear") {
    image(clearImage, width / 2, height / 2 - 100);
    image(retryImage, width / 2, height / 2 + 100);
    updateParticles();
  } else if (gameState === "gameover") {
    image(gameoverImage, width / 2, height / 2 - 100);
    image(retryImage, width / 2, height / 2 + 100);
  }

  if (rushMode && millis() - rushStartTime > 3000) {
    rushMode = false;
  }
}

function drawScrollingBackground() {
  bgOffset = (bgOffset + BACKGROUND_SPEED) % bgImage.height;
  image(bgImage, width / 2, bgOffset - bgImage.height / 2, width, bgImage.height);
  image(bgImage, width / 2, bgOffset + bgImage.height / 2, width, bgImage.height);
}

function drawStaticBackground() {
  image(bgImage, width / 2, height / 2, width, height);
}

function drawText(txt, x, y) {
  stroke(0);
  strokeWeight(6);
  fill(255);
  textSize(64);
  text(txt, x, y);
}

function drawPlayer() {
  image(playerImage, playerX, playerY, 96, 96);
}

function movePlayer() {
  if (keyIsDown(LEFT_ARROW) || virtualLeftPressed) playerX -= PLAYER_SPEED;
  if (keyIsDown(RIGHT_ARROW) || virtualRightPressed) playerX += PLAYER_SPEED;
  playerX = constrain(playerX, 48, width - 48);
}

function spawnEnemies() {
  let interval = rushMode ? ENEMY_INTERVAL / 2 : ENEMY_INTERVAL;
  if (frameCount % interval === 0) {
    let num = rushMode ? 4 : floor(random(1, 4));
    for (let i = 0; i < num; i++) {
      let type;
      if (rushMode) {
        type = "front";
      } else {
        type = random(["front", "left", "right", "front", "front"]);
      }
      let x = type === "front" ? random(width / 2 - 60, width / 2 + 60) : (type === "left" ? 0 : width);
      let y = type === "front" ? -100 : random(height / 3, height / 2); // 横敵は中央付近に出現
      enemies.push({ x, y, type, vx: 0, vy: 0, t: 0 });
    }
  }
}

function handleEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    e.t++;
    if (e.type === "front") {
      if (e.t % 60 === 0) {
        let angle = random(-PI / 4, PI / 4);
        e.vx = 3 * sin(angle);
        e.vy = ENEMY_SPEED_BASE + 3 * cos(angle);
      }
    } else if (e.type === "left" || e.type === "right") {
      let angle = e.type === "left" ? random(PI / 12, PI / 3) : random(2 * PI / 3, 11 * PI / 12);
      let speed = ENEMY_SPEED_BASE + random(0, 3);
      e.vx = speed * cos(angle);
      e.vy = speed * sin(angle);
    }
    e.x += e.vx;
    e.y += e.vy;

    let img = e.type === "front" ? enemyFrontImage : e.type === "left" ? enemyLeftImage : enemyRightImage;
    image(img, e.x, e.y, 96, 96);

    if (dist(playerX, playerY, e.x, e.y) < 48) {
      enemies.splice(i, 1);
      hp--;
      seHit.play();
      if (hp <= 0) {
        gameState = "gameover";
        seGameover.play();
      }
    } else if (e.y > height + 100 || e.x < -100 || e.x > width + 100) {
      enemies.splice(i, 1);
    }
  }
}

function drawHUD() {
  let remaining = gameState === "playing" ? GAME_DURATION - (millis() - startTime) / 1000 :
                 gameState === "countdown" ? GAME_DURATION : 66.6;
  drawText(remaining.toFixed(1), width - 100, 40);

  for (let i = 0; i < hp; i++) {
    image(playerImage, 20 + i * 60, 40, 48, 48);
  }
}

function drawVirtualButtons() {
  if (windowWidth < 768) {
    tint(255, 127);
    image(leftButtonImage, 80, height - 80, 64, 64);
    image(rightButtonImage, width - 80, height - 80, 64, 64);
    noTint();
  }
}

function touchStarted() {
  if (gameState === "start") {
    gameState = "countdown";
    countdownStart = millis();
    seStart.play();
    return false;
  }
  if (["clear", "gameover"].includes(gameState)) {
    resetGame();
    return false;
  }
  if (dist(mouseX, mouseY, 80, height - 80) < 50) virtualLeftPressed = true;
  if (dist(mouseX, mouseY, width - 80, height - 80) < 50) virtualRightPressed = true;
  return false;
}

function touchEnded() {
  virtualLeftPressed = false;
  virtualRightPressed = false;
  return false;
}

function mousePressed() {
  if (gameState === "start") {
    gameState = "countdown";
    countdownStart = millis();
    seStart.play();
  }
  if (["clear", "gameover"].includes(gameState)) {
    resetGame();
  }
}

function resetGame() {
  gameState = "countdown";
  enemies = [];
  hp = 3;
  bgOffset = 0;
  countdownStart = millis();
  particles = [];
}

function createGoalParticles() {
  for (let i = 0; i < 100; i++) {
    let angle = random(TWO_PI);
    let speed = random(2, 6);
    particles.push({
      x: width / 2,
      y: height / 2,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      life: 255,
      size: random(4, 10),
      color: [random(200, 255), random(200, 255), random(200, 255)]
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 4;
    if (p.life <= 0) {
      particles.splice(i, 1);
    } else {
      noStroke();
      fill(p.color[0], p.color[1], p.color[2], p.life);
      ellipse(p.x, p.y, p.size);
    }
  }
}
