const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { deleteItem, findItems, getItems, save, updateItem} = require('../infrastructure/generalRepository')
const { validateUuid } = require('../validators/checkGeneral')
const { propCreateValidate, propUpdateValidate } = require('../validators/checkProperty.js')


/**
 * #CASERO_FUNCTION / ADMIN
 * Creates a new property in the database
 * @param {json} req 
 * @param {json} res 
 */
const createNewProperty = async(req, res) =>{
    try {
        let newProp = propCreateValidate(req.body)
        //TEMP Línea añadida para poder trabajar con los uuid generados en la base de datos
        //En la versión definitiva no dejaremos que el post traiga uuid
        if (!newProp.inmueble_uuid){
            newProp = {...newProp, inmueble_uuid : v4()}
        }

        const createdProp = await save(newProp, 'inmuebles')

        isStatus = 201
        sendMessage = {
            info: "Inmueble created",
            data: newProp
        }
    } catch (error) {
        console.warn(error)
        if(error instanceof errorInvalidField){
            isStatus = 401
            sendMessage = {error: 'Formato de datos incorrecto, introdúcelo de nuevo'}
        }else{
            isStatus = 500
            sendMessage = {error: 'Error interno servidor'}
        }
    }finally{
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
        const validatedProp = validateUuid(req.params) //TODO check for params?
        const propByProp = await findItems(validatedProp,tName)

        if (!propByProp){
            throw new errorNoEntryFound(
                tName,
                "no Prop was found in getPropertyByProp",
                Object.keys(validatedProp)[0],
                validatedProp.inmueble_uuid)
        }else{
            if(
                req.auth?.user?.user_uuid === propByProp.usr_casero_uuid ||
                req.auth?.user?.tipo === 'ADMIN'
            ){
                isStatus = 200
                sendMessage =   {
                    tuple: validatedProp.inmueble_uuid,
                    info:"Inmueble encontrado",
                    data: propByProp
                }
                console.log(`Successful getPropByProp in ${tName}`);
            }else{
                throw new errorInvalidUser('the prop is not visible for you')
            }
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
 * TODO
 * @param {*} req 
 * @param {*} res 
 */
const getPropertiesSelf = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'inmuebles';
    try {
        const propCasero = { usr_casero_uuid : request.auth.user.user_uuid}
        const selfProp = await findItems(propCasero,tName)

        if (!selfProp){
            throw new errorNoEntryFound(
                tName,
                "no Prop was found in getPropertiesSelf",
                'usr_casero_uuid',
                request.auth.user.user_uuid)
        }else{
            isStatus = 200
            sendMessage =   {
                Tuple: selfProp.anuncio_uuid,
                Info:"Anuncio encontrado",
                Data: selfProp
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
        response.status(isStatus).send(sendMessage)
    }
}

/**
 * #ADMIN_FUNCTION
 * Check all properties in database
 * TODO QUERY PARAMS
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
                    info: foundUsers.length >= 1 ? 'Inmuebles localizados' : 'No se han encontrado inmuebles',
                    foundUsers
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
 * Updates the property with a determined property uuid, expected as param
 * @param {json} req json object from which we are gonna use the 'inmueble_uuid'
 * @param {json} res json object we are gonna send back
 */
const modifyProperty = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'inmuebles';
    try {
        const oldProp = validateUuid(req.params) //TODO check joi req params?
        const existsProp = await findItems(oldProp, tName)
        if(Object.keys(existsProp).length === 0){
            new errorNoEntryFound(
                'Prop update by admin or self',
                'old Prop uuid not found in database',
                'req.params.anuncio_uuid',
                req.params.anuncio_uuid
            )
        }
        if(req.auth?.user?.user_uuid === existsProp.usr_casero_uuid || req.auth?.user?.tipo === 'ADMIN'){
            //Cannot do that in the middleware since it needs to check the database
            let newProp = propUpdateValidate(req.body) //throws validation error
            newProp = {...oldProp, ...newProp}
            const consulta = await updateItem(newProp, oldProp, tName)
            if(consulta >= 1){
                isStatus = 200
                sendMessage = {
                    Info: "Anuncio modificado",
                    NewData: newProp,
                    Reference: oldProp
                }
                console.log(`Successfully update for ${JSON.stringify(oldProp)} with ${JSON.stringify(newProp)}`);
            }else{
                new errorNoEntryFound(tName,'no entry found with the given id','anuncio_uuid',oldProp.anuncio_uuid)
            }
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
    
    try{
        let modifyProp = validatePropByProp(req.params)
        let newProp = validateUpdateProp(req.body)
        const updatedProp = await updateItem(newProp, modifyProp,'inmuebles')
        res.status(200).send({Info:"Inmueble modificado", Data:updatedProp})
    }catch(error){
        console.warn(error.message)
        res.status(400).send("No se ha podido actualizar el inmueble")
    }
}

/**
 * Deletes the property with a determined property uuid, expected as param
 * @param {json} req we use no data from here
 * @param {json} res json object we are gonna send back as 'true' for deleted object
 */
const deleteProperty = async(req, res) =>{
    try{
        let prop = validatePropByProp(req.body)
        const deletedProp = await deleteItem(prop, 'inmuebles')
        if(deletedProp){
            res.status(200).send({Info:"Inmueble eliminado", Delete:deletedProp})
        }else{
            res.status(404).send({Info:"El inmueble que quieres borrar no existe.", Delete:deletedProp})
        }
    }catch(error){
        console.warn(error.message)
        res.status(400).send("No se ha podido eliminar el inmueble")
    }
}

module.exports = {
    getPropertyByProp, getAllProperties, getPropertiesSelf,
    createNewProperty, modifyProperty, deleteProperty
}
