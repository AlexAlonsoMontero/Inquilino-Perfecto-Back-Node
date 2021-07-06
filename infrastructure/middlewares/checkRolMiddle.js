const jwt = require('jsonwebtoken')
const { errorInvalidUser } = require('../../customErrors/errorInvalidUser')
const { errorNoEntryFound } = require('../../customErrors/errorNoEntryFound')
const { getUserNoPass } = require('../userRepository')

/**
 * Middleware that's gonna determine if the user's is logged in
 * @param {json} request .auth contains the user token
 * @param {json} response contains more data
 * @param {meth} next executes the following method
 */
 const validateAuthorization = async (request, response, next) => { //TEST .env SECRET umMCSTVufgZOaMpvDZnyJ3L9O4qV24xF
    try {
        const { authorization } = request.headers
        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw new errorInvalidUser()
        }
        const token = authorization.slice(7, authorization.length)
        const decodedToken = jwt.verify(token, process.env.SECRET)
        const [user] = await getUserNoPass(decodedToken.user_uuid)
        request.auth = { user, token: decodedToken }

        response.statusCode = 200
        next()
    } catch (error) {
        console.warn(error.message)
        response.status(401).send(error.message)
    }
}


const validateRolAdmin = (request, response, next) => {
    try{
        if (request.auth.user.tipo === 'ADMIN'){
            response.statusCode = 200
            next()
        }else{
            const error = new Error('No tiene permioisos para realizar esta acción')
            error.code = 401
            throw error
        }
    }catch(error){
        console.warn(error)
        response.status(401).send('No tiene permioisos para realizar esta acción')
    }
}

const validateRolCasero =(requeset, response, next) => {
    try{
        if (request.auth.user.tipo === 'ADMIN' || request.auth.user.tipo === 'CASERO' || request.auth.user.tipo === 'INQUILINO_CASERO'){
            response.statusCode = 200
            next()
        }else{
            const error = new Error('No tiene permioisos para realizar esta acción')
            error.code = 401
            throw error
        }
    }catch(error){
        console.warn(error)
        response.status(401).send('No tiene permioisos para realizar esta acción')
    }
}

const validateRolInquilino = (request, response, next) => {
    try{
        if (request.auth.user.tipo === 'ADMIN' || request.auth.user.tipo === 'INQUILINO' || request.auth.user.tipo === 'INQUILINO_CASERO'){
            response.statusCode = 200
            next()
        }else{
            const error = new Error('No tiene permisos para realizar esta acción')
            error.code = 401
            throw error
        }
    }catch(error){
        console.warn(error)
        response.status(401).send('No tiene permisos para realizar esta acción')
    }
}

/**
 * Checks if it's the user itself or ADMIN
 * @param {json} request token container
 * @param {json} response if success user is added to .auth
 * @param {meth} next if .headers contains the adecuate bearer token
 */
 const validateSelfOrAdmin = async (request, response, next) => { //TEST .env SECRET umMCSTVufgZOaMpvDZnyJ3L9O4qV24xF
    // const { authorization } = request.headers
    // if (!authorization || !authorization.startsWith('Bearer ')) {
    //     throw new errorInvalidUser()
    // }
    // const token = authorization.slice(7, authorization.length)
    // const decodedToken = jwt.verify(token, process.env.SECRET)
    // const [user] = await getUserNoPass(decodedToken.user_uuid)
    // request.auth = { user, token: decodedToken }
    try {
        const {user} = request.auth
        if(request.params.username === user.username || user.tipo === 'ADMIN'){
            response.statusCode = 200
            next()
        }else{
            throw new errorNoAuthorization(user.username,user.tipo,'self auth check','trying to check others data without permision')
        }
    } catch (error) {
        console.warn(error.message)
        response.status(401).send(error.message)
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
    try{
        let isStatus, sendMessage;
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
            next()
        }
    }catch(error){
        sendMessage = error.message
        if (error instanceof errorNoEntryFound){
            isStatus = 404
        }else{
            isStatus = 500
        }
        response.status(isStatus).send(sendMessage)
    }
}

module.exports = {
    validateAuthorization,
    validateRolAdmin,
    validateRolCasero,
    validateRolInquilino,
    validateSelfOrAdmin,
    detectType
}