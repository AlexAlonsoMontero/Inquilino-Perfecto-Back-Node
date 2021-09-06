const Joi = require('joi');
const { errorInvalidField } = require('../customErrors/errorInvalidField');


const schemaCreateReserv = Joi.object().keys({
    reserva_uuid : Joi.string().guid({ version : 'uuidv4' }),
    usr_casero_uuid:Joi.string().guid({ version : 'uuidv4' }),
    usr_inquilino_uuid:Joi.string().guid({ version : 'uuidv4' }),
    inmuebles_uuid:Joi.string().guid({ version : 'uuidv4' }),
    anuncio_uuid : Joi.string().guid({ version : 'uuidv4' }).required(),
    fecha_reserva : Joi.date().iso().required(),
    fecha_inicio : Joi.date().iso().min(Joi.ref('fecha_reserva')),
    fecha_fin : Joi.date().iso().min(Joi.ref('fecha_inicio')),
    precio_reserva : Joi.number().min(0).required(),
    estado_reserva : Joi.string().valid('PENDIENTE').required(),
    tipo_pago_reserva : Joi.string().valid(...['MENSUAL','SEMANAL','DIARIO','OTRO']).required()
})

const schemaUpdateReserv = Joi.object().keys({
    fecha_reserva : Joi.date().iso().optional(),
    fecha_inicio : Joi.date().iso().min(Joi.ref('fecha_reserva')).optional(),
    fecha_fin : Joi.date().iso().min(Joi.ref('fecha_inicio')).optional(),
    precio_reserva : Joi.number().min(0).optional(),
    estado_reserva : Joi.string().valid(...['PENDIENTE','ACEPTADA','RECHAZADO','ALQUILER','FINALIZADA']).optional(),
    tipo_pago_reserva : Joi.string().valid(...['MENSUAL','SEMANAL','DIARIO','OTRO']).optional()
})

const reservCreateValidate = (reserv) => {
    if(schemaCreateReserv.validate(reserv)?.error){
        const [errorDetails] = schemaCreateReserv.validate(reserv)?.error.details;
        const errorMessage = errorDetails.message
        const errorType = errorDetails.type
        const errorField = errorDetails.message.split(' ')[0].split('"')[1]

        throw new errorInvalidField(
            'reserv creation fields joi validation',
            errorMessage,
            errorField,
            errorType
        )
    }else{
        return reserv
    }
}

const reservUpdateValidate = (reserv) => {
    if(schemaUpdateReserv.validate(reserv)?.error){
        const [errorDetails] = schemaUpdateReserv.validate(reserv)?.error.details;
        const errorMessage = errorDetails.message
        const errorType = errorDetails.type
        const errorField = errorDetails.message.split(' ')[0].split('"')[1]

        throw new errorInvalidField(
            'reserv update fields joi validation',
            errorMessage,
            errorField,
            errorType
        )
    }else{
        return reserv
    }
}

module.exports = {
    reservCreateValidate, reservUpdateValidate
}