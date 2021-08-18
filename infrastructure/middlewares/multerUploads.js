const path = require("path");
const multer = require("multer");
const fs = require('fs')

//properties
const storageProps = multer.diskStorage({
    destination: ( req, file, callback ) => {
        const dir = '../../imgs/properties'

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

export const uploadPropsMid = async (req, res, next) => {
    uploadProps(res, req, (err) => {
        if(err){
            return res.status(500).send({error:'No se pudo subir la imagen'})
        }
        next()
    })
}

//reviews
