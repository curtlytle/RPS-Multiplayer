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
var turn = 0;
var storageType = sessionStorage;
var storageKey = "myRPSid";
var NADA = "nada";


playerDB.on("value", function (snapshot) {
    var data = snapshot.val();
    if (data !== null) {
        players = data;
    } else {
        return;  // no data, just return
    }
    var uid = getUser();

    var cnt = players.length;

    if (uid === 1 && cnt === 1) {
        setUser(0);  // was second player, now first
        putTopMsg2(" ");
        $("#pNameBox1").empty();
        uid = 0;
    }
    displayTotals0();

    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        putUpName(player.name, i);
        if (uid === i) {
            putTopMsg2("Hi " + player.name + "!  Your are player " + (i + 1));
        }

    }
    if (cnt === 2) {
        displayTotals1();
        if (players[0].pick !== NADA && players[1].pick !== NADA) {
            console.log("Both picked, now determine....");
        }
    }

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

turnDB.on("value", function (snapshot) {
    var turn = snapshot.val();
    if (turn === null) return;
    console.log("turn: " + turn);

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

chatDB.on("value", function (snapshot) {
    var data = snapshot.val();
    if (data === null || data.chat === null) return;
    console.log("chatdb: " + data);

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});


function getUser() {  // player 1 is 0, player 2 is 1, anything else will return -1
    var stvalue = storageType.getItem(storageKey);
    var uid = -1;
    if (stvalue != null) {
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
    var chatMsg = $("#chatText").val().trim();

    var msgp = $("<p class='chatP'>").text(chatMsg);
    // console.log(msgp);
    $("#chatDiv").prepend(msgp);

});

function pickRPS() {
    var text = $(this).text();
    var uid = getUser();
    if (uid === 0) {
        displayRPS0Pick(text);
        players[0].pick = text;
    } else if (uid === 1) {
        displayRPS1Pick(text);
        players[1].pick = text;
    }

    playerDB.set(players);
}

function setupPlayer(name) {
    if (players != null && players.length === 2) {
        return; // we already have both players in the list
    }
    var player = {
        name: name,
        wins: 0,
        losses: 0,
        pick: NADA
    };

    var startTurn = false;

    if (players === null || players.length === 0) {
        setUser(0);
        setupEmptyTopMsgsDiv();
        putTopMsg2("Waiting for another player to join.");
        displayRPS0();
        turnDB.set(0);
    } else {
        setUser(1);
        setupEmptyTopMsgsDiv();
        putTopMsg2("Make your choice.");
        displayRPS1();
        turnDB.set(1);
        startTurn = true;
    }

    players.push(player);

    playerDB.set(players);



    if (startTurn) {
        var uid = getUser();
        if (uid === 0) {

        } else {
        }

    }
}

window.onunload = function () {
    if (players != null) {
        var uid = getUser();
        if (uid === -1) uid = 1;
        players.splice(uid, 1);
        playerDB.set(players);
        turnDB.remove();
    }

    //storageType.removeItem(storageKey);
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

function displayRPS0() {
    var divRPS = $("#rpsBox0");
    divRPS.empty();
    var divr = $("<div id='box0_rock' class='rps'>");
    divr.text("Rock");
    var divp = $("<div id='box0_paper' class='rps'>");
    divp.text("Paper");
    var divs = $("<div id='box0_scissors' class='rps'>");
    divs.text("Scissors");

    divRPS.append(divr);
    divRPS.append(divp);
    divRPS.append(divs);
}

function displayRPS0Pick(pick) {
    var divRPS = $("#rpsBox0");
    divRPS.empty();
    var divb = $("<div class='rpsBlank'>");
    divb.text("______________");
    var divp = $("<div class='rpsPick'>");
    divp.text(pick);

    divRPS.append(divb);
    divRPS.append(divp);
    divRPS.append(divb);
}

function displayRPS1Pick(pick) {
    var divRPS = $("#rpsBox1");
    divRPS.empty();
    var divb = $("<div class='rpsBlank'>");
    divb.text("______________");
    var divp = $("<div class='rpsPick'>");
    divp.text(pick);

    divRPS.append(divb);
    divRPS.append(divp);
    divRPS.append(divb);
}

function displayRPS1() {
    var divRPS = $("#rpsBox1");
    divRPS.empty();
    var divr = $("<div id='box1_rock' class='rps'>");
    divr.text("Rock");
    var divp = $("<div id='box1_paper' class='rps'>");
    divp.text("Paper");
    var divs = $("<div id='box1_scissors' class='rps'>");
    divs.text("Scissors");

    divRPS.append(divr);
    divRPS.append(divp);
    divRPS.append(divs);
}

function displayRPSBlank(divElement) {
    divElement.empty();
    var div1 = $("<div class='rpsBlank'>");
    divr.text("&nbsp;");

    divElement.append(div1);
    divElement.append(div1);
    divElement.append(div1);
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


function displayTotals0() {
    var totDiv = $("#totalsBox0");
    totDiv.empty();

    var msg = "Wins: 0, Losses: 0";
    if (players[0] !== null) {
        msg = "Wins: " + players[0].wins + ", Losses: " + players[0].losses;
    }
    totDiv.text(msg);
}

function displayTotals1() {
    var totDiv = $("#totalsBox1");
    totDiv.empty();

    var msg = "Wins: 0, Losses: 0";
    if (players[1] !== null) {
        msg = "Wins: " + players[1].wins + ", Losses: " + players[1].losses;
    }
    totDiv.text(msg);
}

function emptyChatDiv() {
    $("#chatDiv").empty();
}


