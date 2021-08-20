const path = require("path");
const multer = require("multer");
const fs = require('fs')

const propDirectory = './imgs/properties'
const revsDirectory = './imgs/reviews'

//properties
const storageProps = multer.diskStorage({
    destination: ( req, file, callback ) => {
        const uuid = req.auth.user.user_uuid;
        const dir = propDirectory + '/' + uuid + '/'
        if(!fs.existsSync(propDirectory)){
            fs.mkdirSync(propDirectory)}
        if(!fs.existsSync(propDirectory + '/' + uuid)){
            fs.mkdirSync(propDirectory + '/' + uuid)}
        callback( null, dir )
    },
    filename: ( req, file, callback )=> {
        const uuid = req.auth.user.user_uuid;
        callback(null,
            uuid + '_' + file.originalname
        )
    }
})

const storageUpdateProp = multer.diskStorage({
    destination: ( req, file, callback ) => {
        const uuid = req.auth.user.user_uuid;
        const dir = propDirectory + '/' + uuid + '/'
        if(!fs.existsSync(propDirectory)){
            fs.mkdirSync(propDirectory)}
        if(!fs.existsSync(propDirectory + '/' + uuid)){
            fs.mkdirSync(propDirectory + '/' + uuid)}
        callback( null, dir )
    },
    filename: ( req, file, callback )=> {
        const uuid = req.auth.user.user_uuid;
        callback(null,
            uuid + '_' + file.originalname
        )
    }
})

//revs
const storageRevs = multer.diskStorage({
    destination: ( req, file, callback ) => {
        const uuid = req.auth.user.user_uuid;
        const dir = revsDirectory + '/' + uuid + '/'
        if(!fs.existsSync(revsDirectory)){
            fs.mkdirSync(revsDirectory)}
        if(!fs.existsSync(revsDirectory + '/' + uuid)){
            fs.mkdirSync(revsDirectory + '/' + uuid)}
        callback( null, dir )
    },
    filename: ( req, file, callback )=> {
        const uuid = req.auth.user.user_uuid;
        callback(null,
            uuid + '_' + file.originalname
        )
    }
})

const storageUpdateRevs = multer.diskStorage({
    destination: ( req, file, callback ) => {
        const uuid = req.auth.user.user_uuid
        const dir = revsDirectory + '/' + uuid + '/'
        if(!fs.existsSync(revsDirectory)){
            fs.mkdirSync(revsDirectory)}
        if(!fs.existsSync(revsDirectory + '/' + uuid)){
            fs.mkdirSync(revsDirectory + '/' + uuid)}
        callback( null, dir )
    },
    filename: ( req, file, callback )=> {
        const uuid = req.auth.user.user_uuid
        callback(null,
            uuid + '_' + file.originalname
        )
    }
})

module.exports = {
    storageProps, storageUpdateProp, storageRevs, storageUpdateRevs,
    propDirectory, revsDirectory
}