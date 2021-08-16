const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound') 
const { errorNoAuthorization } = require('../customErrors/errorNoAuthorization') 
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getItems, findItems, getItemsMultiParams, save, updateItem, deleteItem} = require('../infrastructure/generalRepository')
const { reviewCreateValidate } = require('../validators/checkReview')
const { updateUserPunctuation, checkIsInvolved } = require('../infrastructure/reviewRepository')
const { validateUuid } = require('../validators/checkGeneral')


/**
 * SELF INVOLVED IN RESERVATION
 * Creates a new Review
 * @param {json} req body contains the new review
 * @param {json} res state of petition
 */
 const createNewReview = async(req, res) =>{
    let isStatus, sendMessage
    const tName = 'resenas'
    try{
        let validatedNewRev = reviewCreateValidate(req.body)
        if(checkIsInvolved(req.auth.user), validatedNewRev){
            //TEMP Línea añadida para poder trabajar con los uuid generados en la base de datos
            //En la versión definitiva no dejaremos que el post traiga uuid
            if (!validatedNewRev.resena_uuid){
                validatedNewRev = {...validatedNewRev, resena_uuid : v4()}
            }
            validatedNewRev = {...validatedNewRev, author_uuid : req.auth.user.user_uuid}

            //update user puntuación media
            const userPunctuations = await getItemsMultiParams(
                {user_uuid:req.auth.user.user_uuid}
                ,tName
            )
            const newRev = await save(validatedNewRev,tName)
            await updateUserPunctuation(usr)

            isStatus = 201
            sendMessage = {
                tuple: req.body.resena_uuid,
                data: validatedNewRev
            }
        }else{
            throw new errorNoAuthorization(
                req.auth.user.username,
                req.auth.user.tipo,
                'createNewReview',
                'user not related with review')
        }
        console.log(`Created new element in ${tName}`)
    }catch (error) {
        console.warn(error)
        if(error instanceof errorInvalidField){
            isStatus = 401
            sendMessage = {error: 'Formato de datos incorrecto, introdúcelo de nuevo'}
        }else if(error instanceof errorNoAuthorization){
            isStatus = 403
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
        if(Object.keys(req.query).length !== 0){
            const foundReviews = await getItemsMultiParams(req.query,tName)
            if (foundReviews) {
                isStatus = 200
                sendMessage = {
                    info: foundReviews.length >= 1 ? 'Reseñas localizadas' : 'No se han encontrado reseñas',
                    foundReviews
                }
            } else {
                throw new errorNoEntryFound('getting all props with query params', 'empty result')
            }
        }else{
            const foundReviews = await getItems(tName)
            if(!foundReviews){
                throw new errorNoEntryFound(tName, "no tuples were found", _, "all")
            }else{
                isStatus = 200
                sendMessage =   {
                    tuple: "all",
                    data: foundReviews
                }
                console.warn(`Successful query on ${tName}`);
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

/**
 * Allows query params
 * @param {*} req 
 * @param {*} res 
 */
const getSelfReviews = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'resenas'
    try {
        if(Object.keys(req.query).length !== 0){
            const foundRevs = await getItemsMultiParams(req.query,tName)
            if (foundRevs) {
                isStatus = 200
                sendMessage = {
                    "info": foundRevs.length >= 1 ? 'Resenas localizadas' : 'No se han encontrado resenas',
                    "data": foundRevs
                }
            } else {
                throw new errorNoEntryFound('getting all props with query params', 'empty result')
            }
        }else{
            const foundRevs = await getItems(tName)
            if (foundRevs) {
                isStatus = 200
                sendMessage = {
                    "info": foundRevs.length >= 1 ? 'Resenas localizados' : 'No se han encontrado resenas',
                    "data": foundRevs
                }
            } else {
                throw new errorNoEntryFound('getting all props with query params', 'empty result')
            }
        }
    } catch (error) {
        console.warn(error.message)
        if(error instanceof errorNoEntryFound){
            isStatus = 404
            sendMessage = {error:"No se han encontrado resenas"}
        }else{
            isStatus = 500
            sendMessage = {error:"Error interno del servidor"}
        }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
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
        const validatedRev = validateUuid(req.params)
        if(checkIsInvolved(req.auth.user, validatedRev)){
            const foundRev = await findItems(validatedRev,tName)
            if(!foundRev){
                throw new errorNoEntryFound(tName,"no tuples were found",Object.keys(validatedRev)[0],validatedRev.reserva_uuid)
            }else{
                isStatus = 200
                sendMessage =   {
                    "tuple": validatedRev,
                    "data": foundRev
                }
                console.warn(`Successful query on ${tName}`);
            }
        }else{
            throw new errorNoAuthorization(
                req.auth.user.username,
                req.auth.user.tipo,
                'getReviewByRev',
                'user not related with review')
        }
    }catch(error){
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
        const oldResRef = validateUuid(req.params)
        if(checkIsInvolved(req.auth.user, oldResRef)){
            const newRevData = reviewUpdateValidate(req.body)
            const updatedRes = await updateItem(newRevData, oldResRef, tName)
            if(updatedRes===0){
                throw new errorNoEntryFound(tName,"no tuple was updated",Object.keys(oldResRef)[0],oldResRef.reserva_uuid)
            }else{
                isStatus = 200
                sendMessage =   {
                    "tuple": oldResRef,
                    "info_query": updatedRes,
                    "new_data": newRevData
                }
                console.warn(`Successfully updated for ${Object.keys(oldResRef)[0]} with ${oldResRef}`);
            }
        }else{
            throw new errorNoAuthorization(
                req.auth.user.username,
                req.auth.user.tipo,
                'modifyReview',
                'user not related with review')
        }
    }catch(error){
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
        const delRev = validateUuid(req.body)
        if(checkIsInvolved(req.auth.user, delRev)){
            const isRedDel = await deleteItem(delRev, tName)
            if(!isRedDel){
                throw new errorNoEntryFound(
                    tName,
                    "no tuple was deleted",
                    Object.keys(delRev)[0],
                    delRev.reserva_uuid)
            }else{
                isStatus = 200
                sendMessage =   {
                    "tuple": delRev,
                    "delete": isRedDel
                }
                console.warn(`Successfully deletion for ${Object.keys(delRev)[0]} with ${delRev}`);
            }
        }else{
            throw new errorNoAuthorization(
                req.auth.user.username,
                req.auth.user.tipo,
                'deleteReview',
                'user not related with review')
        }
    }catch(error){
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

const getReviewAvg = async(request,response)=>{
    let isStatus, sendMessage;
    try{
        const showParam =Object.keys(request.query)[0]
        const avgParam = request.params.avg_param
        const groupParam = "inmueble_uuid"
        const whereParams = request.query
        const table = request.params.table
        const result = await getAvgItems(showParam,avgParam,groupParam,whereParams,table)
        if(result.length===0){
            throw new errorNoEntryFound(table,"no tuple was located",Object.keys(whereParams)[0])
        }else{
            result.puntuacion = parseInt(result.puntuacion)
            isStatus = 200
            sendMessage =   {
                "Tuple": "all",
                "data": result
            }
            console.warn(`Successful query on ${table}`);
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
        response.status(isStatus).send(sendMessage)
    }
}

module.exports = {
    getReviewByRev, getAllReviews, getSelfReviews, createNewReview, modifyReview, deleteReview, getReviewAvg
}