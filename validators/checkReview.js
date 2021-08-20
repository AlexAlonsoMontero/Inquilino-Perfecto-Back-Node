const Joi = require('joi');
const { errorInvalidField } = require('../customErrors/errorInvalidField');

const schemaCreateReview = Joi.object().keys({
    resena_uuid: Joi.string().guid({ version : 'uuidv4' }),
    reserva_uuid : Joi.string().guid({ version : 'uuidv4' }).required(),
    puntuacion : Joi.number().min(1).max(5).required(),
    contenido : Joi.string().max(65535).required(),
    objetivo : Joi.string().valid(...['INQUILINO','CASERO', 'INMUEBLE']).required()
})
const schemaUpdateReview = Joi.object().keys({
    puntuacion : Joi.number().min(1).max(5),
    contenido : Joi.string().max(65535)
})

const reviewCreateValidate = (review) => {
    if(schemaCreateReview.validate(review)?.error){
        const [errorDetails] = schemaCreateReview.validate(review)?.error.details;
        const errorMessage = errorDetails.message
        const errorType = errorDetails.type
        const errorField = errorDetails.message.split(' ')[0].split('"')[1]

        throw new errorInvalidField(
            'review update fields joi validation',
            errorMessage,
            errorField,
            errorType
        )
    }else{
        return review
    }
}

const reviewUpdateValidate = (review) => {
    if(schemaUpdateReview.validate(review)?.error){
        const [errorDetails] = schemaUpdateReview.validate(review)?.error.details;
        const errorMessage = errorDetails.message
        const errorType = errorDetails.type
        const errorField = errorDetails.message.split(' ')[0].split('"')[1]

        throw new errorInvalidField(
            'review update fields joi validation',
            errorMessage,
            errorField,
            errorType
        )
    }else{
        return review
    }
}

module.exports = {
    reviewCreateValidate, reviewUpdateValidate
}