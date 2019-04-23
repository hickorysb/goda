document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);
});

document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {
        hoverEnabled: false
    });
});

function create() {
    if (sessionStorage.getItem('AdminKey') == null) {
        location.href = "/admin/index.html";
    }

    this.socket = io('/admin');
    this.socket.emit("CheckAdminKey", sessionStorage.getItem('AdminKey'));

    this.socket.on('CheckedAdminKey', function (valid) {
        if (valid) {
            document.getElementById("loading").style.display = 'none';
            document.getElementById("adminArea").style.display = '';
            refresh();
        } else {
            sessionStorage.removeItem('AdminKey');
            location.replace('/admin/index.html');
        }
    });

    this.socket.on("Refreshing", function (games) {
        var myNode = document.getElementById("games");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
        if (Object.keys(games).length != 0) {
            document.getElementById('games').style.display = '';
            document.getElementById('noGames').style.display = 'none';
            for (var g in games) {
                var node = document.createElement("LI");
                var cheader = document.createElement("DIV");
                var cbody = document.createElement("DIV");
                var cheadertext = document.createTextNode(games[g].id);
                cheader.classList = "collapsible-header";
                cheader.appendChild(cheadertext);
                cbody.classList = "collapsible-body";
                var cbodytext = document.createTextNode("Player Count: " + games[g].playerCount);
                cbody.appendChild(cbodytext);
                var linebreak = document.createElement('BR');
                cbody.appendChild(linebreak);
                var cbodytext = document.createTextNode("Ready Count: " + games[g].readyCount);
                cbody.appendChild(cbodytext);
                var linebreak = document.createElement('BR');
                cbody.appendChild(linebreak);
                var cbodytext = document.createTextNode("Players:");
                cbody.appendChild(cbodytext);
                var linebreak = document.createElement('BR');
                cbody.appendChild(linebreak);
                var playerlist = document.createElement("UL");
                playerlist.classList = "collection";
                for (var i = 0; i < 8; i++) {
                    var playerline = document.createElement("LI");
                    playerline.classList = "collection-item green";
                    playerline.style.display = 'none';
                    playerline.id = 'player' + (i + 1);
                    playerlist.appendChild(playerline);
                }
                cbody.appendChild(playerlist);
                var linebreak = document.createElement('BR');
                cbody.appendChild(linebreak);
                var button = document.createElement('BUTTON');
                var cbodytext = document.createTextNode("End Game");
                button.classList = "waves-effect waves-light btn";
                button.setAttribute("type", "button");
                button.setAttribute("onclick", "endGame(\"" + g + "\");");
                button.appendChild(cbodytext);
                cbody.appendChild(button);
                node.appendChild(cheader);
                node.appendChild(cbody);
                document.getElementById('games').appendChild(node);
                document.getElementById('player1').innerHTML = games[g].players[0] + '<br />' + games[g].playerPoints[0] + ' Points';
                document.getElementById('player2').innerHTML = games[g].players[1] + '<br />' + games[g].playerPoints[1] + ' Points';
                document.getElementById('player3').innerHTML = games[g].players[2] + '<br />' + games[g].playerPoints[2] + ' Points';
                document.getElementById('player4').innerHTML = games[g].players[3] + '<br />' + games[g].playerPoints[3] + ' Points';
                document.getElementById('player5').innerHTML = games[g].players[4] + '<br />' + games[g].playerPoints[4] + ' Points';
                document.getElementById('player6').innerHTML = games[g].players[5] + '<br />' + games[g].playerPoints[5] + ' Points';
                document.getElementById('player7').innerHTML = games[g].players[6] + '<br />' + games[g].playerPoints[6] + ' Points';
                document.getElementById('player8').innerHTML = games[g].players[7] + '<br />' + games[g].playerPoints[7] + ' Points';
                let u = 1;
                games[g].players.forEach(function (element) {
                    if (u != 9) {
                        let tempID = "player" + u;
                        if (element != '') {
                            document.getElementById(tempID).style.display = '';
                        } else {
                            document.getElementById(tempID).style.display = 'none';
                        }
                        u++;
                    }
                });
            }
        } else {
            document.getElementById('games').style.display = 'none';
            document.getElementById('noGames').style.display = '';
        }
    });
}

function refresh() {
    this.socket.emit("Refresh");
}

function endGame(gameID) {
    this.socket.emit("EndGame", gameID);
    this.socket.emit("Refresh");
}