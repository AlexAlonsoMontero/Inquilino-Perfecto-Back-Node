const errorInvalidUser = require('../customErrors/errorInvalidUser');
const { save, getItems, findItem, updateItem, deleteItem } = require('../infrastructure/generalRepository')
const { validateNewAdevertisement, validateUpdateAdvertisemente } = require("../validators/advertisementeValidator")

//TODO Realizar validacion de usuario cuando esté completa la base de datos
//TODO configurar para que haga usuario correcto, logado admin, o casero
//TODO JOI

/**
 * 
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
 * Replaced by query search
 * Busqueda por un parametro, el campo por el que se busca key del object, el resultado se da en value
 * @param {*} request
 * @param {*} response
 */
const getAdvertisementByUser = async (request, response) => {
    // try {
    //     //check request.params.usr_casero_uuid exists
    //     let advByUser = undefined
    //     if(request.params.estado === 'all'){
    //         advByUser = await findItem({usr_casero_uuid:request.params.usr_casero_uuid}, 'anuncios')
    //     }else{// JOI VALIDATION }else if(request.params.estado === ('PENDIENTE','ACEPTADA','RECHAZADO','ALQUILER','FINALIZADA')){

    //     }
    //     if (!advByUser){
    //         response.status(404).send({Error:"No se ha encontrado el anuncio "+req.params.anuncio_uuid})
    //     }else{
    //         response.status(200).send({Info:"Anuncio encontrado", Data:advByUser})
    //     }
    // } catch (error) {
    //     console.warn(error.message)
    //     response.status(400).send("Datos no localizados")
    // }
}

/**
 * Shows the data of anuncio_uuid
 * @param {json} request contiene anuncio_uuid como path param
 * @param {json} response 
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
            request?.auth.user.user_uuid === advByAdv.usr_casero_uuid ||
            request?.auth.user.tipo === 'ADMIN'
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
 * Used only by ADMIN
 * @param {json} request not going to be used
 * @param {json} response object with all the advertisements in the database
 */
const getAllAdvertisements = async (request, response) => {
    try {
        const advertisements = await getItems('anuncios')
        response.status(200).send({ info: "Anuncios localizados", data: advertisements })
    } catch (error) {
        console.warn(error.message)
        response.status(400).send("No se han localizado anuncios")
    }
}

/**
 * Announces availables in the casual search
 * @param {json} request no data retrieved from res
 * @param {json} response sends an object with all the visible advertisements of the database
 */
const getAllVisibleAdvertisements = async (request, response) => {
    try {
        const advertisements = await findItem({visibilidad:true},'anuncios')
        response.status(200).send({ info: "Anuncios localizados", data: advertisements })
    } catch (error) {
        console.warn(error.message)
        response.status(400).send("No se han localizado anuncios")
    }
}


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
            if(request?.auth.user_uuid === existsAdv.usr_casero_uuid || request?.auth.tipo === 'ADMIN'){
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
                    new errorInvalidField('modifyAdv(AdvController)','joi verification failed')
                }
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
        const existsAdv = await findItem(validatedDelAdv,tName)
        if(request?.auth.user_uuid === existsAdv.usr_casero_uuid || request?.auth.tipo === 'ADMIN'){
            const isAdvDel = await deleteItem(validatedDelAdv, tName)
            if (isAdvDel) {
                isStatus = 200
                sendMessage = {
                    "Tuple": validatedDelAdv,
                    "Delete": isAdvDel
                }
                console.log(`Successfully deletion for ${Object.keys(validatedDelAdv)[0]} with ${validatedDelAdv.anuncio_uuid}`);
            } else {
                throw new errorNoEntryFound(tName,'adv not found','request.body',request.body.anuncio_uuid)
            }
        }
    } catch (error) {
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
    createAdvertisemenet,
    getAllAdvertisements,
    getAllVisibleAdvertisements,
    getAdvertisementByUser,
    getAdvertisementByAdv,
    modifyAdvertisement,
    deleteAdvertisement
}