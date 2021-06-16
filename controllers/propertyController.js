const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { response } = require('express')
const { save, findItem } = require('../infrastructure/generalRepository')


const createNewProperty = async(req, res) =>{
    try {
        const newProp = validateNewProp(req.body)
        const createdProp = await save(newProp, 'inmuebles')
        res.status(201).send({Info:"Inmueble creado",createdProp})
    } catch (error) {
        console.warn(error.message)
        response.status(400).send({Error:"No se ha podido crear el inmueble"})
    }
}

const getProperty = async(req, res) =>{
    try {
        // comprobación
        const prop = validatePropPP(req.params.usr_casero_uuid)
        const foundProp = await findItem(prop.usr_casero_uuid, 'inmuebles')
        res.status(200).send({Info:"Inmuebles encontrados", foundProp})
    } catch (error) {
        console.warn(error.message)
        res.status(404).send({Error:"No se ha encontrado ningún inmueble"})
    }
}

const getAllProperties = async(req, res) =>{
    try {
        const allProp = await getItems('inmuebles');
        res.status(200).send({Info:"Inmuebles encontrados", foundProp})
    } catch (error) {
        console.warn(error.message)
        res.status(404).send({Error:"No se ha encontrado ningún inmueble"})
    }
}

/**
 * Gets the properties of a determined landlord, expected params
 * @param {json} req json object from which we are gonna use the 'usr_casero_uuid'
 * @param {json} res json object we are gonna send back
 */
const getUserProperties = async(req, res) =>{
    try {
        const props = validateProp(req.params.username)
        const propsByUser = await findItem(props, 'inmuebles')
        res.status(200).send({Info:"Inmueble mostrado", propsByUser})
    } catch (error) {
        console.warn(error.message)
        res.status(404).send({Error:"No se ha encontrado ningún inmueble"})
    }
}

const modifyProperty = async(req, res) =>{
    try{
        let modifyProp = validateProp(request.body)
        const updatedProp = await updateItem(modifyProp, modifyProp.inmueble_uuid)
        response.status(200).send({info:"Inmueble modificado", data:updatedProp})
    }catch(error){
        console.warn(error.message)
        response.status(400).send("No se ha podido actualizar el inmueble")
    }
}

const deleteProperty = async(req, res) =>{
    try{
        let deleteProp = validateProp(request.body)
        const deletedProp = await dropItem(deleteProp, deleteProp.inmueble_uuid)
        response.status(200).send({info:"Inmueble eliminado", data:deletedProp})
    }catch(error){
        console.warn(error.message)
        response.status(400).send("No se ha podido actualizar el inmueble")
    }
}

module.exports = {
    getProperty, getAllProperties, getUserProperties, createNewProperty, modifyProperty, deleteProperty
}
