const { v4 } = require('uuid')
const Joi = require('joi')
const bcrypt = require('bcryptjs')
const { object } = require('joi')
const { updateItem } = require('../infrastructure/generalRepository')

/**
 * CREA LOS ESQUEMAS DE VALIDACIÓN Y LAS FUNCIONES CORRESPONDIENTES
 */
//TODO REVISAR JOI PASSWORD
//SCHEMAS
const userSchema = Joi.object({
    user_uuid: Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    username: Joi.string().alphanum().min(8).max(64).required(),
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
    username: Joi.string().alphanum().min(4).max(64).required(),
    password: Joi.string().min(8).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    tipo: Joi.string()
})


const updateUserSchemaNoPass =Joi.object({
    username: Joi.string().alphanum().min(8).max(64).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    tipo: Joi.string().valid(...['INQUILINO','CASERO','INQUILINO_CASERO'])
})


const updateUserForAdminSchema = Joi.object({
    username: Joi.string().alphanum().min(8).max(64).required(),
    password: Joi.string().min(8).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    tipo: Joi.string()
})

const loginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).min(8).required(),
    password: Joi.string().min(5).required()
})

const mailSchema =  Joi.string() // TODO: FIX .email({ minDomainSegments: 2 }).min(8)
const passwordSchema =  Joi.string().min(5)



//VALIDACIONES

/**
 * This method creates the user uuid
 * @param {json} user
 * @returns validated user
 */
const validateNewUser =(user) => {
    // user.user_uuid = v4() nunca crear datos en la validación
    if (!newUserSchema.validate(user).error) {
        return user
    } else {
        throw newUserSchema.validate(user).error
    }
}


const genericValidateUser = (user,schema) =>{
    if (!schema.validate(user).error) {
        return user
    } else {
        throw schema.validate(user).error
    }
}



//Funciones validate llaman al a función genérica  validateUser para evitar la redundancia de código
const validateUser = user =>  genericValidateUser(user,userSchema)
const validateUpdateUser = user => genericValidateUser(user,updateUserSchemaNoPass)
const validateLogin = user => genericValidateUser(user, loginSchema)
const validateAdminUpdateUser = user => genericValidateUser(user,updateUserForAdminSchema)
const validateUserMail = userMail => (mailSchema.validate(userMail).error ? false : true)
const validateUserPassword = userPass => (passwordSchema.validate(userPass).error ? false : true)


//TODO DELTE LOGINCHEMA SI NO SE USA

module.exports = {
    validateNewUser,    validateUser,    validateLogin,    validateUpdateUser,
    validateAdminUpdateUser,    validateUserMail,    validateUserPassword
}