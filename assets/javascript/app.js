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

function testInputPlayers() {
    var list = [];
    list.push(setupPlayer("Curt"));
    list.push(setupPlayer("Melissa"));

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
