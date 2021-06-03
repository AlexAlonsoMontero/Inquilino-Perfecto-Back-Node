const { uuid } = require('uuidv4')
const Joi = require('joi')

const userSchema = Joi.object({
    user_uuid: Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    username: Joi.string().alphanum().min(8).max(30).required(),
    password: Joi.string(),
    email: Joi.string().email({ minDomainSegments:2}),
    tipo: Joi.string()
})

const createValidatedUser =(object)=>{
    object.user_uuid = uuid()
    if (!userSchema.validate(object).error){
        return object
    }else{
        throw userSchema.validate(object).error
    }
}


module.exports =  { createValidatedUser }