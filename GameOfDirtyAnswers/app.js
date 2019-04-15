const express = require('express');
var questions = require('./questions.json');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var servroot = __dirname + '/public';
var clients = {};
var usernames = {};
var playerCount = 0;
var currentJudge;
var gameStarted = false;
var players = ["", "", "", "", "", "", "", ""];
var responses = ["", "", "", "", "", "", "", ""];
var responseSIDs = ["", "", "", "", "", "", "", ""];
var currentResonseCount = 0;
var readyCount = 0;
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
function randomProperty(obj) {
    var keys = Object.keys(obj)
    return obj[keys[keys.length * Math.random() << 0]];
};

app.use(express.static(servroot));

app.get('/', function (req, res) {
    res.sendFile(servroot + '/index.html');
});

server.listen(80, function () {
    console.log(`Listening on ${server.address().port}`);
});

io.on('connection', function (socket) {
    clients[socket.id] = {
        'id': playerCount,
        'sid': socket.id,
        'data': {
            'username': "Joining",
            'points': 0,
            'role': null,
            'host': false,
            'player': false,
            'ready': false
        }
    }

    if (playerCount == 0) {
        clients[socket.id].data.host = true;
    }

    if (playerCount == 8) {
        socket.emit('GameFull');
    } else if (gameStarted) {
        socket.emit('GameStarted');
    } else {
        socket.emit('Connected', clients[socket.id].data.host);
        playerCount++;
        clients[socket.id].data.player = true;
        let i = 0;
        for (var key in clients) {
            players[i] = clients[key].data.username;
            if (clients[key].data.host) {
                players[i] = players[i] + ' (Host)';
            }
            if (clients[key] == currentJudge) {
                players[i] = players[i] + ' (Judge)';
            }
            i++;
        }
        while (i <= 8) {
            players[i] = ''
            i++;
        }
        io.sockets.emit('PlayerListUpdate', players);
    }

    socket.on('disconnect', function () {
        delete usernames[clients[socket.id].data.username];
        if (clients[socket.id].data.player == true) {
            let wasHost = clients[socket.id].data.host;
            let wasReady = clients[socket.id].data.ready;
            delete clients[socket.id];
            playerCount--;
            if (wasReady) {
                readyCount--;
            }
            let i = 0;
            for (var key in clients) {
                players[i] = clients[key].data.username;
                if (clients[key].data.host) {
                    players[i] = players[i] + ' (Host)';
                }
                if (clients[key] == currentJudge) {
                    players[i] = players[i] + ' (Judge)';
                }
                i++;
            }
            while (i <= 8) {
                players[i] = ''
                i++;
            }
            io.sockets.emit('PlayerListUpdate', players);
            if (readyCount < 3 && gameStarted) {
                gameStarted = false;
                io.sockets.emit('tooFewPlayersLeft');
                responseSIDs = ["", "", "", "", "", "", "", ""];
                responses = ["", "", "", "", "", "", "", ""];
                currentResonseCount = 0;
                questions = require('./questions.json');
            } else if (gameStarted && wasHost) {
                newHost = randomProperty(clients)
                clients[newHost.sid].data.host = true;
                io.sockets.emit('NewHost', newHost.sid);
                let i = 0;
                for (var key in clients) {
                    players[i] = clients[key].data.username;
                    if (clients[key].data.host) {
                        players[i] = players[i] + ' (Host)';
                    }
                    if (clients[key] == currentJudge) {
                        players[i] = players[i] + ' (Judge)';
                    }
                    i++;
                }
                while (i <= 8) {
                    players[i] = ''
                    i++;
                }
                io.sockets.emit('PlayerListUpdate', players);
            }
        } else {
            delete clients[socket.id];
        }
    });

    socket.on('SetUser', function (username) {
        if (username in usernames || username == "Joining" || username.toLowerCase().includes('(host)') || username.toLowerCase().includes('(judge)')) {
            socket.emit('UsernameInvalid', 'Invalid');
        } else {
            clients[socket.id].data.username = username;
            usernames[username] = 'taken';
            socket.emit('UsernameSet', username);
            let i = 0;
            for (var key in clients) {
                players[i] = clients[key].data.username;
                if (clients[key].data.host) {
                    players[i] = players[i] + ' (Host)';
                }
                if (clients[key] == currentJudge) {
                    players[i] = players[i] + ' (Judge)';
                }
                i++;
            }
            while (i <= 8) {
                players[i] = ''
                i++;
            }
            io.sockets.emit('PlayerListUpdate', players);
            readyCount++;
            clients[socket.id].data.ready = true;
        }
    });

    socket.on('BeginGame', function () {
        if (readyCount >= 3) {
            gameStarted = true;
            currentJudge = randomProperty(clients);
            let i = 0;
            for (var key in clients) {
                players[i] = clients[key].data.username;
                if (clients[key].data.host) {
                    players[i] = players[i] + ' (Host)';
                }
                if (clients[key] == currentJudge) {
                    players[i] = players[i] + ' (Judge)';
                }
                i++;
            }
            while (i <= 8) {
                players[i] = ''
                i++;
            }
            io.sockets.emit('PlayerListUpdate', players);
            io.sockets.emit('StartingGame', currentJudge.sid);
            let phrase = randomProperty(questions);
            delete questions[getKeyByValue(questions, phrase)];
            io.sockets.emit('NewPhrase', phrase)
        } else {
            socket.emit('NotEnoughPlayers');
        }
    });

    socket.on('SubmitResponse', function (response) {
        responses[currentResonseCount] = response;
        responseSIDs[currentResonseCount] = socket.id;
        currentResonseCount++;
        if (currentResonseCount == playerCount - 1) {
            io.sockets.emit('AllResponsesReceived', currentResonseCount);
        }
        io.sockets.emit('ResponseListUpdated', responses);
    });

    socket.on('SubmitDecision', function (selection) {
        clients[responseSIDs[selection - 1]].data.points++;
        currentJudge = clients[responseSIDs[selection - 1]];
        io.sockets.emit('Winner', responseSIDs[selection - 1], clients[responseSIDs[selection - 1]].data.username, responses[selection - 1]);
    });

    socket.on('NewRound', function () {
        if (Object.keys(questions).length > 0) {
            responseSIDs = ["", "", "", "", "", "", "", ""];
            responses = ["", "", "", "", "", "", "", ""];
            currentResonseCount = 0;
            phrase = randomProperty(questions);
            delete questions[getKeyByValue(questions, phrase)];
            let i = 0;
            for (var key in clients) {
                players[i] = clients[key].data.username;
                if (clients[key].data.host) {
                    players[i] = players[i] + ' (Host)';
                }
                if (clients[key] == currentJudge) {
                    players[i] = players[i] + ' (Judge)';
                }
                i++;
            }
            while (i <= 8) {
                players[i] = ''
                i++;
            }
            io.sockets.emit('PlayerListUpdate', players);
            io.sockets.emit('StartingNewRound');
            io.sockets.emit('NewPhrase', phrase);
            io.sockets.emit('StartingGame', currentJudge.sid);
        } else {
            io.sockets.emit('GameOver');
            responseSIDs = ["", "", "", "", "", "", "", ""];
            responses = ["", "", "", "", "", "", "", ""];
            currentResonseCount = 0;
            questions = require('./questions.json');
            gameStarted = false;
        }
    });
});