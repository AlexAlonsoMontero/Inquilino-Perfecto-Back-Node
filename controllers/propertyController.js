const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const { deleteItem, findItems, getItems, save, updateItem, getItemsMultiParams} = require('../infrastructure/generalRepository')
const { validateUuid } = require('../validators/checkGeneral')
const { propCreateValidate, propUpdateValidate } = require('../validators/checkProperty')
const { propDirectory } = require('../infrastructure/utils/multerUploads')

const { v4 } = require('uuid')
const { errorInvalidUser } = require('../customErrors/errorInvalidUser')
const { errorInvalidField } = require('../customErrors/errorInvalidField')
const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound')
const { errorNoAuthorization } = require('../customErrors/errorNoAuthorization')
const { stringToBoolean } = require('../infrastructure/utils/stringtoboolean')

/**
 * #CASERO_FUNCTION / ADMIN
 * Creates a new property in the database
 * @param {json} req
 * @param {json} res
 */
const createNewProperty = async(req, res) =>{
    console.log("****************************************************************************")
    let isStatus, sendMessage;
    const tName = 'inmuebles';
    const tImgs = 'img_inmuebles';
    
    try {
        let auxBodyContentKeys = Object.keys(req.body)
        let auxBodyContentValues = Object.values(req.body)
        let auxBody = {}
        auxBodyContentKeys.forEach((k,i) => {
            if(auxBodyContentValues[i] === 'true'){
                auxBody[k] = true
            }else if(auxBodyContentValues[i] === 'false'){
                auxBody[k] = false
            }else{
                auxBody[k]=auxBodyContentValues[i]
            }
        })
        let newProp = propCreateValidate(auxBody)

        //TEMP Línea añadida para poder trabajar con los uuid generados en la base de datos
        //En la versión definitiva no dejaremos que el post traiga uuid
        if (!newProp.inmueble_uuid){
            newProp = {...newProp,pais:"España", inmueble_uuid : v4()}
        }
        newProp = {
            ...newProp, 
            usr_casero_uuid: req.auth.user.user_uuid, 
            disponibilidad : true
        }

        const createdProp = await save(newProp, tName)

        const prevDir = propDirectory + '/' + newProp.usr_casero_uuid
        const newDir = propDirectory + '/' + newProp.inmueble_uuid
        if(fs.existsSync(prevDir)){
            fs.renameSync(prevDir, newDir)

            const filenames = fs.readdirSync(newDir)
            for(const f in filenames){
                console.log(newDir + '/' + filenames[f])
                const tuple = {
                    img_inmueble_uuid: v4(),
                    inmueble_uuid: newProp.inmueble_uuid,
                    img_inmueble: newDir + '/' + filenames[f]
                }
                const saveIt = await save(tuple,tImgs)
            }
        }

        isStatus = 201
        sendMessage = {
            info: "Inmueble created",
            data: newProp
        }
    } catch (error) {
        console.warn(error)
        if(error instanceof errorInvalidField){
            isStatus = 401
            sendMessage = {error: error.messageEsp}
        }else if(error?.sql){
            isStatus = 500
            sendMessage = {
                error: 'Error de base de datos',
                message: error.sqlMessage
            }
        }
        else{
            isStatus = 500
            sendMessage = {error: 'Error interno servidor'}
        }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
}

/**
 * #ADMIN_FUNCTION
 * Gets all properties in database
 * @param {json} req corresponding to req
 * @param {json} res corresponding to res
 */
const getAllProperties = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'inmuebles'
    try {
        if(Object.keys(req.query).length !== 0){
            const foundProps = await getItemsMultiParams(req.query,tName)
            if (foundProps) {
                isStatus = 200
                sendMessage = {
                    info: foundProps.length >= 1 ? 'Inmuebles localizados' : 'No se han encontrado inmuebles',
                    foundProps
                }
            } else {
                throw new errorNoEntryFound('getting all props with query params', 'empty result')
            }
        }else{
            const foundProps = await getItems(tName)
            if (foundProps) {
                isStatus = 200
                sendMessage = {
                    info: foundProps.length >= 1 ? 'Inmuebles localizados' : 'No se han encontrado inmuebles',
                    foundProps
                }
            } else {
                throw new errorNoEntryFound('getting all props with query params', 'empty result')
            }
        }
    } catch (error) {
        console.warn(error.message)
        if(error instanceof errorNoEntryFound){
            isStatus = 404
            sendMessage = {error:"No se han encontrado inmuebles"}
        }else{
            isStatus = 500
            sendMessage = {error:"Error interno del servidor"}
        }
    }
    finally{
        res.status(isStatus).send(sendMessage)
    }
}

/**
 * #SELF_CASERO_FUNCTION / ADMIN
 * Gets a property using a determined property uuid, expected as param
 * @param {json} req param 'inmueble_uuid'
 * @param {json} res :  Codes
 *                      200 When the property is found
 *                      404 When the property is not found
 *                      500 When there's an internal error
 */
const getPropertyByProp = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'inmuebles';
    try {
        const validatedProp = validateUuid(req.params)

        const propByProp = await findItems(validatedProp,tName)
        if (!propByProp){
            throw new errorNoEntryFound(
                tName,
                "no Prop was found in getPropertyByProp",
                Object.keys(validatedProp)[0],
                validatedProp.inmueble_uuid)

        }else{
                isStatus = 200
                sendMessage =   {
                    tuple: validatedProp.inmueble_uuid,
                    info:"Inmueble encontrado",
                    data: propByProp
                }
                console.log(`Successful getPropByProp in ${tName}`);
            
        }
    }catch(error){

        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else if(error instanceof ValidationError){
            isStatus = 422
        }else if(error instanceof errorInvalidUser){
            isStatus = 403
        }else{
            isStatus = 500
        }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
}

/**
 * @param {json} req 
 * @param {json} res 
 */
const getPropertiesSelf = async(req, res) =>{
    console.log("****************************************************")
    console.log(req.body)
    let isStatus, sendMessage;
    const tName = 'inmuebles';
    try {
        const propCasero = { usr_casero_uuid : req.auth.user.user_uuid, disponibilidad:true }
        const selfProp = await getItemsMultiParams(propCasero,tName)

        if (!selfProp){
            throw new errorNoEntryFound(
                tName,
                "no Prop was found in getPropertiesSelf",
                'usr_casero_uuid',
                req.auth.user.user_uuid)
        }else{
            isStatus = 200
            sendMessage =   {
                tuple: selfProp.inmueble_uuid,
                info:"Inmueble encontrado",
                data: selfProp
            }
            console.warn(`Successful getPropertiesSelf in ${tName}`);
        }
    }catch(error){
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else if(error instanceof errorInvalidUser){
            isStatus = 403
        }else{
            isStatus = 500
        }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
}

/**
 * Updates the property with a determined property uuid, expected as param
 * @param {json} req json object from which we are gonna use the 'inmueble_uuid'
 * @param {json} res json object we are gonna send back
 */
const modifyProperty = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'inmuebles';
    const tImgs = 'img_inmuebles';

    delete req.body.inmueble_uuid
    delete req.body.id_inmueble
    delete req.body.puntuacion_media
    req.body = parseProperty(req.body)
    try {
        const oldProp = validateUuid(req.params)
        let existsProp = await findItems(oldProp, tName)
        existsProp = existsProp[0]
        if(!existsProp){
            throw new errorNoEntryFound(
                'Prop update by admin or self',
                'old Prop uuid not found in database',
                'req.params.inmueble_uuid',
                oldProp
            )
        }
        else if(
                req.auth?.user?.user_uuid === existsProp.usr_casero_uuid ||
                req.auth?.user?.tipo === 'ADMIN'
        ){
            
            let newProp = propUpdateValidate(req.body)

            newProp = {...oldProp, ...newProp}
            const consulta = await updateItem(newProp, oldProp, tName)
            if(consulta >= 1){

                if(req.files){
                    const prevDir = propDirectory + '/' + existsProp.usr_casero_uuid
                    const newDir = propDirectory + '/' + newProp.inmueble_uuid
                    if(fs.existsSync(prevDir+'/')){
                        fs.rmdirSync(newDir, { recursive: true });
                        const delPropImg = deleteItem({inmueble_uuid: newProp.inmueble_uuid},tImgs)
                        fs.renameSync(prevDir, newDir)

                        const filenames = fs.readdirSync(newDir)
                        for(const f in filenames){
                            const tuple = {
                                img_inmueble_uuid: v4(),
                                inmueble_uuid: newProp.inmueble_uuid,
                                img_inmueble: newDir + '/' + filenames[f]
                            }
                            const saveIt = await save(tuple,tImgs)
                        }
                    }
                }

                isStatus = 200
                sendMessage = {
                    info: "Inmueble modificado",
                    newData: newProp,
                    reference: oldProp
                }
                console.log(`Successfully update for ${JSON.stringify(oldProp)} with ${JSON.stringify(newProp)}`);
            }else{
                throw new errorNoEntryFound(tName,'no entry found with the given id','inmueble_uuid',oldProp.inmueble_uuid)
            }
        }else{
            throw new errorNoEntryFound(tName,'no entry found with the given id','inmueble_uuid',oldProp.inmueble_uuid)
        }
    } catch (error) {
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorInvalidField){
            isStatus = 401
        }else if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else{
            isStatus = 500
        }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
}

/**
 * Deletes the property with a determined property uuid, expected as param
 * @param {json} req we use no data from here
 * @param {json} res json object we are gonna send back as 'true' for deleted object
 */
const deleteProperty = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'inmuebles';
    const tImgs = 'img_inmuebles';
    try {
        const validatedDelProp = validateUuid(req.body)
        let existsProp = await findItems(validatedDelProp,tName)

        if(existsProp && existsProp.length!== 0){
            existsProp = existsProp[0]
            if(
                req.auth?.user?.user_uuid === existsProp.usr_casero_uuid
                ||req.auth?.user?.tipo === 'ADMIN'
            ){
                const isPropDel = await deleteItem(validatedDelProp, tName)
                if(isPropDel){
                    const imgDir = propDirectory + '/' + validatedDelProp.inmueble_uuid
                    if(fs.existsSync(imgDir)){
                        fs.rmdirSync(imgDir, {recursive : true})
                    }
                    const isPropImgDel = await deleteItem(validatedDelProp, tImgs)

                    sendMessage = {
                        "tuple": validatedDelProp,
                        "delete": isPropDel
                    }
                    isStatus = 200
                    console.log(isPropDel ?
                        `Successfully deletion for ${Object.keys(validatedDelProp)[0]} with ${validatedDelProp.inmueble_uuid}`
                        : `No tuple could be deleted for ${Object.keys(validatedDelProp)[0]} with ${validatedDelProp.inmueble_uuid}`);
                }
            }else{
                throw new errorNoAuthorization(
                    req.auth?.user?.username,
                    req.auth?.user?.tipo,
                    'delete property',
                    'only admin or Prop creator can delete it')
                }
            }
            else{
                throw new errorNoEntryFound(tName + 'delete Prop','Prop not found','req.body',req.body.inmueble_uuid)
            }
    } catch (error) {
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else if(error instanceof errorNoAuthorization){
            isStatus = 403
        }else{
            isStatus = 500
        }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
}


const parseProperty = (property)=>{
    
    property.banos= parseInt(property.banos)
    property.metros_2=parseInt(property.metros_2)
    property.habitaciones= parseInt(property.habitaciones)
    property = stringToBoolean(property)
    if (property.piso===true){
        property.piso="1"
    }else if(property.piso===false){
        property.piso="0"
    }
    
    return property

}



module.exports = {
    getPropertyByProp, getAllProperties, getPropertiesSelf,
    createNewProperty, modifyProperty, deleteProperty
}
