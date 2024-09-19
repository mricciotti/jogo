// Configurações do jogo
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

// Variáveis globais
let player;
let cursors;
let enemyCars = [];
let track;
const LEFT_LIMIT = 150;  // Limite esquerdo da pista preta
const RIGHT_LIMIT = 650; // Limite direito da pista preta
const MIN_DISTANCE = 100; // Distância mínima entre os carros inimigos
let score = 0; // Pontuação inicial
let scoreText; // Texto da pontuação
let gameStarted = false; // Variável para controlar o estado do jogo

const game = new Phaser.Game(config);

function preload() {
    // Carregando imagens
    this.load.image('car', 'img/car.png');
    this.load.image('enemyCar', 'img/enemy_car.png');
    this.load.image('track', 'img/track.png');
}

function create() {
    // Adicionando a pista e permitindo que ela role
    track = this.add.tileSprite(400, 300, 800, 600, 'track');
    
    // Adicionando o carro do jogador
    player = this.physics.add.sprite(400, 500, 'car');
    player.setCollideWorldBounds(true);
    
    // Configurando o teclado
    cursors = this.input.keyboard.createCursorKeys();
    
    // Adicionando carros adversários
    createEnemyCars(this);

    // Inicialmente, o jogo está pausado até o botão "Jogar" ser pressionado
    this.physics.pause();

    // Exibindo a pontuação inicial
    scoreText = document.getElementById('score');
}

function update() {
    if (!gameStarted) return; // Se o jogo não começou, não faça nada

    // Movimento do carro do jogador
    if (cursors.left.isDown) {
        player.setVelocityX(-300);
    } else if (cursors.right.isDown) {
        player.setVelocityX(300);
    } else {
        player.setVelocityX(0);
    }
    
    // Verificando os limites para o carro do jogador
    if (player.x < LEFT_LIMIT) {
        player.x = LEFT_LIMIT;
    } else if (player.x > RIGHT_LIMIT) {
        player.x = RIGHT_LIMIT;
    }

    // Movimento da pista
    track.tilePositionY -= 5;

    // Incrementando a pontuação
    increaseScore();

    // Movendo os carros adversários e verificando colisão
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

// Função para incrementar a pontuação
function increaseScore() {
    score += 1; // Incrementa a pontuação com base na distância percorrida
    scoreText.innerHTML = 'Pontuação: ' + score; // Atualiza o texto da pontuação
}

// Função para criar carros adversários
function createEnemyCars(scene) {
    for (let i = 0; i < 3; i++) {
        let validPosition = false;
        let enemyX, enemyY;

        // Tentativa de encontrar uma posição válida para o carro inimigo
        while (!validPosition) {
            enemyX = Phaser.Math.Between(LEFT_LIMIT, RIGHT_LIMIT);
            enemyY = Phaser.Math.Between(-600, -100);

            // Verifica se a posição escolhida é válida
            if (isValidEnemyPosition(enemyX, enemyY)) {
                validPosition = true;
            }
        }

        let enemy = scene.physics.add.sprite(enemyX, enemyY, 'enemyCar');
        enemyCars.push(enemy);
        enemy.setVelocityY(200);
    }
}

// Função para verificar se a posição do carro inimigo é válida
function isValidEnemyPosition(x, y) {
    for (let enemy of enemyCars) {
        let distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
        if (distance < MIN_DISTANCE) {
            return false; // Posição não é válida, está muito próxima de outro carro
        }
    }
    return true; // Posição é válida
}

// Função para tratar a colisão
function handleCollision(scene) {
    scene.physics.pause();
    player.setTint(0xff0000);
    document.getElementById('restartButton').style.display = 'block'; // Mostra o botão "Jogar Novamente"
}

// Função chamada ao clicar no botão "Jogar"
function startGame() {
    gameStarted = true; // Define que o jogo começou
    score = 0; // Reinicia a pontuação
    scoreText.innerHTML = 'Pontuação: ' + score; // Reinicia o texto da pontuação
    game.scene.scenes[0].physics.resume(); // Retoma a física do jogo
    document.getElementById('startButton').style.display = 'none'; // Esconde o botão de "Jogar"
}

// Função chamada ao clicar no botão "Jogar Novamente"
function restartGame() {
    gameStarted = true; // Define que o jogo começou
    score = 0; // Reinicia a pontuação
    scoreText.innerHTML = 'Pontuação: ' + score; // Reinicia o texto da pontuação
    document.getElementById('restartButton').style.display = 'none'; // Esconde o botão de "Jogar Novamente"
    
    // Reinicia as posições dos carros
    player.clearTint();
    player.x = 400;
    player.y = 500;
    enemyCars.forEach(enemy => {
        enemy.x = Phaser.Math.Between(LEFT_LIMIT, RIGHT_LIMIT);
        enemy.y = Phaser.Math.Between(-600, -100);
    });

    game.scene.scenes[0].physics.resume(); // Retoma a física do jogo
}
