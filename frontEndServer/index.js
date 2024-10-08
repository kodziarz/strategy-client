var express = require("express");
var app = express();
const SETTINGS = require("../settings.json");
const PORT = SETTINGS.frontEndServerPort;
var path = require("path");

app.use(express.urlencoded({
    extended: true
}));

console.log("ścieżka: ", path.join(__dirname, "..", "frontEnd"));

app.use(express.static(path.join(__dirname, "..", "frontEnd")));

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT);
});

// host DRACO codecs
app.get("/draco/:path", function (req, res) {
    res.sendFile(path.join(
        __dirname,
        "node_modules/three/examples/jsm/libs/draco",
        ...req.params.path.split("/")));
});

// app.get("/", function (req, res) {
//     res.sendFile(path.join(__dirname + "/static/game.html"));
// })