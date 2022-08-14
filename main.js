/**
 * random start
 * public/private game
 * game search menu
 * chat
 */

const winner = document.querySelector(".winner");
const turndiv = document.querySelector(".turn");
const gamediv = document.querySelector(".game");
const menudiv = document.querySelector(".menu");
const lobbydiv = document.querySelector(".lobby");
const replaydiv = document.querySelector(".replay");
const args = new URLSearchParams(window.location.search);
const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789".split("");

let game = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
let turn = 0, moves = 0;
let playing = true;
let online = false;
var gameid = args.get("gameId");
var host = args.get("host") == "true";
var gameref = firebase.database().ref("games/"+gameid+"/players");
var isSpectator = false;

var opponentUUID;

function init() {
    if(gameid != null) {
        firebase.auth().onAuthStateChanged((u) => {
            if(u) {
                console.log(u);
                uuid = u.uid;
                ref = firebase.database().ref("games/"+gameid+"/players/"+uuid);
                ref.set({
                    uuid: uuid,
                    host: host,
                    move: -1,
                    start: host
                });
                // gameref.once('value', (e) => {
                //     e.forEach((el, i) => {
                //         let v = el.val();
                //         console.log(v);
                //     });
                // });

                ref.onDisconnect().remove();
            }
        });

        menudiv.className+=" hidden";
        lobbydiv.className = lobbydiv.className.replace(" hidden", "");
        document.querySelector(".gid").innerHTML = args.get("gameId");
    }
}
init();

function startGame() {
    online = true;
    lobbydiv.className+=" hidden";
    gamediv.className = gamediv.className.replace(" hidden", "");
    if(!host) {
        turn = 1;
    }
    turndiv.innerHTML = "It's "+(turn==0?"Your":"Opponent")+"'s turn!";
    winner.innerHTML = "Get three of your symbols in a row to win!";
}

window.onclick = (e) => {
    if(e.target.className.includes("replay")) {
        winner.innerHTML = "Get three of your symbols in a row to win!";
        if(online) resetDatabase();
        else {
            game = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
            turn = 0;
            moves = 0;
            playing = true;
            for(let i = 1; i < 10; i++) {
                document.querySelector(".cell"+i).innerHTML = "&nbsp;";
            }
            replaydiv.className+=" hidden";
        }
        turndiv.innerHTML = "It's "+(turn==0?"O":"X")+"'s turn!";
    }
    if(!playing) return;
    if(!online) {
        if(e.target.className.includes("cell") && !isSpectator) {
            let cellId = e.target.className.replace("cell", "")*1-1;
            if(game[cellId]==-1) {
                game[cellId] = turn;
    
                e.target.innerHTML = turn == 0 ? "O" : "X";
    
                turn = turn == 0 ? 1 : 0;
                moves++;
                turndiv.innerHTML = "It's "+(turn==0?"O":"X")+"'s turn!";
            }
            checkMoves();
        }
    } else {
        if(e.target.className.includes("cell") && turn == 0 && !isSpectator) {
            let cellId = e.target.className.replace("cell", "")*1-1;
            if(game[cellId]==-1) {
                game[cellId] = turn;
    
                e.target.innerHTML = host ? "O" : "X";
                console.log(turn);
                turn = 1;
                console.log(turn);
                moves++;
                turndiv.innerHTML = "It's "+(turn==0?"Your":"Opponent")+"'s turn!";
                ref.set({
                    uuid: uuid,
                    host: host,
                    move: cellId
                });
            }
            checkMoves();
        }
    }
    if(e.target.className.includes("join")) {
        online = true;
        let g = document.querySelector(".gameid");
        if(g.value.length != 4) {
            alert("Game id should be 4-digit string");
        } else {
            window.location.href = window.location.href.split("?")[0]+"?gameId="+g.value;
        }
    } if(e.target.className.includes("hostonline")) {
        online = true;
        window.location.href = window.location.href.split("?")[0]+"?gameId="+createGameId()+"&host=true";

    } if(e.target.className.includes("hostoffline")) {
        online = false;
        gamediv.className = gamediv.className.replace(" hidden", "");
        menudiv.className+=" hidden";
        turndiv.innerHTML = "It's "+(turn==0?"O":"X")+"'s turn!";
    }
}
function checkMoves() {
    for(let i = 0; i < 2; i++) {
        for(let j = 0; j < 3; j++) {
            if(game[j*3]==i && game[(j*3)+1]==i && game[(j*3)+2]==i) win(i);
            if(game[j]==i && game[j+3] == i && game[j+6] == i) win(i);
        }
        if(game[0] == game[4] && game[0] == game[8] && game[0] == i) win(i);
        if(game[2] == game[4] && game[2] == game[6] && game[2] == i) win(i);
    }
    if(moves >= 9 && playing) {
        win(-1);
        return;
    }
}
function win(player) {
    playing = false;
    if(player==-1) {
        winner.innerHTML = "Draw!";
        replaydiv.className = replaydiv.className.replace(" hidden", "");
        return;
    }
    if(!online) winner.innerHTML = (player==0?"O":"X")+"'s won the game!";
    else {
        winner.innerHTML = (player==(host||!online?0:1)?"O":"X")+"'s won the game!";
    }
    replaydiv.className = replaydiv.className.replace(" hidden", "");
    turndiv.innerHTML = "";
}

function createGameId() {
    let r = "";

    for(let i = 0; i < 4; i++) {
        r+=alphabet[Math.round(Math.random()*(alphabet.length-1))];
    }

    return r;
}

function resetDatabase() {
    let oref = firebase.database().ref("games/"+gameid+"/players/"+opponentUUID);
    let s = Math.round(Math.random())==1;

    ref.set({
        uuid: uuid,
        host: host,
        move: host?-2:-1,
        start: s
    });
    oref.set({
        uuid: opponentUUID,
        host: !host,
        move: host?-1:-2,
        start: !s
    });
}

let playerID = -1;
gameref.on("value", e => {
    console.log("VALUES: ", e.val());
    if(e.val()==null) return;
    if(Object.keys(e.val()).length>2) {
        isSpectator = true;
        return;
    }
    Object.keys(e.val()).forEach((ev, i) => {
        let p = e.val()[ev];
        if(p.uuid==uuid) playerID = i;
        if(p.host && !host && opponentUUID == null) {
            opponentUUID = p.uuid;
            startGame();
        }

        if(opponentUUID != null && p.uuid == opponentUUID && p.move >= 0 && game[p.move] == -1 && playing) {
            game[p.move] = 1;
            turn = turn == 1 ? 0 : 1;
            moves++;
            turndiv.innerHTML = "It's "+(turn==0?"Your":"Opponent")+"'s turn!";
            document.querySelector(".cell"+(p.move+1)).innerHTML = !host ? "O" : "X";
        }
        if(p.move == -2 && p.host) {
            window.location.reload();
        }
        checkMoves();
    });
});
gameref.on("child_added", e => {
    console.log("ADDED: ", e.val());
    let p = e.val();
    if(!p.host && host && opponentUUID == null) {
        opponentUUID = p.uuid;
        startGame();
    }
});