const path = require("path");
const multer = require("multer");
const fs = require('fs')

const propDirectory = './imgs/properties'
const revsDirectory = './imgs/reviews'

//properties
const storageProps = multer.diskStorage({
    destination: ( req, file, callback ) => {
        const uuid = req.auth.user.user_uuid;
        const calle = req.body.calle;
        const dt = new Date().getDate()
        const dir = propDirectory + '/' + uuid + '/' + calle + '/' + dt
        if(!fs.existsSync(propDirectory)){
            fs.mkdirSync(propDirectory)}
        if(!fs.existsSync(propDirectory + '/' + uuid)){
            fs.mkdirSync(propDirectory + '/' + uuid)}
        if(!fs.existsSync(propDirectory + '/' + uuid + '/' + calle)){
            fs.mkdirSync(propDirectory + '/' + uuid + '/' + calle)}
        if(!fs.existsSync(propDirectory + '/' + uuid + '/' + calle + '/' + dt)){
            fs.mkdirSync(propDirectory + '/' + uuid + '/' + calle + '/' + dt)}
        callback( null, (dir + '/'))
    },
    filename: ( req, file, callback )=> {
        const uuid = req.auth.user.user_uuid;
        callback(null,
            uuid + '_' + file.originalname
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