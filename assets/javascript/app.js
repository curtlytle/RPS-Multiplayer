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
var dref = database.ref("/turn");
var chatDB = database.ref("/chat");

var players = [];
var turn = 0;
var storageType = sessionStorage;
var storageKey = "myRPSid";


playerDB.on("value", function (snapshot) {
    var data = snapshot.val();
    if (data != null) {
        players = data;
    } else {
        return;  // no data, just return
    }
    var stvalue = storageType.getItem(storageKey);
    var uid = -1;
    if (stvalue != null) {
        uid = Number(stvalue);
    }

    var cnt = players.length;

    if (uid === 1 && cnt === 1) {
        storageType.setItem(storageKey, 0);  // was second player, now first
        putTopMsg2(" ");
        $("#pNameBox1").empty();
        uid = 0;
    }

    putUpNames();

    if (uid === 0) {
        putTopMsg1("Hi " + players[0].name + "! You are player 1");
    } else if (uid === 1) {
        putTopMsg1("Hi " + players[1].name + "! You are player 2");
    }

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

dref.on("value", function (snapshot) {
    var turn = snapshot.val();
    if (turn === null || players === null) return;
    console.log("turn: " + turn);
    // setupEmptyTopMsgsDiv();

    var uid = Number(storageType.getItem(storageKey));
    if (turn === 0) {
        if (uid === 0) {
            putTopMsg2("It's your turn!");
            displayRPS0();
        } else {
            putTopMsg2("Waiting for " + players[0].name + " to choose!");
            console.log("Waiting for " + players[0].name + " to choose!");
        }
    } else if (turn === 1 ) {
        if (uid === 1) {
            putTopMsg2("It's your turn!");
            displayRPS1();
        } else {
            putTopMsg2("Waiting for " + players[1].name + " to choose!");
            // displayRPSBlank($("#rpsBox0"));
        }
    }

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

$(document).on("click touchstart", ".rps", pickRPS);

function pickRPS () {
    var text = $(this).text();
    displayRPS0Pick(text);
}

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

function putUpNames() {
    $("#pNameBox0").empty();
    $("#pNameBox0").text(players[0].name);

    if (players.length == 2) {
        $("#pNameBox1").empty();
        $("#pNameBox1").text(players[1].name);
    }
}

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

function emptyChatDiv() {
    $("#chatDiv").empty();
}

function setupPlayer(name) {
    if (players != null && players.length === 2) {
        return; // we already have both players in the list
    }
    var player = {
        name: name,
        wins: 0,
        losses: 0
    };

    var startTurn = false;

    if (players == null || players.length === 0) {
        storageType.setItem(storageKey, 0);
        setupEmptyTopMsgsDiv();
    } else {
        storageType.setItem(storageKey, 1);
        setupEmptyTopMsgsDiv();
        startTurn = true;
    }

    players.push(player);

    playerDB.set(players);

    if (startTurn) {
        dref.set(0);
    }
}

window.onunload = function () {
    if (players != null) {
        var uid = storageType.getItem(storageKey);
        players.splice(uid, 1);
        playerDB.set(players);
        dref.remove();
    }

    //storageType.removeItem(storageKey);
};
