const WebSocket = require('ws');
const ws = new WebSocket("ws://localhost:6694");
const fs = require('fs');
const path = require('path');
const { argv } = require('process');
const Abuff = fs.readFileSync("./data3/" + argv[2], 'utf8')
const A = JSON.parse(Abuff)


//console.log(A)
//console.log(A.code)
try {
    ws.on('open', () => {
        console.log('Connected to the server.');
        ws.send(JSON.stringify(A))
        ws.close();
    });
    ws.on('error', () => {
        console.log("つながんねぇ！")
    })

} catch (error) {
    console.log("つながんねぇ！")
}
