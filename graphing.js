// create server instance
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const dgram = require('node:dgram');
const udpServer = dgram.createSocket('udp4');

// other modules
const configFile = require('./config.json'); // config file
//const utils = require('./utils.js'); // own utilities
const path = require('path'); // manage local paths
const fs = require('fs')

// WEB SERVER
// static files
const pagesStatics = 'pages';
app.use('/', express.static(path.join(__dirname, pagesStatics, 'plot')));
//app.use('/notFound',    express.static(path.join(__dirname, pagesStatics, 'notFound')));
app.use(express.static(path.join(__dirname, pagesStatics, 'statics')));

// every other request (e.g. /test /lol /get/database)
app.all('*', (req, res) => {
    //res.redirect('/notFound');
    res.status(404).send("404 not found")
});



// SOCKET
io.on('connect', (socket) => {

    console.log(socket.id, 'just connected to the server');

    socket.on('test', (data) => {
        console.log(socket.id, data);
    });

    socket.on('requestMatchList', (data) => {
        // console.log(socket.id, "req all matches");

        matchList = fs.readdirSync(path.join(__dirname, 'matches'));
        socket.emit('sendMatchList', ({matchList:matchList}));
    });
    
    socket.on('requestTurnList', (data) => {
        // console.log(socket.id, "req for", data.matchID);

        if (typeof data.matchID != 'string') {
            socket.emit('sendTurnList', ({matchID:data.matchID, error:true, code:-2}));
            return
        }

        if (!fs.existsSync(path.join(__dirname, 'matches', data.matchID))) { // match not found
            socket.emit('sendTurnList', ({matchID:data.matchID, error:true, code:-1}));
            return;
        }

        var turnList = fs.readdirSync(path.join(__dirname, 'matches', data.matchID));
        socket.emit('sendTurnList', ({matchID:data.matchID, turnList:turnList}));
    });

    socket.on('loadTurn', (data) => {
        var turnData = fs.readFileSync(path.join(__dirname, 'matches', data.matchID, data.turn), 'utf8');
        // console.log(socket.id, "req for", data.matchID, data.turn);
        socket.emit('sendTurn', ({turn:turnData}));
    });

    socket.on('disconnecting', () => {
		console.log(socket.id, 'just disconnected from the server');
	});
});

// UDP SERVER

/**
 * 
 * @param {Date} _date 
 * @returns string
 */
function formatDate(_date) {

    let formatted_date = 
    _date.getFullYear() + '-' +
    ifOneDigit((_date.getMonth() + 1).toString()) + '-' +
    ifOneDigit((_date.getDate() + 1).toString()) + 'T' +
    ifOneDigit((_date.getHours() + 1).toString()) + ':' +
    ifOneDigit((_date.getMinutes() + 1).toString()) + ':' +
    ifOneDigit((_date.getSeconds() + 1).toString()) + '.' +
    _date.getMilliseconds();

    return formatted_date;
}

/**
     * 
     * @param {string} str 
     */
function ifOneDigit(str) {
    if (str.length == 1) {
        return '0' + str;
    }
    return str;
}

udpServer.on('error', (err) => {
    console.error(`udpServer error:\n${err.stack}`);
    udpServer.close();
});

udpServer.on('message', (msg, rinfo) => {
    console.log(`udpServer got: turnData from ${rinfo.address}:${rinfo.port}`);

    var data = msg.toString()
    var jsonData = JSON.parse(data)
    var turn = jsonData.turn;
    var time = jsonData.time;

    // check if directory exists
    if (!fs.existsSync(path.join(__dirname, 'matches', time))) { // match not exists -> mkdir
        fs.mkdirSync(path.join(__dirname, 'matches', time));
    }

    // write file
    fs.writeFileSync(path.join(__dirname, 'matches', time, `turn${ifOneDigit(turn.toString())}.json`), data, 'utf8');

    //const date = new Date();
    //const format = formatDate(date);
    //console.log('own:', format);
    //console.log('udp:', "clienttime");
});

udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`udpServer listening ${address.address}:${address.port}`);
});



// boot up services
udpServer.bind(configFile.udpServer.port, configFile.udpServer.host);

server.listen(configFile.webServer.port, configFile.webServer.host, () => {
    console.log(`webServer listening ${configFile.webServer.host}:${configFile.webServer.port}`);
});