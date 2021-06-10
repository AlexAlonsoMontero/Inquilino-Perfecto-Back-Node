require('dotenv').config()
const { validateNewUser,validateUser, validateLogin } = require('../validators/uservalidator')
const { save } = require('../infrastructure/generalRepository')
const { findUser, getUserBDD, updateUser, dropUser } = require('../infrastructure/userRepository')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { response } = require('express')



const createNewUser = async (request, response) => {
    try {
        const newUser = validateNewUser(request.body)
        await save(newUser, 'usuarios')
        response.statusCode = 201
        response.send("Usuario guardado")
    } catch (error) {

        response.statusCode = 400
        console.warn(error.message)
        response.send("No se ha podido añadir el usuario")

    }
}


const login = async (request, response, next) => {//TODO Ver la posibilidad de añadir morgan
    let userLogin = {}
    try {
        userLogin = validateLogin(request.body)
    } catch (error) {
        response.statusCode = 400
        console.warn(error.message)
        response.send("Formato de datos de entrega incorrectos")

    }
    try {
        const user = await findUser(userLogin.email)
        if (!user) {
            const error = new Error('No existe el usuario');
            console.warn('No existe el usuario')
            error.code = 404
            throw error
        } else {
            if (!await bcrypt.compare(request.body.password, user.password)) {
                console.warn('Password incorrecto')
                const error = new Error('El password es incorrecto')
                error.code = 404

                throw error

            } else {
                const tokenPayload = { uuid: user.user_uuid }
                const token = jwt.sign(
                    tokenPayload,
                    process.env.SECRET,
                    { expiresIn: '1d' }
                )
                response.send({ token , user})


            }


        }

    } catch (error) {

        response.statusCode = error.code
        response.send(error.message)
    }



}
//TODO Revisar response codes
/**
 * 
 * @param {*} request 
 * @param {*} response 
 * @returns El usuario se encuentra en request.auth, el método devuelve response code 200
 */
const getUser = async (request, response) => {
    try {
        const userReq = request.auth.usuario
        const userBDD = await getUserBDD(userReq.user_uuid)
        response.statusCode = 200
    
        response.send(request.auth)
    } catch (error) {
        console.warn(error.message)
        response.statusCode = 404
        response.send("Error en la carga del usuario")

    }
}

const modifyUser = async(request, response) => {
    try{
        let  modifyUser = request.body
        modifyUser= validateUser(modifyUser)
        const consulta= await updateUser(modifyUser,request.auth.usuario.user_uuid)
        response.statusCode=200
        response.send({info:"Usuario modificado",data:consulta})
    }catch(error){
        response.statusCode = 400
        console.warn(error.message)
        response.send("No se ha podido actualizar el usuario")
    }
}

const deleteUser = async(request, response) => {
    try{
        dropUser(request.params.user_uuid)
        response.statusCode=200
        response.send("Borrado de usuario realizado correctamente")

    }catch(error){
        response.statusCode = 400
        console.warn(error.message)
        response.send("No se ha podido eliminar el usuario")
    }
}


module.exports = {
    createNewUser,
    login,
    getUser,
    modifyUser,
    deleteUser
}