// Variáveis do Jogo
const pads = document.querySelectorAll('.pad');
const startButton = document.getElementById('start-button');
const levelDisplay = document.getElementById('level');
const messageDisplay = document.getElementById('message');
const gameBoard = document.querySelector('.game-board');

// Cores disponíveis para o Genius
const colors = ['green', 'red', 'yellow', 'blue'];

// Sequência que o Genius gera
let geniusSequence = [];

// Sequência que o jogador está tentando replicar
let playerSequence = [];

// Nível atual do jogo
let level = 1;

// Flag para saber se é a vez do jogador
let isPlayerTurn = false;

// Flag para saber se o jogo está ativo
let gameRunnig = false;

// Velocidade de exibição de sequência (em ms)
const sequenceSpeed = 800;

// Efeitos Sonoros (Mapeamento de Frequências)

// Criando um AudioContext para gerar sons de forma programática (mais simples que carregar arquivos .mp3)
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// Frequências aproximadas para simular os tons do Genius
const soundFrequencies = {

    green: 261.63, // C4
    red: 329.63, // E4
    yellow: 392.00, // G4
    blue: 493.88 // B4

}

// Toca um tom com a frequência especificada
function PlayTone(frequency, duration = 0.3){

    if(!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine'; // Onda senoidal para um som mais 'puro'
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Ajusta o volume
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);

}

// Funções de Lógica do Jogo

// Inicia o jogo, limpa sequência e avança para a próxima rodada.
function StartGame(){

    if(gameRunnig) return; // Não iniciar se já estiver rodando

    gameRunnig = true;
    level = 1;
    geniusSequence = [];
    playerSequence = [];
    isPlayerTurn = false;

    levelDisplay.textContent = level;
    messageDisplay.textContent = 'Observe a sequência!';
    startButton.disabled = true;

    NextRound();

}

// Adiciona um novo passo à sequência do Genius e a exibe
function NextRound(){

    isPlayerTurn = true;
    playerSequence = [];
    gameBoard.classList.add('unclickable'); // Impede cliques enquantos o Genius joga

    // 1. Gera a nova cor
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    geniusSequence.push(randomColor);

    // 2. Exibe o nível
    levelDisplay.textContent = level;

    // 3. Reproduz a sequência
    PlaySequence(geniusSequence);

}

// Exibe a sequência de cores do Genius
function PlaySequence(sequence){

    let i = 0;
    
    const interval = setInterval(() => {

        const color = sequence[i];
        LightUp(color); // Acende a cor
        PlayTone(soundFrequencies[color]); // Toca o som

        i++;

        if(i >= sequence.length){

            clearInterval(interval);

            // Depois de reproduzir, é a vez do jogador
            setTimeout(StartPlayerTurn, sequenceSpeed);

        }

    }, sequenceSpeed); // O tempo entre as luzes

}

// Ativa o modo de jogada do usuário
function StartPlayerTurn(){

    isPlayerTurn = true;
    messageDisplay.textContent = 'Sua vez de jogar!';
    gameBoard.classList.remove('unclickable'); // Permite cliques

}

// Acende um botão de cor específica e o apaga em seguida
function LightUp(color){

    const padElement = document.getElementById(color);
    padElement.classList.add('active'); // Adiciona a classe de brilho

    setTimeout(() => {

        padElement.classList.remove('active'); // Remova a classe para apagar

    }, sequenceSpeed / 2); // Tempo de luz acesa

}

// Lida com o clique do jogador em um dos botões
function HandlePlayerClick(event){

    if(!isPlayerTurn || !gameRunnig) return;

    const clickedPad = event.target;
    const clickedColor = clickedPad.dataset.color;

    if(!clickedColor) return; // Garante que clicou em um pad

    // 1. Registra e Toca o som/brilho do clique
    playerSequence.push(clickedColor);
    PlayTone(soundFrequencies[clickedColor], 0.15);

    // Adiciona a classe 'active' temporariamente no clique
    clickedPad.classList.add('active');
    setTimeout(() => clickedPad.classList.remove('active'), 150);

    // 2. Verifica a jogada
    const index = playerSequence.length - 1;
    if(clickedColor !== geniusSequence[index]){

        // Errou!
        GameOver();
        return;

    }

    // 3. Se o jogador completou a sequência do nível
    if(playerSequence.length === geniusSequence.length){

        // Acertou o nível
        level++;
        messageDisplay.textContent = `Parabéns! Nível ${level - 1} completo!`;

        // Pequena pausa antes do próximo nível
        setTimeout(NextRound, 1500);

    }

}

// Finaliza o jogo após um erro
function GameOver(){

    gameRunnig = false;
    isPlayerTurn = false;
    gameBoard.classList.add('unclickable');

    messageDisplay.textContent = `Fim de Jogo! Você chegou ao Nível ${level}. Tente Novamente!`;
    startButton.disabled = false;

}

// Event Listeners

// 1. Ouve o clique no botão Iniciar
startButton.addEventListener('click', StartGame);

// 2. Ouve os cliques nos quadrantes coloridos
gameBoard.addEventListener('click', HandlePlayerClick); 