const jwt = require('jsonwebtoken')
const { errorNoAuthorization } = require('../../customErrors/errorNoAuthorization')
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

/**
 * Checks if it's the user itself or ADMIN
 * @param {json} request token container
 * @param {json} response if success user is added to .auth
 * @param {meth} next if .headers contains the adecuate bearer token
 */
 const validateSelfOrAdmin = async (request, response, next) => { //TEST .env SECRET umMCSTVufgZOaMpvDZnyJ3L9O4qV24xF
    try {
        const { authorization } = request.headers
        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw new errorInvalidUser()
        }
        const token = authorization.slice(7, authorization.length)
        const decodedToken = jwt.verify(token, process.env.SECRET)
        const [user] = await getUserNoPass(decodedToken.user_uuid)
        request.auth = { user, token: decodedToken }

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
            const error = new Error('No tiene permioisos para realizar esta acción')
            error.code = 401
            throw error
        }
    }catch(error){
        console.warn(error)
        response.status(401).send('No tiene permioisos para realizar esta acción')
    }

}

module.exports = {
    validateAuthorization,
    validateRolAdmin,
    validateRolCasero,
    validateRolInquilino,
    validateSelfOrAdmin
}