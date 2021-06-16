
const jwt = require('jsonwebtoken')
const { findUserNoPass } = require('../infrastructure/userRepository')


/**
 * Middleware that's gonna determine if the user's is logged in
 * @param {json} request json object coming from the petition url .auth contains the user token
 * @param {json} response json object from the that contains more data
 * @param {meth} next executes the following method
 */
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
        const [user]  = await findUserNoPass(decodedToken.user_uuid)
        response.statusCode = 200
        request.auth = { token: decodedToken, user }
        
        next()

    } catch (error) {
        console.warn(error.message)
        response.status(401).send(error.message)
    }
}




module.exports = {
    validateAuthorization,
}