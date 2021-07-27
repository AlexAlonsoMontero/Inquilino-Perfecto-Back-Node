const Joi = require('@hapi/joi');

const schemaCreateProp = Joi.object().keys({
    disponibilidad : Joi.string.boolean().required(),
    calle : Joi.string().max(256).required(),

    metros_2 : Joi.number(),

    calle : Joi.string().max(256).required(),
    numero : Joi.string().max(16),
    piso : Joi.string().max(16),
    ciudad : Joi.string().max(128).required(),
    provincia : Joi.string().max(128).required(),
    comunidad : Joi.string().max(128),
    pais : Joi.string().max(128).required(),
    cp : Joi.string().max(5).required()
})
const schemaUpdateProp = Joi.object.key({
    disponibilidad : Joi.string.boolean(),
    calle : Joi.string().max(256),

    metros_2 : Joi.number(),

    calle : Joi.string().max(256),
    numero : Joi.string().max(16),
    piso : Joi.string().max(16),
    ciudad : Joi.string().max(128),
    provincia : Joi.string().max(128),
    comunidad : Joi.string().max(128),
    pais : Joi.string().max(128),
    cp : Joi.string().max(5)
})