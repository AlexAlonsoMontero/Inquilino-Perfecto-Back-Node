const Joi = require('joi')
//SCHEMAS


const newPropSchema = Joi.object({
    inmueble_uuid:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }).required(),
    usr_casero_uuid:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }).required(),
    direccion:Joi.string(),
    metros_2:Joi.number().positive()
})
/**
 * Used when creating a property
 * @param {json} newProp data from wich the property is gonna be created
 * @returns type validated property or throws error
 */
const validateNewProp = (newProp) => {
    if (!newPropSchema.validate(newProp).error) {
        return newProp;
    } else {
        throw newPropSchema.validate(newProp).error
    }
}


const propSchemaQP = Joi.object({
    inmueble_uuid:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    })
})
const validatePropQP = (prop) => {
    if (!propSchemaQP.validate(prop).error) {
        return prop
    } else {
        throw propSchemaQP.validate(prop).error
    }
}

const allPropByUserSchema = Joi.object({
    usr_casero_uuid:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    inmueble_uuid:Joi.string().valid('all').required()
})
const validatePropByUser = (prop) => {
    if (!allPropByUserSchema.validate(prop).error) {
        return prop
    } else {
        throw allPropByUserSchema.validate(prop).error
    }
}

const propByUserAndProp = Joi.object({
    usr_casero_uuid:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    inmueble_uuid:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    })
})
const validatePropByUserAndProp = (prop) => {
    if (!propByUserAndProp.validate(prop).error) {
        return prop
    } else {
        throw propByPropSchema.validate(prop).error
    }
}

const propByPropSchema = Joi.object({
    inmueble_uuid:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    })
})
const validatePropByProp = (prop) => {
    if (!propByPropSchema.validate(prop).error) {
        return prop
    } else {
        throw propByPropSchema.validate(prop).error
    }
}
/**
 * Used when editing a property
 * @param {json} prop data from wich the property is gonna be created
 * @returns validated property or throws error
 */
const propUpdateSchema = Joi.object({
    inmueble_uuid:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }).required(),
    usr_casero_uuid:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }).required(),
    disponibilidad:Joi.boolean(),
    direccion:Joi.string(),
    metros_2:Joi.number().positive()
})
const validateUpdateProp = (prop) => {
    if (!propUpdateSchema.validate(prop).error) {
        return prop
    } else {
        throw propUpdateSchema.validate(prop).error
    }
}

module.exports = {
    validateNewProp,
    validatePropByUser,
    validatePropByUserAndProp,
    validateUpdateProp,
    validatePropQP,
    validatePropByProp
}
