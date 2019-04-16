var gameIDEntry;
var GDEE;
var GAEE;
var GASE;
var GFE;

function create() {
    this.socket = io('/gameRoom');
    gameIDEntry = document.getElementById('gameIDEntry');
    GDEE = document.getElementById('gameDoesntExistError');
    GAEE = document.getElementById('gameExistsError');
    GASE = document.getElementById('gameAlreadyStartedError');
    GFE = document.getElementById('gameFullError');

    this.socket.on('GameDoesntExist', function () {
        GDEE.style.display = '';
    });

    this.socket.on('GameAlreadyExists', function () {
        GAEE.style.display = '';
    });

    this.socket.on('GameAlreadyStarted', function () {
        GASE.style.display = '';
    });

    this.socket.on('GameFull', function () {
        GFE.style.display = '';
    });

    this.socket.on('ClearToConnect', function () {
        sessionStorage.setItem('gameID', gameIDEntry.value);
        location.href = '/game.html';
    });
}

function createGame() {
    GASE.style.display = 'none';
    GAEE.style.display = 'none';
    GDEE.style.display = 'none';
    GFE.style.display = 'none';
    socket.emit('CreateGame', gameIDEntry.value);
}

function joinGame() {
    GASE.style.display = 'none';
    GAEE.style.display = 'none';
    GDEE.style.display = 'none';
    GFE.style.display = 'none';
    socket.emit('JoinGame', gameIDEntry.value);
}