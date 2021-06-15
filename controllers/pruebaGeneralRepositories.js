require('dotenv').config()
const { validateNewUser,validateUser, validateLogin } = require('../validators/uservalidator')

const { save, getItems, findItem, updateItem, dropItem } = require('../infrastructure/generalRepository')

const generalGet = async (request, response) => {
    try {
        const consulta = await getItems('usuarios')
        response.statuscode = 200
        response.send(consulta)

    }
    catch (err) {
        response.statuscode = 401
        response.send(err.message)
    }
}

const generalFind = async (request, response) => {
    try {
        item = { "user_uuid": "1db1d2a3-349b-451b-aa5d-533e0cf24494" }
        const consulta = await findItem(item, 'usuarios')
        response.statuscode = 200
        response.send(consulta)

    } catch (error) {
        response.statuscode = 401
        response.send(err.message)
    }
}

const generalUpdate = async(request, response) => {
    try {
        newItem = {
            username: 'Iago Aspas',
            email: 'prueba@cambio.com',
            tipo: 'Inquilino'
        }
        oldItem ={email: 'lll@99999.com'}
        newITem = validateUser(newItem)
        const consulta = await updateItem(newItem,oldItem,'usuarios')
        response.code = 200
        response.send({info: "Usuario Modificado",newItem})
    } catch (error) {
        response.statuscode = 401
        response.send(error.message)
    }
}

const generalDrop = async(request, response)=>{
    try {
        const item = {id_usuario:5}
        if(await dropItem(item,'usuarios')){
            response.code=200
            response.send({info: "usuario borrado",item})
        }else{
            throw new Error ("No existe el usuario en la base de datos")
        }

    } catch (error) {
        response.statuscode=200
        response.send(error.message)
    }
}


module.exports = {
    generalGet,
    generalFind,
    generalUpdate,
    generalDrop
}