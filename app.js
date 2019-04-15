
const execFile = require('child_process').execFile;
const Redis = require('ioredis');
const readline = require('readline');
const express = require('express');
var app = express(),
    bodyParser = require('body-parser');
var http = require('http').Server(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const RedisDB = new Redis(6379, '5.253.27.99');
const HTTP_PORT = 1243;

app.post('/createMatch', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    console.log("Spawning The Match");

    var users = JSON.parse(req.body.raw);

    var match = execFile('/home/centos/Physic/Match');

    const rl = readline.createInterface({
        input: match.stderr
    });

    rl.on('line', (input) => {
        console.log("Input Message: " + input);
        if (!isNaN(input)) {
            res.status(200).send(JSON.stringify({
                port: parseInt(input)
            }));
        } else {
            console.log("Error: " + input);
        }
    });

    readline.createInterface({
        input: match.stdout
    }).on('line', (input) => console.log(input));


    var req = [];
    for (var i = 0; i < users.length; i++) {
        req.push(['hget', users[i], 'CurrentHero']);
    }

    RedisDB.multi(req).exec(function (err, raw) {
        if (err != null) {
            //TODO: Handle The Error
        }

        for (var i = 0; i < raw.length; i++) {
            console.log("User: " + users[i] + ", " + raw[i][1]);
            this.match.stdin.write(users[i] + "\n");
            this.match.stdin.write(raw[i][1] + "\n");
        }

        this.match.stdin.write("Default\n"); //Map
        console.log("Match Ready To Pair");
    }.bind({ match: match }));

});

http.listen(process.env.PORT || HTTP_PORT);
