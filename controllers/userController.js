const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const { v4 } = require('uuid')
require('dotenv').config()
const { userCreateValidate, userUpdateValidate, userUpdatePassValidate, userPassValidate, userMailValidate, userUsernameValidate } = require('../validators/checkUser')
const { save,    findItems,    updateItem,    deleteItem, getItemsMultiParams } = require('../infrastructure/generalRepository')
const { getUserPass, getUserNoPass, findUsersNoPass} = require('../infrastructure/userRepository')
const { sendConfirmUserActivation, sendRegistrationMail } = require('../infrastructure/utils/smtpMail')
const { validateUuid } = require('../validators/checkGeneral')
const { errorNoAuthorization } = require('../customErrors/errorNoAuthorization')
const { errorInvalidField } = require('../customErrors/errorInvalidField')
const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound')
const { errorInvalidToken } = require('../customErrors/errorInvalidToken')
const { errorInvalidUserLogin } = require('../customErrors/errorInvalidUserLogin')
const { errorUserNotActive } = require('../customErrors/errorUserNotActive')

//TODO posibilidad de añadir morgan

/**
 * #GUEST_FUNCTION // Admin
 * Creates a new user [POST]
 * throws error if tries to create an admin user
 * @param {*} request request.body has new user data
 * @param {*} response
 */
const createNewUser = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'usuarios'

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
            if(request.file){
                newUser.avatar = '/uploadAvatars/user-'+ request.body.username +'.jpg'
            }else{
                newUser.avatar = '/uploadAvatars/default-avatar.png'
            }

            newUser = userCreateValidate(newUser)
            delete newUser.confirmPassword
            const verificationCode = crypto.randomBytes(32).toString('hex')

            const creation = await save({...newUser, activated_code:verificationCode}, tName)
            delete newUser.password
            sendRegistrationMail(newUser.username,newUser.email,verificationCode)

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
    } catch (error) {
        console.warn(error)
        if(error instanceof errorNoAuthorization){
            isStatus = 403
            sendMessage = {error: 'Servicio denegado, no tienes permisos para eso'}
        }else if(error instanceof errorInvalidField){
            isStatus = 401
            sendMessage = {
                error: error.messageEsp,
                errorFieldKey: error.what_1,
                errorFieldValue: error.what_2
            }
        }else{
            isStatus = 500
            if(error?.code){
                const sqlErrArr = error.sqlMessage.split(' ')
                const whatKey = sqlErrArr[sqlErrArr.length-1]
                const whatCont = sqlErrArr[2]
                if(error.code === 'ER_DUP_ENTRY'){
                    sendMessage = {
                        error: `Entrada duplicada para ${whatKey}`,
                        errorMessage: error.sqlMessage,
                        errorCode: error.code,
                        errorFieldKey: whatKey,
                        errorFieldValue: whatCont
                    }
                }else if(error.code === 'ER_DATA_TOO_LONG'){
                    sendMessage = {
                        error: `Largo del campo excedido para ${whatKey}`,
                        errorMessage: error.sqlMessage,
                        errorCode: error.code,
                        errorFieldKey: whatKey,
                        errorFieldValue: whatCont
                    }
                }
            }
            else{
                sendMessage = {error: 'Error interno servidor'}
            }
        }
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}

/**
 * # ALL USERS
 * retrieves data of all users (no pass, no admins)
 * @param {*} request 
 * @param {*} response 
 */
const getUsers = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'usuarios'
    try {
        if(Object.keys(request.query).length !== 0){
            if(request.auth?.user?.tipo !== 'INQUILINO'){
                let foundUsers = await getItemsMultiParams(request.query,tName)
                if (foundUsers) {
                    foundUsers = foundUsers
                        .filter( (user) => {
                            return user.tipo !== 'ADMIN'
                        })
                        .map( (user) => {
                            delete user.password
                            return user
                        })
                    isStatus = 200
                    sendMessage = {
                        info: foundUsers.length >= 1 ? 'Usuarios localizados' : 'No se han encontrado usuarios',
                        foundUsers
                    }
                } else {
                    throw new errorNoEntryFound('getting all users with query params', 'empty result')
                }
            }else{
                const params = { ...request.query, tipo: 'CASERO' }
                let foundUsers = await getItemsMultiParams(params,tName)
                foundUsers = foundUsers.map( (user) => {
                    delete user.password
                    return user
                })
            }
        }else{ //get with no query
            if(request.auth?.user?.tipo !== 'INQUILINO'){
                const foundUsers = await findUsersNoPass()
                if (foundUsers) {
                    isStatus = 200
                    sendMessage = {
                        info: foundUsers.length >= 1 ? 'Usuarios localizados' : 'No se han encontrado usuarios',
                        foundUsers
                    }
                } else {
                    throw new errorNoEntryFound('getting all users with query params', 'empty result')
                }
            }else {
                let foundUsers = await findItems({tipo:'CASERO'},tName)
                if (foundUsers) {
                    foundUsers = foundUsers.map( (user) => {
                        delete user.password
                        return user
                    })
                    isStatus = 200
                    sendMessage = {
                        info: foundUsers.length >= 1 ? 'Usuarios localizados' : 'No se han encontrado usuarios',
                        foundUsers
                    }
                } else {
                    throw new errorNoEntryFound('getting all users with query params', 'empty result')
                }
            }
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
const getSelfUser = async (request, response) => {
    let isStatus, sendMessage;
    try {
        if(request.auth?.user){
            const bddUserData = await getUserNoPass(request.auth.user.user_uuid)
            console.log(bddUserData);
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
    let isStatus, sendMessage;
    const tName = 'usuarios';
    try {
        const uuidSelf = request?.auth?.user?.user_uuid
        const oldSelfData = await getUserNoPass(uuidSelf)

        if (!oldSelfData || oldSelfData.length === 0){
            console.log('error');
            throw new errorNoEntryFound(
                tName,
                "user was not found",
                'user_uuid',
                request?.auth?.user?.user_uuid)
        }else{
            const newSelfData = userUpdateValidate(request.body)
            const oldUuid = {user_uuid : oldSelfData.user_uuid}
            const updatedRows = await updateItem(newSelfData,oldUuid,tName)

            if(updatedRows && updatedRows >= 1){
                const newUser = await getUserNoPass(oldUuid.user_uuid)
                if(newUser){
                    request.headers = undefined
                    request.body = undefined

                    const tokenPayload = {
                        user_uuid: newUser.user_uuid,
                        username: newUser.username,
                        tipo: newUser.tipo
                    }
                    const token = jwt.sign(
                        tokenPayload,
                        process.env.SECRET, {
                            expiresIn: '30d'
                        })

                    isStatus = 200
                    sendMessage =   {
                        oldData: oldSelfData,
                        newData: newSelfData,
                        token
                    }
                    console.warn(`Successfully selfUpdate for 'user_uuid' ${oldUuid.user_uuid}`);
                }else{
                    throw new errorNoEntryFound(tName,"couldn't update user",'user_uuid',uuidSelf)
                }
            }else{
                throw new errorNoEntryFound(tName,"couldn't update user",'user_uuid',uuidSelf)
            }
        }
    }catch(error){
        console.warn(error)
        if(error instanceof errorNoEntryFound){
            isStatus = 404
        }else if(error instanceof errorInvalidUser){
            isStatus = 403
        }else{
            isStatus = 500
        }
        sendMessage = {error:error.message}
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
        const oldUser = validateUuid(request.params)
        const existsOld = await getUserNoPass(request.params.user_uuid)
        if(existsOld){
            const newUser = userUpdateValidate(request.body)
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
                    throw new errorNoEntryFound(tName,'no entry found with the given id','user_uuid',oldUser.user_uuid)
                    }
            }else{
                throw new errorNoEntryFound(
                    'user update by admin',
                    'old user uuid not found in database',
                    'request.params.user_uuid',
                    request.params.user_uuid
                )
            }
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
        const delUser = userUpdateValidate(request.body)
        const isUserDel = await deleteItem(delUser, 'usuarios')
        if (isUserDel) {
            isStatus = 200
            sendMessage = {
                "tuple": delUser,
                "delete": isUserDel
            }
            console.log(`Successfully deletion for ${Object.keys(delUser)[0]} with ${JSON.stringify(delUser)}`);
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
 * @param {*} request
 * @param {*} response
 * @param {*} next
 */
const login = async (request, response, next) => {
    let isStatus, sendMessage;
    const tName = 'usuarios'
    try {
        if(userMailValidate(request.body?.email) || userUsernameValidate(request.body?.username)){
            if (userPassValidate(request.body?.password)){

                let user = await findItems(
                    request.body?.email ? {email : request.body?.email} : {username : request.body?.username}, 
                    tName)
                user = user[0]
                // WARNING password send here

                    if(user){
                        if(user.activated_at === null){
                            throw new errorUserNotActive("User not activated")
                        }
                        else if (!await bcrypt.compare(request.body.password, user.password)) {
                            throw new errorInvalidUserLogin(request.body.email,request.body.password,true)
                        }else{
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
                            })
                            isStatus = 200
                            sendMessage = {
                                token,
                                user
                            }
                            console.log('Successfully logged in');
                        }
                    }else if (!user || user.length === 0) {
                        throw new errorInvalidUserLogin(request.body.email,request.body.password,false)
                    }
            }else{
                throw new errorInvalidField('user login','password validation failed in joi','password',request.body.password)
            }
        }else if(!userMailValidate(request.body?.email)){
            throw new errorInvalidField('user login','mail validation failed in joi','mail',request.body.email)
        }else if(!userUsernameValidate(request.body?.username)){
            throw new errorInvalidField('user login','username validation failed in joi','username',request.body.username)
        }else{
            throw new Error('THIS SHOULD NOT HAPPEN')
        }
    }catch (error) {
        console.warn(error)
        if(error instanceof errorInvalidField){
            isStatus = 401
            sendMessage = {error: `${error?.mailInDB ? 'La contraseña es incorrecta' : 'El nombre de usuario o email incorrecto'}`}
        }else if(error instanceof errorInvalidUserLogin){
            isStatus = 401
            sendMessage = {
                error: `Error de Validación contra la base de datos: ${error?.mailInDB ? 'contraseña mal':'Nombrede usuario o email mal'}`
            }
        }else if(error instanceof errorUserNotActive){
            isStatus = 401
            sendMessage = { error: "Usuario sin activar, revise su correo electrónico"}
            console.warn("No active user")
        }else{
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
 * LOGGED
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

const activateValidationUser = async (request, response) => {
    let isStatus, sendMessage;
    const tName = 'usuarios';

    try {
        const activation_code = request.query
        console.log("code")
        console.log(activation_code)
        if (!activation_code){
            throw new Error ('Código de verificación requerido')
        }

        const newUser = {activated_at: new Date()} //TODO joi
        const oldUser = activation_code
        const affectedRows = await updateItem(newUser,oldUser,tName)
        if (affectedRows === 0){
            throw new errorUserNotActive ('La cuenta no ha sido activada')
        }
        let user = await findItems (oldUser,tName)
        user = user[0]
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
        }else if(error instanceof errorUserNotActive){
            isStatus =501
        }else{
            isStatus = 500
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