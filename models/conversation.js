const mongoose = require('mongoose');

const ConvoSchema = new mongoose.Schema({
    name : {
        type : String
    },
    isGroup : {
        type : Boolean,
        default : false
    },
    members : [
        {type : mongoose.Schema.Types.ObjectId , ref : "User"}
    ],
    admin : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "User"
    },
    pfp : {
        type : String,
    },
    lastMsg : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Message"
    }
} , {timestamps : true})

module.exports = mongoose.model('Conversation' , ConvoSchema)