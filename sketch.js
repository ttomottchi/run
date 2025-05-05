
let bgImage, playerImage, enemyFrontImage, enemyLeftImage, enemyRightImage;
let startImage, clearImage, gameoverImage, retryImage;
let leftButtonImage, rightButtonImage;

let playerX, playerY;
let enemies = [];
let gameState = "start";
let startTime, countdownStart, hp = 3;
let virtualLeftPressed = false;
let virtualRightPressed = false;

const GAME_DURATION = 66.6;
const COUNTDOWN = 3;
const PLAYER_SPEED = 7;
const ENEMY_INTERVAL = 40;
const ENEMY_SPEED = 6;
const BACKGROUND_SPEED = 6;

let bgOffset = 0;
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
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  playerX = width / 2;
  playerY = height - 100;
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
    let timeElapsed = (millis() - startTime) / 1000;
    if (timeElapsed >= GAME_DURATION) gameState = "clear";
    drawVirtualButtons();
  } else if (gameState === "clear") {
    image(clearImage, width / 2, height / 2 - 100);
    image(retryImage, width / 2, height / 2 + 100);
  } else if (gameState === "gameover") {
    image(gameoverImage, width / 2, height / 2 - 100);
    image(retryImage, width / 2, height / 2 + 100);
  }
}

function drawScrollingBackground() {
  bgOffset += BACKGROUND_SPEED;
  let bgHeight = bgImage.height;
  for (let y = -bgHeight; y < height; y += bgHeight) {
    image(bgImage, width / 2, y + (bgOffset % bgHeight), width, bgHeight);
  }
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
  if (frameCount % ENEMY_INTERVAL === 0) {
    let type = random(["front", "left", "right"]);
    let x = type === "front" ? random(50, width - 50) : (type === "left" ? 0 : width);
    enemies.push({ x: x, y: -100, type: type });
  }
}

function handleEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    if (e.type === "front") e.y += ENEMY_SPEED;
    else if (e.type === "left") { e.x += 3; e.y += ENEMY_SPEED; }
    else { e.x -= 3; e.y += ENEMY_SPEED; }

    let img = e.type === "front" ? enemyFrontImage :
              e.type === "left" ? enemyLeftImage : enemyRightImage;
    image(img, e.x, e.y, 96, 96);

    if (dist(playerX, playerY, e.x, e.y) < 48) {
      enemies.splice(i, 1);
      hp--;
      if (hp <= 0) gameState = "gameover";
    } else if (e.y > height + 100) {
      enemies.splice(i, 1);
    }
  }
}

function drawHUD() {
  let remaining = GAME_DURATION - (millis() - startTime) / 1000;
  drawText(remaining.toFixed(1), width - 100, 40);
  for (let i = 0; i < hp; i++) {
    image(playerImage, 20 + i * 40, 40, 32, 32);
  }
}

function drawVirtualButtons() {
  if (windowWidth < 768) {
    image(leftButtonImage, 80, height - 100, 100, 100);
    image(rightButtonImage, width - 80, height - 100, 100, 100);
  }
}

function touchStarted() {
  if (gameState === "start") {
    gameState = "countdown";
    countdownStart = millis();
    return false;
  }
  if (["clear", "gameover"].includes(gameState)) {
    resetGame();
    return false;
  }
  if (dist(mouseX, mouseY, 80, height - 100) < 50) virtualLeftPressed = true;
  if (dist(mouseX, mouseY, width - 80, height - 100) < 50) virtualRightPressed = true;
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
}
