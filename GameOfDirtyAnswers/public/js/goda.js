var isHost = false;
var isJudge = false;
var disconnectOP = false;
var winner;
var body;
var gameStarted;
var usernameInvalid;
var playerList;
var waiting;
var userForm;
var game;
var responses;

function create() {
    this.socket = io();

    winner = document.getElementById('winner');
    body = document.getElementById('body');
    gameStarted = document.getElementById('gameStarted');
    usernameInvalid = document.getElementById('usernameInvalid');
    playerList = document.getElementById('playerList');
    waiting = document.getElementById('waiting');
    userForm = document.getElementById('userForm');
    game = document.getElementById('game');
    responses = document.getElementById('responses');


    this.socket.on('Connected', function (host) {
        body.style.visibility = 'visible';
        isHost = host;
    });

    this.socket.on('UsernameInvalid', function () {
        usernameInvalid.style.display = '';
    });

    this.socket.on('UsernameSet', function (username, players) {
        document.title = 'Game Of Dirty Answers | ' + username;
        userForm.style.display = 'none';
        waiting.style.display = '';
        if (isHost) {
            document.getElementById('startButton').style.display = '';
        }
        playerList.style.display = '';
    });

    this.socket.on('GameFull', function () {
        body.style.visibility = 'visible';
        userForm.style.display = '';
        document.getElementById('gameFull').style.display = '';
    });

    this.socket.on('PlayerListUpdate', function (players) {
        document.getElementById('player1').innerHTML = players[0];
        document.getElementById('player2').innerHTML = players[1];
        document.getElementById('player3').innerHTML = players[2];
        document.getElementById('player4').innerHTML = players[3];
        document.getElementById('player5').innerHTML = players[4];
        document.getElementById('player6').innerHTML = players[5];
        document.getElementById('player7').innerHTML = players[6];
        document.getElementById('player8').innerHTML = players[7];
        let i = 1;
        players.forEach(function (element) {
            if (i != 9) {
                let tempID = "player" + i;
                if (element != '') {
                    document.getElementById(tempID).style.display = '';
                } else {
                    document.getElementById(tempID).style.display = 'none';
                }
                i++;
            }
        });
    });

    this.socket.on('GameStarted', function () {
        body.style.visibility = 'visible';
        userForm.style.display = 'none';
        gameStarted.style.display = '';
    });

    this.socket.on('NotEnoughPlayers', function () {
        document.getElementById('tooFewPlayers').style.display = '';
    });

    this.socket.on('NewPhrase', function (phrase) {
        document.getElementById('phrase').innerHTML = phrase;
    });

    this.socket.on('StartingGame', function (judgeSID) {
        userForm.style.display = 'none';
        waiting.style.display = 'none';
        game.style.display = '';
        document.getElementById('errors').style.display = 'none';

        if (judgeSID == socket.id) {
            isJudge = true;
        } else {
            isJudge = false;
        }

        if (isJudge) {
            responses.style.display = 'none';
            document.getElementById('respondent').style.display = 'none';
            document.getElementById('waitingr').style.display = '';
            document.getElementById('judge').style.display = '';
        } else {
            responses.style.display = 'none';
            document.getElementById('waitingr').style.display = 'none';
            document.getElementById('respondent').style.display = '';
            document.getElementById('judge').style.display = 'none';
        }
    });

    this.socket.on('disconnect', function () {
        if (!disconnectOP) {
            alert("Connection Lost");
            socket.disconnect(true);
            location.reload();
        }
    });

    this.socket.on('ResponseListUpdated', function (responses) {
        document.getElementById('response1').innerHTML = responses[0];
        document.getElementById('response2').innerHTML = responses[1];
        document.getElementById('response3').innerHTML = responses[2];
        document.getElementById('response4').innerHTML = responses[3];
        document.getElementById('response5').innerHTML = responses[4];
        document.getElementById('response6').innerHTML = responses[5];
        document.getElementById('response7').innerHTML = responses[6];
        document.getElementById('response8').innerHTML = responses[7];
        let i = 1;
        responses.forEach(function (element) {
            if (i != 9) {
                let tempID = "response" + i;
                if (element != '') {
                    document.getElementById(tempID).style.display = '';
                } else {
                    document.getElementById(tempID).style.display = 'none';
                }
                i++;
            }
        });
    });

    this.socket.on('AllResponsesReceived', function (rCount) {
        document.getElementById('waitingr').style.display = 'none';
        document.getElementById('responses').style.display = '';
        if (isJudge) {
            for (var i = 1; i <= rCount; i++) {
                document.getElementById('btnresponse' + i).style.display = '';
            }
        }
    });

    this.socket.on('Winner', function (SID, username, response) {
        winner.style.display = '';
        if (socket.id == SID) {
            winner.innerHTML = 'You won the round with the response: ' + response;
        } else {
            winner.innerHTML = username + ' won the round with the response: ' + response;
        }
        document.getElementById('judge').style.display = 'none';
        if (isHost) {
            document.getElementById('newRound').style.display = '';
        }
    });

    this.socket.on('StartingNewRound', function () {
        winner.style.display = 'none';
        for (var i = 1; i <= 8; i++) {
            document.getElementById('btnresponse' + i).style.display = 'none';
        }
        document.getElementById('newRound').style.display = 'none';
        document.getElementById('response').value = '';
    });

    this.socket.on('tooFewPlayersLeft', function () {
        alert('Too few players to continue.');
        location.reload();
    });

    this.socket.on('GameOver', function () {
        disconnectOP = true;
        socket.disconnect(true);
        location.href = '/gameover.html';
    });

    this.socket.on('NewHost', function (newHostSID) {
        if (socket.id == newHostSID) {
            isHost = true;
        }
    });
}

function setUser() {
    var user = document.getElementById('usernameEntry').value;
    document.getElementById('usernameInvalid').style.display = 'none';
    if (user == '') {
        document.getElementById('usernameInvalid').style.display = '';
    } else {
        socket.emit('SetUser', user);
    }
}

function startGame() {
    document.getElementById('tooFewPlayers').style.display = 'none';
    socket.emit('BeginGame');
}

function submitResponse() {
    socket.emit('SubmitResponse', document.getElementById('response').value);
    document.getElementById('respondent').style.display = 'none';
    document.getElementById('waitingr').style.display = '';
}

function newRound() {
    socket.emit('NewRound');
}

function submitDecision(r) {
    socket.emit('SubmitDecision', r);
}