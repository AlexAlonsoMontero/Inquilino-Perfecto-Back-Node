const { v4 } = require('uuid')
const Joi = require('joi')
const bcrypt = require('bcryptjs')
const { object } = require('joi')

/**
 * CREA LOS ESQUEMAS DE VALIDACIÓN Y LAS FUNCIONES CORRESPONDIENTES
 */

//SCHEMAS
const userSchema = Joi.object({
    user_uuid: Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    username: Joi.string().min(8).max(64).required(),
    email: Joi.string().email({ minDomainSegments:2}).required(),
    tipo: Joi.string()
})

const passwordSchema = Joi.string().min(8).required()

const loginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments:2}).min(8).required(),
    password: Joi.string().min(5).alphanum().required()
})

//VALIDACIONES
const validateUser =(object)=>{
    if(!object.user_uuid){
        object.user_uuid = v4()
        passwordSchema.validate(object.password)
    }
    
    if (!userSchema.validate(object).error){
        return object
    }else{
        throw userSchema.validate(object).error
    }
}



const validateLogin = (user) => {
    if(!loginSchema.validate(user).error){
        return user
    }else{
        throw loginSchema.validate(user).error
        
    }
}




module.exports = { validateUser,
    validateLogin
}