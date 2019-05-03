const execFile = require('child_process').execFile;
const axios = require('axios');
const Redis = require('ioredis');
const readline = require('readline');
const express = require('express');
var app = express(),
    bodyParser = require('body-parser');
var http = require('http').Server(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const RedisDB = new Redis(6379, '5.253.27.99');
const HTTP_PORT = 1243;
const SERVER_IP = '5.253.27.99';
const MAIN_SERVER = '5.253.27.99';

app.post('/createMatch', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    console.log("Spawning The Match");

    var users = JSON.parse(req.body.raw);

    var match = execFile('/home/centos/Physic/Match');

    const rl = readline.createInterface({
        input: match.stderr
    });

    rl.on('line', function (input) {
        console.log("Input Message: " + input);
        if (!isNaN(input)) {
            var matchPort = parseInt(input);
            res.status(200).send(JSON.stringify({
                port: matchPort
            }));
            axios.post('http://5.253.27.99:254/onSpawn', {
                    serverIP: SERVER_IP,
                    serverPort: matchPort,
                    userIds: users
                })
                .then(function (response) {
                    var id = response.data.id;
                    this.match.stdin.write(id + "\n");
                }.bind({
                    match: this.match
                }))
                .catch(function (error) {
                    console.log(error);
                });
        } else {
            console.log("Error: " + input);
        }
    }.bind({
        match: match
    }));

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
    }.bind({
        match: match
    }));

});

http.listen(process.env.PORT || HTTP_PORT);