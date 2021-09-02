const Joi = require('joi');
const { errorInvalidField } = require('../customErrors/errorInvalidField');

const schemaCreateAdv = Joi.object().keys({
    anuncio_uuid : Joi.string().guid({ version : 'uuidv4' }),
    inmueble_uuid : Joi.string().guid({ version : 'uuidv4' }).required(),
    usr_casero_uuid : Joi.string().guid({ version : 'uuidv4' }),
    // visibilidad : Joi.boolean().required(),
    fecha_disponibilidad : Joi.date().iso(),
    // fecha_disponibilidad : Joi.string(),
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
    precio : Joi.number().min(0),

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
})

const advCreateValidate = (adv) => {
    const auxAdv = adv
    auxAdv.fecha_disponibilidad = new Date(adv.fecha_disponibilidad)
    console.log(auxAdv.fecha_disponibilidad)
    if(schemaCreateAdv.validate(auxAdv)?.error){
        const [errorDetails] = schemaCreateAdv.validate(adv)?.error.details;
        const errorMessage = errorDetails.message
        const errorType = errorDetails.type
        const errorField = errorDetails.message.split(' ')[0].split('"')[1]

        throw new errorInvalidField(
            'Adv creation fields joi validation',
            errorMessage,
            errorField,
            errorType
        )
    }else{
        return adv
    }
}
const advUpdateValidate = (adv) => {
    
    if(schemaUpdateAdv.validate(adv)?.error){
        const [errorDetails] = schemaUpdateAdv.validate(adv)?.error.details;
        const errorMessage = errorDetails.message
        const errorType = errorDetails.type
        const errorField = errorDetails.message.split(' ')[0].split('"')[1]

        throw new errorInvalidField(
            'adv update fields joi validation',
            errorMessage,
            errorField,
            errorType
        )
    }else{
        return adv
    }
}

module.exports = {
    advCreateValidate, advUpdateValidate
}

