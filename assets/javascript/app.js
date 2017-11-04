var config = {
    apiKey: "AIzaSyBiHpTHCi2hcp0Yb0p7StD2vP_mgWm2-bo",
    authDomain: "multi-rps-384d6.firebaseapp.com",
    databaseURL: "https://multi-rps-384d6.firebaseio.com",
    projectId: "multi-rps-384d6",
    storageBucket: "",
    messagingSenderId: "706473249998"
};
firebase.initializeApp(config);

var database = firebase.database();
var playerDB = database.ref("/players");
var turnDB = database.ref("/turn");
var chatDB = database.ref("/chat");

var players = [];
var chats = [];
var turn = 0;
var storageType = sessionStorage;
var storageKey = "myRPSid";
var NADA = "nada";


playerDB.on("value", function (snapshot) {
    var data = snapshot.val();
    if (data === null) {
        players = [];
        return;  // no data, just return
    }
    players = data;
    var uid = getUser();

    var cnt = players.length;

    if (uid === 1 && cnt === 1) {
        setUser(0);  // was second player, now first
        players[0].wins = 0;
        players[0].losses = 0;
        putTopMsg2(" ");
        uid = 0;
    }
    if (cnt === 1) {
        displayRPSBlank(0);
        displayRPSBlank(1);
        emptyNameInBox(1);
        displayTotals(0, true);
        displayTotals(1, true);
    } else {
        displayTotals(0, false);
    }

    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        putUpName(player.name, i);
        if (uid === i) {
            putTopMsg1("Hi " + player.name + "!  You are player " + (i + 1));
        }

    }
    if (cnt === 2) {
        if (players[uid].pick === NADA) {
            displayRPS(uid);
        }
        displayTotals(1, false);
        if (players[0].pick !== NADA && players[1].pick !== NADA) {
            console.log("Both picked, now determine....");
            determineWin();
        }
    }

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

turnDB.on("value", function (snapshot) {
    var turn = snapshot.val();
    if (turn === null) return;
    console.log("turn: " + turn);

    if (turn === 0) {
        putTopMsg2("Waiting for another player to join.");
    } else if (turn === 1) {
        putTopMsg2("Make your choice.");
    }

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

chatDB.on("value", function (snapshot) {
    var data = snapshot.val();
    if (data === null || data.length === 0) {
        emptyChatDiv();
        return;
    }
    console.log("chatdb: " + data);
    chats = data;
    emptyChatDiv();

    for (var i = 0; i < chats.length; i++) {
        var chat = chats[i];
        var msgp = $("<p class='chatP'>").text(chat);
        // console.log(msgp);
        $("#chatDiv").append(chat + "\n");
    }

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

function determineWin() {
    var p0 = players[0].pick;
    var p1 = players[1].pick;

    var p0flag = didP0Win(p0, p1);

    if (p0flag === 0) {
        putMiddleMsg("TIE!");
    } else if (p0flag === 1) {
        putMiddleMsg(players[0].name + " Wins!");
        players[0].wins++;
        players[1].losses++;
    } else if (p0flag === 2) {
        putMiddleMsg(players[1].name + " Wins!");
        players[1].wins++;
        players[0].losses++;
    }

    displayRPSPick(0, p0);
    displayRPSPick(1, p1);


    setTimeout(startOver, 4000);
}

function startOver() {
    console.log("Start over, refresh....");
    var uid = getUser();
    players[0].pick = NADA;
    players[1].pick = NADA;
    playerDB.set(players);

    if (uid === 0) {
        displayRPS(0);
        displayRPSBlank(1);
    } else if (uid === 1) {
        displayRPS(1);
        displayRPSBlank(0);
    }
    putMiddleMsg("");
    putTopMsg2("Make your choice!");
}

function didP0Win(p0, p1) {  // 0 for tie, 1 for a win, 2 loss
    if (p0 === "Rock") {
        if (p1 === "Rock") {
            return 0;
        } else if (p1 === "Scissors") {
            return 1;
        } else if (p1 === "Paper") {
            return 2;
        }
    } else if (p0 === "Paper") {
        if (p1 === "Rock") {
            return 1;
        } else if (p1 === "Scissors") {
            return 2;
        } else if (p1 === "Paper") {
            return 0;
        }
    } else if (p0 === "Scissors") {
        if (p1 === "Rock") {
            return 2;
        } else if (p1 === "Scissors") {
            return 0;
        } else if (p1 === "Paper") {
            return 1;
        }
    }
}


function getUser() {  // player 1 is 0, player 2 is 1, anything else will return -1
    var stvalue = storageType.getItem(storageKey);
    var uid = -1;
    if (stvalue !== null) {
        uid = Number(stvalue);
    }

    return uid;
}

function setUser(userId) {
    storageType.setItem(storageKey, userId);
}

$(document).on("click touchstart", ".rps", pickRPS);

$("#playerNameButton").on("click", function () {
    event.preventDefault();
    var playerName = $("#playerNameText").val().trim();

    setupPlayer(playerName);

});

$("#chatButton").on("click", function () {
    event.preventDefault();
    var chatText = $("#chatText");
    var chatMsg = chatText.val().trim();
    if (players === null || players.length !== 2) {
        $("#chatDiv").append("Wait for another user to chat.");
        return;
    }

    chats.push("[" + players[getUser()].name + "]  " + chatMsg);
    chatDB.set(chats);
    chatText.val("");
});

function pickRPS() {
    var text = $(this).text();
    var uid = getUser();

    displayRPSPick(uid, text);
    players[uid].pick = text;
    var other = 0;
    if (uid === 0) other = 1;
    putTopMsg2("Waiting for " + players[other].name + " to pick.");

    playerDB.set(players);
}

function setupPlayer(name) {
    if (players !== null && players.length === 2) {
        return; // we already have both players in the list
    }
    var player = {
        name: name,
        wins: 0,
        losses: 0,
        pick: NADA
    };


    if (players === null || players.length === 0) {
        setUser(0);
        setupEmptyTopMsgsDiv();
        turnDB.set(0);
    } else {
        var uid = getUser();
        setUser(1);
        setupEmptyTopMsgsDiv();
        turnDB.set(1);
        emptyChatDiv();
    }

    players.push(player);

    playerDB.set(players);
}

window.onunload = function () {
    if (players !== null) {
        var uid = getUser();
        if (uid === -1) uid = 1;
        players.splice(uid, 1);
        if (players === null || players.length === 0) {
            turnDB.remove();
        } else {
            players[0].wins = 0;
            players[0].losses = 0;
            turnDB.set(0);
        }
        playerDB.set(players);
    }


    emptyChatDiv();
    chats = [];
    chatDB.set(chats);
    storageType.removeItem(storageKey);
};

function emptyTopInput() {
    $("#topPanel").empty();
}

function createTopInputForm() {
    var div1 = $("<div class='form-group'>");
    var text1 = $("<input type=\"text\" class=\"form-control\" id=\"playerNameText\" placeholder=\"Enter Your Name\">");
    var button1 = $("<button type=\"submit\" class=\"btn btn-primary\" id=\"playerNameButton\">").text("Start");
    div1.append(text1);
    div1.append(button1);
    var form1 = $("<form>").append(div1);
    $("#topPanel").append(form1);
}

function setupEmptyTopMsgsDiv() {
    emptyTopInput();
    var div1 = $("<div id='topMsg1' class='topMsg'>");
    var div2 = $("<div id='topMsg2' class='topMsg'>");
    $("#topPanel").append(div1);
    $("#topPanel").append(div2);
}

function displayRPSPick(id, pick) {
    var rpsBox = "#rpsBox" + id;
    var divRPS = $(rpsBox);
    divRPS.empty();
    var divb = $("<div class='rpsBlank'>");
    divb.text("______________");
    var divp = $("<div class='rpsPick'>");
    divp.text(pick);

    divRPS.append(divb);
    divRPS.append(divp);
    divRPS.append(divb);
}

function displayRPS(id) {
    var rpsBox = "#rpsBox" + id;
    var divRPS = $(rpsBox);
    divRPS.empty();
    var divr = $("<div class='rps'>");
    divr.text("Rock");
    var divp = $("<div class='rps'>");
    divp.text("Paper");
    var divs = $("<div class='rps'>");
    divs.text("Scissors");

    divRPS.append(divr);
    divRPS.append(divp);
    divRPS.append(divs);
}

function displayRPSBlank(id) {
    var rpsBox = "#rpsBox" + id;
    var divRPS = $(rpsBox);
    divRPS.empty();
    var div1 = $("<div class='rpsBlank'>");
    div1.text("");

    divRPS.append(div1);
    divRPS.append(div1);
    divRPS.append(div1);
}

function putTopMsg1(msg) {
    $("#topMsg1").empty();
    $("#topMsg1").text(msg);
}

function putTopMsg2(msg) {
    $("#topMsg2").empty();
    $("#topMsg2").text(msg);
}

function putMiddleMsg(msg) {
    $("#boxM").empty();
    $("#boxM").text(msg);
}

function putUpName(name, i) {
    var boxId = "#pNameBox" + i;
    $(boxId).empty();
    $(boxId).text(name);
}

function emptyNameInBox(i) {
    var boxId = "#pNameBox" + i;
    $(boxId).empty();
}


function displayTotals(id, justEmptyIt) {
    var divstr = "#totalsBox" + id;
    var totDiv = $(divstr);
    totDiv.empty();
    if (justEmptyIt) {
        return;
    }

    var msg = "Wins: 0, Losses: 0";
    if (players[id] !== null) {
        msg = "Wins: " + players[id].wins + ", Losses: " + players[id].losses;
    }
    totDiv.text(msg);
}

function emptyChatDiv() {
    $("#chatDiv").empty();
}


