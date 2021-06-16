//SCHEMAS

//TODO amplicar con más datos obligatorioa para el imnueble

const newPropSchema = Joi.object({
    inmueble_uuid:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    usr_uuid_casero:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
})

const propSchema = Joi.object({
    inmueble_uuid:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
    usr_uuid_casero:Joi.string().guid({
        version: [
            'uuidv4',
            'uuidv5'
        ]
    }),
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


/**
 * Used when editing a property
 * @param {json} prop data from wich the property is gonna be created
 * @returns validated property or throws error
 */
const validateProp = (prop) => {
    if (!propSchema.validate(prop).error) {
        return prop
    } else {
        throw propSchema.validate(prop).error
    }
}

const validatePropQP = (prop) => {
    if (!propSchema.validate(prop).error) {
        return prop
    } else {
        throw propSchema.validate(prop).error
    }
}

const validatePropPP = (prop) => {
    if (!propSchema.validate(prop).error) {
        return prop
    } else {
        throw propSchema.validate(prop).error
    }
}
