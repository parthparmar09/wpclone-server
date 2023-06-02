const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');

//defining the storage directory and file names
const storage = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null , './public/images')
    },
    filename : (req,file,cb) =>{
        cb(null , Date.now() + file.originalname)
    }
})
//setting up the file limits
const upload = multer({
    storage,
    limits : {
        fileSize : 1024*1024*2,
    },
    fileFilter : (req,file,cb) => {
        if(!(file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' )){
            cb(null , false )
            return cb(new Error('only .jpg/.jpeg/.png files are allowed '))
        }
        cb(null , true)
    }
})

router.post('/upload' , upload.single('image') , (req,res) => {
    if(req.file){
        res.status(200).json({success : true , url : `/images/${req.file.filename}`})
    }
})

router.get('/download/:name' , (req,res) => {
    let file = `./public/images/${req.params.name}`
    res.download(file)
})
module.exports = router