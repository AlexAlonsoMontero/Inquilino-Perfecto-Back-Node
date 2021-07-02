require('dotenv').config()
const {    validateNewUser,    validateUser,    validateLogin,    validateUpdateUser,    validateUserMail,    validateUserPassword} = require('../validators/userValidator')
const {    save,    findItem,    updateItem,    deleteItem } = require('../infrastructure/generalRepository')
const {    selectUsersNoPass} = require('../infrastructure/userRepository')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { errorNoAuthorization } = require('../customErrors/errorNoAuthorization') 
const { errorInvalidField } = require('../customErrors/errorInvalidField')
const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound')
const { errorInvalidUser } = require('../customErrors/errorInvalidUser')

/**
 * #GUEST_FUNCTION // Admin
 * Creates a new user [POST]
 * throws error if tries to create an admin user
 * @param {*} request request.body has new user data
 * @param {*} response
 */
const createNewUser = async (request, response) => {
    let isStatus, sendMessage;
    try {
        if(request.body.tipo==="ADMIN"){
            throw new errorNoAuthorization('guest','guest', 'user creation', 'tried to create admin')
        }else{
            const newUser = validateNewUser(request.body) //TODO check joi
            if(newUser.error){
                throw new errorInvalidField('user creation','invalid joi validation for data granted by guest','request.body',request.body)
            }else{
                const creation = await save(newUser, 'usuarios')
                isStatus = 201
                sendMessage = {
                    Info: "User created",
                    Data: newUser
                }
                console.warn(`Created new user`)
            }
        }
    } catch (error) {
        console.warn(error)
        sendMessage = {error: error.message}
        if(error instanceof errorNoAuthorization){
            isStatus = 403
        }else if(error instanceof errorInvalidField){
            isStatus = 401
        }else{
            isStatus = 500
        }
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}

//TODO posibilidad de añadir morgan
//TODO posibilidad de logear con username
/**
 * #GUEST_FUNCTION
 * Verifies user login
 * needs to check password 
 * it uses the 'all data retrieving method'
 * @param {*} request
 * @param {*} response
 * @param {*} next
 */
const login = async (request, response, next) => { 
    let isStatus, sendMessage;
    try {
        if (!validateUserMail(request.body.email)) {
            throw new errorInvalidField('user login','mail validation failed in joi','mail',request.body.email)
        } else if (!validateUserPassword(request.body.password)) {
            throw new errorInvalidField('user login','password validation failed in joi','password',request.body.password)
        } else {
            let user = await findItem(request.body, 'usuarios')
            if (user.length === 0) {
                console.warn('Incorrect mail')
                throw new errorInvalidUser(request.body.email,request.body.password,false)
            } else if (!await bcrypt.compare(request.body.password, user.password)) {
                console.warn('Incorrect password')
                const error = new Error('El password es incorrecto')
                throw new errorInvalidUser(request.body.email,request.body.password,true)
            } else {
                const tokenPayload = {
                    user_uuid: user.user_uuid,
                    username: user.username,
                    tipo: user.tipo
                }
                const token = jwt.sign(
                    tokenPayload,
                    process.env.SECRET, {
                        expiresIn: '1d'
                    }
                )
                isStatus = 200
                sendMessage = {
                    token,
                    user
                }
            }
        }
    } catch (error) {
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorInvalidField
        || error instanceof errorInvalidUser){
            isStatus = 401
        }else{
            isStatus = 500
        }
    }finally{
        res.status(isStatus).send(sendMessage)
    }
}

// const login = async (request, response, next) => { //TODO Ver la posibilidad de añadir morgan
    
//     try {
//         if (!validateUserMail(request.body.email)) {

//             const error = new Error('Formato de email incorrecto')
//             console.log("mail incorrecto")
//             error.code = 401
//             throw (error)
//         } else if (!validateUserPassword(request.body.password)) {
//             const error = new Error('Formato de password incorrecto')
//             error.code = 401
//             throw (error)
//         } else {
//             let user = await findItem(request.body, 'usuarios')
//             console.log(userLogin)
//             if (!user) {
//                 const error = new Error('No existe el usuario');
//                 console.warn('No existe el usuario entra aqui')
//                 error.code = 403
//                 throw error
//             } else {
//                 user = user[0]
//                 if (!await bcrypt.compare(request.body.password, user.password)) {
//                     console.warn('Password incorrecto')
//                     const error = new Error('El password es incorrecto')
//                     error.code = 403

//                     throw error
//                 } else {
//                     const tokenPayload = {
//                         user_uuid: user.user_uuid
//                     }
//                     const token = jwt.sign(
//                         tokenPayload,
//                         process.env.SECRET, {
//                             expiresIn: '1d'
//                         }
//                     )
//                     response.statusCode = 200
//                     response.send({
//                         token,
//                         user
//                     })
//                 }
//             }

//         }
//     } catch (error) {
        
//         response.statusCode = error.code
//         response.send(error.message)
//     }
// }

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

            response.status(200).send({
                info: "Usuario verficado",
                user
            })
        } else {
            throw new Error("El usuario no coresponde on el acceso")

        }
    } catch (error) {
        console.warn(error.message)
        response.status(401).send("Verificación de datos erronea")
    }
}


/**
 * 
 * @param {*} request 
 * @param {*} response 
 * @description get all users from database, only usable by ADMIN
 */

const getUsers = async (request, response) => {
    try {
        const users = await selectUsersNoPass()
        if (users.length < 1) {
            throw new Error("No existen usuarios en la base de datos")
        } else {
            response.status(201).send({
                info: "Usuarios localizados",
                users
            })
        }

    } catch (error) {
        console.warn(error.message)
        response.status(401).send("No se han podido cargar usuarios")
    }
}

const findUser = (request, response) => {


}

const filterUser = (request, response) => {



}

const updateUser = async (request, response) => {
    try {
        const newUser = request.body
        validateUpdateUser(newUser)
        const oldUser = {
            user_uuid: request.auth.token.user_uuid
        }
        const consulta = await updateItem(newUser, oldUser, 'usuarios')
        response.statusCode = 200
        response.send({
            info: "Usuario modificado",
            data: consulta
        })
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
        const sentence = await deleteItem(request.body, 'usuarios')
        if (sentence) {
            response.statusCode = 200
            response.send("Borrado de usuario realizado correctamente")
        } else {
            throw new Error("No se ha eliminado el usuario")
        }
    } catch (error) {
        response.statusCode = 400
        console.warn(error.message)
        response.send("No se ha podido eliminar el usuario")
    }

}

const logout = (request, response) => {
    try {
        if (request.headers) {
            request.headers = undefined
            request.body = undefined

            response.status(200).send("Logout existoso")
        } else {
            throw new Error("El usuario no est logado")
        }


    } catch (error) {
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