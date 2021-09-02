const { errorInvalidUser } = require('../customErrors/errorInvalidUser');
const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound');
const { errorInvalidField } = require('../customErrors/errorInvalidField')
const { errorNoAuthorization } = require('../customErrors/errorNoAuthorization');
const { save, getItems, findItems, updateItem, deleteItem, getItemsMultiTable,getItemsMultiJoin, getItemsMultiParams } = require('../infrastructure/generalRepository')
const { advCreateValidate, advUpdateValidate} = require('../validators/checkAdvertisement')
const { validateUuid } = require('../validators/checkGeneral')
const { v4 } = require('uuid')

/**
 * Creates an advertisement
 * @param {*} request 
 * @param {*} response 
 */
const createAdvertisemenet = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'anuncios';
    try {
        let newAdv = advCreateValidate(request.body)
        //TEMP Línea añadida para poder trabajar con los uuid generados en la base de datos
        //En la versión definitiva no dejaremos que el post traiga uuid
        if (!newAdv.anuncio_uuid){
            newAdv = {...newAdv, anuncio_uuid : v4()}
        }
        // newAdv.usr_casero_uuid = request.auth.user.user_uuid
        newAdv = {
            ...newAdv,
            usr_casero_uuid : request.auth.user.user_uuid,
            visibilidad : true
        }


        const createAdv = await save(newAdv, tName)

        isStatus = 201
        sendMessage = {
            info: "Anuncio creado",
            data: newAdv
        }
    } catch (error) {
        console.warn(error)
        if(error instanceof errorInvalidField){
            isStatus = 401
            sendMessage = {error: error.message}
        }else if(error.code === 'ER_DUP_ENTRY'){
            isStatus = 500
            sendMessage = {error: 'Ya existe un anuncio para este inmueble'}
        }else{
            isStatus = 500
            sendMessage = {error: 'Error interno servidor'}
        }
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}

/**
 * Shows the data of anuncio_uuid
 * @param {json} request contiene anuncio_uuid como path param
 * @param {json} response
 * getAdvertisementSelf
 */
 const getAdvertisementByAdv = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'anuncios';
    try {console.log(request.params)
        const validatedAdv = validateUuid(request.params)
        validatedAdv.visibilidad = true
        let advByAdv = await getItemsMultiParams(validatedAdv,tName)
        advByAdv = advByAdv[0]
        if (!advByAdv){
            throw new errorNoEntryFound(
                tName,
                "no adv was found in getAdvByAdv",
                Object.keys(validatedAdv)[0],
                validatedAdv.anuncio_uuid)
        }else{
            if(advByAdv.visibilidad ||
            request.auth?.user?.user_uuid === advByAdv.usr_casero_uuid ||
            request.auth?.user?.tipo === 'ADMIN'
            ){
                isStatus = 200
                sendMessage =   {
                    tuple: validatedAdv.anuncio_uuid,
                    info:"Anuncio encontrado",
                    data: advByAdv
                }
                console.warn(`Successful getAdvByAdv in ${tName}`);
            }else{
                throw new errorInvalidUser('the adv is not visible for you')
            }
        }
    }catch(error){
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else if(error instanceof ValidationError){
            isStatus = 422
            sendMessage = {error : error.message}
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
 * Get self's advertisements
 * method to be used in profile
 * @param {*} request
 * @param {*} response
 */
 const getAdvertisementUser = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'anuncios';
    const tUsuarios = 'usuarios';
    try {
        if(request.params.username === request.auth.user.username){
            const advCasero = { usr_casero_uuid : request.auth.user.user_uuid}
            const selfAdv = await findItems(advCasero,tName)

            if (!selfAdv){
                throw new errorNoEntryFound(
                    tName,
                    "no adv was found in getAdvertisementSelf",
                    'usr_casero_uuid',
                    request.auth.user.user_uuid)
            }else{
                isStatus = 200
                sendMessage =   {
                    tuple: request.auth.user.username,
                    info:"Anuncio propios",
                    data: selfAdv
                }
                console.log(`Successful getAdvertisementUser in ${tName}`);
            }
        }else{
            const user = await findItems({username: request.params.username},tUsuarios)
            const userAdv = await getItemsMultiParams({usr_casero_uuid: user[0].user_uuid, visibilidad: true},tName)
            if (!userAdv){
                throw new errorNoEntryFound(
                    tName,
                    "no adv was found in getAdvertisementSelf",
                    'username',
                    user.username)
            }else{
                isStatus = 200
                sendMessage =   {
                    tuple: user.user_uuid,
                    info:`Anuncios de ${request.auth.user.username}`,
                    data: userAdv
                }
                console.log(`Successful getAdvertisementUser in ${tName}`);
            }
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


const getAdvertisements = async (request, response) => {
    let isStatus, sendMessage;
    const queryTable = 'anuncios'
    try {
        const joinAdvPlusInmueblesTables = ['inmuebles','usuarios']
        const joinAdvPlusInmueblesKeys =[
            ['anuncios.inmueble_uuid','inmuebles.inmueble_uuid'],
            ['inmuebles.usr_casero_uuid','usuarios.user_uuid']
        ]
        let advInm = undefined

        const visibilidad = { visibilidad : request.auth?.user?.tipo === 'ADMIN' ? request.query.visibilidad : true }
        if(request.query && Object.keys(request?.query).length !== 0){
            const isquery = {...request?.query, ...visibilidad}
            advInm = await getItemsMultiJoin(queryTable, joinAdvPlusInmueblesTables, joinAdvPlusInmueblesKeys, isquery)
        }else{
            advInm = await getItemsMultiJoin(queryTable, joinAdvPlusInmueblesTables, joinAdvPlusInmueblesKeys, visibilidad)
        }
        if(!advInm){
            throw new errorNoEntryFound("get advertisements","no advertisements found","advInm",JSON.stringify(advInm))
        }else{
            isStatus = 200
            sendMessage = {
                tuple: JSON.stringify(request.query),
                data: advInm
            }
        }
    } catch (error) {
        console.warn(error)
        sendMessage = {error:error.message}
        if (error instanceof errorNoEntryFound){
            isStatus = 404
        }else{
            isStatus = 500
        }
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}

/**
 * modifies the content of an advertisement
 * @param {json} request anuncio_uuid as path param
 * @param {json} response 
 */
const modifyAdvertisement = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'anuncios';
    try {
        const oldAdv = validateUuid(request.params)
        let existsAdv = await findItems(oldAdv, tName)
        if(!existsAdv || Object.keys(existsAdv).length === 0){
            throw new errorNoEntryFound(
                'adv update by admin or self',
                'old adv uuid not found in database',
                'request.params.anuncio_uuid',
                request.params.anuncio_uuid
            )
        }
        if(request.auth?.user?.user_uuid === existsAdv.usr_casero_uuid || request.auth?.user?.tipo === 'ADMIN'){
            const newAdv = advUpdateValidate(request.body)
            const consulta = await updateItem(newAdv, oldAdv, tName)
            if(consulta >= 1){
                isStatus = 200
                sendMessage = {
                    info: "Anuncio modificado",
                    newData: newAdv,
                    reference: oldAdv
                }
                console.log(`Successfully update for ${JSON.stringify(oldAdv)} with ${JSON.stringify(newAdv)}`);
            }else{
                throw new errorNoEntryFound(tName,'no entry found with the given id','anuncio_uuid',oldAdv.anuncio_uuid)
            }
        }else{
            throw new errorInvalidUser('You are trying to update an advertisement that is not yours')
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
        response.status(isStatus).send(sendMessage)
    }
}

const deleteAdvertisement = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'anuncios';
    try {
        const validatedDelAdv = validateUuid(request.body)
        let existsAdv = await findItems(validatedDelAdv,tName)
        existsAdv = existsAdv[0]
        if(existsAdv){
            console.log(request.auth?.user?.user_uuid);
            console.log(existsAdv.usr_casero_uuid);
            if(request.auth?.user?.user_uuid === existsAdv.usr_casero_uuid || request.auth?.user?.tipo === 'ADMIN'){
                const isAdvDel = await deleteItem(validatedDelAdv, tName)
                sendMessage = {
                    "Tuple": validatedDelAdv,
                    "Delete": isAdvDel
                }
                isStatus = 200
                console.log(isAdvDel ?
                        `Successfully deletion for ${Object.keys(validatedDelAdv)[0]} with ${validatedDelAdv.anuncio_uuid}`
                        : `No tuple could be deleted for ${Object.keys(validatedDelAdv)[0]} with ${validatedDelAdv.anuncio_uuid}`);
            }else{
                throw new errorNoAuthorization(
                    request.auth?.user?.username,
                    request.auth?.user?.tipo,
                    'delete advertisement',
                    'only admin or adv creator can delete it'
                )
            }
        }else{
            throw new errorNoEntryFound(tName + 'delete adv','adv not found','request.body',request.body.anuncio_uuid)
        }
    } catch (error) {
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
        response.status(isStatus).send(sendMessage)
    }
}


module.exports = {
    createAdvertisemenet,
    getAdvertisements,
    getAdvertisementByAdv,
    getAdvertisementUser,
    modifyAdvertisement,
    deleteAdvertisement
}