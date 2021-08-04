require('dotenv').config()
const {    validateNewUser,    validateUser,    validateLogin,    validateUpdateUser,    validateUserMail,    validateUserPassword} = require('../validators/userValidator')
const {    save,    findItems,    updateItem,    deleteItem, getItemsMultiParams } = require('../infrastructure/generalRepository')
const {    getUserNoPass, findUsersNoPass} = require('../infrastructure/userRepository')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4 } = require('uuid')
const { errorNoAuthorization } = require('../customErrors/errorNoAuthorization')
const { errorInvalidField } = require('../customErrors/errorInvalidField')
const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound')
const { errorInvalidToken } = require('../customErrors/errorInvalidToken')
const { errorInvalidUserLogin } = require('../customErrors/errorInvalidUserLogin')
const { request } = require('express')
const fs = require('fs')
const path = require('path')
const { sendConfirmUserActivation, sendRegistrationMail } = require('../infrastructure/utils/smtpMail')
const  cryptoRandomString  = require('crypto-random-string')
const { errorNoActiveUser } = require('../customErrors/errorNoActiveuser')
const { errorSendMail } = require('../customErrors/errorSendMail')
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
        let newUser = request.body
        if(newUser?.tipo === 'ADMIN' && request.auth?.user.tipo !== 'ADMIN'){
            throw new errorNoAuthorization('guest or unauthorized','guest or unauthorized', 'user creation', 'tried to create admin')
        }else{
            //TEMP Línea añadida para poder trabajar con los uuid generados en la base de datos
            //En la versión definitiva no dejaremos que el post traiga uuid
            if (!newUser.user_uuid){
                newUser = {...newUser, user_uuid : v4()}
            }
            newUser.avatar= '/uploadAvatars/user-'+ request.body.username +'.jpg'
            newUser = validateNewUser(newUser) //TODO check joi
            const verificationCode = await cryptoRandomString({length:64})
            if(newUser.error){
                throw new errorInvalidField('user creation','invalid joi validation for data granted by guest','request.body',request.body)
            }else if(await sendRegistrationMail(newUser.username, newUser.email,verificationCode).error){
                throw new errorSendMail()
            }
            else{
                const creation = await save({...newUser, activated_code:verificationCode}, 'usuarios')
                delete newUser.password
                isStatus = 201
                sendMessage = {
                    info: "User created",
                    data: newUser
                }
                if (request.file){
                    fs.writeFileSync(path.join('uploadAvatars','user-'+ request.body.username +'.jpg'),request.file.buffer)
                }
                console.log(`Created new user`)
            }
        }
    } catch (error) {
        console.warn(error)
        if(error instanceof errorNoAuthorization){
            isStatus = 403
            sendMessage = {error: 'Servicio denegato, no tienes permisos para eso'}
        }else if(error instanceof errorInvalidField){
            isStatus = 401
            sendMessage = {error: 'Formato de datos incorrecto, introdúcelo de nuevo'}
        }else if(error instanceof errorSendMail){
            isStatus = 401
            sendMessage = {error: "No se ha enviado mail, revise la dirección"}
        }
        else{
            isStatus = 500
            sendMessage = {error: 'Error interno servidor'}
        }
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}

/**
 * #CASERO/ADMIN_FUNCTION
 * retrieves data of all users (no pass, no admins)
 * @param {*} request 
 * @param {*} response 
 */
const getUsers = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'usuarios'
    try {
        if(Object.keys(request.query).length !== 0
        && request.auth?.user?.tipo !== 'INQUILINO'){
            let foundUsers = await getItemsMultiParams(request.query,tName)
            foundUsers = foundUsers.map( (user) => {
                delete user.password
                return user
            })
            if (foundUsers) {
                isStatus = 200
                sendMessage = {
                    info: foundUsers.length >= 1 ? 'Usuarios localizados' : 'No se han encontrado usuarios',
                    foundUsers
                }
            } else {
                throw new errorNoEntryFound('getting all users with query params', 'empty result')
            }
        }else if(request.auth?.user?.tipo !== 'INQUILINO'){
            const users = await findUsersNoPass()
            if (users) {
                isStatus = 200
                sendMessage = {
                    info: users.length >= 1 ? 'Usuarios localizados' : 'No se han encontrado usuarios',
                    users
                }
            } else {
                throw new errorNoEntryFound('getting all users', 'empty result')
            }
        }else{
            throw new errorNoAuthorization(
                request.auth?.user?.username,
                request.auth?.user?.tipo,
                'getUsers',
                'INQUILINOS cannot query on users')
        }
    } catch (error) {
        console.warn(error)
        if(error instanceof errorNoEntryFound){
            isStatus = 404
            sendMessage = {error:"No se han encontrado usuarios"}
        }else{
            isStatus = 500
            sendMessage = {error:"Error interno del servidor"}
        }
    }
    finally{
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
        if(request.auth.user){
            const bddUserData = getUserNoPass(request.auth.user.user_uuid)
            isStatus = 200
            sendMessage = {
                info: "Usuario verficado: eres admin, tú mismo o tienes permiso para estar aquí",
                user: {...bddUserData}
            }
        }else {
            throw new errorNoAuthorization(decodedUser.username,decodedUser.tipo,'showUser','tryed to get someone else data')
        }
    } catch (error) {
        console.warn(error)
        if(error instanceof errorNoAuthorization){
            isStatus = 404
            sendMessage = {error:'No tienes permisos para acceder a estos datos'}
        }else{
            isStatus = 500
            sendMessage = {error: 'Error interno del servidor'}
        }
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}

/**
 * Actualiza los datos de usuario y devuelve un token nuevo
 * @param {*} request 
 * @param {*} response 
 */
const updateSelfUser = async (request, response) =>{
    try{
        console.log('TODO');

    }catch(error){

    }finally{

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
        const oldUser = request.params //TODO joi
        if(!oldUser.error){
            const existsOld = await getUserNoPass(oldUser.user_uuid)
            if(existsOld.length === 0){
                new errorNoEntryFound(
                    'user update by admin',
                    'old user uuid not found in database',
                    'request.params.user_uuid',
                    request.params.user_uuid
                )
            }
        }
        const newUser = request.body //TODO JOI
        if(!newUser.error){
            const consulta = await updateItem(newUser, oldUser, 'usuarios')
            if(consulta>=1){
                isStatus = 200
                sendMessage = {
                    info: "Usuario modificado",
                    newData: newUser,
                    reference: oldUser
                }
            console.log(`Successfully update for ${JSON.stringify(oldUser)} with ${JSON.stringify(newUser)}`);
            }else{
                new errorNoEntryFound(tName,'no entry found with the given id','user_uuid',oldUser.user_uuid)
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



const activateValidationUser = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'usuarios';
    
    try {
        const  activation_code  = request.query
        console.log("code")
        console.log(activation_code)
        if ( !activation_code){
            throw new Error ('Código de verificación requerido')
        }

        const newUser = {activated_at: new Date()} //TODO joi
        const oldUser = activation_code
        const affectedRows = await updateItem(newUser,oldUser,tName)
        if (affectedRows===0){
            throw new Error ('La cuenta no ha sido activada')
            isStatus =501
            sendMessage = "La cuenta no ha sido activada..........."
        }
        const user = await findItems (oldUser,tName)
        await sendConfirmUserActivation(user.username, user.email)

        isStatus= 201
        sendMessage ={message:"Cuenta activada"}

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
            console.log(`Successfully deletion for ${Object.keys(delUser)[0]} with ${delUSer}`);
        } else {
            throw new errorNoEntryFound(tName,'user not found','request.body',request.body.user_uuid)
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
            let user = await findItems(request.body, 'usuarios') //aquí consigues el user, pero también lleva la password
            if(user.activated_at===null){
                throw new errorNoActiveUser("User no activate")
                
            }
            if (!user || user.length === 0) {
                throw new errorInvalidUserLogin(request.body.email,request.body.password,false)
            }
            else if (!await bcrypt.compare(request.body.password, user.password)) {
                throw new errorInvalidUserLogin(request.body.email,request.body.password,true)
            } else {
                delete user.password
                const tokenPayload = {
                    user_uuid: user.user_uuid,
                    username: user.username,
                    tipo: user.tipo
                }
                const token = jwt.sign(
                    tokenPayload,
                    process.env.SECRET, {
                        expiresIn: '30d'
                    }
                )
                isStatus = 200
                sendMessage = {
                    token,
                    user
                }
                console.log('Successfully logged in');
            }
        }
    } catch (error) {
        console.warn(error)
        if(error instanceof errorInvalidField
            || error instanceof errorInvalidUserLogin){
            isStatus = 401
            sendMessage = {error: error?.mailInDB ? 'La contraseña es incorrecta' : 'El mail es incorrecto'}
            console.warn(`${error.type !== 'login' ? 'Error de Joi' : error?.mailInDB ? 'contraseña mal':'mail mal'}`)
        }else if(error instanceof errorNoActiveUser){
            isStatus =401
            sendMessage ={error:"Usuario sin activar, revise su correo electrónico"}
            console.warn("No active user")
        }
        
        else{
            isStatus = 500
            sendMessage = {error:'Error interno del servidor'}
        }
    }finally{
        response.status(isStatus).send(sendMessage)
        //Si hago un send termina el flujo
        // next(error, isStatus) //en caso de que lo queramos usar como middleware
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
            console.log('Successfu logged out');
        } else {
            throw new errorInvalidToken('user not logged')
        }
    } catch (error) {
        console.warn(error.message)
        if(error instanceof errorInvalidToken){
            isStatus = 401
            sendMessage = {error:'Token inválido o inexistente'}
        }else{
            isStatus = 500
            sendMessage = {error:'Error interno del servidor'}
        }
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}

module.exports = {
    createNewUser,    login,    getUsers,    getSelfUser,
    updateSelfUser, updateUser,    deleteUser,  logout,
    activateValidationUser
}