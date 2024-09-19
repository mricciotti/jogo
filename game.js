const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let player;
let cursors;
let enemyCars = [];
let track;
const LEFT_LIMIT = 190;  
const RIGHT_LIMIT = 650; 
const MIN_DISTANCE = 100; 
let score = 0;
let scoreText; 
let gameStarted = false; 

const game = new Phaser.Game(config);

function preload() {
    this.load.image('car', './img/car.png');
    this.load.image('enemyCar', './img/enemy_car.png');
    this.load.image('track', './img/track.png');
}

function create() {
    track = this.add.tileSprite(400, 300, 800, 600, 'track');
    
    player = this.physics.add.sprite(400, 500, 'car');
    player.setCollideWorldBounds(true);
    
    cursors = this.input.keyboard.createCursorKeys();
    
    createEnemyCars(this);

    this.physics.pause();

    scoreText = document.getElementById('score');
}

function update() {
    if (!gameStarted) return; 

    if (cursors.left.isDown) {
        player.setVelocityX(-300);
    } else if (cursors.right.isDown) {
        player.setVelocityX(300);
    } else {
        player.setVelocityX(0);
    }
    
    if (player.x < LEFT_LIMIT) {
        player.x = LEFT_LIMIT;
    } else if (player.x > RIGHT_LIMIT) {
        player.x = RIGHT_LIMIT;
    }

    track.tilePositionY -= 5;

    increaseScore();

    enemyCars.forEach(enemy => {
        if (enemy.y > 600) {
            enemy.y = -100;
            enemy.x = Phaser.Math.Between(LEFT_LIMIT, RIGHT_LIMIT);
        }
        
        if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), enemy.getBounds())) {
            handleCollision(this);
        }
    });
}

function increaseScore() {
    score += 1;
    scoreText.innerHTML = 'Pontuação: ' + score; 
}

function createEnemyCars(scene) {
    for (let i = 0; i < 3; i++) {
        let validPosition = false;
        let enemyX, enemyY;

        while (!validPosition) {
            enemyX = Phaser.Math.Between(LEFT_LIMIT, RIGHT_LIMIT);
            enemyY = Phaser.Math.Between(-600, -100);

            if (isValidEnemyPosition(enemyX, enemyY)) {
                validPosition = true;
            }
        }

        let enemy = scene.physics.add.sprite(enemyX, enemyY, 'enemyCar');
        enemyCars.push(enemy);
        enemy.setVelocityY(200);
    }
}

function isValidEnemyPosition(x, y) {
    for (let enemy of enemyCars) {
        let distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
        if (distance < MIN_DISTANCE) {
            return false; 
        }
    }
    return true; 
}

function handleCollision(scene) {
    scene.physics.pause();
    player.setTint(0xff0000);
    document.getElementById('restartButton').style.display = 'block';
}

function startGame() {
    gameStarted = true; 
    score = 0; 
    scoreText.innerHTML = 'Pontuação: ' + score; 
    game.scene.scenes[0].physics.resume(); 
    document.getElementById('startButton').style.display = 'none'; 
}

function restartGame() {
    gameStarted = true; 
    score = 0; 
    scoreText.innerHTML = 'Pontuação: ' + score; 
    document.getElementById('restartButton').style.display = 'none'; 
    
    player.clearTint();
    player.x = 400;
    player.y = 500;
    enemyCars.forEach(enemy => {
        enemy.x = Phaser.Math.Between(LEFT_LIMIT, RIGHT_LIMIT);
        enemy.y = Phaser.Math.Between(-600, -100);
    });

    game.scene.scenes[0].physics.resume(); 
}
