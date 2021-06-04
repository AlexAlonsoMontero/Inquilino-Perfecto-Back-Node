const { v4 } = require('uuid')
const Joi = require('joi')
const bcrypt = require('bcryptjs')

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
    username: Joi.string().alphanum().min(8).max(64).required(),
    password: Joi.string().required(),
    email: Joi.string().email({ minDomainSegments:2}).required(),
    tipo: Joi.string()
})

const loginSchema = Joi.object({
    useemail: Joi.string().email({ minDomainSegments:2}).required(),
    password: Joi.string().alphanum().required()
})

//VALIDACIONES
const validateNewUser =(object)=>{
    object.user_uuid = v4()
    if (!userSchema.validate(object).error){
        return object
    }else{
        throw userSchema.validate(object).error
    }
}


const validateLogin = (user) => {
    if (user.login ==="" || user.password ===""){
        
        return false
        // return false

    }else if(loginSchema.validate(user).error){
        return loginSchema.validate(user).error
    }else{
        return true
        
    }
}

module.exports = { validateNewUser,
    validateLogin
}