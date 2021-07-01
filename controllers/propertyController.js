const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { deleteItem, findItem, getItems, save, updateItem} = require('../infrastructure/generalRepository')
const { validatePropByUserAndProp, validateNewProp,    validatePropByUser,    validateUpdateProp,    validatePropQP,    validatePropByProp} = require('../validators/propValidators.js')

/**
 * #LAND_FUNCTION
 * Creates a new property in the database
 * @param {json} req 
 * @param {json} res 
 */
const createNewProperty = async(req, res) =>{
    try {
        const newProp = validateNewProp(req.body)
        const createdProp = await save(newProp, 'inmuebles')
        res.status(201).send({Info:"Inmueble creado",Data:createdProp})
    } catch (error) {
        console.warn(error.message)
        res.status(500).send({Error:"Internal error, no se ha podido crear el inmueble"})
    }
}

/**
 * #LAND_FUNCTION
 * Gets a property using a determined property uuid, expected as param
 * @param {json} req param 'inmueble_uuid'
 * @param {json} res :  Codes
 *                      200 When the property is found
 *                      404 When the property is not found
 *                      500 When there's an internal error
 */
const getProperty = async(req, res) =>{
    try {
        const prop = validatePropByProp(req.params)
        const foundProp = await findItem(prop, 'inmuebles')
        if (!foundProp){
            res.status(404).send({Error:"No se ha encontrado el inmueble "+req.params.inmueble_uuid})
        }else{
            throw {not_found_error:[]}
            res.status(200).send({Info:"Inmueble encontrado", Data:foundProp})
        }
    } catch (error) {
        console.warn(error.message)
        res.status(500).send({Error:"No se ha podido resolver la petición"})
    }
}

/**
 * Check all properties in database
 * @param {json} req corresponding to req
 * @param {json} res corresponding to res
 */
const getAllProperties = async(req, res) =>{
    try {
        const allProp = await getItems('inmuebles');
        if (!allProp){
            res.status(404).send({Error:"No se ha encontrado ningún inmueble"})
        }else{
            res.status(200).send({Info:"Inmueble encontrado", Data:allProp})
        }
    } catch (error) {
        console.warn(error.message)
        res.status(500).send({Error:"No se ha podido resolver la petición"})
    }
}

/**
 * #ADMIN_FUNCTION
 * Gets the properties of a determined landlord uuid, expected as param
 * @param {json} req json object from which we are gonna use the 'usr_casero_uuid'
 * @param {json} res json object we are gonna send back
 */
const getUserProperties = async(req, res) =>{
    try {
        let propsByUser = undefined;
        if(req.params.inmueble_uuid==='all'){
            propsByUser = await findItem(validatePropByUser(req.params), 'inmuebles')
        }else{

            console.warn('Necesito método SELECT CON VARIOS PARÁMETROS')
            throw error;
            // TODO + de un parámetro en where
            // console.log(`${req.params.usr_casero_uuid} es numero`);
            // propsByUser = await findItem(validatePropByUserAndProp(req.params), 'inmuebles')
        }
        if (!propsByUser){
            res.status(404).send({Error:"No se ha encontrado el inmueble "+req.params.usr_casero_uuid})
        }else{
            res.status(200).send({Info:"Inmueble encontrado", Data:propsByUser})
        }
    } catch (error) {
        console.warn(error.message)
        res.status(500).send({Error:"No se ha podido resolver la petición"})
    }
}

// const getOwnProps = async(req, res){
// }

/**
 * Updates the property with a determined property uuid, expected as param
 * @param {json} req json object from which we are gonna use the 'inmueble_uuid'
 * @param {json} res json object we are gonna send back
 */
const modifyProperty = async(req, res) =>{
    try{
        let modifyProp = validatePropByProp(req.params)
        let newProp = validateUpdateProp(req.body)
        const updatedProp = await updateItem(newProp, modifyProp,'inmuebles')
        res.status(200).send({Info:"Inmueble modificado", Data:updatedProp})
    }catch(error){
        console.warn(error.message)
        res.status(400).send("No se ha podido actualizar el inmueble")
    }
}

/**
 * Deletes the property with a determined property uuid, expected as param
 * @param {json} req we use no data from here
 * @param {json} res json object we are gonna send back as 'true' for deleted object
 */
const deleteProperty = async(req, res) =>{
    try{
        let prop = validatePropByProp(req.body)
        const deletedProp = await deleteItem(prop, 'inmuebles')
        if(deletedProp){
            res.status(200).send({Info:"Inmueble eliminado", Delete:deletedProp})
        }else{
            res.status(404).send({Info:"El inmueble que quieres borrar no existe.", Delete:deletedProp})
        }
    }catch(error){
        console.warn(error.message)
        res.status(400).send("No se ha podido eliminar el inmueble")
    }
}

module.exports = {
    getProperty, getAllProperties, getUserProperties, createNewProperty, modifyProperty, deleteProperty
}
