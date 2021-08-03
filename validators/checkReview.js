const Joi = require('@hapi/joi')

const schemaCreateReview = Joi.object().keys({
    puntuacion : Joi.number().min(1).max(5).required(),
    contenido : Joi.string().max(65535).required()
})
const schemaCreateReview = Joi.object().keys({
    puntuacion : Joi.number().min(1).max(5),
    contenido : Joi.string().max(65535)
})

const reviewCreateValidate = async (review) => {
    return Joi.assert(review,schemaCreateReview)
}
const reviewUpdateValidate = async (review) => {
    return Joi.assert(review, schemaUpdateReview)
}

module.exports = {
    reviewCreateValidate, reviewUpdateValidate
}