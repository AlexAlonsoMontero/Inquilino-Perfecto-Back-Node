const Joi = require("joi").defaults((schema) => schema.options({
    allowUnknown: true
}));

schemaUuidV4 = Joi.object({
    a:Joi.string().guid({ version : 'uuidv4' }).required()
})//.pattern(/./, Joi.string())

const validateUuid = (uuid) =>{
    Joi.assert(uuid, schemaUuidV4)
    return uuid
}

module.exports = {
    validateUuid
}