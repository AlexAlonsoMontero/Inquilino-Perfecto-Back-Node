const Joi = require('@hapi/joi');

// https://stackoverflow.com/questions/56423558/joi-validation-how-to-require-or-optional-field-based-on-another-key-exists-in

const schemaCreateUser = Joi.object().keys({
    username: Joi.string().alphanum().min(4).max(32).required(),
    email: Joi.string().email({
        ignoreLength:true,
        tlds:{allow:false} //https://stackoverflow.com/questions/57972358/joi-email-validation
    }).required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    tipo: Joi.string().valid(...['ADMIN','INQUILINO','INQUILINO/CASERO','CASERO']).required()
})
const schemaUpdateUser = Joi.object.keys({
    username:Joi.string().alphanum().min(4).max(32),
    email: Joi.string().email({
        ignoreLength:true,
        tlds:{allow:false} //https://stackoverflow.com/questions/57972358/joi-email-validation
    }),
    tipo: Joi.string().valid(...['ADMIN','INQUILINO','INQUILINO/CASERO','CASERO']),
    puntuacion_media:Joi.number().precision(2)
})

const schemaNewPass = Joi.object.keys({
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
})

//validate vs assert https://livebook.manning.com/book/hapi-js-in-action/chapter-6/v-9/74

const userCreateValidate = async (user) => {
    return Joi.assert(user,schemaCreateUser)
}
const userUpdateValidate = async (user) => {
    return Joi.assert(user, schemaUpdateUser)
}
const userUpdatePassValidate = async (user) => {
    return Joi.assert(user, schemaNewPass)
}

module.exports = {
    userCreateValidate, userUpdateValidate, userUpdatePassValidate
}