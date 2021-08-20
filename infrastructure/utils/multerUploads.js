const path = require("path");
const multer = require("multer");
const fs = require('fs')

const propDirectory = './imgs/properties/'
const revsDirectory = './imgs/reviews/'

//properties
const storageProps = multer.diskStorage({
    destination: ( req, file, callback ) => {
        if(!fs.existsSync(propDirectory + req.body.inmueble_uuid)){
            fs.mkdirSync(propDirectory + req.body.inmueble_uuid)
        }
        callback( null, propDirectory + req.body.inmueble_uuid)
    },
    filename: ( req, file, callback )=> {
        callback(null,
            req.body.inmueble_uuid + '_' + Date.now() + '_' + file.originalname
        )
    }
})

//reviews
const storageRevs = multer.diskStorage({
    destination: ( req, file, callback ) => {
        const revsDirectory = './imgs/reviews'

        if(!fs.existsSync(revsDirectory)){
            fs.mkdirSync(revsDirectory)
        }
        callback( null, revsDirectory )
    },
    filename: ( req, file, callback )=> {
        callback(null, 
            file.filename + '-' + req.body.author + '_' + Date.now() + path.extname(file)
        )
    }
})

module.exports = {
    storageProps, storageRevs, propDirectory, revsDirectory
}