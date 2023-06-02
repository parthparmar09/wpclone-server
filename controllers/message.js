const Conversation = require('../models/conversation')
const Message = require('../models/message')
const {StautsCodes, StatusCodes} = require('http-status-codes')

//post a meesage in a conversation
const postMessage = async (req,res) => {
    let url = ''
    let isImage = false
    if(req.body.url){
        url = req.body.url
        isImage = true
    }
    let message = await Message.create({
        sender : req.user._id,
        convo_id : req.params.id,
        msg : req.body.msg,
        isImage,
        url
    })
    message = await Message.findOne({_id : message._id}).populate('sender' , 'name email pfp').populate('convo_id' ,'members _id')
    const convo = await Conversation.findByIdAndUpdate({_id : req.params.id} , {lastMsg : message._id})

    res.status(StatusCodes.CREATED).json({success : true , message})
}

//get all messages of a conversation
const getMessages = async (req,res) => {
    const msgs = await Message.find({convo_id : req.params.id}).populate('sender' , 'name email pfp')
    res.status(StatusCodes.CREATED).json({success : true , msgs})
}

//delete all messages of a conversation
const deleteMessages = async (req,res) => {
    const msg =  await Message.deleteMany({convo_id : req.params.id})

    res.status(StatusCodes.OK).json({success : true , msg : 'chat cleared'})
}

module.exports = {postMessage , getMessages , deleteMessages}
