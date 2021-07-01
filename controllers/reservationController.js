const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound') 
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getItems, findItem, getItemsMultiParams, save, updateItem, deleteItem} = require('../infrastructure/generalRepository')

/**
 * #ADMIN_FUNCTION
 * @param {json} req
 * @param {json} res all the database reservations
 */
const getAllReservations = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    try{
        const foundRes = await getItems(tName)
        if(foundRes.length === 0){
            throw new errorNoEntryFound(tName, "no tuples were found", _, "all")
        }else{
            isStatus = 200
            sendMessage =   {
                "Tuple": "all",
                "Data": foundRes
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
 * ADMIN_FUNCTION
 * Checks reservations by ':usr_casero_uuid', ':usr_inquilino_uuid' or both
 * @param {json} req with params ':usr_casero_uuid'/all || ':usr_inquilino_uuid'/all
 * @param {json} res list with reservations
 */
const getReservationsByUsers = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    try{
        const validatedUsers = req.params //TODO JOI
        let foundRes = undefined

        if(req.params.usr_casero_uuid === 'all'){
            const params = {usr_inquilino_uuid:validatedUsers.usr_inquilino_uuid}
            foundRes = await findItem(params,tName)
        }else if(req.params.usr_inquilino_uuid === 'all'){
            const params = {usr_casero_uuid:validatedUsers.usr_casero_uuid}
            foundRes =  await findItem(params,tName)
        }else{
            foundRes = await getItemsMultiParams(validatedUsers,tName)
        }

        if(!foundRes){//no llega a ejecutarse la búsqueda, por eso es undefined
            throw new errorNoEntryFound(tName,"no tuples were found",
                [Object.keys(validatedUsers)[0],Object.keys(validatedUsers)[1]],
                [validatedUsers.usr_casero_uuid,validatedUsers.usr_inquilino_uuid])
        }else{
            isStatus = 200
            sendMessage =   {
                "Tuple": validatedUsers,
                "Data": foundRes
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
const getReservationsSelfInvolved = async(req, res) =>{
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
        const foundRes = await findItem(validatedRes,tName)
        if(!foundRes){
            throw new errorNoEntryFound(tName,"no tuples were found",Object.keys(validatedRes)[0],validatedRes.reserva_uuid)
        }else{
            isStatus = 200
            sendMessage =   {
                "Tuple": validatedRes,
                "Data": foundRes
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
 * #REGISTRED_FUNCTION [ANY]
 * Creates a new reservation in the database
 * @param {json} req
 * @param {json} res reservation parameters
 */
const createNewReservation = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    try{
        const validatedNewRes = req.body //TODO JOI, check estado pendiente
        const newRes = await save(validatedNewRes,tName)

        isStatus = 201
        sendMessage =   {
            "Tuple": req.body.reserva_uuid,
            "New_Data": validatedNewRes
        }
        console.warn(`Created new element in ${tName}`)
    }catch(error){
        console.warn(error)
        sendMessage = {error:error.message}
        isStatus = 400
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
        const oldResRef = req.params //TODO JOI
        const newResData = req.body //TODO JOI
        const updatedRes = await updateItem(newResData, oldResRef, tName)
        if(updatedRes===0){
            throw new errorNoEntryFound(tName,"no tuple was updated",Object.keys(oldResRef)[0],oldResRef.reserva_uuid)
        }else{
            isStatus = 200
            sendMessage =   {
                "Tuple": oldResRef,
                "Info_Query": updatedRes,
                "New_Data": newResData
            }
            console.warn(`Successfully updated for ${Object.keys(oldResRef)[0]} with ${oldResRef}`);
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
        const delRes = req.body //TODO JOI
        const isRedDel = await deleteItem(delRes, tName)
        if(!isRedDel){
            throw new errorNoEntryFound(tName,"no tuple was deleted",Object.keys(delRes)[0],delRes.reserva_uuid)
        }else{
            isStatus = 200
            sendMessage =   {
                "Tuple": delRes,
                "Delete": isRedDel
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
    getReservationsByUsers, getReservationByRes, getAllReservations, getReservationsSelfInvolved,
    createNewReservation, modifyReservation, deleteReservation
}