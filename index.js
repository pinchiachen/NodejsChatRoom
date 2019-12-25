const express = require('express');
const app = express();
// const server = require('http').Server(app);
const server = app.listen(3000);    // 啟動伺服器
// const io = require('socket.io')(server);
const io = require('socket.io').listen(server);
const records = require('./records.js');

var userSchema = require('./userSchema');
var adminSchema = require('./adminSchema');
var bodyParser = require('body-parser');
var crypto = require("crypto");

const mongoose = require('./db-connector');

// 解析表單數據
app.use(bodyParser.urlencoded({extended:true}))

// 加入線上人數計數
let onlineCount = 0;

// app.get('/', (req, res) => {
//     // res.send('Hello, World!');
//     res.sendFile( __dirname + '/views/home.html');
// });

// 建立 Router 物件
var router = express.Router();

// 首頁路由 
router.get('/', function(req, res) {
    res.sendFile( __dirname + '/views/home.html');
});

// 註冊頁面路由 
router.get('/register', function(req, res) {
    res.sendFile( __dirname + '/views/register.html');
});

// 登入頁面路由 
router.get('/login', function(req, res) {
    res.sendFile( __dirname + '/views/login.html');
});

// 聊天室頁面路由 
router.get('/chat', function(req, res) {
    res.sendFile( __dirname + '/views/index.html');
});

// 管理員登入頁面路由 
router.get('/adminlogin', function(req, res) {
    res.sendFile( __dirname + '/views/adminlogin.html');
});

// 後台頁面路由 
router.get('/admin', function(req, res) {
    res.sendFile( __dirname + '/views/admin.html');
});

// 將路由套用至應用程式
app.use('/', router);

// 當發生連線事件
io.on('connection', (socket) => {
    onlineCount++;
    io.emit("online", onlineCount);
    socket.emit("maxRecord", records.getMax());   // 記錄最大值，用來讓前端網頁知道要放多少筆
    // socket.emit("chatRecord", records.get());     // 發送紀錄
    records.get((msgs) => {
        socket.emit("chatRecord", msgs);
    });

    socket.on("send", (msg) => {
        if (Object.keys(msg).length < 2) {
            return;
        }
        records.push(msg);
    });

    // 當發生離線事件
    socket.on('disconnect', () => {
        onlineCount = (onlineCount<0) ? 0 : onlineCount-1;
        io.emit("online", onlineCount);
    });

});

// Records 的事件監聽器
records.on("new_message", (msg) => {
    // 廣播訊息到聊天室
    io.emit("msg", msg);
});

// server.listen(3000, () => {
//     console.log("Server Started. http://localhost:3000");
// });

// // ---- 啟動伺服器 ----
// app.listen(3000, () => {
//     console.log("AppServer Started. http://localhost:3000");
// });

// 新增會員資料
function insert (name,psw) {
    // 資料格式
    var user =  new userSchema({
                username : name,
                userpsw : psw,
            });
    user.save(function(err,res) {
        if (err) {
            console.log(err);
        } else {
            console.log(res);
        }
    })
}

// 新增管理員帳號
function insertAdmin (name,psw) {
    // 資料格式
    var user =  new adminSchema({
                username : name,
                userpsw : psw,
            });
    user.save(function(err,res) {
        if (err) {
            console.log(err);
        } else {
            console.log(res);
        }
    })
}

// 註冊
app.post('/register', function (req, res) {
    // 處理跨域問題
    res.setHeader('Content-type','application/json;charset=utf-8')
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    // 先查詢是否有此user
    var UserName = req.body.username;
    var UserPsw = req.body.password;
    // 密碼加密
    var md5 = crypto.createHash("md5");
    var newPas = md5.update(UserPsw).digest("hex");
    // 通過證號認證
    var updatestr = {username: UserName};
    if (UserName == '') {
        res.send({status:'success', message:false});
    }
    res.setHeader('Content-type','application/json;charset=utf-8')
    userSchema.find(updatestr, function (err, obj) {
        if (err) {
            console.log("Error:" + err);
        } else {
            if(obj.length == 0){
                // 如果查無數據，就將資料插入資料庫
                insert(UserName,newPas); 
                // 返回資料至前端
                res.send({status:'success', message:true}) 
            } else if (obj.length !=0) {
                res.send({status:'success', message:false}) 
            } else {
                res.send({status:'success', message:false}) 
            }
        }
    })  
});

// 登入
app.post('/login', function (req, res, next) {
    // 先查詢有沒有該user
    console.log("req.body" + req.body);
    var UserName = req.body.username;
    var UserPsw = req.body.password;
    // 密碼加密
    var md5 = crypto.createHash("md5");
    var newPas = md5.update(UserPsw).digest("hex");
    // 通過帳號密碼搜索驗證
    var updatestr = {username: UserName, userpsw:newPas};
    // 處理跨域的問題
    res.setHeader('Content-type','application/json;charset=utf-8')
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    userSchema.find(updatestr, function (err, obj) {
        if (err) {
            console.log("Error:" + err);
        } else {
            if (obj.length == 1) {
                console.log('登入成功');
                res.send({status:'success', message:true, data:obj}); 
            } else {
                console.log('帳號密碼錯誤'); 
                res.send({status:'success', message:false}); 
            }
        }
    })
});

// 管理員登入
app.post('/adminlogin', function (req, res, next) {
    // 先查詢有沒有該user
    console.log("req.body" + req.body);
    var UserName = req.body.username;
    var UserPsw = req.body.password;
    // 密碼加密
    var md5 = crypto.createHash("md5");
    var newPas = md5.update(UserPsw).digest("hex");
    // 通過帳號密碼搜索驗證
    var updatestr = {username: UserName, userpsw:newPas};
    // 處理跨域的問題
    res.setHeader('Content-type','application/json;charset=utf-8')
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')   
    adminSchema.find(updatestr, function (err, obj) {
        if (err) {
            console.log("Error:" + err);
        } else {
            if (obj.length == 1) {
                console.log('登入成功');
                res.send({status:'success', message:true, data:obj}); 
            } else {
                console.log('帳號密碼錯誤'); 
                res.send({status:'success', message:false}); 
            }
        }
    })
});

// 查詢會員資料
// 不知為何無法用get方法，故用post
app.post('/search', function (req, res, next) {
    // 去資料庫抓資料
    userSchema.find({}, {__v: 0}, function (err, obj) {
        if (err) {
            console.log("Error:" + err);
        } else {
            console.log("obj is ", obj);
            res.json(obj);
        }
    });
});

// 刪除會員資料
app.delete('/delete', function (req, res, next) {
    var UserName = req.body.username;
    userSchema.find({username: UserName}, function (err, obj) {
        if (obj.length == 0) {
            res.send({status:'not found'});
            console.log("查無此帳號");
        } else {
            userSchema.deleteOne({ username: UserName }, function (err, obj) {
                if (obj.length == 0) {
                    console.log("刪除失敗：", UserName);
                    res.send({status:'fail'});
                } else {
                    console.log("刪除成功：", UserName);
                    res.send({status:'success'});
                }
            });
        }
    });
});

// 修改會員資料
app.post('/update', function (req, res, next) {
    var UserName = req.body.username;
    var UserPsw = req.body.password;
    console.log("YYYYYY", UserPsw)
    // 密碼加密
    var md5 = crypto.createHash("md5");
    var newPas = md5.update(UserPsw).digest("hex");
    console.log("ZZZZZZZZ", newPas)
    // 通過帳號密碼搜索驗證
    // var updatestr = {username: UserName, userpsw:newPas};  
    userSchema.find({username: UserName}, function (err, obj) {
        if (obj.length == 0) {
            res.send({status:'not found'});
            console.log("查無此帳號");
        } else {
            userSchema.updateOne({username: UserName}, {userpsw: newPas}, function (err, obj) {
                if (obj.length == 0) {
                    console.log("修改失敗：", UserName);
                    res.send({status:'fail'});
                } else if (err) {
                    console.log("修改失敗");
                } else {
                    console.log("修改成功：", UserName);
                    res.send({status:'success'});
                }
            });
        }
    });
});

