const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound') 
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getItems, findItems, getItemsMultiParams, save, updateItem, deleteItem} = require('../infrastructure/generalRepository')
const { validateUuid } = require('../validators/checkGeneral')
const { reservUpdateValidate, reservCreateValidate } = require('../validators/checkReservation')
const { v4 } = require('uuid')
const { errorNoAuthorization } = require('../customErrors/errorNoAuthorization')
const { errorInvalidField } = require('../customErrors/errorInvalidField')
const { sendStarReservationCasero, sendStarReservationInquilino} = require('../infrastructure/utils/smtpMail')
const {getConnection} = require('../infrastructure/bd/db')
const { query } = require('express')
const connection = getConnection()


/**
 * #REGISTRED_FUNCTION [ANY]
 * Creates a new reservation in the database
 * @param {json} req
 * @param {json} res reservation parameters
 */
const createNewReservation = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    const tAnuncios = 'anuncios';
    try{
        req.body.tipo_pago_reserva='MENSUAL'
        validatedNewRes =req.body
        console.log(validatedNewRes)
        if((new Date(req.body.fecha_inicio)> new Date (req.body.fecha_fin)) || new Date (req.body.fecha_inicio)< new Date (req.body.fecha_reserva)){
            throw new errorInvalidField(
                "fecha",
                "fecha inicio",
                "fecha fin",
                "formato"
            )
            

        }
        // let validatedNewRes = reservCreateValidate(req.body) //only allows estado_reserva = PENDING
        //TEMP Línea añadida para poder trabajar con los uuid generados en la base de datos
        if (!validatedNewRes.reserva_uuid){
            validatedNewRes = {...validatedNewRes, reserva_uuid : v4()}
        }
        validatedNewRes = {...validatedNewRes, usr_inquilino_uuid : req.auth?.user?.user_uuid }
        
    
        let anuncioRes = await findItems({anuncio_uuid : validatedNewRes.anuncio_uuid}, tAnuncios)
        if(anuncioRes){
            anuncioRes = anuncioRes[0]
            validatedNewRes = {
                ...validatedNewRes,
                usr_casero_uuid : anuncioRes.usr_casero_uuid,
                inmueble_uuid :  anuncioRes.inmueble_uuid
            }
            
            console.log(anuncioRes)
            const newRes = await save(validatedNewRes,tName)
            const casero = await findItems({user_uuid:validatedNewRes.usr_casero_uuid}, 'usuarios')
            const mailCasero = await sendStarReservationCasero(casero.username, casero.email)
            const inquilino  = await findItems({user_uuid:validatedNewRes.usr_inquilino_uuid}, 'usuarios')
            const mailInquilino = await sendStarReservationInquilino(inquilino.username, inquilino.email)
            isStatus = 201
            sendMessage =   {
                info: `Creada nueva reserva para ${req.auth?.user?.username}`,
                data: validatedNewRes
            }
            console.log(`Created new element in ${tName}`)
        }else{
            throw new errorNoAuthorization(
                req.auth?.user?.username,
                req.auth?.user?.tipo,
                'createNewReservation',
                'No se encuentra el anuncio relacionado'
            )
        }
    }catch (error) {
        console.warn(error)
        if(error instanceof errorInvalidField){
            isStatus = 401
            sendMessage = {error: error.message}
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

const getInquilinoReservations=async(req,res)=>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    try {
        (req.params.rol==='inquilino'? {usr_inquilino_uuid : req.auth.user.user_uuid}:{usr_casero_uuid : req.auth.user.user_uuid})
        
        let selfUuid= (req.params.rol==='inquilino'? {usr_inquilino_uuid : req.auth.user.user_uuid}:{usr_casero_uuid : req.auth.user.user_uuid})
        selfRes = await findItems(selfUuid,tName)
        

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
 * #INVOLVED OR ADMIN_FUNCTION
 * gets reservation using :reserva_uuid as key
 * @param {json} req with path param ':reserva_uuid'
 * @param {json} res
 */
const getReservationByUUID = async(req, res) =>{
    let isStatus, sendMessage;
    const tName = 'reservas';
    try{
        const validatedRes = validateUuid(req.params)
        let foundRes = await findItems(validatedRes,tName)
        // foundRes = foundRes[0]
        if(!foundRes[0]){
            throw new errorNoEntryFound(tName,"no tuples were found",Object.keys(validatedRes)[0],validatedRes.reserva_uuid)
        }else{
            // if(    req.auth?.user?.user_uuid === foundRes.usr_casero_uuid
            //     || req.auth?.user?.user_uuid === foundRes.usr_inquilino_uuid
            //     || req.auth?.user?.tipo === 'ADMIN'){

                isStatus = 200
                sendMessage =   {
                    Tuple: validatedRes,
                    Data: foundRes
                }
                console.warn(`Successful query on ${tName}`);
            // }else{
            //     console.log(req.auth?.user?.username);
            //     throw new errorNoAuthorization(
            //         req.auth?.user?.username,
            //         req.auth?.user?.tipo,
            //         'getReservationByUUID',
            //         'no participa en la reserva y no es admin')
            // }
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
        let existsRes = await findItems(oldRes, tName)
        existsRes = existsRes[0]
        if(!existsRes || Object.keys(existsRes).length === 0){
            throw new errorNoEntryFound(
                'Res update by admin or self',
                'old reservation uuid not found in database',
                'req.params.reserva_uuid',
                req.params.reserva_uuid
                )
            }else{
                if( req.auth?.user?.user_uuid === existsRes.usr_casero_uuid
                    || req.auth?.user?.tipo === 'ADMIN'){
                delete req.body.id_reserva
                delete req.body.reserva_uuid
                delete req.body.usr_casero_uuid
                delete req.body.usr_inquilino_uuid
                const inmueble_uuid = req.body.inmueble_uuid
                delete req.body.inmueble_uuid
                delete req.body.anuncio_uuid
                let newRes = reservUpdateValidate(req.body)
                newRes = {...oldRes, ...newRes}
                const consulta = await updateItem(newRes, oldRes, tName)
                if(consulta >= 1){
                    if(newRes.estado_reserva==="ACEPTADA"){
                        const query = `UPDATE ${tName} SET estado_reserva="RECHAZADO" WHERE estado_reserva="PENDIENTE" AND inmueble_uuid="${inmueble_uuid}" AND reserva_uuid!="${newRes.reserva_uuid}"`
                        const [rows, fields] = await connection.query(query)
                    }

                    isStatus = 200
                    sendMessage = {
                        info: "Inmueble modificado",
                        newData: newRes,
                        reference: oldRes
                    }
                    console.log(`Successfully updated for ${Object.keys(oldRes)[0]} with ${oldRes}`);
                }else{
                    throw new errorNoEntryFound(tName,'no entry found with the given id','inmueble_uuid',oldRes.inmueble_uuid)
                }
            }else{
                throw new errorNoAuthorization(
                    req.auth.user.username,
                    req.auth.user.tipo,
                    'modifyReservation',
                    'only the related casero or admin can update'
                )
            }
        }
    }catch(error){
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else if(error instanceof errorInvalidField){
            isStatus = 401
        }else{
            isStatus = 500
        }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
}







/**
 * ADMIN_FUNCTION
 * @param {*} req 
 * @param {*} res 
 */
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
    getReservationsByUser, getReservationByUUID, getAllReservations, getReservationsSelf,
    createNewReservation, modifyReservation, deleteReservation,getInquilinoReservations
}