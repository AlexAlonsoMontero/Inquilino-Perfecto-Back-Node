const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound') 
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getItems, findItem, getItemsMultiParams, save, updateItem, deleteItem} = require('../infrastructure/generalRepository')

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



const createNewReview = async(req, res) =>{
    
}

const modifyReview = async(req, res) =>{
    
}

const deleteReview = async(req, res) =>{
    
}

module.exports = {
    getReviewByRev, getAllReviews, createNewReview, modifyReview, deleteReview
}