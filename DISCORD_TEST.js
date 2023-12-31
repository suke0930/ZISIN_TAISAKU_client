const fs = require('fs');
const path = require('path');
const wslib = require("./lib/cli.js");
const { argv } = require('process');
const dataDir = path.join(__dirname, 'data'); // データを保存するディレクトリパス
const previewsindo = 30 //プレビューする震度。これ以上ならログに流す
const ip = "ws://" + argv[2]
if (argv[2] === undefined) {
    console.log("Specify IP and PORT.")
    process.exit()
}
async function senddiscord(data) {
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
        ////あああああ

    }
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

    await wslib.wssendms("zisintest", tmpmessege1, ip).catch((error) => { console.log(error) })

    sprit.forEach(async (data) => {
        await wslib.wssendms("zisintest", data, ip).catch((error) => { console.log(error) })
        //  console.log("-----ここから----")
        //     console.log(data)
        //    console.log("-----ここまで----")
    });


    setTimeout(async () => {
        await wslib.wssendms("zisintest", tmpmessegeend, ip).catch((error) => { console.log(error) })
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
    const filePath = path.join(dataDir, filename);

    fs.writeFile(filePath, JSON.stringify(data), (err) => {
        if (err) {
            console.error('Failed to save data:', err);
        } else {
            console.log('Data saved successfully.');
        }
    });
}
const datapar = {

    "_id": "64ba6f6a51d38bb17b2e8461",
    "code": 551,
    "earthquake": {
        "domesticTsunami": "None",
        "foreignTsunami": "Unknown",
        "hypocenter": {
            "depth": 50,
            "latitude": 37.7,
            "longitude": 141.5,
            "magnitude": 3.9,
            "name": "福島県沖"
        },
        "maxScale": 10,
        "time": "2023/07/21 20:40:00"
    },
    "issue": {
        "correct": "None",
        "source": "気象庁",
        "time": "2023/07/21 20:43:36",
        "type": "DetailScale"
    },
    "points": [
        {
            "addr": "田村市船引町",
            "isArea": false,
            "pref": "福島県",
            "scale": 10
        },
        {
            "addr": "田村市常葉町",
            "isArea": false,
            "pref": "福島県",
            "scale": 10
        },
        {
            "addr": "田村市都路町",
            "isArea": false,
            "pref": "福島県",
            "scale": 10
        },
        {
            "addr": "相馬市中村",
            "isArea": false,
            "pref": "福島県",
            "scale": 10
        },
        {
            "addr": "福島広野町下北迫大谷地原",
            "isArea": false,
            "pref": "福島県",
            "scale": 10
        },
        {
            "addr": "楢葉町北田",
            "isArea": false,
            "pref": "福島県",
            "scale": 10
        },
        {
            "addr": "川内村下川内",
            "isArea": false,
            "pref": "福島県",
            "scale": 10
        },
        {
            "addr": "大熊町大川原",
            "isArea": false,
            "pref": "福島県",
            "scale": 10
        },
        {
            "addr": "浪江町幾世橋",
            "isArea": false,
            "pref": "福島県",
            "scale": 10
        }
    ],
    "time": "2023/07/21 20:43:38.1",
    "timestamp": {
        "convert": "2023/07/21 20:43:37.952",
        "register": "2023/07/21 20:43:38.101"
    },
    "user_agent": "jmaxml-seis-parser-go, relay, register-api",
    "ver": "20220813"

}

senddiscord(datapar);





