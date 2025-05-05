// === グローバル変数 ===
let bgImage, playerImage, enemyFrontImage, enemyLeftImage, enemyRightImage;
let startImage, clearImage, gameoverImage, retryImage;
let leftButtonImage, rightButtonImage;

let playerX, playerY;
let enemies = [];
let gameState = "start"; // "start", "countdown", "playing", "clear", "gameover"
let startTime, countdownStart, hp = 3;
let virtualLeftPressed = false;
let virtualRightPressed = false;

const GAME_DURATION = 66.6;
const COUNTDOWN = 3;
const PLAYER_SPEED = 7;
const ENEMY_INTERVAL = 40;
const ENEMY_SPEED = 6;
const BACKGROUND_SPEED = 6;

let bgY = 0;
let fontSize = 32;

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
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(fontSize);
  fill(255);
  stroke(0);
  strokeWeight(4);
  playerX = width / 2;
  playerY = height - 150;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  if (gameState === "start") {
    image(bgImage, 0, 0, width, height);
    image(startImage, width / 2 - 150, height / 2 - 50);
  } else if (gameState === "countdown") {
    image(bgImage, 0, 0, width, height);
    let elapsed = (millis() - countdownStart) / 1000;
    let count = 3 - floor(elapsed);
    if (count > 0) {
      drawTextWithShadow(count.toString(), width / 2, height / 2);
    } else {
      gameState = "playing";
      startTime = millis();
    }
  } else if (gameState === "playing") {
    updateBackground();
    handleInput();
    moveEnemies();
    checkCollisions();
    drawPlayer();
    drawEnemies();
    drawHUD();
    spawnEnemies();

    let timeElapsed = (millis() - startTime) / 1000;
    if (timeElapsed >= GAME_DURATION) {
      gameState = "clear";
    }
  } else if (gameState === "clear") {
    image(bgImage, 0, 0, width, height);
    image(clearImage, width / 2 - 200, height / 2 - 100);
    image(retryImage, width / 2 - 150, height / 2 + 50);
  } else if (gameState === "gameover") {
    image(bgImage, 0, 0, width, height);
    image(gameoverImage, width / 2 - 200, height / 2 - 100);
    image(retryImage, width / 2 - 150, height / 2 + 50);
  }

  if (gameState !== "start" && gameState !== "clear" && gameState !== "gameover") {
    drawVirtualButtons();
  }
}
function updateBackground() {
  bgY += BACKGROUND_SPEED;
  image(bgImage, 0, -bgY % height, width, height);
  image(bgImage, 0, -bgY % height + height, width, height);
}

function drawTextWithShadow(txt, x, y) {
  stroke(0);
  strokeWeight(6);
  fill(255);
  textSize(64);
  text(txt, x, y);
}

function drawPlayer() {
  image(playerImage, playerX - 48, playerY - 48, 96, 96);
}

function handleInput() {
  if (keyIsDown(LEFT_ARROW) || virtualLeftPressed) {
    playerX -= PLAYER_SPEED;
  }
  if (keyIsDown(RIGHT_ARROW) || virtualRightPressed) {
    playerX += PLAYER_SPEED;
  }
  playerX = constrain(playerX, 48, width - 48);
}

function spawnEnemies() {
  if (frameCount % ENEMY_INTERVAL === 0) {
    let type = random(["front", "left", "right"]);
    let x = type === "front" ? random(50, width - 50) : (type === "left" ? 0 : width);
    enemies.push({ x: x, y: -100, type: type });
  }
}
function moveEnemies() {
  for (let e of enemies) {
    if (e.type === "front") {
      e.y += ENEMY_SPEED;
    } else if (e.type === "left") {
      e.x += 3;
      e.y += ENEMY_SPEED;
    } else if (e.type === "right") {
      e.x -= 3;
      e.y += ENEMY_SPEED;
    }
  }
}

function drawEnemies() {
  for (let e of enemies) {
    let img = e.type === "front" ? enemyFrontImage :
              e.type === "left" ? enemyLeftImage : enemyRightImage;
    image(img, e.x, e.y, 96, 96);
  }
}

function checkCollisions() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    let d = dist(playerX, playerY, e.x, e.y);
    if (d < 48) {
      enemies.splice(i, 1);
      hp--;
      if (hp <= 0) {
        gameState = "gameover";
      }
    } else if (e.y > height + 100 || e.x < -100 || e.x > width + 100) {
      enemies.splice(i, 1);
    }
  }
}

function drawHUD() {
  let remaining = GAME_DURATION - (millis() - startTime) / 1000;
  drawTextWithShadow(remaining.toFixed(1), width - 100, 40);
  for (let i = 0; i < hp; i++) {
    image(playerImage, 20 + i * 40, 20, 32, 32);
  }
}

function drawVirtualButtons() {
  image(leftButtonImage, 80, height - 100, 100, 100);
  image(rightButtonImage, width - 80, height - 100, 100, 100);
}

function touchStarted() {
  if (dist(mouseX, mouseY, 80, height - 100) < 50) {
    virtualLeftPressed = true;
  } else if (dist(mouseX, mouseY, width - 80, height - 100) < 50) {
    virtualRightPressed = true;
  }
  return false;
}

function touchEnded() {
  virtualLeftPressed = false;
  virtualRightPressed = false;
  return false;
}

function keyPressed() {
  if (gameState === "start" && key === " ") {
    gameState = "countdown";
    countdownStart = millis();
  }

  if ((gameState === "clear" || gameState === "gameover") && key === " ") {
    resetGame();
  }
}


