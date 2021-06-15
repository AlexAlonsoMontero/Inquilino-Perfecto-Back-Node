const Joi = require('joi').extend(require('@joi/date'))
const { v4 } =require('uuid')
const { format } = require("date-fns")


//SCHEMAS
const advertisementSchema = Joi.object({
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


//VALIDATIONS

/*TODO Crear método para, ajustar la hora a la local si hacen la consulta desde otro sitio y validar que hay que restarle 1 al mes */
const validateAdvertisement = (advertisement)=>{
    advertisement.fecha_inicio  = format(new Date(advertisement.fecha_inicio.year, advertisement.fecha_inicio.month-1, advertisement.fecha_inicio.day),"yyyy-MM-dd")
    return advertisementSchema.validate(advertisement) ? advertisement : advertisementSchema.validate(advertisement).error
}

module.exports = {
    validateAdvertisement
}