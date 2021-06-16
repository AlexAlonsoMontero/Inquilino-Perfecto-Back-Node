const { v4 } = require('uuid')
const Joi = require('joi')
const bcrypt = require('bcryptjs')
const { object } = require('joi')
const { updateItem } = require('../infrastructure/generalRepository')

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
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    tipo: Joi.string()
})

const newUserSchema = Joi.object({
    user_uuid: Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    username: Joi.string().min(8).max(64).required(),
    password: Joi.string().min(8).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    tipo: Joi.string()
})


const updateUserSchema =Joi.object({
    username: Joi.string().min(8).max(64).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    tipo: Joi.string()
})

const loginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).min(8).required(),
    password: Joi.string().min(5).required()
})

//VALIDACIONES
const validateNewUser =(object) => {
    object.user_uuid = v4()
    if (!newUserSchema.validate(object).error) {
        
        return object
    } else {
        throw newUserSchema.validate(object).error
    }

}

const validateUser = (object) => {
    if (!userSchema.validate(object).error) {
        
        return object
    } else {
        throw userSchema.validate(object).error
    }
}

const validateUpdateUser = (user) =>{
    if(!updateUserSchema.validate(user).error){
        return user
    }else{
        throw updateUserSchema.validate(user).error
    }
}




const validateLogin = (user) => {
    if (!loginSchema.validate(user).error) {
        return user
    } else {
        throw loginSchema.validate(user).error

    }
}




module.exports = {
    validateNewUser,
    validateUser,
    validateLogin,
    validateUpdateUser
}
