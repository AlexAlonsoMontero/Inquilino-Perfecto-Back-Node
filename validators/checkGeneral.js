const { errorInvalidField } = require('../customErrors/errorInvalidField');

const Joi = require('joi').defaults((schema) => schema.options({
    allowUnknown: true
}));

const schemaUuidV4 =  Joi.object().keys({
    user_uuid : Joi.string().guid({ version : 'uuidv4' }).required()
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