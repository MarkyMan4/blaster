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
