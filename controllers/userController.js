require('dotenv').config()
const { validateNewUser, validateUser, validateLogin, validateUpdateUser } = require('../validators/userValidator')
const { save, findItem, updateItem, deleteItem } = require('../infrastructure/generalRepository')
const { selectUsersNoPass } = require('../infrastructure/userRepository')
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
 * @descriptions middleware, verify user login
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
        if (!user) {
            const error = new Error('No existe el usuario');
            console.warn('No existe el usuario entra aqui')
            error.code = 404
            throw error
        } else {
            user = user[0   ]
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
/**
 * 
 * @param {token,user} request 
 * @param {} response 
 * @description Confirm validate user and shows user data
 */
const showUser = (request, response) => {
    try {
        if (request.params.username === request.auth.user.username) {
            const user = request.auth.user

            response.status(200).send({ info: "Usuario verficado", user })
        } else {
            throw new Error("El usuario no coresponde on el acceso")

        }
    } catch (error) {
        console.warn(error.message)
        response.status(401).send("Verificación de datos erronea")
    }
}


//TODO Revisar y realizar validación de admin

/**
 * 
 * @param {*} request 
 * @param {*} response 
 * @description get all users from database, only usable by ADMIN
 */

const getUsers = async(request, response) => {
    try{
        const users = await selectUsersNoPass()
        if(users.length < 1){
            throw new Error ("No existen usuarios en la base de datos")
        }else{
            response.status(201).send({info:"Usuarios localizados", users})
        }
        
    }catch(error){
        console.warn(error.message)
        response.status(401).send("No se han podido cargar usuarios")
    }
}

/**
 * 
 * @param {*} request 
 * @param {*} response 
 * @description get users, uses request.params
 */
const findUser = (request, response) => {


}

/**
 * 
 * @param {*} request 
 * @param {*} response 
 * @description get users, uses request.query
 */
const filterUser = (request, response) => {
}

//********************************* PUT */

/**
 * 
 * @param {*} request 
 * @param {*} response 
 */
const updateUser = async (request, response) => {
    try {

        const newUser = request.body
        validateUpdateUser(newUser)
        const oldUser = { user_uuid: request.auth.token.user_uuid }
        const consulta = await updateItem(newUser, oldUser, 'usuarios')
        response.statusCode = 200
        response.send({ info: "Usuario modificado", data: consulta })
    } catch (error) {
        response.statusCode = 400
        console.warn(error.message)
        response.send("No se ha podido actualizar el usuario")
    }
}




//********************************* DELETE */
/**
 * 
 * @param {user_uuid: string} request 
 * @param {*} response 
 * @description drop user from database, user request.param
 */
const deleteUser = async (request, response) => {
    try {
        const sentence = await deleteItem(request.body,'usuarios')
        if(sentence){
        response.statusCode = 200
        response.send("Borrado de usuario realizado correctamente")
        }else{
            throw new Error ("No se ha eliminado el usuario")
        }
    } catch (error) {
        response.statusCode = 400
        console.warn(error.message)
        response.send("No se ha podido eliminar el usuario")
    }

}

const logout = (request, response) => {
    try{
        if (request.headers){
            request.headers=undefined
            request.body=undefined
            
            response.status(200).send("Logout existoso")
        }else{
            throw new Error ("El usuario no est logado")
        }

        
    }catch(error){
        console.warn(error.message)
        response.status(401).send("Logout incorrecto")
    }
}







module.exports = {
    createNewUser,
    login,
    getUsers,
    showUser,
    findUser,
    filterUser,
    updateUser,
    deleteUser,
    logout
}


//TODO COMENTAR METODOS
//TODO REVISAR GETUSER QUE DEVUELVA TODOS LOS USUARIOS Y CREAR FIND USER USANDO PARAMS
//TODO Revisar response codes
