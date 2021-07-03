require('dotenv').config()
const {    validateNewUser,    validateUser,    validateLogin,    validateUpdateUser,    validateUserMail,    validateUserPassword} = require('../validators/userValidator')
const {    save,    findItem,    updateItem,    deleteItem } = require('../infrastructure/generalRepository')
const {    getUserNoPass, findUsersNoPass} = require('../infrastructure/userRepository')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { errorNoAuthorization } = require('../customErrors/errorNoAuthorization') 
const { errorInvalidField } = require('../customErrors/errorInvalidField')
const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound')
const { errorInvalidUser } = require('../customErrors/errorInvalidUser')
const { invalid } = require('joi')
const errorInvalidToken = require('../customErrors/errorInvalidToken')

//TODO Update self
//TODO REVISAR GETUSER QUE DEVUELVA TODOS LOS USUARIOS Y CREAR FIND USER USANDO PARAMS
//TODO posibilidad de añadir morgan
//TODO posibilidad de loggear con username

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


/**
 * #REGISTRED_FUNCTION [ALL/SELF]
 * Retrieves self data
 * @param {json} request
 * @param {json} response
 */
const getSelfUser = (request, response) => {
    let isStatus, sendMessage;
    try {
        const decodedUser = request.auth.user
        if (request.params.username === decodedUser.username) {
            isStatus = 200
            sendMessage = {
                Info: "Usuario verficado",
                user: {...decodedUser}
            }
        } else {
            throw new errorNoAuthorization(decodedUser.username,decodedUser.tipo,'showUser','tryed to get someone else data')
        }
    } catch (error) {
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else{
            isStatus = 500
        }
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}


/**
 * #ADMIN_FUNCTION
 * retrieves data of all users (no pass, no admins)
 * @param {*} request 
 * @param {*} response 
 */
const getUsers = async (request, response) => {
    let isStatus, sendMessage;
    try {
        const users = await findUsersNoPass()
        if (users.length === 0) {
            throw new errorNoEntryFound('getting all users', 'empty result')
        } else {
            isStatus = 200
            sendMessage = {
                info: "Usuarios localizados",
                users
            }
        }
    } catch (error) {
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else{
            isStatus = 500
        }
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}


/**
 * #ADMIN FUNCTION
 * updates any user
 * @param {json} request user reference in params, new user data in body
 * @param {json} response
 */
const updateUser = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'usuarios';
    try {
        const oldUser = request.params
        // const oldUser = {
            //     user_uuid: request.auth.token.user_uuid
            // }
            const newUser = request.body //TODO JOI
            //(El anterior está mal, exige que cambien todos los datos que aparecen en el joi)
            if(!newUser.error){
                const consulta = await updateItem(newUser, oldUser, 'usuarios')
                if(consulta>=1){
                    isStatus = 200
                    sendMessage = {
                        Info: "Usuario modificado",
                        Data: consulta
                    }
                }else{
                    new errorNoEntryFound(tName,'no entry found with the given id','user_uuid',oldUser)
                }
            }else{
                new errorInvalidField('userUpdate(UserController)','joi verification failed')
            }
        } catch (error) {
            console.warn(error)
            sendMessage = {error:error.message}
            if(error instanceof errorInvalidField){
                isStatus = 401
            }else if(error instanceof errorNoEntryFound){
                isStatus = 404
            }else{
                isStatus = 500
            }
        }finally{
            response.status(isStatus).send(sendMessage)
        }
    }

    /**
     * #ADMIN FUNCTION
     * deletes user from database
     * @param {json} request
     * @param {json} response
     */
    const deleteUser = async (request, response) => {
        let isStatus, sendMessage;
        const tName = 'usuarios';
        try {
            const delUser = request.body //TODO JOI
            const isUserDel = await deleteItem(delUser, 'usuarios')
            if (isUserDel) {
                isStatus = 200
                sendMessage = {
                    "Tuple": delUser,
                    "Delete": isUserDel
                }
                console.warn(`Successfully deletion for ${Object.keys(delUser)[0]} with ${delRes}`);
            } else {
                throw new errorNoEntryFound(tName,'user not found','request.body',request.body)
            }
    } catch (error) {
        console.warn(error)
        sendMessage = {error:error.message}
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else{
            isStatus = 500
        }
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}

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
                throw new errorInvalidUser(request.body.email,request.body.password,false)
            } else if (!await bcrypt.compare(request.body.password, user.password)) {
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
                    // token: token,            Según el ejemplo no se mandanada más
                    // user: {...tokenPayload}
                    token
                }
                res.status(isStatus).send(sendMessage)
                //termina aquí el flujo si el logeo es correcto
                console.warn('Successfully logged in');
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
        // res.status(isStatus).send(sendMessage)
        //Si hago un send termina el flujo
        next(error, isStatus)
        //Llega aquí sólo si falla el logeo
    }
}

/**
 * 
 * @param {json} request contains the loggin token
 * @param {*} response 
 */
const logout = (request, response) => {
    let isStatus, sendMessage;
    try {
        if (request.headers) {
            request.headers = undefined
            request.body = undefined
            
            isStatus = 200
            sendMessage = {
                "Log out":"OK"
            }
            console.warn('Successfu logged out');
        } else {
            throw new errorInvalidToken('user not logged')
        }
    } catch (error) {
        console.warn(error.message)
        if(error instanceof errorInvalidToken){
            isStatus = 400
        }else{
            isStatus = 500
        }
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}

module.exports = {
    createNewUser,    login,    getUsers,    getSelfUser,
    updateUser,    deleteUser,  logout
}