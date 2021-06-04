require('dotenv').config()
const { validateNewUser, validateLogin } = require('../validators/uservalidator')
const { save } = require('../infrastructure/generalRepository')
const { findUser } = require('../infrastructure/userRepository')
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
        response.send("No se ha podido añadir el usuario")

    }
}


const login = async (request, response) => {
    try {
        if (validateLogin(request.body)) {
            const user = await findUser(request.body.email)

            if (await !bcrypt.compare(request.body.password, user.password)) {
                console.warn("Pasword incorrecto")
                response.statusCode = 404
                response.send("Password o mail incorrecto")
            } else {
                //USUARIO PASWORD OK, JWT
                const tokenPayload = { user_uuid: user.user_uuid  }
                console.log(process.env.SECRET)
                const token = jwt.sign(tokenPayload,process.env.SECRET,{expiresIn:'1d'})//TODO Revisar la duración
                console.log("usuario ok")
                console.log(token)
                response.statusCode = 200
                response.send(token)
            }


        } else {
            console.warn("Formato de datos incorrecto")
            response.statusCode = 500
            response.send("Usuario o contraseña incorrectos, revisa el formato de entrada")
        }
    } catch (error) {
        console.warn("Datos incorrectos")
        console.warn(error.message)
        response.status(500).send("Datos incorrectos")
    }

}


const confirmLogin = (objeto) => {

}


module.exports = {
    createNewUser,
    login
}