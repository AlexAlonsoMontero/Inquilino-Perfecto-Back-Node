const Joi = require('@hapi/joi')

const schemaCreateAdv = Joi.object().keys({
    visibilidad : Joi.boolean().required(),
    fecha_disponibilidad : Joi.date().iso(),
    fecha_inicio : Joi.date().iso().min(Joi.ref('fecha_disponibilidad')),
    fecha_fin : Joi.date().iso().min(Joi.ref('fecha_inicio')),
    precio : Joi.number().min(0)
})

const schemaUpdateAdv = Joi.object.key({
    visibilidad : Joi.boolean(),
    fecha_disponibilidad : Joi.date().iso(),
    fecha_inicio : Joi.date().iso().min(Joi.ref('fecha_disponibilidad')),
    fecha_fin : Joi.date().iso().min(Joi.ref('fecha_inicio')),
    precio : Joi.number().min(0)
})
