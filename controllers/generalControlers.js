
const { request, response } = require('express')
const jwt = require('jsonwebtoken')
const { findUserNoPass } = require('../infrastructure/userRepository')
const { getItemsMultiParams } = require('../infrastructure/generalRepository')



/**
 * Middleware that's gonna determine if the user's is logged in
 * @param {json} request json object coming from the petition url .auth contains the user token
 * @param {json} response json object from the that contains more data
 * @param {meth} next executes the following method
 */
const validateAuthorization = async (request, response, next) => { //TEST .env SECRET umMCSTVufgZOaMpvDZnyJ3L9O4qV24xF
    try {

        const { authorization } = request.headers
        if (!authorization || !authorization.startsWith('Bearer ')) {

            const error = new Error('Authorization header required')
            error.code = 401
            throw error
        }

        const token = authorization.slice(7, authorization.length)
        const decodedToken = jwt.verify(token, process.env.SECRET)
        const [user] = await findUserNoPass(decodedToken.user_uuid)
        response.statusCode = 200
        request.auth = { token: decodedToken, user }
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
            const error = new Error('No tiene permioisos para realizar esta acción')
            error.code = 401
            throw error
        }
    }catch(error){
        console.warn(error)
        response.status(401).send('No tiene permioisos para realizar esta acción')
    }

}

const searchMultiParams = async(request, response) => {
    try{
        const result = await getItemsMultiParams(request.query,request.params.table)
        if(result.length >0){
            response.status(200).send({ info: "Busqueda ok", data: result })
        }else{
            const error = new Error ("No se han encontrado resultados para la búsqueda")
            throw error
        }

    }catch(error){
        console.warn(error.message)
        response.status(400).send("No se han encontrado resultados para la búsqueda")
    }

}


module.exports = {
    validateAuthorization,
    validateRolAdmin,
    // validateRolCasero,
    // ValidateRolInquilino
    searchMultiParams
}