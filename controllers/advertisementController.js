const errorInvalidUser = require('../customErrors/errorInvalidUser');
const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound');
const { errorInvalidField } = require('../customErrors/errorInvalidField')
const { save, getItems, findItem, updateItem, deleteItem, getItemsMultiTable,getItemsMultiJoi } = require('../infrastructure/generalRepository')
const { advCreateValidate, advUpdateValidate} = require('../validators/checkAdvertisement')
const { errorNoAuthorization } = require('../customErrors/errorNoAuthorization');
const { validateUuid } = require('../validators/checkGeneral')
const { v4 } = require('uuid')

//TODO JOI

/**
 * Creates an advertisement
 * @param {*} request 
 * @param {*} response 
 */
const createAdvertisemenet = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'anuncios';
    try {
        let newAdv = advCreateValidate(request.params)
        //TEMP Línea añadida para poder trabajar con los uuid generados en la base de datos
        //En la versión definitiva no dejaremos que el post traiga uuid
        if (!newAdv.anuncio_uuid){
            newAdv = {...newAdv, anuncio_uuid : v4()}
        }

        if(newAdv.error){
            throw new errorInvalidField(
                'advertisement creation',
                `invalid joi validation for data granted by ${request?.auth.username}`,
                'request.body',
                request.body)
        }else{
            const createAdv = await save(request.body, tName)

            isStatus = 201
            sendMessage = {
                Info: "Anuncio created",
                Data: newAdv
            }
        }
    } catch (error) {
        console.warn(error)
        if(error instanceof errorInvalidField){
            isStatus = 401
            sendMessage = {error: 'Formato de datos incorrecto, introdúcelo de nuevo'}
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
    try {
        const validatedAdv = request.params //TODO check for params?
        const advByAdv = await findItem(validatedAdv,tName)
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
                    Tuple: validatedAdv.anuncio_uuid,
                    Info:"Anuncio encontrado",
                    Data: advByAdv
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
 const getAdvertisementSelf = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'anuncios';
    try {
        const advCasero = { usr_casero_uuid : request.auth.user.user_uuid}
        const selfAdv = await findItem(advCasero,tName)

        if (!selfAdv){
            throw new errorNoEntryFound(
                tName,
                "no adv was found in getAdvertisementSelf",
                'usr_casero_uuid',
                request.auth.user.user_uuid)
        }else{
            isStatus = 200
            sendMessage =   {
                Tuple: selfAdv.anuncio_uuid,
                Info:"Anuncio encontrado",
                Data: selfAdv
            }
            console.warn(`Successful getAdvertisementSelf in ${tName}`);
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
//TODO Se deja de utilizar get Advertisements, y se utiliza getAdvertisementsMultiJoi posible borrado si no se usa en nada más

/**
 * Used by searcher engine, only returns visible advs
 * @param {json} request not going to be used
 * @param {json} response object with all the advertisements in the database
 */
const getAdvertisements = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'anuncios';
    try {
        const joinAdvPlusInmuebles = {
            table1: tName,
            table2: "inmuebles",
            t1key: "inmueble_uuid",
            t2key: "inmueble_uuid"
        }
        let advInm = undefined
        //TODO: check if user is self or admin
        const vis = true

        if(request.auth?.user?.tipo !== 'ADMIN'){
            const vis = {'visibilidad':true}
            if(Object.keys(request.query).length !== 0){
                const query = {...request.query, ...vis}
                advInm = await getItemsMultiTable(joinAdvPlusInmuebles, query)
            }
            else{
                advInm = await getItemsMultiTable(joinAdvPlusInmuebles, vis)
            }
        }else{
            advInm = await getItemsMultiTable(joinAdvPlusInmuebles, request.query)
        }

        if(!advInm){
            throw new errorNoEntryFound("get advertisements","no advertisements found","advInm",JSON.stringify(advInm))
        }else{
            isStatus = 200
            sendMessage = {
                Tuple: JSON.stringify(request.query),
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

const getAdvertisementsMultiJoi = async (request, response) => {
    let isStatus, sendMessage;
    try {
        const queryTable = 'anuncios'
        const joinAdvPlusInmueblesTables = ['inmuebles','usuarios','resenas']
        const joinAdvPlusInmueblesKeys =[
            ['anuncios.inmueble_uuid','inmuebles.inmueble_uuid'],
            ['anuncios.usr_casero_uuid','usuarios.user_uuid'],
            ['anuncios.inmueble_uuid','resenas.inmueble_uuid']
        ]
        let advInm = undefined
        //TODO: check if user is self or admin
        const vis = true

        if(Object.keys(request.query).length !== 0){
            const query = {...request.query, ...vis}
            advInm = await getItemsMultiJoi(queryTable, joinAdvPlusInmueblesTables, joinAdvPlusInmueblesKeys, query)
        }else{
            advInm = await getItemsMultiJoi(queryTable, joinAdvPlusInmueblesTables, joinAdvPlusInmueblesKeys, vis)
        }

        if(!advInm){
            throw new errorNoEntryFound("get advertisements","no advertisements found","advInm",JSON.stringify(advInm))
        }else{
            isStatus = 200
            sendMessage = {
                Tuple: JSON.stringify(request.query),
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
        const oldAdv = validateUuid(request.params) //TODO check joi request params?
        const existsAdv = await findItem(oldAdv, tName)
        if(Object.keys(existsAdv).length === 0){
            new errorNoEntryFound(
                'adv update by admin or self',
                'old adv uuid not found in database',
                'request.params.anuncio_uuid',
                request.params.anuncio_uuid
            )
        }
        if(request.auth?.user?.user_uuid === existsAdv.usr_casero_uuid || request.auth?.user?.tipo === 'ADMIN'){
            //Checks if the one updating is self or admin
            //Cannot do that in the middleware since it needs to check the database
            let newAdv = request.body//advUpdateValidate(request.body) //throws validation error
            newAdv = {...oldAdv, ...newAdv}
            const consulta = await updateItem(newAdv, oldAdv, tName)
            if(consulta >= 1){
                isStatus = 200
                sendMessage = {
                    Info: "Anuncio modificado",
                    NewData: newAdv,
                    Reference: oldAdv
                }
                console.log(`Successfully update for ${JSON.stringify(oldAdv)} with ${JSON.stringify(newAdv)}`);
            }else{
                new errorNoEntryFound(tName,'no entry found with the given id','anuncio_uuid',oldAdv.anuncio_uuid)
            }
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
        const validatedDelAdv = request.body //TODO JOI
        if(!validatedDelAdv.error){
            const existsAdv = await findItem(validatedDelAdv,tName)
            if(existsAdv >= 1){
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
                        request.auth?.user?.user_uuid,
                        request.auth?.user?.tipo,
                        'delete advertisement',
                        'only admin or adv creator can delete it')
                    }
                }
                else{
                    throw new errorNoEntryFound(tName + 'delete adv','adv not found','request.body',request.body.anuncio_uuid)
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
    getAdvertisementSelf,
    modifyAdvertisement,
    deleteAdvertisement,
    getAdvertisementsMultiJoi
}