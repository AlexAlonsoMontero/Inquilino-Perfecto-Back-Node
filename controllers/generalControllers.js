const jwt = require('jsonwebtoken')
const { getItemsMultiParams, getItemsMultiTable } = require('../infrastructure/generalRepository')


const searchMultiParams = async(request, response) => {
    try{
        const result = await getItemsMultiParams(request.query,request.params.table)
        if(result.length >0){
            response.status(200).send({ info: "Busqueda ok", data: result })
        }else{
            const error = new Error ("No se han encontrado resultados para la búsqueda")
            throw error
        }

    }catch(error){
        console.warn(error.message)
        response.status(400).send("No se han encontrado resultados para la búsqueda")
    }

}

/**
 * 
 * @param {json} request with path params and query params
 * @param {*} response 
 */
const searchMultiTableMultiParams  = async(request,response) =>{
    try{
        const result = await getItemsMultiTable(request.params, request.query)
        response.status(200).send({info: "Datos localizados",data: result})
    }catch(error){
        // console.warn(error.message)
        response.status(400).send("Bad request")
    }
    
}



module.exports = {
    searchMultiParams,
    searchMultiTableMultiParams
}