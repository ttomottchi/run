
let bgImg, playerImg, enemyFrontImg, enemyLeftImg, enemyRightImg;
let startImg, clearImg, gameoverImg, retryImg;
let bgY = 0;
let playerX, playerY;
let playerSpeed = 5;
let enemies = [];
let enemySpawnInterval = 90;
let lastSpawnTime = 0;
let hp = 3;
let gameState = "start";
let startButton, retryButton;
let startTime;
let countdown = 3;
let timer = 66.6;
let goalLineY = -12800;
let leftPressed = false;
let rightPressed = false;
let leftBtn, rightBtn;

function preload() {
  bgImg = loadImage("images/bg.png");
  playerImg = loadImage("images/player.png");
  enemyFrontImg = loadImage("images/enemy_front.png");
  enemyLeftImg = loadImage("images/enemy_left.png");
  enemyRightImg = loadImage("images/enemy_right.png");
  startImg = loadImage("images/start.png");
  clearImg = loadImage("images/clear.png");
  gameoverImg = loadImage("images/gameover.png");
  retryImg = loadImage("images/retry.png");
}

function setup() {
  createCanvas(720, 1280);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(64);
  playerX = width / 2;
  playerY = height - 150;

  startButton = createImg("images/start.png");
  startButton.position(width / 2 - 150, height / 2 - 50);
  startButton.size(300, 100);
  startButton.mousePressed(() => {
    startButton.hide();
    gameState = "countdown";
    startTime = millis();
  });

  retryButton = createImg("images/retry.png");
  retryButton.position(width / 2 - 150, height / 2 + 100);
  retryButton.size(300, 100);
  retryButton.hide();
  retryButton.mousePressed(restartGame);

  // Left button
  leftBtn = createButton("◀");
  leftBtn.position(20, height - 100);
  leftBtn.size(100, 100);
  leftBtn.style("font-size", "32px");
  leftBtn.touchStarted(() => leftPressed = true);
  leftBtn.touchEnded(() => leftPressed = false);
  leftBtn.mousePressed(() => leftPressed = true);
  leftBtn.mouseReleased(() => leftPressed = false);

  // Right button
  rightBtn = createButton("▶");
  rightBtn.position(width - 120, height - 100);
  rightBtn.size(100, 100);
  rightBtn.style("font-size", "32px");
  rightBtn.touchStarted(() => rightPressed = true);
  rightBtn.touchEnded(() => rightPressed = false);
  rightBtn.mousePressed(() => rightPressed = true);
  rightBtn.mouseReleased(() => rightPressed = false);
}

function draw() {
  background(0);
  image(bgImg, width / 2, bgY + bgImg.height / 2);
  image(bgImg, width / 2, bgY + bgImg.height * 1.5);

  if (gameState === "start") {
    bgY += 2;
    bgY %= bgImg.height;
    startButton.show();
    leftBtn.hide();
    rightBtn.hide();
  } else if (gameState === "countdown") {
    leftBtn.show();
    rightBtn.show();
    let elapsed = (millis() - startTime) / 1000;
    let count = floor(3 - elapsed);
    fill(255);
    stroke(0);
    strokeWeight(8);
    text(count > 0 ? count : "START!", width / 2, height / 2);
    if (elapsed > 3) {
      gameState = "playing";
      startTime = millis();
    }
  } else if (gameState === "playing") {
    leftBtn.show();
    rightBtn.show();
    updateGame();
  } else if (gameState === "gameover") {
    image(gameoverImg, width / 2, height / 2);
    retryButton.show();
    leftBtn.hide();
    rightBtn.hide();
  } else if (gameState === "clear") {
    image(clearImg, width / 2, height / 2);
    retryButton.show();
    leftBtn.hide();
    rightBtn.hide();
  }

  if (gameState === "playing" || gameState === "countdown") {
    for (let i = 0; i < hp; i++) {
      image(playerImg, 60 + i * 100, 60, 96, 96);
    }
    fill(255);
    stroke(0);
    strokeWeight(6);
    text(nf(timer, 2, 1), width - 100, 60);
  }
}

function updateGame() {
  let elapsed = (millis() - startTime) / 1000;
  timer = max(0, 66.6 - elapsed);
  bgY -= 4;
  bgY %= bgImg.height;

  // player move
  if (keyIsDown(LEFT_ARROW) || leftPressed) playerX -= playerSpeed;
  if (keyIsDown(RIGHT_ARROW) || rightPressed) playerX += playerSpeed;
  playerX = constrain(playerX, 50, width - 50);

  image(playerImg, playerX, playerY, 96, 96);

  // spawn enemies
  if (frameCount - lastSpawnTime > enemySpawnInterval) {
    let type = random(["front", "left", "right"]);
    let x = type === "front" ? random(50, width - 50) : (type === "left" ? -50 : width + 50);
    let y = -100;
    let vx = type === "left" ? 3 : (type === "right" ? -3 : 0);
    enemies.push({ x, y, vx, vy: 4, type });
    lastSpawnTime = frameCount;
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    e.x += e.vx;
    e.y += e.vy;
    let img = e.type === "front" ? enemyFrontImg : (e.type === "left" ? enemyLeftImg : enemyRightImg);
    image(img, e.x, e.y, 96, 96);

    // collision
    if (dist(e.x, e.y, playerX, playerY) < 48) {
      enemies.splice(i, 1);
      hp--;
      if (hp <= 0) gameState = "gameover";
    } else if (e.y > height + 100) {
      enemies.splice(i, 1);
    }
  }

  // Goal line
  if (timer <= 0) {
    gameState = "clear";
  }
}

function restartGame() {
  hp = 3;
  timer = 66.6;
  enemies = [];
  bgY = 0;
  playerX = width / 2;
  retryButton.hide();
  gameState = "countdown";
  startTime = millis();
}
