const Joi = require('joi');
const { errorInvalidField } = require('../customErrors/errorInvalidField');

const schemaCreateProp = Joi.object().keys({
    //disponibilidad : Joi.boolean().required(),
    calle : Joi.string().max(256).required(),
    ciudad : Joi.string().max(128).required(),
    provincia : Joi.string().max(128).required(),
    pais : Joi.string().max(128).required(),
    cp : Joi.string().max(5).required(),

    lng : Joi.number().precision(6),
    lat : Joi.number().precision(6),

    usr_casero_uuid :  Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    inmueble_uuid :  Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    metros_2 : Joi.number().positive(),
    comunidad : Joi.string().max(128),
    piso : Joi.string().max(16),
    numero : Joi.string().max(16),

    banos: Joi.number(),
    habitaciones: Joi.number(),
    amueblado: Joi.boolean(),
    calefaccion: Joi.boolean(),
    aire_acondicionado: Joi.boolean(),
    jardin: Joi.boolean(),
    terraza: Joi.boolean(),
    ascensor: Joi.boolean(),
    piscina: Joi.boolean()
})

const schemaUpdateProp = Joi.object().keys({
    disponibilidad : Joi.boolean(),
    calle : Joi.string().max(256),
    ciudad : Joi.string().max(128),
    provincia : Joi.string().max(128),
    pais : Joi.string().max(128),
    cp : Joi.string().max(5),

    lng : Joi.number().precision(6),
    lat : Joi.number().precision(6),

    inmueble_uuid : Joi.string().forbidden(),
    usr_casero_uuid : Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    numero : Joi.string().max(16),
    piso : Joi.string().max(16),
    comunidad : Joi.string().max(128),

    metros_2 : Joi.number(),
    banos: Joi.number(),
    habitaciones: Joi.number(),
    amueblado: Joi.boolean(),
    calefaccion: Joi.boolean(),
    aire_acondicionado: Joi.boolean(),
    jardin: Joi.boolean(),
    terraza: Joi.boolean(),
    ascensor: Joi.boolean(),
    piscina: Joi.boolean()
})

const propCreateValidate = (prop) => {
    if(schemaCreateProp.validate(prop)?.error){
        const [errorDetails] = schemaCreateProp.validate(prop)?.error.details;
        const errorMessage = errorDetails.message
        const errorType = errorDetails.type
        const errorField = errorDetails.message.split(' ')[0].split('"')[1]

        throw new errorInvalidField(
            'prop creation fields joi validation',
            errorMessage,
            errorField,
            errorType
        )
    }else{
        return prop
    }
}

const propUpdateValidate = (prop) => {
    if(schemaUpdateProp.validate(prop)?.error){
        const [errorDetails] = schemaUpdateProp.validate(prop)?.error.details;
        const errorMessage = errorDetails.message
        const errorType = errorDetails.type
        const errorField = errorDetails.message.split(' ')[0].split('"')[1]

        throw new errorInvalidField(
            'prop update fields joi validation',
            errorMessage,
            errorField,
            errorType
        )
    }else{
        return prop
    }
}

module.exports = {
    propCreateValidate, propUpdateValidate
}