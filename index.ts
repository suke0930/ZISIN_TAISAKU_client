import * as fs from 'fs';
//const path = ('path');
import * as path from 'path';
const wslib = require("./lib/cli.js");
//const { argv } = require('process');
import { argv } from 'process';
import { json } from 'stream/consumers';
import WebSocket from 'ws';
//import { WebSocketServer } from 'ws';
/**
 * P2P地震対策APIから送られてくる情報の型
 */
interface datapar {
    code: number,
    id: string,
    time: string,
    earthquake: {
        time: string,
        maxScale: number,
        domesticTsunami: string,
        foreignTsunami: string,
        hypocenter: {
            name: string,
            latitude: number,
            longitude: number,
            depth: number,
            magnitude: number
        }
    },
    points: {
        pref: string,
        addr: string,
        isArea: boolean,
        scale: number
    }[]

}
let dataDirbuff = "";
//a

let ip_wserverbuff: string = "";
//let ip: string = "";
try {

    ip_wserverbuff = "ws://" + JSON.parse(fs.readFileSync("conf.json", 'utf8')).ip
} catch (error: any) {
    if ((error.errno === -2) && (error.syscall === "open")) {
        console.log(`you must set the conf.json!!`)
        process.exit();
    } else {
        console.log("Unknown error")
        console.log(error)
        process.exit();
    }

}

const ip_wserver = ip_wserverbuff


//const { number } = require('sharp/lib/is.js');



const previewsindo: number = 30;//プレビューする震度。これ以上ならログに流す
let ipbuff: string = "";
let typebuff: string = "";
let testbuff: boolean = false
let buffisdevdefaults: boolean = false;

if (argv[2] === "test") {


    if (argv[3]) {
        ipbuff = argv[3];
    } else {
        console.log("Specity IP and PORT.");
        console.log("Use defaults Port(6010)")
        ipbuff = "6010"
        buffisdevdefaults = true
    }



    dataDirbuff = path.join(__dirname, 'data_debug');
    typebuff = "zisintest"
    testbuff = true
    console.log("TEST MODE")

} else {
    dataDirbuff = path.join(__dirname, 'data');
    typebuff = "zisin"
};


const ip = ipbuff;
const dataDir = dataDirbuff;// データを保存するディレクトリパ
const type = typebuff;
const test = testbuff
const isdevdefaults = buffisdevdefaults
//console.log(argv[2])
//if (argv[2] === undefined) {
//    console.log("Specify IP and PORT.")
//    process.exit()
//};
//console.log("BOOT")
function createDirectoryIfNotExists(dirPath: string) {
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
/**
 * discord送る地震情報を組み立てる関数
 * @param data APIから送られてきたデータ
 * @param type discord_APIの送り先のID
 */
async function senddiscord(data: datapar, type: string) {
    // const 情報 = des(data.code);
    // const 震源地 = data.earthquake.hypocenter.name;
    // const 震度 = sindo(data.earthquake.maxScale)
    // const 時間 = data.earthquake.time
    // const マグニチュード = data.earthquake.hypocenter.magnitude
    // const 震源の深さ = data.earthquake.hypocenter.depth
    // const 国内津波 = tsunami(data.earthquake.domesticTsunami)
    // const 海外津波 = tsunami(data.earthquake.foreignTsunami)
    function des(id: number) {
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
    function sindo(data: number) {
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
    /**
     * 津波の情報をIDから特定
     * @param id dataの津波の情報
     * @returns string:津波に関する警告文
     */
    function tsunami(id: string) {
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

    await wslib.wssendms(type, tmpmessege1, ip_wserver).catch((error: string) => { console.log(error) })

    sprit.forEach(async (data) => {
        await wslib.wssendms(type, data, ip_wserver).catch((error: string) => { console.log(error) })
        //  console.log("-----ここから----")
        //     console.log(data)
        //    console.log("-----ここまで----")
    });


    setTimeout(async () => {
        await wslib.wssendms(type, tmpmessegeend, ip_wserver).catch((error: string) => { console.log(error) })
    }, 500);

}
/**
 * 入力された文字列を指定場所で分割する関数
 * @param inputString 処理したい文字列
 * @param maxLength 分ける文字数
 * @returns 分割後のもろもろ
 */
function splitStringByMaxLengthWithNewline(inputString: string, maxLength: number) {
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

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}:${month}:${day}:${hours}:${minutes}:${seconds}`;
}

function saveDataAsTimestampedJSON(data: datapar) {
    const timestamp = formatDate(new Date()); // 現在の日付を取得してフォーマットする
    const filename = `${timestamp}.json`; // タイムスタンプをファイル名として使用
    const dirPath = path.join(dataDir + "/" + String(data.code));
    const filePath = path.join(dataDir + "/" + String(data.code), filename);
    createDirectoryIfNotExists(dirPath);

    fs.writeFile(filePath, JSON.stringify(data), (err) => {
        if (err) {

            console.error('Failed to save data:', err);
        } else {
            console.log('Data saved successfully.');
        }
    });

}



//DEV環境

/**
 * 
 * @param ip テストモードでAPIを展開するIPとポート
 * @param type DISCORD_APIの送信先id
 * @param isdevdefaults ポートの使用に失敗したかどうか
 */
function devboot(ip: number, type: string, isdevdefaults: boolean) {
    const server = new WebSocket.Server({ port: ip });
    console.log("server has started.")
    console.log("PORT" + ip)
    server.on('connection', (socket) => {

        console.log(`[TEST]New client connected`);
        socket.on('message', (rawdata) => {
            const data: string = rawdata.toString();
            const datapar: datapar = JSON.parse(data)
            switch (datapar.code) {
                case 551:
                    senddiscord(datapar, type);
                    break;
                default:
                    break;
            }
            saveDataAsTimestampedJSON(datapar);
        });
        socket.on('close', () => {
            console.log('[TEST]Client disconnected');
        });
    });
    server.on('error', (error: NodeJS.ErrnoException) => {
        if (isdevdefaults) {
            if (error.code === "EADDRINUSE") {
                if (ip === 6020) {
                    console.log("too many port aleady use!")
                    console.log("exit")
                    process.exit();
                }
                const nextry = Number(ip) + 1;
                console.log(`port:${ip} is aleady use
                try use port:${nextry} 
                `)
                devboot(nextry, type, true)
            }
        };
    });
}


/**
 * 本番環境での稼働
 * @param type DISCORD APIに送る指定の種類。詳しくはDISCORD APIを見ろ
 */
function proboot(type: string) {

    // let count = 0;
    // setInterval(() => {
    //     count++;
    //     if (count > 180) {
    //         console.log("りろーでぃん！！")
    //         return -1;
    //     }
    // }, 1000);


    // //READ ONLY!!!!!!////
    // const ws = new WebSocket('wss://api.p2pquake.net/v2/ws');

    // ws.on('open', () => {
    //     console.log('Connected to 地震 server.');
    // });
    // ws.on('message', (rawdata) => {
    //     const stringdata = rawdata.toString();
    //     const datapar: datapar = JSON.parse(stringdata);
    //     switch (datapar.code) {
    //         case 551:
    //             count = 0;
    //             senddiscord(datapar, type);
    //             break;
    //         default:
    //             break;
    //     }
    //     saveDataAsTimestampedJSON(datapar);

    // });
    return new Promise((resolve, reject) => {
        // ここに非同期処理を記述
        let count = 0;
        const intervalId = setInterval(() => {
            console.log(count);
            count++;
            if (count > 30) {
                console.log("りろーでぃん！！");
                clearInterval(intervalId); // インターバルを停止
                ws.close();
                resolve(1);
            }
        }, 1000);

        //READ ONLY!!!!!!////
        const ws = new WebSocket('wss://api.p2pquake.net/v2/ws');

        ws.on('open', () => {
            console.log('Connected to 地震 server.');
        });
        ws.on('message', (rawdata: datapar) => {
            const data: string = rawdata.toString();
            const datapar: datapar = JSON.parse(data)

            switch (datapar.code) {
                case 551:
                    count = 0;
                    senddiscord(datapar, type);
                    break;
                default:
                    break;
            }
            saveDataAsTimestampedJSON(datapar);

        });
        ws.on('close', () => {
            console.log('ソケットは正常に終了しました');
        });
    });
}




if (test === true) { devboot(Number(ip), type, false) }


async function mainif() {
    if (test === false) {
        while (true === true) {
            console.log("インスタンス生成!")
            let result: any = await proboot(type);
        }
    }
}
mainif()



