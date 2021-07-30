const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound') 
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getItems, findItem, getItemsMultiParams, save, updateItem, deleteItem} = require('../infrastructure/generalRepository')

/**
 * TODO QUERYS
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

    // let isStatus, sendMessage;
    // const tName = 'resenas';
    // try {
    //     const joinAdvPlusInmuebles = {
    //         table1: tName,
    //         table2: "inmuebles",
    //         t1key: "inmueble_uuid",
    //         t2key: "inmueble_uuid"
    //     }
    //     let advInm = undefined
    //     //TODO: check if user is self or admin
    //     const vis = {'visibilidad':true}

    //     if(Object.keys(request.query).length !== 0){
    //         const query = {...request.query, ...vis}
    //         advInm = await getItemsMultiTable(joinAdvPlusInmuebles, query)
    //     }else{
    //         advInm = await getItemsMultiTable(joinAdvPlusInmuebles, vis)
    //     }

    //     if(!advInm){
    //         throw new errorNoEntryFound("get advertisements","no advertisements found","advInm",JSON.stringify(advInm))
    //     }else{
    //         isStatus = 200
    //         sendMessage = {
    //             Tuple: JSON.stringify(request.query),
    //             Data: advInm
    //         }
    //     }
    // } catch (error) {
    //     console.warn(error)
    //     sendMessage = {error:error.message}
    //     if (error instanceof errorNoEntryFound){
    //         isStatus = 404
    //     }else{
    //         isStatus = 500
    //     }
    // }finally{
    //     response.status(isStatus).send(sendMessage)
    // }
}

/**
 * TODO
 * @param {*} req 
 * @param {*} res 
 */
const getSelfReviews = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'resenas';
    try{
        const validatedRev = req.params //TODO JOI
        const foundRev = await findItem(validatedRev,tName)
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
 * CHECKS an existing tuple identified by ':resena_uuid'
 * @param {json} req param :resena_uuid
 * @param {json} res review data
 */
const getReviewByRev = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'resenas';
    try{
        const validatedRev = req.params //TODO JOI
        const foundRev = await findItem(validatedRev,tName)
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
 * Creates a new Review
 * @param {json} req body contains the new review
 * @param {json} res state of petition
 */
const createNewReview = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'resenas';
    try{
        const validatedNewRev = req.body //TODO JOI, check estado pendiente
        const newRev = await save(validatedNewRev,tName)

        isStatus = 201
        sendMessage =   {
            "Tuple": req.body.reserva_uuid,
            "New_Data": validatedNewRev
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