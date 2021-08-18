const { errorInvalidField } = require('../customErrors/errorInvalidField');

const Joi = require('joi').defaults((schema) => schema.options({
    allowUnknown: true
}));

const schemaUuidV4 =  Joi.object().keys({
    user_uuid : Joi.string().guid({ version : 'uuidv4' }),
    inmueble_uuid : Joi.string().guid({ version : 'uuidv4' }),
    anuncio_uuid : Joi.string().guid({ version : 'uuidv4' }),
    resena_uuid : Joi.string().guid({ version : 'uuidv4' }),
    reserva_uuid : Joi.string().guid({ version : 'uuidv4' }),
    usr_casero_uuid : Joi.string().guid({ version : 'uuidv4' }),
    author_uuid : Joi.string().guid({ version : 'uuidv4' })
})

const validateUuid = (uuid) =>{
    if(schemaUuidV4.validate(uuid)?.error){
        const [errorDetails] = schemaUuidV4.validate(uuid)?.error.details;
        const errorMessage = errorDetails.message
        const errorType = errorDetails.type
        const errorField = errorDetails.message.split(' ')[0].split('"')[1]

        throw new errorInvalidField(
            'uuid creation fields joi validation',
            errorMessage,
            errorField,
            errorType
        )
    }else{
        return uuid
    }
}

module.exports = {
    validateUuid
}