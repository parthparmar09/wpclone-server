const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()

const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true , `name can't be empty`]
    },
    pfp : {
        type : String,
    },
    email : {
        type : String,
        required : [true , `email can't be empty`],
        match : [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'provide a valid email',
        ],
        unique : true
    },
    password : {
        type : String ,
        required : [true , `password can't be empty`],
        minlength : 5,
    },
    contacts : [
        {type : mongoose.Schema.Types.ObjectId,
        ref : 'User'}
    ]
} , {timestamps : true})

UserSchema.pre('save' , async function(){
    try {
        const salt = await bcrypt.genSalt(5)
        this.password = await bcrypt.hash(this.password , salt)
    } catch (error) {
        console.error(error)
    }
})

UserSchema.methods.createJwt = function() {
    return jwt.sign({id: this._id}, process.env.SECRET_KEY)
}

UserSchema.methods.comparePass =  async function (pass) {
    return await bcrypt.compare(pass , this.password)
  }

module.exports = mongoose.model('User' , UserSchema)