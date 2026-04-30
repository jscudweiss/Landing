const express = require("express");
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

app.listen(process.env.PORT || 4000, function () {
    console.log("server started at 4000");
})

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/Landing.html");
})
app.get('/Home', function (req, res) {
    res.sendFile(__dirname + "/public/Landing.html");
})
app.get('/Booking', function (req, res) {
    res.sendFile(__dirname + "/public/Booking.html");
})

