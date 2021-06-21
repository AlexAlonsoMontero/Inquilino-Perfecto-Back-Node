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
    try {
        // const advertisement = validateNewAdevertisement(request.body)
        const advertisementBDD = await save(request.body, 'anuncios')

        response.status(201).send({Info: "Anuncio guardado", Data:advertisementBDD })
    } catch (error) {
        console.warn(error.message)
        response.status(400).send("No se ha podido añadir el anuncio")
    }
}

/**
 * Busqueda por un parametro, el campo por el que se busca key del object, el resultado se da en value
 * @param {*} request
 * @param {*} response
 */
const getAdvertisementByUser = async (request, response) => {
    try {
        //check request.params.usr_casero_uuid exists
        let advByUser = undefined
        if(request.params.estado === 'all'){
            advByUser = await findItem({usr_casero_uuid:request.params.usr_casero_uuid}, 'anuncios')
        }else{// JOI VALIDATION }else if(request.params.estado === ('PENDIENTE','ACEPTADA','RECHAZADO','ALQUILER','FINALIZADA')){

        }
        if (!advByUser){
            response.status(404).send({Error:"No se ha encontrado el anuncio "+req.params.anuncio_uuid})
        }else{
            response.status(200).send({Info:"Anuncio encontrado", Data:advByUser})
        }
    } catch (error) {
        console.warn(error.message)
        response.status(400).send("Datos no localizados")
    }
}

/**
 * Shows the data of anuncio_uuid
 * @param {json} request contiene anuncio_uuid como path param
 * @param {json} response 
 */
 const getAdvertisementByAdv = async (request, response) => {
    try {
        let advByAdv = undefined;
        console.log(request.params);
        advByAdv = await findItem(request.params,'anuncios')

        if (!advByAdv){
            response.status(404).send({Error:"No se ha encontrado el anuncio "+req.params.anuncio_uuid})
        }else{
            response.status(200).send({Info:"Inmueble encontrado", Data:advByAdv})
        }
    } catch (error) {
        console.warn(error.message)
        response.status(400).send("Datos no localizados")
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
    try {
        // const newItem = validateUpdateAdvertisemente(request.body)
        const newItem = request.body
        const oldItem = request.params
        const advertisement = await updateItem(newItem, oldItem, 'anuncios')
        response.status(200).send({ Info:"Se han realizado los cambios", Data:newItem })
    } catch (error) {
        console.warn(error.message)
        response.status(401).send({Error:"No se ha podido actualizar el anuncio"})
    }
}

const deleteAdvertisement = async (request, response) => {
    try {
        if (await deleteItem(request.body, 'anuncios')) {
            response.status(200).send("Borrado de anuncio realizado correctamente")
        } else {
            throw Error("No se han borrado elementos")
        }


    } catch (error) {
        response.statusCode = 400
        console.warn(error.message)
        response.send("No se ha podido eliminar el anuncio")
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