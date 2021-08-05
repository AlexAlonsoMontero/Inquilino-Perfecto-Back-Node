const Joi = require('@hapi/joi')


const schemaCreateReserv = Joi.object().keys({
    fecha_reserva : Joi.date().iso().required(),
    fecha_inicio : Joi.date().iso().min(Joi.ref('fecha_reserva')),
    fecha_fin : Joi.date().iso().min(Joi.ref('fecha_inicio')),
    precio_reserva : Joi.number().min(0).required(),
    estado_reserva : Joi.string().valid(...['PENDIENTE','ACEPTADA','RECHAZADO','ALQUILER','FINALIZADA']).required(),
    tipo_pago_reserva : Joi.string().valid(...['MENSUAL','SEMANAL','DIARIO','OTRO']).required()
})

const schemaUpdateReserv = Joi.object().keys({
    fecha_reserva : Joi.date().iso(),
    fecha_inicio : Joi.date().iso().min(Joi.ref('fecha_reserva')),
    fecha_fin : Joi.date().iso().min(Joi.ref('fecha_inicio')),
    precio_reserva : Joi.number().min(0),
    estado_reserva : Joi.string().valid(...['PENDIENTE','ACEPTADA','RECHAZADO','ALQUILER','FINALIZADA']),
    tipo_pago_reserva : Joi.string().valid(...['MENSUAL','SEMANAL','DIARIO','OTRO'])
})

const reservCreateValidate = async (reserv) => {
    return Joi.assert(reserv,schemaCreateReserv)
}

const reservUpdateValidate = async (reserv) => {
    return Joi.assert(reserv, schemaUpdateReserv)
}

module.exports = {
    reservCreateValidate, reservUpdateValidate
}