const jwt = require('jsonwebtoken')
const { getUserNoPass } = require('../userRepository')
const { errorNoEntryFound } = require('../../customErrors/errorNoEntryFound')
const { errorNoAuthorization } = require('../../customErrors/errorNoAuthorization')
const { errorInvalidToken } = require('../../customErrors/errorInvalidToken')

/**
 * Middleware that's gonna determine if the user's is logged in
 * @param {json} request .auth contains the user token
 * @param {json} response contains more data
 * @param {meth} next executes the following method
 */
const validateAuthorization = async (request, response, next) => { //TEST .env SECRET umMCSTVufgZOaMpvDZnyJ3L9O4qV24xF
    let isStatus, sendMessage
    try {
        const { authorization } = request.headers
        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw new errorInvalidToken('token null or not Bearer token')
        }
        const token = authorization.slice(7, authorization.length)
        const decodedToken = jwt.verify(token, process.env.SECRET)
        const user = await getUserNoPass(decodedToken.user_uuid)
        if (Object.keys(user).length > 0){
            throw new errorNoEntryFound('validate authorization','token valid, user not in bd','user',JSON.stringify(user))
        }else{
            request.auth = {
                token: decodedToken,
                user: user
            }
            next()
        }
    } catch (error) {
        console.warn(error)
        if (error instanceof errorNoEntryFound){
            isStatus = 404
            sendMessage = "token correcto, usuario no encontrado en la base de datos"
        }else if(error instanceof errorInvalidToken){
            isStatus = 403
            sendMessage = "validación de token fallida"
        }else{
            isStatus = 500
            sendMessage = "error interno del servidor"
        }
        response.status(isStatus).send({'Error': sendMessage})
    }
}

/**
 * Adds token info to request, ALLOWING GUESTS to next()
 * exception thrown when token is correct but user doesn't exists
 * @param {json} request
 * @param {json} response
 * @param {function} next
 */
const detectType = async (request, response, next) => {
    let isStatus, sendMessage;
    try{
        const { authorization } = request.headers
        if (authorization?.startsWith('Bearer ')) {
            const token = authorization.slice(7, authorization.length)
            const decodedToken = jwt.verify(token, process.env.SECRET)
            let user = await getUserNoPass(decodedToken.user_uuid)
            if(Object.keys(user).length > 0){
                console.log(user);
                request.auth = {
                    user,
                    token: decodedToken }
            }else{
                throw new errorNoEntryFound('detectType','token bearer not found in db',JSON.stringify(decodedToken),decodedToken.username)
            }
        }
        next()
    }catch(error){
        console.warn(error)
        if (error instanceof errorNoEntryFound){
            isStatus = 404
            sendMessage = 'Token válido, pero usuario no encontrado en la base de datos'
        }else{
            isStatus = 500
            sendMessage = 'Error interno del servidor'
        }
        response.status(isStatus).send({'Error': sendMessage})
    }
}



/**
 * Adds token info to request, NOT ALLOWING GUESTS to next()
 * exception thrown when token is correct but user doesn't exists
 * @param {json} request
 * @param {json} response
 * @param {function} next
 */
 const detectTypeNoGuests = async (request, response, next) => {
    let isStatus, sendMessage;
    try{
        const { authorization } = request.headers
        if (authorization?.startsWith('Bearer ')) {
            const token = authorization.slice(7, authorization.length)
            const decodedToken = jwt.verify(token, process.env.SECRET)
            let user = await getUserNoPass(decodedToken.user_uuid)
            if(Object.keys(user).length > 0){
                console.log(user);
                request.auth = {
                    user,
                    token: decodedToken
                }
                next()
            }else{
                throw new errorNoEntryFound('detectTypeNoGuests','token bearer not found in db',JSON.stringify(decodedToken),decodedToken.username)
            }
        }
    }catch(error){
        console.warn(error)
        if (error instanceof errorNoEntryFound){
            isStatus = 404
            sendMessage = 'Token válido, pero usuario no encontrado en la base de datos'
        }else{
            isStatus = 500
            sendMessage = 'Error interno del servidor'
        }
        response.status(isStatus).send({'Error': sendMessage})
    }
}

const validateRolAdmin = async (request, response, next) => {
    let isStatus, sendMessage
    try{
        if (request.auth.user.tipo === 'ADMIN'){
            next()
        }else{
            throw new errorNoAuthorization(
                request.auth.user.username,request.auth.user.tipo,
                '?', 'area restringida a casero, inquilino_casero o admin')
        }
    }catch(error){
        console.warn(error)
        if(error instanceof errorNoAuthorization){
            isStatus = 403
            sendMessage = 'No tiene permisos para realizar esta acción'
        }else{
            isStatus = 500
            sendMessage = 'Error interno del servidor'
        }
        response.status(isStatus).send({'Error': sendMessage})
    }
}

const validateRolCasero = async (request, response, next) => {
    let isStatus, sendMessage
    try{
        if (request.auth?.user?.tipo !== 'INQUILINO'){
            next()
        }else{
            throw new errorNoAuthorization(
                request.auth?.user?.username,request.auth?.user?.tipo,
                '?', 'area restringida a inquilino, inquilino_casero o admin')
        }
    }catch(error){
        console.warn(error)
        if(error instanceof errorNoAuthorization){
            isStatus = 403
            sendMessage = 'No tiene permisos para realizar esta acción'
        }else{
            isStatus = 500
            sendMessage = 'Error interno del servidor'
        }
        response.status(isStatus).send({'Error': sendMessage})
    }
}

const validateRolInquilino = async (request, response, next) => {
    let isStatus, sendMessage
    try{
        if (request.auth.user.tipo !== 'CASERO'){
            console.log('validated inquilino/inquilino_casero/admin');
            next()
        }else{
            throw new errorNoAuthorization(
                request.auth.user.username,request.auth.user.tipo,
                '?', 'area restringida a inquilino, inquilino_casero o admin')
        }
    }catch(error){
        console.warn(error)
        if(error instanceof errorNoAuthorization){
            isStatus = 403
            sendMessage = 'No tiene permisos para realizar esta acción'
        }else{
            isStatus = 500
            sendMessage = 'Error interno del servidor'
        }
        response.status(isStatus).send({'Error': sendMessage})
    }
}

const validateRolInquiCas = async (request, response, next) => {
    let isStatus, sendMessage
    try{
        if (request.auth.user.tipo !== 'CASERO' && request.auth.user.tipo !== 'INQUILINO'){
            console.log('validated inquilino_casero/admin');
            next()
        }else{
            throw new errorNoAuthorization(request.auth.user.username,request.auth.user.tipo, '?', 'area restringida a inquilino_casero o admin')
        }
    }catch(error){
        console.warn(error)
        if(error instanceof errorNoAuthorization){
            isStatus = 403
            sendMessage = 'No tiene permisos para realizar esta acción'
        }else{
            isStatus = 500
            sendMessage = 'Error interno del servidor'
        }
        response.status(isStatus).send({'Error': sendMessage})
    }
}

/**
 * Checks if it's the user itself or ADMIN
 * @param {json} request token container
 * @param {json} response if success user is added to .auth
 * @param {meth} next if .headers contains the adecuate bearer token
 */
 const validateSelfOrAdmin = async (request, response, next) => { //TEST .env SECRET umMCSTVufgZOaMpvDZnyJ3L9O4qV24xF
    try {
        const {user} = request.auth
        if(request.params?.username === user.username
            || request.params?.user_uuid === user.user_uuid
            || user.tipo === 'ADMIN'){
            next()
        }else{
            throw new errorNoAuthorization(user.username,user.tipo,'self auth check','trying to check others data without permision')
        }
    } catch (error) {
        console.warn(error)
        if(error instanceof errorNoAuthorization){
            isStatus = 403
            sendMessage = 'No tiene permisos para realizar esta acción'
        }else{
            isStatus = 500
            sendMessage = 'Error interno del servidor'
        }
        response.status(isStatus).send({'Error': sendMessage})
    }
}

module.exports = {
    validateAuthorization,
    validateRolAdmin,
    validateRolCasero,
    validateRolInquilino,
    validateRolInquiCas,
    validateSelfOrAdmin,
    detectType,
    detectTypeNoGuests
}