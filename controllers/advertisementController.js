const { save, getItems, findItem, updateItem, deleteItem } = require('../infrastructure/generalRepository')

const { v4 } = require('uuid')
const { validateNewAdevertisement, validateUpdateAdvertisemente } = require("../validators/advertisementeValidator")



const createAdvertisemenet = async (request, response) => {
    //TODO Realizar validacion de  usuario cuando esté completa la base de datos
    try {
        const advertisement = validateNewAdevertisement(request.body)
        const advertisementBDD = await save(advertisement, 'anuncios')

        response.statusCode = 201
        response.send({ info: "Anuncio guardado", advertisement })
    } catch (error) {
        response.statusCode = 400
        console.warn(error.message)
        response.send("No se ha podido añadir el anuncio")

    }
}
/*TODO configurar para que haga usuario correcto, logado admin, o casero
/**
 * Busuqueda por un parametro, el campo por el que se busca key del object, el resultado se da en value
 * @param {*} request 
 * @param {*} response 
 *  
 */
const findAdvertisement = async (request, response) => {
    try {
        const advertisements = await findItem(request.params, 'anuncios')
        response.status(200).send({ info: "Los datos solicitados han sido localizados", advertisements })
    } catch (error) {
        console.warn(error.message)
        response.status(400).send("Datos no localizados")
    }
}


const modifyAdvertisement = async (request, response) => {
    try {
        const newItem = validateUpdateAdvertisemente(request.body)
        const oldItem = request.params
        const advertisement = await updateItem(newItem, oldItem, 'anuncios')
        response.status(200).send({ info: "Se han realizado los cambios", data: newItem })
    } catch (error) {
        console.warn(error.message)
        response.status(401).send("No se ha podido actualizar el usuario")
    }
}

const getAllAdvertisements = async (request, response) => {
    try {
        const advertisements = await getItems('anuncios')
        response.status(200).send({ info: "Anuncios localizados", data: advertisements })
    } catch (error) {
        console.warn(error.message)
        response.status(400).send("No se han localizado anuncios")
    }
}

const deleteAdvertisement = async (request, response) => {
    try {
        if (await deleteItem(request.body, 'anuncios')) {
            response.statusCode = 200
            response.send("Borrado de anuncio realizado correctamente")
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
    findAdvertisement,
    modifyAdvertisement,
    getAllAdvertisements,
    deleteAdvertisement
}