const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound')
const { errorNoAuthorization } = require('../customErrors/errorNoAuthorization')
const { errorInvalidField } = require('../customErrors/errorInvalidField')
const { errorCouldNotUpdate } = require('../customErrors/errorCouldNotUpdate')
const { getItems, findItems, getItemsMultiParams, save, updateItem, deleteItem, getItemsMultiTable, getItemsMultiJoin} = require('../infrastructure/generalRepository')
const { reviewCreateValidate, reviewUpdateValidate } = require('../validators/checkReview')
const { updatePuntuation } = require('../infrastructure/reviewRepository')
const { validateUuid } = require('../validators/checkGeneral')
const { v4 } = require('uuid')
const { revDirectory } = require('../infrastructure/utils/multerUploads')


/**
 * SELF INVOLVED IN RESERVATION
 * Creates a new Review
 * @param {json} req body contains the new review
 * @param {json} res state of petition
 */
 const createNewReview = async(req, res) =>{
    let isStatus, sendMessage
    const tName = 'resenas'
    const tRes = 'reservas'
    const tImgs = 'img_resenas';
    
    let tUpdate
    try{
        let validatedNewRev = reviewCreateValidate(req.body)
        let reserv = await findItems({reserva_uuid:validatedNewRev.reserva_uuid},tRes)
        reserv = reserv[0]
        if(reserv){
                validatedNewRev ={...validatedNewRev,resena_uuid : v4()}
                const saveRev = await save(validatedNewRev,tName)
                isStatus = 201
                sendMessage = {
                    info: 'review created',
                    data: validatedNewRev
                }
                console.log(`Created new element in ${tName}`)
            }else{
            throw new errorNoEntryFound(
                'createNewReview',
                'the reservation doesn\'t exists',
                'reserva_uuid',
                validatedNewRev.reserva_uuid
            )
        }
    }catch (error) {
        console.warn(error)
        if(error instanceof errorInvalidField){
            isStatus = 401
            sendMessage = {error: error.messageEsp}
        }else if(error.code === 'ER_DUP_ENTRY'){
            isStatus = 500
            sendMessage = { error: 'existe ya una rese??a para este alquiler'}
        }else if(error instanceof errorNoAuthorization){
            isStatus = 403
            sendMessage = {error: error.message}
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
 * @param {json} res
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
                    info: foundReviews.length >= 1 ? 'Rese??as localizadas' : 'No se han encontrado rese??as',
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
        if(req.params.username === req.auth.user.username){
            if(Object.keys(req.query).length !== 0){
                const foundRevs = await getItemsMultiParams({...req.query,autor_uuid:req.auth.user.user_uuid},tName)
                if (foundRevs) {
                    isStatus = 200
                    sendMessage = {
                        "info": foundRevs.length >= 1 ? 'Resenas localizadas' : 'No se han encontrado resenas',
                        "data": foundRevs
                    }
                } else {
                    throw new errorNoEntryFound(
                        'getSelfReviews',
                        'null result from database',
                        'req.query',
                        JSON.stringify(req.query)
                        )
                }
            }else{
                const foundRevs = await findItems({autor_uuid:req.auth.user.user_uuid},tName)
                if (foundRevs) {
                    isStatus = 200
                    sendMessage = {
                        "info": foundRevs.length >= 1 ? 'Resenas localizadas' : 'No se han encontrado resenas',
                        "data": foundRevs
                    }
                } else {
                    throw new errorNoEntryFound(
                        'getSelfReviews no query params',
                        'null result from database',
                        `autor_uuid is ${req.auth.user.username}`,
                        req.auth.user.user_uuid
                    )
                }
            }
        }else{
            throw new errorNoAuthorization(
                req.auth.user.username,
                req.auth.user.tipo,
                `checking ${req.params.username} reviews`,
                'this is not your profile'
            )
        }
    } catch (error) {
        console.warn(error.message)
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
 * # [RESERVATION-RELATED] /ADMIN
 * CHECKS an existing tuple identified by ':resena_uuid'
 * @param {json} req param :resena_uuid
 * @param {json} res review data
 */
const getReviewByRev = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'resenas';
    try{
        const validatedRev = validateUuid(req.query)
        const  findRev = await getItemsMultiParams(req.query,tName)
        

        if(findRev){
            isStatus = 200
            sendMessage = {
                info : 'review found',
                data : findRev
            }
            
        }else{
            throw new errorNoEntryFound(
                'getReviewByRev',
                'null',
                'req.params.resena_uuid',
                req.params.resena_uuid
            )
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
    const tName = 'resenas';
    const tImgs = 'img_resenas';
    try{
        const oldResRef = validateUuid(req.params)
        let findRes = await findItems(oldResRef,tName)
        if(findRes && findRes.length !== 0){
            findRes = findRes[0]
            if(req.auth.user.tipo === 'ADMIN'
                || findRes.usr_inquilino_uuid === req.auth.user.user_uuid
                || findRes.usr_casero_uuid === req.auth.user.user_uuid
                || findRes.autor_uuid === req.auth.user.user_uuid ){
                const newRev = reviewUpdateValidate(req.body)
                const updateRev = await updateItem(newRev,oldResRef,tName)
                if(updateRev === 1){
                    if(newRev.puntuacion){
                    await updatePuntuation(
                        findRes.objetivo === 'IMBUEBLE' ?
                            { inmueble_uuid : findRes.inmueble_uuid }
                            :
                            findRes.objetivo === 'INQUILINO' ?
                                { usr_inquilino_uuid : findRes.usr_inquilino_uuid }
                                :
                                { usr_casero_uuid : findRes.usr_casero_uuid },
                        findRes.objetivo === 'IMBUEBLE' ?
                            { inmueble_uuid : findRes.inmueble_uuid }
                            :
                            findRes.objetivo === 'INQUILINO' ?
                                { user_uuid : findRes.usr_inquilino_uuid }
                                :
                                { user_uuid : findRes.usr_casero_uuid },
                        findRes.objetivo === 'IMBUEBLE' ? 'inmuebles' : 'usuarios')
                    }
                    if(req.files){
                        const prevDir = revDirectory + '/' + req.auth.user.user_uuid
                        const newDir = revDirectory + '/' + findRes.resena_uuid
                        if(fs.existsSync(prevDir+'/')){
                            fs.rmdirSync(newDir, { recursive: true });
                            const delResImg = deleteItem({resena_uuid: findRes.resena_uuid},tImgs)
                            fs.renameSync(prevDir, newDir)

                            const filenames = fs.readdirSync(newDir)
                            for(const f in filenames){
                                const tuple = {
                                    img_resenas_uuid: v4(),
                                    resena_uuid: findRes.resena_uuid,
                                    autor_uuid: findRes.autor_uuid,
                                    img_resena: newDir + '/' + filenames[f]
                                }
                                const saveIt = await save(tuple,tImgs)
                            }
                        }
                    }

                    isStatus = 200
                    sendMessage = {
                        tuple: oldResRef,
                        info: 'reeview modificada',
                        oldData: findRes,
                        newData: newRev
                    }
                }else{
                    throw new errorCouldNotUpdate(`Couldn't update review ${oldResRef}`,req.auth.user.username)
                }
            }else{
                throw new errorNoAuthorization(
                    req.auth.user.username,
                    req.auth.user.tipo,
                    'modifyReview',
                    `unrelated users can't update other's reviews`
                )
            }
        }else{
            throw new errorNoEntryFound(
                'modifyReview',
                'null',
                'req.params.resena_uuid',
                req.params.resena_uuid
            )
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
    const tImgs = 'img_resenas';
    try{
        const checkRes = validateUuid(req.body)
        let findRes = await findItems(checkRes,tName)
        if(findRes && findRes.length !== 0){
            findRes = findRes[0]
            if(req.auth.user.tipo === 'ADMIN'
                || findRes.usr_inquilino_uuid === req.auth.user.user_uuid
                || findRes.usr_casero_uuid === req.auth.user.user_uuid
                || findRes.autor_uuid === req.auth.user.user_uuid ){
                const delRev = await deleteItem(checkRes,tName)
                if(delRev){

                    await updatePuntuation(
                            findRes.objetivo === 'IMBUEBLE' ?
                                { inmueble_uuid : findRes.inmueble_uuid }
                                :
                                findRes.objetivo === 'INQUILINO' ?
                                    { usr_inquilino_uuid : findRes.usr_inquilino_uuid }
                                    :
                                    { usr_casero_uuid : findRes.usr_casero_uuid },
                            findRes.objetivo === 'IMBUEBLE' ?
                                { inmueble_uuid : findRes.inmueble_uuid }
                                :
                                findRes.objetivo === 'INQUILINO' ?
                                    { user_uuid : findRes.usr_inquilino_uuid }
                                    :
                                    { user_uuid : findRes.usr_casero_uuid },
                            findRes.objetivo === 'IMBUEBLE' ? 'inmuebles' : 'usuarios')

                    const imgDir = revDirectory + '/' + checkRes.resena_uuid
                    if(fs.existsSync(imgDir)){
                        fs.rmdirSync(imgDir, {recursive : true})
                    }

                    const isPropImgDel = await deleteItem(checkRes, tImgs)

                    isStatus = 200
                    sendMessage = {
                        tuple: checkRes,
                        info: 'deleted review'
                    }
                }else{
                    throw new errorCouldNotUpdate(`Couldn't delete review ${oldResRef}`,req.auth.user.username)
                }
            }else{
                throw new errorNoAuthorization(
                    req.auth.user.username,
                    req.auth.user.tipo,
                    'deleteReview',
                    `unrelated users can't delete reviews`
                )
            }
        }else{
            throw new errorNoEntryFound(
                'deleteReview',
                'null',
                'req.body.resena_uuid',
                req.body.resena_uuid
            )
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
                tuple: "all",
                info: "getReviewAvg",
                data: result
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