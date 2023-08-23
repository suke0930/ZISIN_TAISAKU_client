"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webserver = void 0;
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
// クラスの定義
class webserver {
    // コンストラクタ
    constructor(prop1, prop2) {
        this.port = prop1;
        this.path = prop2;
        this.app = (0, express_1.default)();
    }
    // メソッドの定義
    on() {
        app.use(express_1.default.json());
        // Routes
        app.get('/zisin', (req, res) => {
            const filePath = "../react/bundle.js";
            //res.sendFile(filePath);
            res.send(filePath);
        });
        app.get('/reqjson', (req, res) => {
            const filePath = '../data/551/' + req.query.file;
            res.sendFile(filePath);
        });
        // Start the server
        app.listen(this.port, () => {
            console.log(`Server is listening on port ${this.port}`);
        });
    }
}
exports.webserver = webserver;
