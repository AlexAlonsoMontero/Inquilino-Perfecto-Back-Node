const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { deleteItem, findItem, getItems, save, updateItem} = require('../infrastructure/generalRepository')
const { validatePropByUserAndProp, validateNewProp,    validatePropByUser,    validateUpdateProp,    validatePropQP,    validatePropByProp} = require('../validators/propValidators.js')


const createNewProperty = async(req, res) =>{
    try {
        const newProp = validateNewProp(req.body)
        const createdProp = await save(newProp, 'inmuebles')
        res.status(201).send({Info:"Inmueble creado",Data:createdProp})
    } catch (error) {
        console.warn(error.message)
        res.status(400).send({Error:"No se ha podido crear el inmueble"})
    }
}

/**
 * Gets a property using a determined property uuid, expected as param
 * @param {json} req json object from which we are gonna use the 'inmueble_uuid'
 * @param {json} res json object we are gonna send back
 */
const getProperty = async(req, res) =>{
    try {
        const prop = validatePropByProp(req.params)
        const foundProp = await findItem(prop, 'inmuebles')
        if (!foundProp){
            res.status(404).send({Error:"No se ha encontrado el inmueble "+req.params.inmueble_uuid})
        }else{
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
        res.status(200).send({Info:"Inmuebles encontrados", Data:allProp})
        if (!allProp){
            res.status(404).send({Error:"No se ha encontrado ningún inmueble"})
        }else{
            res.status(200).send({Info:"Inmueble encontrado", Data:foundProp})
        }
    } catch (error) {
        console.warn(error.message)
        res.status(500).send({Error:"No se ha podido resolver la petición"})
    }
}

/**
 * Gets the properties of a determined landlord uuid, expected as param
 * @param {json} req json object from which we are gonna use the 'usr_casero_uuid'
 * @param {json} res json object we are gonna send back
 */
const getUserProperties = async(req, res) =>{
    try {
        let propsByUser = undefined;
        if(req.params.usr_casero_uuid==='all'){
            console.log(`${req.params.usr_casero_uuid} es all`);
            propsByUser = await findItem(validatePropByUser(req.params), 'inmuebles')
        }else{
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

/**
 * Updates the property with a determined property uuid, expected as param
 * @param {json} req json object from which we are gonna use the 'inmueble_uuid'
 * @param {json} res json object we are gonna send back
 */
const modifyProperty = async(req, res) =>{
    try{
        let modifyProp = validatePropByProp(req.params)
        console.log(modifyProp);
        let newProp = validateUpdateProp(req.body)
        console.log(newProp);
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
        console.log(deletedProp);
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
