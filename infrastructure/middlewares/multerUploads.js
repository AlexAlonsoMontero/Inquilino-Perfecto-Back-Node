const path = require("path");
const multer = require("multer");
const fs = require('fs')

//properties
const storageProps = multer.diskStorage({
    destination: ( req, file, callback ) => {
        const dir = './imgs/properties'

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir)
        }
        callback( null, dir )
    },
    filename: ( req, file, callback )=> {
        callback(null,
            file.filename + '-' + req.auth.user.username + '_' + Date.now() + path.extname(file)
        )
    }
})
const uploadProps = multer ({ storage : storageProps }).array("files",12)

const uploadPropsMid = async (req, res, next) => {
    uploadProps(res, req, function (err){
        if(err){
            return res.status(500).send({error:'No se pudo subir la imagen'})
        }else{
            next()
        }
    })
}

//reviews
const storageRevs = multer.diskStorage({
    destination: ( req, file, callback ) => {
        const dir = './imgs/reviews'

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir)
        }
        callback( null, dir )
    },
    filename: ( req, file, callback )=> {
        callback(null, 
            file.filename + '-' + req.body.author + '_' + Date.now() + path.extname(file)
        )
    }
})
const uploadRevs = multer ({ storage : storageRevs }).array("propFiles",12)
const uploadRevsMid = async (req, res, next) => {
    uploadRevs(res, req, (err) => {
        if(err){
            return res.status(500).send({error:'No se pudo subir la imagen'})
        }else{
            next()
        }
    })
}

module.exports = {uploadPropsMid,uploadRevsMid}