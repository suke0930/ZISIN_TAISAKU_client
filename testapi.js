
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data32'); // データを保存するディレクトリパス

// データを保存するディレクトリを再帰的に作成


// ディレクトリの作成が成功したらデータを保存する
function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}:${month}:${day}:${hours}:${minutes}:${seconds}`;
}

function saveDataAsTimestampedJSON(data) {
        const timestamp = formatDate(new Date()); // 現在の日付を取得してフォーマットする
        const filename = `${timestamp}.json`; // タイムスタンプをファイル名として使用
        const filePath = path.join(dataDir, filename);

        fs.writeFile(filePath, JSON.stringify(data), (err) => {
                if (err) {
                        console.error('Failed to save data:', err);
                } else {
                        console.log('Data saved successfully.');
                }
        });
}


const ws2 = require("ws")
//const ws2 = new ws('ws://api.p2pquake.net/v2/ws')

const ws = new ws2('wss://api.p2pquake.net/v2/ws');
ws.on('open', () => {
        console.log('Connected to the server.');
        // ws.send(JSON.stringify({ type: "zisin", message: "----------\n"+variable1 +"\n"+ variable2 +"\n----------\n"}))

        //ws.close()
        //process.exit()
});
ws.on('message', (data) => {
        const datapar = JSON.parse(data)
        if (datapar.code !== 555 && datapar.code !== 9611) {
                saveDataAsTimestampedJSON(datapar);
        }


});
