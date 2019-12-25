const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// module.exports = new Schema({
//     userName: {              
//         type: String,     
//         required: true,   
//     },
//     userPw: {
//         type: String,
//         required: true,
//     },
// });

var UserSchema = new Schema({
    username : String,
    userpsw : String,
})

module.exports = mongoose.model('User',UserSchema);