
const jwt = require('jsonwebtoken')
const { getUserBDD } = require('../infrastructure/userRepository.js')


const validateAuthorization = async (request, response,next) => { //TEST .env SECRET umMCSTVufgZOaMpvDZnyJ3L9O4qV24xF
    try {

        const { authorization } = request.headers
        

        if (!authorization || !authorization.startsWith('Bearer ')) {

            const error = new Error('Authorization header required')
            error.code = 401
            throw error
        }

        const token = authorization.slice(7, authorization.length)
        const decodedToken = jwt.verify(token, process.env.SECRET)
        
        usersBDD = await getUserBDD(decodedToken.uuid)

        response.statusCode = 200

        request.auth = { token: decodedToken, usuario: usersBDD }
        next()


    } catch (error) {
        console.warn(error.message)
        response.status(401).send(error.message)
    }
}




module.exports = {
    validateAuthorization,
}