const errorInvalidUser = require('../customErrors/errorInvalidUser');
const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound');
const { errorInvalidField } = require('../customErrors/errorInvalidField')
const { save, getItems, findItem, updateItem, deleteItem, getItemsMultiTable } = require('../infrastructure/generalRepository')
const { validateNewAdevertisement, validateUpdateAdvertisemente } = require("../validators/advertisementeValidator");
const { errorNoAuthorization } = require('../customErrors/errorNoAuthorization');
const { response } = require('express');

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
        let newAdv = request.body
        //TEMP Línea añadida para poder trabajar con los uuid generados en la base de datos
        //En la versión definitiva no dejaremos que el post traiga uuid
        if (!newAdv.anuncio_uuid){
            newAdv = {...newAdv, anuncio_uuid : v4()}
        }
        newAdv = validatenewAdv(newAdv) //TODO check joi

        if(newAdv.error){
            throw new errorInvalidField(
                'advertisement creation',
                `invalid joi validation for data granted by ${request?.auth.tipo}`,
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
        const validatedAdv = request.params
        const advByAdv = await findItem(validatedRes,'anuncios')

        if (advByAdv.length === 0){
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
 * TODO
 * @param {*} request
 * @param {*} response
 */
 const getAdvertisementSelf = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'anuncios';
    try {
        const validatedAdv = request.params
        const advByAdv = await findItem(validatedRes,'anuncios')

        if (advByAdv.length === 0){
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

        if(Object.keys(request.query).length !== 0){
            const query = {...request.query, ...vis}
            console.log(query)
            advInm = await getItemsMultiTable(joinAdvPlusInmuebles, query)
        }else{
            advInm = await getItemsMultiTable(joinAdvPlusInmuebles, vis)
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
        const oldAdv = request.params //TODO joi
        if(!oldAdv.error){
            const existsAdv = await findItem({anuncio_uuid: oldAdv.anuncio_uuid},tName)
            if(existsAdv.length === 0){
                new errorNoEntryFound(
                    'adv update by admin or self',
                    'old adv uuid not found in database',
                    'request.params.anuncio_uuid',
                    request.params.anuncio_uuid
                    )
            }
            if(request.auth?.user?.user_uuid === existsAdv.usr_casero_uuid || request.auth?.user?.tipo === 'ADMIN'){
                //Checks if the one updating is self or admin
                const newAdv = request.body //TODO JOI
                if(!newAdv.error){
                    const consulta = await updateItem(newAdv, oldAdv, 'usuarios')
                    if(consulta>=1){
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
                }else{
                    new errorInvalidField('modifyAdv(AdvController)','joi verification failed for newAdv content')
                }
            }
        }else{
            new errorInvalidField('modifyAdv(AdvController)','joi verification failed for anuncio_uuid')
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
    deleteAdvertisement
}