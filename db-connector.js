const setting = require('./setting.js');
const mongoose = require('mongoose');
var name = setting.getName();
var passwd = setting.getPasswd();
var address = setting.getAddress();
const uri = "mongodb+srv://" + name + ":" + passwd + address
mongoose.connect(uri);

module.exports = mongoose.connection;