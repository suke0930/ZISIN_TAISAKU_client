import express from 'express';
import { type } from 'os';
const app = express();
// クラスの定義
export class webserver {
    // プロパティの宣言
    private app: express.Express;
    private port: string;
    private path: string;

    // コンストラクタ
    constructor(prop1: string, prop2: string) {
        this.port = prop1;
        this.path = prop2;
        this.app = express();
    }
    // メソッドの定義
    on() {
        app.use(express.json());
        // Routes
        app.get('/zisin', (req: express.Request, res: express.Response) => {
            const filePath = "../react/bundle.js";
            //res.sendFile(filePath);
            res.send(filePath)
        });
        app.get('/reqjson', (req: express.Request, res: express.Response) => {
            const filePath = '../data/551/' + req.query.file;
            res.sendFile(filePath);
        });

        // Start the server
        app.listen(this.port, () => {
            console.log(`Server is listening on port ${this.port}`);
        });
    }
}