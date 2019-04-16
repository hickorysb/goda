const express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var other = io.of('/game');
var gameRoom = io.of("/gameRoom");
var servroot = __dirname + '/public';
var games = {};
var socketGames = {};
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

other.on('connection', function (socket) {
    socket.on('JoinGame', function (gameID) {
        if (gameID in games) {
            games[gameID].clients[socket.id] = {
                'id': games[gameID].playerCount,
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

            if (games[gameID].playerCount == 0) {
                games[gameID].clients[socket.id].data.host = true;
            }

            if (games[gameID].playerCount == 8) {
                socket.emit('GameFull');
            } else if (games[gameID].gameStarted) {
                socket.emit('GameStarted');
            } else {
                socket.emit('Connected', games[gameID].clients[socket.id].data.host);
                socket.join(gameID);
                socketGames[socket.id] = gameID;
                games[gameID].playerCount++;
                games[gameID].clients[socket.id].data.player = true;
                let i = 0;
                for (var key in games[gameID].clients) {
                    games[gameID].players[i] = games[gameID].clients[key].data.username;
                    games[gameID].playerPoints[i] = games[gameID].clients[key].data.points;
                    if (games[gameID].clients[key].data.host) {
                        games[gameID].players[i] = games[gameID].players[i] + ' (Host)';
                    }
                    if (games[gameID].clients[key] == games[gameID].currentJudge) {
                        games[gameID].players[i] = games[gameID].players[i] + ' (Judge)';
                    }
                    i++;
                }
                while (i <= 8) {
                    games[gameID].players[i] = ''
                    i++;
                }
                other.to(gameID).emit('PlayerListUpdate', games[gameID].players, games[gameID].playerPoints);
            }
        }
    });
    socket.on('disconnect', function () {
        gameID = socketGames[socket.id];
        if (gameID in games) {
            games[gameID].clients = games[gameID].clients;
            delete games[gameID].usernames[games[gameID].clients[socket.id].data.username];
            if (games[gameID].clients[socket.id].data.player == true) {
                let wasJudge = false;
                if (games[gameID].currentJudge.sid == socket.id) {
                    wasJudge = true;
                }
                let wasHost = games[gameID].clients[socket.id].data.host;
                let wasReady = games[gameID].clients[socket.id].data.ready;
                delete games[gameID].clients[socket.id];
                games[gameID].playerCount--;
                if (wasReady) {
                    games[gameID].readyCount--;
                }
                let i = 0;
                for (var key in games[gameID].clients) {
                    games[gameID].players[i] = games[gameID].clients[key].data.username;
                    games[gameID].playerPoints[i] = games[gameID].clients[key].data.points;
                    if (games[gameID].clients[key].data.host) {
                        games[gameID].players[i] = games[gameID].players[i] + ' (Host)';
                    }
                    if (games[gameID].clients[key] == games[gameID].currentJudge) {
                        games[gameID].players[i] = games[gameID].players[i] + ' (Judge)';
                    }
                    i++;
                }
                while (i <= 8) {
                    games[gameID].players[i] = ''
                    i++;
                }
                other.to(gameID).emit('PlayerListUpdate', games[gameID].players, games[gameID].playerPoints);
                if (games[gameID].readyCount < 3 && games[gameID].gameStarted) {
                    delete games[gameID];
                    other.to(gameID).emit('tooFewPlayersLeft');
                } else if (games[gameID].gameStarted && wasHost) {
                    newHost = randomProperty(games[gameID].clients)
                    games[gameID].clients[newHost.sid].data.host = true;
                    io.sockets.emit('NewHost', newHost.sid);
                    let i = 0;
                    for (var key in games[gameID].clients) {
                        games[gameID].players[i] = games[gameID].clients[key].data.username;
                        games[gameID].playerPoints[i] = games[gameID].clients[key].data.points;
                        if (games[gameID].clients[key].data.host) {
                            games[gameID].players[i] = games[gameID].players[i] + ' (Host)';
                        }
                        if (games[gameID].clients[key] == games[gameID].currentJudge) {
                            games[gameID].players[i] = games[gameID].players[i] + ' (Judge)';
                        }
                        i++;
                    }
                    while (i <= 8) {
                        games[gameID].players[i] = ''
                        i++;
                    }
                    other.to(gameID).emit('PlayerListUpdate', games[gameID].players, games[gameID].playerPoints);
                }
                if (wasJudge && games[gameID].gameStarted) {
                    games[gameID].responseSIDs = ["", "", "", "", "", "", "", ""];
                    games[gameID].responses = ["", "", "", "", "", "", "", ""];
                    games[gameID].currentResonseCount = 0;
                    games[gameID].currentJudge = randomProperty(games[gameID].clients);
                    let i = 0;
                    for (var key in games[gameID].clients) {
                        games[gameID].players[i] = games[gameID].clients[key].data.username;
                        games[gameID].playerPoints[i] = games[gameID].clients[key].data.points;
                        if (games[gameID].clients[key].data.host) {
                            games[gameID].players[i] = games[gameID].players[i] + ' (Host)';
                        }
                        if (games[gameID].clients[key] == games[gameID].currentJudge) {
                            games[gameID].players[i] = games[gameID].players[i] + ' (Judge)';
                        }
                        i++;
                    }
                    while (i <= 8) {
                        games[gameID].players[i] = ''
                        i++;
                    }
                    other.to(gameID).emit('PlayerListUpdate', games[gameID].players, games[gameID].playerPoints);
                    other.to(gameID).emit('StartingNewRound');
                    other.to(gameID).emit('StartingGame', games[gameID].currentJudge.sid);
                }
            } else {
                delete games[gameID].clients[socket.id];
            }
        }
    });

    socket.on('SetUser', function (username) {
        gameID = socketGames[socket.id];
        games[gameID].clients = games[gameID].clients;
        if (username in games[gameID].usernames || username == "Joining" || username.toLowerCase().includes('(host)') || username.toLowerCase().includes('(judge)')) {
            socket.emit('UsernameInvalid', 'Invalid');
        } else {
            games[gameID].clients[socket.id].data.username = username;
            games[gameID].usernames[username] = 'taken';
            socket.emit('UsernameSet', username);
            let i = 0;
            for (var key in games[gameID].clients) {
                games[gameID].players[i] = games[gameID].clients[key].data.username;
                games[gameID].playerPoints[i] = games[gameID].clients[key].data.points;
                if (games[gameID].clients[key].data.host) {
                    games[gameID].players[i] = games[gameID].players[i] + ' (Host)';
                }
                if (games[gameID].clients[key] == games[gameID].currentJudge) {
                    games[gameID].players[i] = games[gameID].players[i] + ' (Judge)';
                }
                i++;
            }
            while (i <= 8) {
                games[gameID].players[i] = ''
                i++;
            }
            other.to(gameID).emit('PlayerListUpdate', games[gameID].players, games[gameID].playerPoints);
            games[gameID].readyCount++;
            games[gameID].clients[socket.id].data.ready = true;
        }
    });

    socket.on('BeginGame', function () {
        gameID = socketGames[socket.id];
        games[gameID].clients = games[gameID].clients;
        if (games[gameID].readyCount >= 3) {
            games[gameID].gameStarted = true;
            games[gameID].currentJudge = randomProperty(games[gameID].clients);
            let i = 0;
            for (var key in games[gameID].clients) {
                games[gameID].players[i] = games[gameID].clients[key].data.username;
                games[gameID].playerPoints[i] = games[gameID].clients[key].data.points;
                if (games[gameID].clients[key].data.host) {
                    games[gameID].players[i] = games[gameID].players[i] + ' (Host)';
                }
                if (games[gameID].clients[key] == games[gameID].currentJudge) {
                    games[gameID].players[i] = games[gameID].players[i] + ' (Judge)';
                }
                i++;
            }
            while (i <= 8) {
                games[gameID].players[i] = ''
                i++;
            }
            other.to(gameID).emit('PlayerListUpdate', games[gameID].players, games[gameID].playerPoints);
            other.to(gameID).emit('StartingGame', games[gameID].currentJudge.sid);
            let phrase = randomProperty(games[gameID].questions);
            delete games[gameID].questions[getKeyByValue(games[gameID].questions, phrase)];
            other.to(gameID).emit('NewPhrase', phrase)
        } else {
            socket.emit('NotEnoughPlayers');
        }
    });

    socket.on('SubmitResponse', function (response) {
        gameID = socketGames[socket.id];
        game = games[gameID];
        games[gameID].clients = games[gameID].clients;
        games[gameID].responses[games[gameID].currentResonseCount] = response;
        games[gameID].responseSIDs[games[gameID].currentResonseCount] = socket.id;
        games[gameID].currentResonseCount++;
        if (games[gameID].currentResonseCount == games[gameID].playerCount - 1) {
            other.to(gameID).emit('AllResponsesReceived', games[gameID].currentResonseCount);
        }
        other.to(gameID).emit('ResponseListUpdated', games[gameID].responses);
    });

    socket.on('SubmitDecision', function (selection) {
        gameID = socketGames[socket.id];
        games[gameID].clients = games[gameID].clients;
        games[gameID].clients[games[gameID].responseSIDs[selection - 1]].data.points++;
        let i = 0;
        for (var key in games[gameID].clients) {
            games[gameID].players[i] = games[gameID].clients[key].data.username;
            games[gameID].playerPoints[i] = games[gameID].clients[key].data.points;
            if (games[gameID].clients[key].data.host) {
                games[gameID].players[i] = games[gameID].players[i] + ' (Host)';
            }
            if (games[gameID].clients[key] == games[gameID].currentJudge) {
                games[gameID].players[i] = games[gameID].players[i] + ' (Judge)';
            }
            i++;
        }
        while (i <= 8) {
            games[gameID].players[i] = ''
            i++;
        }
        other.to(gameID).emit('PlayerListUpdate', games[gameID].players, games[gameID].playerPoints);
        currentJudge = games[gameID].clients[games[gameID].responseSIDs[selection - 1]];
        other.to(gameID).emit('Winner', games[gameID].responseSIDs[selection - 1], games[gameID].clients[games[gameID].responseSIDs[selection - 1]].data.username, games[gameID].responses[selection - 1]);
    });

    socket.on('NewRound', function () {
        gameID = socketGames[socket.id];
        games[gameID].clients = games[gameID].clients;
        if (Object.keys(games[gameID].questions).length > 0) {
            games[gameID].responseSIDs = ["", "", "", "", "", "", "", ""];
            games[gameID].responses = ["", "", "", "", "", "", "", ""];
            games[gameID].currentResonseCount = 0;
            phrase = randomProperty(games[gameID].questions);
            delete games[gameID].questions[getKeyByValue(games[gameID].questions, phrase)];
            let i = 0;
            for (var key in games[gameID].clients) {
                games[gameID].players[i] = games[gameID].clients[key].data.username;
                games[gameID].playerPoints[i] = games[gameID].clients[key].data.points;
                if (games[gameID].clients[key].data.host) {
                    games[gameID].players[i] = games[gameID].players[i] + ' (Host)';
                }
                if (games[gameID].clients[key] == games[gameID].currentJudge) {
                    games[gameID].players[i] = games[gameID].players[i] + ' (Judge)';
                }
                i++;
            }
            while (i <= 8) {
                games[gameID].players[i] = ''
                i++;
            }
            other.to(gameID).emit('PlayerListUpdate', games[gameID].players, games[gameID].playerPoints);
            other.to(gameID).emit('StartingNewRound');
            other.to(gameID).emit('NewPhrase', phrase);
            other.to(gameID).emit('StartingGame', games[gameID].currentJudge.sid);
        } else {
            other.to(gameID).emit('GameOver');
            delete games[gameID];
        }
    });

    socket.on('error', function (err) {
        console.log(err);
    });
});

gameRoom.on('connection', function (socket) {
    socket.on('CreateGame', function (gameID) {
        if (gameID in games) {
            socket.emit('GameAlreadyExists');
        } else {
            games[gameID] = {
                'clients': {},
                'usernames': {},
                'playerCount': 0,
                'currentJudge': {},
                'gameStarted': false,
                'players': ["", "", "", "", "", "", "", ""],
                'responses': ["", "", "", "", "", "", "", ""],
                'responseSIDs': ["", "", "", "", "", "", "", ""],
                'currentResonseCount': 0,
                'readyCount': 0,
                'questions': require('./questions.json'),
                'playerPoints': [0, 0, 0, 0, 0, 0, 0, 0]
            }
            socket.emit('ClearToConnect');
        }
    });
    socket.on('disconnect', function () {

    });
    socket.on('JoinGame', function (gameID) {
        if (gameID in games) {
            if (games[gameID].gameStarted) {
                socket.emit('GameAlreadyStarted');
            } else if (games[gameID].playerCount == 8) {
                socket.emit('GameAlreadyFull');
            } else {
                socket.emit('ClearToConnect');
            }
        } else {
            socket.emit('GameDoesntExist');
        }
    });
});