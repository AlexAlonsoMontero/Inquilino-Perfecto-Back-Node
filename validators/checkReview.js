const Joi = require('@hapi/joi')

const schemaCreateReserv = Joi.object().keys({
    puntuacion : Joi.number().min(1).max(5).required(),
    contenido : Joi.string().max(65535).required()
})
const schemaCreateReserv = Joi.object().keys({
    puntuacion : Joi.number().min(1).max(5),
    contenido : Joi.string().max(65535)
})