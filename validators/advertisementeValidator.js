const Joi = require('joi').extend(require('@joi/date'))
const { v4 } =require('uuid')
const { format } = require("date-fns")
const { updateItem } = require('../infrastructure/generalRepository')


//SCHEMAS
const newAdvertisementSchema = Joi.object({
    inmueble_uuid: Joi.string(),//.guid({
    //     version: ['uuidv4']
    //     }),
    usr_casero: Joi.string().guid({
        version: [
            'uuidv4'
        ]
    }),
    fecha_inicio: Joi.date().format(["DD-MM-YYYY"],["YYYY-MM-DD"])
})

//TODO VALICADIOENS ADVERTISESMENTE
const advertisementUpdateScheme = Joi.object({
    
})

//VALIDATIONS

/*TODO Crear método para, ajustar la hora a la local si hacen la consulta desde otro sitio y validar que hay que restarle 1 al mes */
const validateNewAdevertisement = (advertisement)=>{
    advertisement.fecha_inicio  = format(new Date(advertisement.fecha_inicio.year, advertisement.fecha_inicio.month-1, advertisement.fecha_inicio.day),"yyyy-MM-dd")
    return newAdvertisementSchema.validate(advertisement) ? advertisement : newAdvertisementSchema.validate(advertisement).error
}

//TODO FINALIZAR METODO DE VALIDACION MODIFICACION ANUNCIOS, SÓLO DOI FORMATO A FECHA
const validateUpdateAdvertisemente = (advertisement) => {
    advertisement.fecha_inicio  = format(new Date(advertisement.fecha_inicio.year, advertisement.fecha_inicio.month-1, advertisement.fecha_inicio.day),"yyyy-MM-dd")
    return advertisement
}

module.exports = {
    validateNewAdevertisement,
    validateUpdateAdvertisemente
}