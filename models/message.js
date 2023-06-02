const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : [true , `sender can't be empty`]
    },
    convo_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Conversation"
    },
    msg : {
        type : String,
    },
    isImage : {
        type : Boolean,
        default : false
    },
    url : {
        type : String,
    }
} , {timestamps : true})

module.exports = mongoose.model('Message' , MessageSchema)