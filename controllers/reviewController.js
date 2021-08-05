const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound') 
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getItems, findItems, getItemsMultiParams, save, updateItem, deleteItem} = require('../infrastructure/generalRepository')
const { reviewCreateValidate } = require('../validators/checkReview')


/**
 * SELF INVOLVED IN RESERVATION
 * Creates a new Review
 * @param {json} req body contains the new review
 * @param {json} res state of petition
 */
 const createNewReview = async(req, res) =>{
    let isStatus, sendMessage
    const tName = 'resenas'
    const tReservations = 'reservas'
    const tUsers = 'usuarios'
    try{
        let validatedNewRev = reviewCreateValidate(req.body)
        let checkInvolved, usr;
        switch(req.auth.user.tipo){
            case 'INQUILINO':
                usr = {usr_inquilino_uuid:req.auth.user.user_uuid}
                checkInvolved = await getItemsMultiParams({...usr, reserva_uuid: validatedNewRev.reserva_uuid},tReservations)
                break;
            case 'CASERO':
                usr = {usr_casero_uuid:req.auth.user.user_uuid}
                checkInvolved = await getItemsMultiParams({...usr, reserva_uuid: validatedNewRev.reserva_uuid},tReservations)
                break;
            case 'INQUILINO/CASERO':
                // usr = {
                //     usr_inquilino_uuid:req.auth.user.user_uuid,
                //     usr_casero_uuid:req.auth.user.user_uuid
                // }
                const checkInvolvedInq = await getItemsMultiParams({
                    usr_inquilino_uuid:req.auth.user.user_uuid,
                    reserva_uuid: validatedNewRev.reserva_uuid},
                    tReservations)
                const checkInvolvedCas = await getItemsMultiParams({
                    usr_casero_uuid:req.auth.user.user_uuid,
                    reserva_uuid: validatedNewRev.reserva_uuid},
                    tReservations)
                checkInvolved = {...checkInvolvedInq, ...checkInvolvedCas}
                break;
            case 'ADMIN':
                checkInvolved = true
            default:
                break;
        }
        if(checkInvolved){
            //TEMP Línea añadida para poder trabajar con los uuid generados en la base de datos
            //En la versión definitiva no dejaremos que el post traiga uuid
            if (!validatedNewRev.resena_uuid){
                validatedNewRev = {...validatedNewRev, resena_uuid : v4()}
            }
            validatedNewRev = {...validatedNewRev, author_uuid : req.auth.user.user_uuid}

            //update user puntuación media
            const userData = await getItemsMultiParams(
                {user_uuid:req.auth.user.user_uuid},tUsers
            )
            

            const newRev = await save(validatedNewRev,tName)
            isStatus = 201
            sendMessage = {
                tuple: req.body.resena_uuid,
                data: validatedNewRev
            }
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
 * #ADMIN_FUNCTION
 * @param {json} req
 * @param {json} res all the database reviews
 */
const getAllReviews = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'resenas';
    try{
        const foundReviews = await getItems(tName)
        if(foundReviews.length === 0){
            throw new errorNoEntryFound(tName, "no tuples were found", _, "all")
        }else{
            isStatus = 200
            sendMessage =   {
                "Tuple": "all",
                "Data": foundReviews
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
 * TODO
 * @param {*} req 
 * @param {*} res 
 */
const getSelfReviews = async(req, res) =>{
    
}

/**
 * #REGISTRED [RESERVATION-RELATED] /ADMIN
 * CHECKS an existing tuple identified by ':resena_uuid'
 * @param {json} req param :resena_uuid
 * @param {json} res review data
 */
const getReviewByRev = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'resenas';
    try{
        const validatedRev = req.params //TODO JOI
        const foundRev = await findItems(validatedRev,tName)
        if(!foundRev){
            throw new errorNoEntryFound(tName,"no tuples were found",Object.keys(validatedRev)[0],validatedRev.reserva_uuid)
        }else{
            isStatus = 200
            sendMessage =   {
                "Tuple": validatedRev,
                "Data": foundRev
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
 * #REGISTRED [RESERVATION-RELATED] /ADMIN
 * Modifies an existing tuple identified by ':resena_uuid'
 * @param {json} req param :resena_uuid
 * @param {json} res modified tuple
 */
const modifyReview = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reseras';
    try{
        const oldResRef = req.params //TODO JOI
        const newRevData = req.body //TODO JOI
        const updatedRes = await updateItem(newRevData, oldResRef, tName)
        if(updatedRes===0){
            throw new errorNoEntryFound(tName,"no tuple was updated",Object.keys(oldResRef)[0],oldResRef.reserva_uuid)
        }else{
            isStatus = 200
            sendMessage =   {
                "Tuple": oldResRef,
                "Info_Query": updatedRes,
                "New_Data": newRevData
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

/**
 * #REGISTRED [RESERVATION-RELATED] /ADMIN
 * DELETES an existing tuple identified by ':resena_uuid'
 * @param {json} req body :resena_uuid
 * @param {json} res success or not
 */
const deleteReview = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'resenas';
    try{
        const delRev = req.body //TODO JOI
        const isRedDel = await deleteItem(delRev, tName)
        if(!isRedDel){
            throw new errorNoEntryFound(tName,"no tuple was deleted",Object.keys(delRev)[0],delRev.reserva_uuid)
        }else{
            isStatus = 200
            sendMessage =   {
                "Tuple": delRev,
                "Delete": isRedDel
            }
            console.warn(`Successfully deletion for ${Object.keys(delRev)[0]} with ${delRev}`);
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
    getReviewByRev, getAllReviews, getSelfReviews, createNewReview, modifyReview, deleteReview
}