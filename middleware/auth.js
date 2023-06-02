const jwt = require('jsonwebtoken');
const User = require('../models/user')

require('dotenv').config()

//verifies jwt and sets user in req.user
const authorization = async(req,res , next) => {
    let token  = req.headers.authorization
    if(!token){
        throw new Error("token not found")
    }
    if(!token.startsWith("Bearer")){
        throw new Error("invalid token")
    }
    token = token.split(" ")[1]
    const payload = jwt.verify(token , process.env.SECRET_KEY)
    if(!payload){
        throw new Error("invalid token")
    }

    const user = await User.findOne({_id : payload.id})
    req.user = user
    next()
}


module.exports = authorization