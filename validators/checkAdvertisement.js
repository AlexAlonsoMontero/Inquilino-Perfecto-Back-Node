const Joi = require('@hapi/joi')

const schemaCreateAdv = Joi.object().keys({
    anuncio_uuid : Joi.string().guid({ version : 'uuidv4' }).required(),
    usr_casero_uuid : Joi.string().guid({ version : 'uuidv4' }).required(),
    id_anuncio : Joi.number().forbidden(),
    visibilidad : Joi.boolean().required(),
    fecha_disponibilidad : Joi.date().iso(),
    fecha_inicio : Joi.date().iso().min(Joi.ref('fecha_disponibilidad')),
    fecha_fin : Joi.date().iso().min(Joi.ref('fecha_inicio')),
    precio : Joi.number().min(0)
})

const schemaUpdateAdv = Joi.object().keys({
    anuncio_uuid : Joi.string().forbidden(),
    usr_casero_uuid : Joi.string().forbidden(),
    id_anuncio : Joi.number().forbidden(),
    visibilidad : Joi.boolean(),
    fecha_disponibilidad : Joi.date().iso(),
    fecha_inicio : Joi.date().iso().min(Joi.ref('fecha_disponibilidad')),
    fecha_fin : Joi.date().iso().min(Joi.ref('fecha_inicio')),
    precio : Joi.number().min(0)
})

const advCreateValidate = (adv) => {
    Joi.assert(adv,schemaCreateAdv)
    return adv
}
const advUpdateValidate = (adv) => {
    Joi.assert(adv, schemaUpdateAdv)
    return adv
}

module.exports = {
    advCreateValidate, advUpdateValidate
}