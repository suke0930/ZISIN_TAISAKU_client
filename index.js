const fs = require('fs');
const path = require('path');
const wslib = require("./lib/cli.js");
const { argv } = require('process');

const ws2 = require("ws");
const dataDir = path.join(__dirname, 'data'); // データを保存するディレクトリパ
const previewsindo = 30;//プレビューする震度。これ以上ならログに流す
const ip = "ws://" + argv[2];
let typebuff = "";
let testbuff = false
if (argv[3] === "test") {
    typebuff = "zisintest"
    testbuff = true
    console.log("TEST MODE")
} else {
    typebuff = "zisin"
};
const type = typebuff;
const test = testbuff
//console.log(argv[2])
if (argv[2] === undefined) {
    console.log("Specify IP and PORT.")
    process.exit()
};
//console.log("BOOT")
function createDirectoryIfNotExists(dirPath) {
    // 絶対パスを取得する
    const absolutePath = path.resolve(dirPath);

    // ディレクトリが存在するか確認
    if (fs.existsSync(absolutePath)) {
        console.log(`Directory ${absolutePath} already exists.`);
        return;
    }

    // ディレクトリが存在しない場合、親ディレクトリを含めて作成
    try {
        fs.mkdirSync(absolutePath, { recursive: true });
        console.log(`Directory ${absolutePath} created successfully.`);
    } catch (err) {
        console.error(`Error creating directory: ${err}`);
    }
}

async function senddiscord(data, type) {
    function des(id) {
        switch (id) {
            case 551:
                return "地震情報"
                break;
            case 552:
                return "津波予報"
                break;
            case 554:
                return "緊急地震速報の発表検出"
                break; 554
            case 556:
                return "緊急地震速報出"
                break; 554
        }


    };
    function sindo(data) {
        let sindo = "震度"
        let k10 = String(data).slice(0, 1)
        let k20 = String(data).slice(1, 2)
        if (data < 44 || data === 70) {
            sindo = sindo + k10
        } else if (data > 44) {
            switch (k20) {
                case "0":
                    sindo = sindo + k10 + "強"
                    break;

                case "5":
                    console.log(k10)
                    console.log(data)
                    sindo = sindo + String(Number(k10) + 1) + "弱"
                    break;
            }

        }
        return sindo;
    }
    function tsunami(id) {
        switch (id) {
            case "Unknown":
                return "不明"
                break;
            case "None":
                return "なし"
                break;
            case "Checking":
                return "調査中"
                break;
            case "NonEffectiveNearby":
                return "震源の近傍で小さな津波の可能性があるが、被害の心配なし"
                break;
            case "WarningNearby":
                return "震源の近傍で津波の可能性がある"
                break;
            case "WarningPacific":
                return "太平洋で津波の可能性がある"
                break
            case "WarningPacificWide":
                return "太平洋の広域で津波の可能性がある"
                break
            case "WarningIndian":
                return "インド洋で津波の可能性がある"
                break
            case "WarningIndianWide":
                return "インド洋の広域で津波の可能性がある"
                break
            case "Potential":
                return "一般にこの規模では津波の可能性がある"
                break
            case "Watch":
                return "津波注意報"
                break
            case "Warning":
                return "津波予報(種類不明)"
                break
        }
    }
    const 上のバー = "\n----------\n"
    const 下のバー = "----------\n"
    /**
     *ここより下は初期化
     */
    let 各地の情報 = "      >>> __各地測定情報__  \n"
    let tmpmessege1 = ""
    let tmpmessegeend = ""
    /**
    *ここまで
    */
    if (data.code === 551) {
        const 情報 = des(data.code);
        const 震源地 = data.earthquake.hypocenter.name;
        const 震度 = sindo(data.earthquake.maxScale)
        const 時間 = data.earthquake.time
        const マグニチュード = data.earthquake.hypocenter.magnitude
        const 震源の深さ = data.earthquake.hypocenter.depth
        const 国内津波 = tsunami(data.earthquake.domesticTsunami)
        const 海外津波 = tsunami(data.earthquake.foreignTsunami)

        data.points.forEach((data) => {
            //"場所:" + data.pref + data.addr
            ``
            if (data.scale > previewsindo) {
                各地の情報 = 各地の情報 + `
                ${data.pref}${data.addr}:${sindo(data.scale)}`
            }

        });
        各地の情報 = 各地の情報 + "\n"
        //       messege = 上のバー + "***" + 情報 + "***\n" + "震源地:" + 震源地 + "\n" + 震度 + "\nマグニチュード:" + マグニチュード
        //        messege = messege + "\n震源の深さ:" + 震源の深さ + "\n時間:" + 時間 + "\n津波への影響\n　　　国内:" + 国内津波 + "\n　　　海外:" + 海外津波 + "\n***" + 情報 + "***\n" + 下のバー
        tmpmessege1 = `
----------
:warning:***${情報}***:warning:
震源地:${震源地}
${震度}
マグニチュード:${マグニチュード}
震源の深さ:${震源の深さ}km
時間:${時間}
津波への影響
        国内:${国内津波}
        海外:${海外津波}
`
        tmpmessegeend = ` 
:warning:***地震情報***:warning:
----------
        `
        // messege = tmpmessege


    } else {
        console.log("551以外")
    }
    console.log(各地の情報.length)
    const maxLength = 1500;
    const sprit = splitStringByMaxLengthWithNewline(各地の情報, maxLength);

    await wslib.wssendms(type, tmpmessege1, ip).catch((error) => { console.log(error) })

    sprit.forEach(async (data) => {
        await wslib.wssendms(type, data, ip).catch((error) => { console.log(error) })
        //  console.log("-----ここから----")
        //     console.log(data)
        //    console.log("-----ここまで----")
    });


    setTimeout(async () => {
        await wslib.wssendms(type, tmpmessegeend, ip).catch((error) => { console.log(error) })
    }, 500);

}
function splitStringByMaxLengthWithNewline(inputString, maxLength) {
    if (typeof inputString !== 'string' || inputString.length <= maxLength) {
        return [inputString];
    }

    const resultArray = [];
    let currentIndex = 0;

    while (currentIndex < inputString.length) {
        let chunk = inputString.substr(currentIndex, maxLength);
        const lastNewlineIndex = chunk.lastIndexOf('\n');

        if (lastNewlineIndex !== -1) {
            chunk = chunk.substr(0, lastNewlineIndex + 1);
            currentIndex += lastNewlineIndex + 1;
        } else {
            currentIndex += maxLength;
        }

        resultArray.push(chunk.trim());
    }

    return resultArray;
}
// テスト
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
    const filePath = path.join(dataDir + "/" + String(data.code), filename);
    createDirectoryIfNotExists(filePath)
    fs.writeFile(filePath, JSON.stringify(data), (err) => {
        if (err) {

            console.error('Failed to save data:', err);
        } else {
            console.log('Data saved successfully.');
        }
    });
}

//DEV環境
if (test === true) {
    const server = new ws2.Server({ port: 6694 });
    server.on('connection', (socket) => {
        console.log(`[TEST]New client connected: ${socket._socket.remoteAddress}:${socket._socket.remotePort}`);
        socket.on('message', (data) => {
            const datapar = JSON.parse(data)
            if (datapar.code !== 555 && datapar.code !== 9611) {
                console.log("A")
                saveDataAsTimestampedJSON(datapar);
                senddiscord(datapar, type);

            }
        });
        socket.on('close', () => {
            console.log('[TEST]Client disconnected');
        });
    });
}

//本番環境
if (test === false) {
    //READ ONLY!!!!!!////
    const ws = new ws2('wss://api.p2pquake.net/v2/ws');
    ws.on('open', () => {
        console.log('Connected to 地震 server.');

    });
    ws.on('message', (data) => {
        const datapar = JSON.parse(data)
        if (datapar.code !== 555 && datapar.code !== 9611) {
            senddiscord(datapar, type);
            saveDataAsTimestampedJSON(datapar);
        }
    });
    //READ ONLY!!!!!!////
}



