const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound') 
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getItems, findItems, getItemsMultiParams, save, updateItem, deleteItem} = require('../infrastructure/generalRepository')
const { validateUuid } = require('../validators/checkGeneral')

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
        let validatedNewRes = reservCreateValidate(req.body)
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
 * Checks reservations by ':usr_casero_uuid', ':usr_inquilino_uuid' or both
 * @param {json} req with params ':usr_casero_uuid'/all || ':usr_inquilino_uuid'/all
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
                [Object.keys(validatedUsers)[0],Object.keys(validatedUsers)[1]],
                [validatedUsers.usr_casero_uuid,validatedUsers.usr_inquilino_uuid])
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
 * Checks the reservations where it's involved
 * @param {json} req 
 * @param {json} res 
 */
const getReservationsSelf = async(req, res) =>{
    //TODO
    //Si el usuario es tipo inquilino_casero devuelve dos tablas
    
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
        const validatedRes = req.params //TODO JOI
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

        const updatedRes = await updateItem(newResData, oldResRef, tName)
        if(updatedRes===0){
            throw new errorNoEntryFound(tName,"no tuple was updated",Object.keys(oldResRef)[0],oldResRef.reserva_uuid)
        }else{
            isStatus = 200
            sendMessage =   {
                Tuple: oldResRef,
                Info_Query: updatedRes,
                New_Data: newResData
            }
            console.warn(`Successfully updated for ${Object.keys(oldResRef)[0]} with ${oldResRef}`);
        }

        const existsRes = await findItems(oldRes, tName)
        if(Object.keys(existsRes).length === 0){
            new errorNoEntryFound(
                'Prop update by admin or self',
                'old reservation uuid not found in database',
                'req.params.reserva_uuid',
                req.params.reserva_uuid
            )
        }
        if(
            req.auth?.user?.user_uuid === existsProp.usr_casero_uuid ||
            req.auth?.user?.tipo === 'ADMIN'
        ){
            //Cannot do that in the middleware since it needs to check the database
            let newProp = propUpdateValidate(req.body)
            newProp = {...oldProp, ...newProp}
            const consulta = await updateItem(newProp, oldProp, tName)
            if(consulta >= 1){
                isStatus = 200
                sendMessage = {
                    info: "Inmueble modificado",
                    newData: newProp,
                    reference: oldProp
                }
                console.log(`Successfully update for ${JSON.stringify(oldProp)} with ${JSON.stringify(newProp)}`);
            }else{
                new errorNoEntryFound(tName,'no entry found with the given id','inmueble_uuid',oldProp.inmueble_uuid)
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