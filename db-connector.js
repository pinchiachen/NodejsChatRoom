const setting = require('./setting.js');
const mongoose = require('mongoose');
var name = setting.getName();
var passwd = setting.getPasswd();
const uri = "mongodb+srv://" + name + ":" + passwd + "@nodechatroom-zj1ib.gcp.mongodb.net/test?retryWrites=true&w=majority"
mongoose.connect(uri);

module.exports = mongoose.connection;