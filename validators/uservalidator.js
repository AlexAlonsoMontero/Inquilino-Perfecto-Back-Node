const { v4 } = require('uuid')
const Joi = require('joi')

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
    username: Joi.string().alphanum().min(8).max(64).required(),
    password: Joi.string().required()
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






const validateLogin = (object) => {
    if(!loginSchema.validateAsync(object).error){
        throw loginSchema.validate(object).error
    }else{
        return object
    }
}

module.exports = { validateNewUser }