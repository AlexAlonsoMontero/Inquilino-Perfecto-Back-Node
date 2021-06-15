require('dotenv').config()
const { validateNewUser, validateUser, validateLogin } = require('../validators/uservalidator')
const { save, findItem } = require('../infrastructure/generalRepository')
// const { findUser, findUserBDD, updateUser, dropUser } = require('../infrastructure/userRepository')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { response } = require('express')


//********************************* POST  */
/**
 * 
 * @param {*} request 
 * @param {*} response 
 * @description Create and save user in database
 */
const createNewUser = async (request, response) => {
    try {
        const newUser = validateNewUser(request.body)
        await save(newUser, 'usuarios')
        response.statusCode = 201
        response.send({ info: "usuario guardado", newUser })
    } catch (error) {

        response.statusCode = 400
        console.warn(error.message)
        response.send("No se ha podido añadir el usuario")

    }

}

/**
 * 
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @descriptions midleware, verify user login
 */
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
        let user = await findItem(userLogin, 'usuarios')
        user = user[0]
        if (!user) {
            const error = new Error('No existe el usuario');
            console.warn('No existe el usuario entra aqui')
            error.code = 404
            throw error
        } else {
            if (!await bcrypt.compare(request.body.password, user.password)) {
                console.warn('Password incorrecto')
                const error = new Error('El password es incorrecto')
                error.code = 404

                throw error

            } else {
                const tokenPayload = { user_uuid: user.user_uuid }
                const token = jwt.sign(
                    tokenPayload,
                    process.env.SECRET,
                    { expiresIn: '1d' }
                )
                response.statusCode = 200
                response.send({ token, user })
            }
        }
    } catch (error) {
        response.statusCode = error.code
        response.send(error.message)
    }
}


//********************************* GET  */

const showUser = (request, response) => {
    try {
        if (request.auth.token.userame === request.param.username) {
            const user = request.auth.user
            response.status(200).send({ info: "Usuario verficado", user })
        } else {
            throw new Error("El usuario no coresponde on el acceso")

        }
    } catch (error) {
        console.warn(error.message)
        response.satus(401).send("Verificación de datos erronea")
    }
}




/**
 * 
 * @param {*} request 
 * @param {*} response 
 * @description get all users from database, only adminuse
 */

const getUsers = (request, response) => {

}

/**
 * 
 * @param {*} request 
 * @param {*} response 
 * @description get users , use request.param
 */
const findUser = (request, response) => {


}

/**
 * 
 * @param {*} request 
 * @param {*} response 
 * @description get users, use request.query
 */
const filterUser = (request, response) => {
}
//************************************************* */
//************************** */

//********************************* PUT */

/**
 * 
 * @param {*} response 
 * @param {*} rquire 
 * @description update user, use request.param
 */
const updateUser = (response, rquire) => {

}

//********************************* DELETE */
/**
 * 
 * @param {*} response 
 * @param {*} require 
 * @description drop db user, user request.param
 */
const dropUser = (response, require) => {

}




module.exports = {
    createNewUser,
    login,
    getUsers,
    showUser,
    findUser,
    filterUser,
    updateUser,
    dropUser
}


//TODO COMENTAR METODOS
//TODO REVISAR GETUSER QUE DEVUELVA TODOS LOS USUARIOS Y CREAR FIND USER USANDO PARAMS

// const createNewUser = async (request, response) => {

// }



// //TODO Revisar response codes
// /**
//  * 
//  * @param {*} request 
//  * @param {*} response 
//  * @returns El usuario se encuentra en request.auth, el método devuelve response code 200
//  * @description Busqueda de datos de un usuario se requiere validación
//  */
// const findUser = async (request, response) => {
//     try {
//         const userReq = request.auth.usuario
//         const userBDD = await findUserBDD(userReq.user_uuid)
//         response.statusCode = 200

//         response.send(request.auth)
//     } catch (error) {
//         console.warn(error.message)
//         response.statusCode = 404
//         response.send("Error en la carga del usuario")

//     }
// }

// const modifyUser = async(request, response) => {
//     try{
//         let  modifyUser = request.body
//         modifyUser= validateUser(modifyUser)
//         const consulta= await updateUser(modifyUser,request.auth.usuario.user_uuid)
//         response.statusCode=200
//         response.send({info:"Usuario modificado",data:consulta})
//     }catch(error){
//         response.statusCode = 400
//         console.warn(error.message)
//         response.send("No se ha podido actualizar el usuario")
//     }
// }

// const deleteUser = async(request, response) => {
//     try{
//         dropUser(request.params.user_uuid)
//         response.statusCode=200
//         response.send("Borrado de usuario realizado correctamente")

//     }catch(error){
//         response.statusCode = 400
//         console.warn(error.message)
//         response.send("No se ha podido eliminar el usuario")
//     }
// }


// module.exports = {
//     createNewUser,
//     login,
//     findUser,
//     modifyUser,
//     deleteUser
// }