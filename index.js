var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var gameOver = false;
var score = 0;

var cannonHeight = 10;
var cannonWidth = 10;
var pWidth = 50;
var pHeight = 50;
var px = (canvas.width / 2) - (pWidth / 2);
var py = canvas.height - (pHeight + (pHeight * 0.5));

var leftPressed = false;
var rightPressed = false;

var lasers = [];
var lWidth = 5;
var lHeight = 30;

var eWidth = 40;
var eHeight = 40;
var enemyInterval = 750;
var eSpeed = 5;
var enemies = [];
var speedInterval = 10000;

var plus100s = [];
var explosions = [];
var colors = ["red", "orange", "yellow", "blue", "blueviolet", "violet", "mediumspringgreen", "coral"];

window.setInterval(spawnEnemy, enemyInterval);
window.setInterval(speedUp, speedInterval);

// space bar pressed
document.addEventListener('keydown', function(event) {
	if(event.keyCode == 32) {
		shoot();
	}
	if(event.keyCode == 65 || event.keyCode == 37) {
		leftPressed = true;
	}
	if(event.keyCode == 68 || event.keyCode == 39) {
		rightPressed = true;
	}
});

document.addEventListener('keyup', function(event) {
	if(event.keyCode == 65 || event.keyCode == 37) {
		leftPressed = false;
	}
	else if(event.keyCode == 68 || event.keyCode == 39) {
		rightPressed = false;
	}
});

function drawPlayer() {
	ctx.beginPath();
	ctx.rect(px, py, pWidth, pHeight);
	ctx.rect(px + ((pWidth / 2) - (cannonWidth / 2)), py - cannonHeight, cannonWidth, cannonHeight);
	ctx.fillStyle = "white";
	ctx.fill();
	ctx.stroke();

	if(leftPressed) {
		if(px >= 0) {
			px -= 7;
		}
	}
	else if(rightPressed) {
		if(px + pWidth <= canvas.width) {
			px += 7;
		}
	}
}

function spawnEnemy() {
	ex = Math.random() * canvas.width;

	while(ex + eWidth > canvas.width) {
		ex = Math.random() * canvas.width;
	}

	enemy = {
		x: ex,
		y: 0 - eHeight
	}

	enemies.push(enemy);
}

function speedUp() {
	eSpeed += 1;
}

function shoot() {
	laser = {
		x: px + ((pWidth / 2) - (lWidth / 2)),
		y: py - lHeight
	}

	lasers.push(laser);
}

function drawLasers() {
	var outOfBoundsLasers = [];

	for(var i = 0; i < lasers.length; i++) {
		laser = lasers[i];

		ctx.beginPath();
		ctx.rect(laser.x, laser.y, lWidth, lHeight);
		ctx.fillStyle = "aqua";
		ctx.fill();
		// ctx.stroke();
	
		laser.y -= 10;
		if(laser.y + lHeight <= 0) {
			outOfBoundsLasers.push(laser);
		}
	}

	removeLasers(outOfBoundsLasers);
}

function updateEnemies() {
	var outOfBoundsEnemies = [];

	for(var i = 0; i < enemies.length; i++) {
		enemy = enemies[i];

		ctx.beginPath();
		ctx.rect(enemy.x, enemy.y, eWidth, eHeight);
		ctx.fillStyle = "red";
		ctx.fill();
		ctx.stroke();

		enemy.y += eSpeed;

		if(enemy.y >= canvas.height) {
			outOfBoundsEnemies.push(enemy);
		}
	}

	removeEnemies(outOfBoundsEnemies);
}

function checkLaserCollision() {
	var deadEnemies = [];
	var collidedLasers = [];

	for(var i = 0; i < lasers.length; i++) {
		for(var j = 0; j < enemies.length; j++) {
			laser = lasers[i];
			enemy = enemies[j];

			if(laser.y <= enemy.y + eHeight
				&& laser.x <= enemy.x + eWidth
				&& laser.x + lWidth >= enemy.x) {

				deadEnemies.push(enemy);
				collidedLasers.push(laser);

				plus100s.push(
					{
						'x' : enemy.x + (eWidth / 2), 
						'y' : enemy.y + eHeight / 2 + 10, 
						'max' : enemy.y - 50
					});

				particleSize = eWidth / 3;

				// coordinates of 4 squares representing enemy exploding
				explosions.push (
					{
						'xs' : [enemy.x, enemy.x + particleSize, enemy.x + (particleSize * 2), 
								enemy.x, enemy.x + (particleSize * 2),
								enemy.x, enemy.x + particleSize, enemy.x + (particleSize * 2)],
						'ys' : [enemy.y, enemy.y, enemy.y,
								enemy.y + particleSize, enemy.y + particleSize,
								enemy.y + (particleSize * 2), enemy.y + (particleSize * 2), enemy.y + (particleSize * 2)],
						'max' : enemy.x - 40
					});

				score += 100;
			}
		}
	}

	removeEnemies(deadEnemies);
	removeLasers(collidedLasers);
}

function checkPlayerEnemyCollision() {
	for(var i = 0; i < enemies.length; i++) {
		enemy = enemies[i];

		if(enemy.y + eHeight >= py
			&& enemy.x <= px + pWidth
			&& enemy.x + eWidth >= px) {

			gameOver = true;
		}
	}
}

function drawExplosions() {
	var explosionsToRemove = [];

	for(var i = 0; i < explosions.length; i++) {
		explosion = explosions[i];

		explosion.xs[0] -= 3;
		explosion.ys[0] -= 3;

		explosion.xs[1] += 0;
		explosion.ys[1] -= 2;

		explosion.xs[2] += 3;
		explosion.ys[2] -= 3;

		explosion.xs[3] -= 2;
		explosion.ys[3] += 0;

		explosion.xs[4] += 2;
		explosion.ys[4] += 0;

		explosion.xs[5] -= 3;
		explosion.ys[5] += 3;

		explosion.xs[6] += 0;
		explosion.ys[6] += 2;

		explosion.xs[7] += 3;
		explosion.ys[7] += 3;

		// draw all explosion pieces
		for(var j = 0; j < explosion.xs.length; j++) {
			ctx.beginPath();
			ctx.rect(explosion.xs[j], explosion.ys[j], eWidth / 3, eHeight / 3);
			ctx.fillStyle = colors[j % colors.length];
			ctx.fill();
			ctx.stroke();
		}

		if(explosion.xs[0] <= explosion.max) {
			explosionsToRemove.push(explosion);
		}
	}

	removeExplosion(explosionsToRemove);
}

function removeExplosion(explosionsToRemove) {
	for(var i = 0; i < explosionsToRemove.length; i++) {
		explosion = explosionsToRemove[i];
		index = explosions.indexOf(explosion);

		if (index > -1) {
			explosions.splice(index, 1);
		}
	}
}

function drawPlus100() {
	var itemsToRemove = [];

	for(var i = 0; i < plus100s.length; i++) {
		var plus100 = plus100s[i];

		ctx.font = "15px Sans-Serif";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText("+100", plus100.x, plus100.y);

		plus100.y -= 1;

		if(plus100.y <= plus100.max) {
			itemsToRemove.push(plus100);
		}
	}

	removePlus100s(itemsToRemove);
}

function removePlus100s(itemsToRemove) {
	for(var i = 0; i < itemsToRemove.length; i++) {
		plus100 = itemsToRemove[i];
		index = plus100s.indexOf(plus100);

		if (index > -1) {
			plus100s.splice(index, 1);
		}
	}
}

function removeEnemies(enemiesToRemove) {
	for(var i = 0; i < enemiesToRemove.length; i++) {
		enemy = enemiesToRemove[i];
		index = enemies.indexOf(enemy);

		if (index > -1) {
			enemies.splice(index, 1);
		}
	}
}

function removeLasers(lasersToRemove) {
	for(var i = 0; i < lasersToRemove.length; i++) {
		laser = lasersToRemove[i];
		index = lasers.indexOf(laser);

		if (index > -1) {
			lasers.splice(index, 1);
		}
	}
}

function gameOverScreen() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "40px Sans-Serif";
	ctx.fillStyle = "red";
	ctx.textAlign = "center";
	ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50);
	
	ctx.font = "30px Sans-Serif";
	ctx.fillStyle = "white";
	ctx.fillText("Final Score: " + score, canvas.width / 2, canvas.height / 2);
}

function showScore() {
	ctx.font = "18px Sans-Serif";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.fillText("Score: " + score, canvas.width / 2, 30);
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	checkLaserCollision();
	drawPlus100();
	drawExplosions();
	checkPlayerEnemyCollision();
	drawPlayer();
	drawLasers();
	updateEnemies();
	showScore();

	if(gameOver) {
		gameOverScreen();
	}
	else {
		requestAnimationFrame(draw);
	}
}

draw();
