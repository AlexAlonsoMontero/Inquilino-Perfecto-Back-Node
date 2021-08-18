const Joi = require('joi');
const { errorInvalidField } = require('../customErrors/errorInvalidField');

// https://stackoverflow.com/questions/56423558/joi-validation-how-to-require-or-optional-field-based-on-another-key-exists-in

const schemaCreateUser = Joi.object().keys({
    user_uuid: Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    username: Joi.string().alphanum().min(4).max(32).required(),
    email: Joi.string().email({
        ignoreLength:true,
        tlds:{allow:false} //https://stackoverflow.com/questions/57972358/joi-email-validation
    }).required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    tipo: Joi.string().valid(...['ADMIN','INQUILINO','INQUILINO/CASERO','CASERO']).required(),
    avatar: Joi.string()
})

const schemaUpdateUser = Joi.object().keys({
    user_uuid: Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    username: Joi.string().alphanum().min(4).max(32),
    email: Joi.string().email({
        ignoreLength: true,
        tlds: {allow:false} //https://stackoverflow.com/questions/57972358/joi-email-validation
    }),
    tipo: Joi.string().valid(...['ADMIN','INQUILINO','INQUILINO/CASERO','CASERO']),
    puntuacion_media: Joi.number().precision(2),
    avatar: Joi.string()
})

const schemaNewPass = Joi.object().keys({
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
})

const schemaPass = Joi.object().keys({
    password: Joi.string().min(6).required()
})

const schemaMail = Joi.object().keys({
    email: Joi.string()
    .email({
        ignoreLength:true,
        minDomainSegments: 2,
        tlds: { allow: false } //https://stackoverflow.com/questions/57972358/joi-email-validation
    })
    .required()
})

const schemaUsername = Joi.object().keys({
    username: Joi.string().alphanum().min(4).max(32).required()
})

//validate vs assert https://livebook.manning.com/book/hapi-js-in-action/chapter-6/v-9/74

const userCreateValidate =  (user) => {
    if(schemaCreateUser.validate(user)?.error){
        const [errorDetails] = schemaCreateUser.validate(user)?.error.details;
        const errorMessage = errorDetails.message
        const errorType = errorDetails.type
        const errorField = errorDetails.message.split(' ')[0].split('"')[1]

        throw new errorInvalidField(
            'user creation fields joi validation',
            errorMessage,
            errorField,
            errorType
        )
    }else{
        return user
    }
}
const userUpdateValidate =  (user) => {
    if(schemaUpdateUser.validate(user)?.error){
        const [errorDetails] = schemaUpdateUser.validate(user)?.error.details;
        const errorMessage = errorDetails.message
        const errorType = errorDetails.type
        const errorField = errorDetails.message.split(' ')[0].split('"')[1]

        throw new errorInvalidField(
            'user update fields joi validation',
            errorMessage,
            errorField,
            errorType
        )
    }else{
        return user
    }
}
const userUpdatePassValidate =  (user) => {
    return Joi.assert(user, schemaNewPass)
}
const userPassValidate =  (pass) => {
    const password = {password: pass};
    return (schemaPass.validate(password)?.error ? false : true)
}
const userMailValidate =  (mail) => {
    const email = {email: mail};
    return (schemaMail.validate(email)?.error ? false : true)
}
const userUsernameValidate =  (uname) => {
    const username = {username: uname}
    return (schemaUsername.validate(username)?.error ? false : true)
}

module.exports = {
    userCreateValidate, userUpdateValidate, userUpdatePassValidate, userPassValidate, userMailValidate, userUsernameValidate
}