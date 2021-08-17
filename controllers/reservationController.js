const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound') 
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getItems, findItems, getItemsMultiParams, save, updateItem, deleteItem} = require('../infrastructure/generalRepository')
const { validateUuid } = require('../validators/checkGeneral')
const { reservUpdateValidate, reservCreateValidate } = require('../validators/checkReservation')
const { v4 } = require('uuid')


/**
 * #REGISTRED_FUNCTION [ANY]
 * Creates a new reservation in the database
 * @param {json} req
 * @param {json} res reservation parameters
 */
const createNewReservation = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    try{
        let validatedNewRes = reservCreateValidate(req.body) //only allows estado_reserva = PENDING
        //TEMP Línea añadida para poder trabajar con los uuid generados en la base de datos
        //En la versión definitiva no dejaremos que el post traiga uuid
        if (!validatedNewRes.reserva_uuid){
            validatedNewRes = {...validatedNewRes, reserva_uuid : v4()}
        }
        const newRes = await save(validatedNewRes,tName)
        isStatus = 201
        sendMessage =   {
            tuple: req.body.reserva_uuid,
            data: validatedNewRes
        }
        console.log(`Created new element in ${tName}`)
    }catch (error) {
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
 * #ADMIN
 * @param {json} req
 * @param {json} res all the database reservations
 */
const getAllReservations = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    try{
        if(Object.keys(req.query).length !== 0){
            const foundRes = await getItemsMultiParams(req.query,tName)
            if (foundRes) {
                isStatus = 200
                sendMessage = {
                    info: foundRes.length >= 1 ? 'reservas localizadas' : 'No se han encontrado reservas',
                    foundRes
                }
            } else {
                throw new errorNoEntryFound('getting all reservations with query params', 'empty result')
            }
        }else{
            const foundRes = await getItems(tName)
            if (foundRes) {
                isStatus = 200
                sendMessage = {
                    info: foundRes.length >= 1 ? 'Reservas localizadas' : 'No se han encontrado reservas',
                    foundRes
                }
            } else {
                throw new errorNoEntryFound('getting all reservations with query params', 'empty result')
            }
        }
        console.log(`Successful query on ${tName}`);
    }catch(error){
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else{
            isStatus = 500
        }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
}


/**
 * ADMIN_FUNCTION
 * NOT CALLED FROM SERVER
 * @param {json} req with params 
 * @param {json} res list with reservations
 */
const getReservationsByUser = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    try{
        const validatedUser = validateUuid(req.params)
        const foundRes = await findItems(validatedUser,tName)

        if(!foundRes){
            throw new errorNoEntryFound(tName,"no tuples were found",
                [Object.keys(validatedUser)[0],Object.keys(validatedUser)[1]],
                [validatedUser.usr_casero_uuid, validatedUser.usr_inquilino_uuid])
        }else{
            isStatus = 200
            sendMessage =   {
                Tuple: validatedUsers,
                Data: foundRes
            }
            console.warn(`Successful query on ${tName}`);
        }
        }catch(error){
            console.warn(error)
            sendMessage = {error:error.message}
            if(error instanceof errorNoEntryFound){
                isStatus = 404
            }else{
                isStatus = 500
            }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
}

/**
 * #(REGISTRED/LAND_FUNCTION [OWNER]) OR ADMIN_FUNCTION
 * TODO parameters search
 * Checks the reservations where it's involved
 * @param {json} req 
 * @param {json} res 
 */
const getReservationsSelf = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    try {
        let selfUuid;
        switch(req.auth.user.tipo){
            default:
            case 'INQUILINO':
                selfUuid = { usr_inquilino_uuid : req.auth.user.user_uuid}
                break;
            case 'CASERO':
                selfUuid = { usr_casero_uuid : req.auth.user.user_uuid}
                break;
            case 'INQUILINO/CASERO':
                selfUuid = {
                        usr_casero_uuid : req.auth.user.user_uuid,
                        usr_inquilino_uuid : req.auth.user.user_uuid
                    }
                break;
        }

        let selfRes;
        if(Object.keys(selfUuid).length > 1){
            const selfResCas =  await findItems(selfUuid.usr_casero_uuid,tName)
            const selfResInq = await findItems(selfUuid.usr_inquilino_uuid,tName)
            selfRes = {...selfResCas, ...selfResInq}
        }else{
            selfRes = await findItems(selfUuid,tName)
        }

        if (!selfRes){
            throw new errorNoEntryFound(
                tName,
                "no reservation was found in getReservationSelf",
                'selfUuid',
                selfUuid)
        }else{
            isStatus = 200
            sendMessage =   {
                tuple: selfUuid,
                info:"Alquiler encontrado",
                data: selfRes
            }
            console.log(`Successful getReservationsSelf in ${tName}`);
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
 * #ADMIN_FUNCTION
 * gets reservation using :reserva_uuid as key
 * @param {json} req with path param ':reserva_uuid'
 * @param {json} res
 */
const getReservationByRes = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    try{
        const validatedRes = validateUuid(req.params)
        const foundRes = await findItems(validatedRes,tName)
        if(!foundRes){
            throw new errorNoEntryFound(tName,"no tuples were found",Object.keys(validatedRes)[0],validatedRes.reserva_uuid)
        }else{
            isStatus = 200
            sendMessage =   {
                Tuple: validatedRes,
                Data: foundRes
            }
            console.warn(`Successful query on ${tName}`);
        }
    }catch(error){
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else{
            isStatus = 500
        }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
}


/**
 * #(REGISTRED/LAND_FUNCTION [OWNER]) OR ADMIN_FUNCTION
 * Modifies an existing tuple identified by ':reserva_uuid'
 * @param {json} req param :reserva_uuid
 * @param {json} res modified tuple
 */
const modifyReservation = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    try{
        const oldRes = validateUuid(req.params)
        const existsRes = await findItems(oldRes, tName)
        if(Object.keys(existsRes).length === 0){
            new errorNoEntryFound(
                'Res update by admin or self',
                'old reservation uuid not found in database',
                'req.params.reserva_uuid',
                req.params.reserva_uuid
                )
            }
            if(
                req.auth?.user?.user_uuid === existsRes.usr_casero_uuid ||
                req.auth?.user?.tipo === 'ADMIN'
                ){
                    //Cannot do that in the middleware since it needs to check the database
                    let newRes = reservUpdateValidate(req.body)
                    newRes = {...oldRes, ...newRes}
                    const consulta = await updateItem(newRes, oldRes, tName)
                    if(consulta >= 1){
                        isStatus = 200
                        sendMessage = {
                            info: "Inmueble modificado",
                            newData: newRes,
                            reference: oldRes
                        }
                        console.log(`Successfully updated for ${Object.keys(oldRes)[0]} with ${oldRes}`);
                    }else{
                        new errorNoEntryFound(tName,'no entry found with the given id','inmueble_uuid',oldRes.inmueble_uuid)
                    }
                }
    }catch(error){
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else{
            isStatus = 500
        }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
}

const deleteReservation = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    try{
        const delRes = validateUuid(req.body)
        const isRedDel = await deleteItem(delRes, tName)
        if(!isRedDel){
            throw new errorNoEntryFound(tName,"no tuple was deleted",Object.keys(delRes)[0],delRes.reserva_uuid)
        }else{
            isStatus = 200
            sendMessage =   {
                Tuple: delRes,
                Delete: isRedDel
            }
            console.warn(`Successfully deletion for ${Object.keys(delRes)[0]} with ${delRes}`);
        }
    }catch(error){
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else{
            isStatus = 500
        }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
}

module.exports = {
    getReservationsByUser, getReservationByRes, getAllReservations, getReservationsSelf,
    createNewReservation, modifyReservation, deleteReservation
}