const {EventEmitter} = require("events");
const mongoose = require('./db-connector');
const schema = require('./schema');

const Message = mongoose.model('Message', schema);

let instance;
let data = [];
let MAX = 50;

class Records extends EventEmitter {
    constructor () {
        super();
    }

    push (msg) {
        // 將聊天資料轉成資料模型
        const m = new Message(msg);
        console.log("message is ", m)
        // 存至資料庫
        m.save();

        this.emit("new_message", msg);

        // 取得資料庫中有多少筆紀錄
        Message.count().then((count) => {
            if (count >= MAX) {
                Message.find().sort({'time': 1}).limit(1).then((res) => {  // 找到最舊的那個訊息
                    Message.findByIdAndRemove(res[0]._id);                 // 然後移除
                });
            }
        });
    }

    get (callback) {
        // 取出所有資料
        Message.find((err, msgs) => {
            callback(msgs);
        });
    }

    setMax (max) {
        MAX = max;
    }

    getMax () {
        return MAX;
    }
}

module.exports = (function () {
    if (!instance) {
        instance = new Records();
    }

    return instance;
})();
