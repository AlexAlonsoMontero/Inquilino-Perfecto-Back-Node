const { save, getItems, findItem, updateItem, dropItem } = require('../infrastructure/generalRepository')

const { v4 } = require ('uuid')
const { validateAdvertisement } = require("../validators/advertisementeValidator")



const createAdvertisemenet = async(request, response) =>{
    //TODO Realizar validacion de  usuario cuando esté completa la base de datos
    try{
        const advertisement = validateAdvertisement(request.body)
        const advertisementBDD = await save(advertisement,'anuncios')
        
        response.statusCode = 201
        response.send({ info:"Anuncio guardado",advertisement })
    }catch(error){
        response.statusCode = 400
        console.warn(error.message)
        response.send("No se ha podido añadir el anuncio")

    }
}
/*TODO
/**
 * Busuqueda por un parametro, el campo por el que se busca key del object, el resultado se da en value
 * @param {*} request 
 * @param {*} response 
 *  
 */
const findAdvertisement = async(request,response) =>{
    try{
        const advertisements = await findItem(Object.keys(request.body)[0],"inmuebles")
        response.status(200).send({ info: "Anuncios localizado", advertisements})
    }catch(error){
        console.warn(error.message)
        response.status(400).send("Datos no localizados")
    }
}




module.exports = {
    createAdvertisemenet,
    findAdvertisement
}