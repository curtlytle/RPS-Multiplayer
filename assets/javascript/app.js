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
var dref = database.ref();


dref.on("value", function (snapshot) {
    var data = snapshot.val();

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

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

function putTopMsg1(msg) {
    $("#topMsg1").empty();
    $("#topMsg1").text(msg);
}

function putTopMsg2(msg) {
    $("#topMsg2").empty();
    $("#topMsg2").text(msg);
}

var cnt = 0;

$("#chatButton").on("click", function () {
    event.preventDefault();
    var chatMsg = $("#chatText").val().trim();

    var msgp = $("<p class='chatP'>").text(chatMsg);
    console.log(msgp);
    $("#chatDiv").prepend(msgp);

    if (cnt === 0) {
        setupEmptyTopMsgsDiv();
        putTopMsg1("Top message number 1");
    } else if (cnt === 1) {
        putTopMsg2("second message");
    }
    cnt++;
});

function emptyChatDiv() {
    $("#chatDiv").empty();
}

function testInputPlayers() {
    var list = [];
    list.push(setupPlayer("Curt"));
    list.push(setupPlayer("Mason"));

    var players = {
        players: list
    };

    dref.set(players);
}

function setupPlayer(name) {
    var player = {
        name: name,
        wins: 0,
        losses: 0
    };

    return player;
}

testInputPlayers();
