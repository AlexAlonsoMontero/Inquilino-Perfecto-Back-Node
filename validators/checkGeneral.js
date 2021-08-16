const Joi = require("joi").defaults((schema) => schema.options({
    allowUnknown: true
}));

const schemaUuidV4 =  Joi.string().guid({ version : 'uuidv4' }).required()

const validateUuid = (uuid) =>{
    Joi.assert(uuid, schemaUuidV4)
    return uuid
}

module.exports = {
    validateUuid
}