
const jwt = require('jsonwebtoken')
const findUser = require('../infrastructure/userRepository')


const validateAuthorization = async(request,response) =>{
    try{
        
        const { authorization }  = request.headers
        console.log(authorization)
        
        if (!authorization || !authorization.startsWith('Bearer ')){
            
            const error  = new Error ('Authorization header required')
            error.code = 401
            throw error
        }
        
        const token = authorization.slice(7, authorization.length)
        
        const decodedToken = jwt.verify(token, process.env.SECRET)
        [users] = findUser(request.body.user_uuid)
        console.log(users)
    }catch(error){
        response.send(error.message)
    }
}

module.exports = {
    validateAuthorization
}