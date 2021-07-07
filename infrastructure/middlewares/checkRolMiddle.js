const jwt = require('jsonwebtoken')
const { errorInvalidUser } = require('../../customErrors/errorInvalidUser')
const { errorNoEntryFound } = require('../../customErrors/errorNoEntryFound')
const { errorNoAuthorization } = require('../../customErrors/errorNoAuthorization')
const { getUserNoPass } = require('../userRepository')

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
            throw new errorInvalidUser('invalid token')
        }
        const token = authorization.slice(7, authorization.length)
        const decodedToken = jwt.verify(token, process.env.SECRET)
        const [user] = await getUserNoPass(decodedToken.user_uuid)
        if (user?.length > 0){
            request.auth = { user, token: decodedToken }
        }else{
            throw new errorNoEntryFound('validate authorization','token valid, user not in bd','user',user)
        }
        next()
    } catch (error) {
        console.warn(error.message)
        if (error instanceof errorNoEntryFound){
            isStatus = 404
            sendMessage = "token correcto, usuario no encontrado en la base de datos"
        }else if(error instanceof errorInvalidUser){
            isStatus = 403
            sendMessage = "validación de token fallida"
        }else{
            isStatus = 500
            sendMessage = "error interno del servidor"
        }
        response.status(isStatus).send(sendMessage)
    }
}


const validateRolAdmin = (request, response, next) => {
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
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}

const validateRolCasero =(requeset, response, next) => {
    let isStatus, sendMessage
    try{
        // if (request.auth.user.tipo === 'ADMIN' || request.auth.user.tipo === 'CASERO' || request.auth.user.tipo === 'INQUILINO_CASERO'){
        if (request.auth.user.tipo !== 'INQUILINO'){
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
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}

const validateRolInquilino = (request, response, next) => {
    let isStatus, sendMessage
    try{
        // if (request.auth.user.tipo === 'ADMIN' || request.auth.user.tipo === 'INQUILINO' || request.auth.user.tipo === 'INQUILINO_CASERO'){
        if (request.auth.user.tipo !== 'CASERO'){
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
    }finally{
        response.status(isStatus).send(sendMessage)
    }
}

const validateRolInquiCas = (request, response, next) => {
    let isStatus, sendMessage
    try{
        // if (request.auth.user.tipo === 'ADMIN' || request.auth.user.tipo === 'INQUILINO' || request.auth.user.tipo === 'INQUILINO_CASERO'){
        if (request.auth.user.tipo !== 'CASERO' && request.auth.user.tipo !== 'INQUILINO'){
            next()
        }else{
            throw new errorNoAuthorization(request.auth.user.username,request.auth.user.tipo, '?', 'area restringida a inquilino_casero o admin')
            // throw new Error('No tiene permisos para realizar esta acción')
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
    }finally{
        response.status(isStatus).send(sendMessage)
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
            // throw new errorNoAuthorization(user.username,user.tipo,'check auth propia','intentar consultar datos de otros sin permisos')
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
    }finally{
        response.status(isStatus).send(sendMessage)
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
            const [user] = await getUserNoPass(decodedToken.user_uuid)
            if(user){
                request.auth = { user, token: decodedToken }
            }else{
                throw new errorNoEntryFound('detectType','token bearer not found in db',JSON.stringify(decodedToken),decodedToken.username)
            }
            //no se determina el status porque de aquí va a next
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
        response.status(isStatus).send(sendMessage)
    }
}

module.exports = {
    validateAuthorization,
    validateRolAdmin,
    validateRolCasero,
    validateRolInquilino,
    validateRolInquiCas,
    validateSelfOrAdmin,
    detectType
}