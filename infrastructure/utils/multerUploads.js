const multer = require("multer");
const fs = require('fs')

const propDirectory = './imgs/properties'
const revDirectory = './imgs/reviews'

//properties
const storageProp = multer.diskStorage({
    destination: ( req, file, callback ) => {
        const uuid = req.auth.user.user_uuid;
        const dir = propDirectory + '/' + uuid + '/'
        if(!fs.existsSync(propDirectory+'/')){
            fs.mkdirSync(propDirectory)}
        if(!fs.existsSync(propDirectory + '/' + uuid+'/')){
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
const storageRev = multer.diskStorage({
    destination: ( req, file, callback ) => {
        const uuid = req.auth.user.user_uuid;
        const dir = revDirectory + '/' + uuid + '/'
        if(!fs.existsSync(revDirectory)){
            fs.mkdirSync(revDirectory)}
        if(!fs.existsSync(revDirectory + '/' + uuid)){
            fs.mkdirSync(revDirectory + '/' + uuid)}
        callback( null, dir )
    },
    filename: ( req, file, callback )=> {
        const uuid = req.auth.user.user_uuid;
        callback(null,
            uuid + '_' + file.originalname
        )
    }
})

const storageUpdateRev = multer.diskStorage({
    destination: ( req, file, callback ) => {
        const uuid = req.auth.user.user_uuid
        const dir = revDirectory + '/' + uuid + '/'
        if(!fs.existsSync(revDirectory)){
            fs.mkdirSync(revDirectory)}
        if(!fs.existsSync(revDirectory + '/' + uuid)){
            fs.mkdirSync(revDirectory + '/' + uuid)}
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
    storageProp, 
    storageUpdateProp, 
    storageRev, 
    storageUpdateRev,
    propDirectory, 
    revDirectory
}