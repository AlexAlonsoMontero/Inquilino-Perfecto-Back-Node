const bcrypt = require('bcryptjs')
const { getConnection } = require('./bd/db')
const connection = getConnection()
/**
 * CREA la entidad dado en la BDD
 * @param {json} entity json correspondiente al dato a insertar
 * @param {string} table string correspondiente a dónde será insertado el dato
 */
const save = async (entity, table) => {
    if (entity.password) {
        entity.password = bcrypt.hashSync(entity.password, 10)
    }
    const cont = Object.values(entity).length
    let cadena = '?'
    for (let i = 1; i < cont; i++) {
        cadena = cadena + ', ?'
    }
    const keys = Object.keys(entity).toString()
    let sentencia = `INSERT INTO ${table} (${keys}) VALUES (${cadena})`
    const values = Object.values(entity).map(value => (typeof (value) === 'string' ? value = "'" + value + "'" : value))
    const consulta = await connection.query(sentencia, Object.values(entity))

    return consulta[0][0]
}

/**
 * Generic table data retriever WITHOUT PARAMS
 * @param {string} table string name of the entity
 * @returns full content of the given table
 */
const getItems = async (table) => {
    const sentencia = `SELECT * FROM ${table}`
    const consulta = await connection.query(sentencia)
    return consulta[0]

}

/**
 * Generic search in table by ONE PARAM
 * @param {json} item json object with the data key we want to find placed in the first field
 * @param {string} table srting name of the table where we are gonna search
 * @returns the query selected rows, otherwise 'undefined'
 */
const findItem = async (item, table) => {
    try {
        const sentencia = `SELECT * FROM ${table} WHERE ${Object.keys(item)[0]}=?`
        const [rows, field] = await connection.query(sentencia, Object.values(item)[0])
        return rows.length > 0 ? rows : undefined
    }catch(error){
       console.warn(error.message) 
    }
    
}

//TODO REALIZAR BUSQUEDA POR VARIOS PARAMETROS EN EL WHERE
//TODO VER FILTER PARA GENERAL Y USUARIOS
const filterItem = async (item, table) => { }

/**
 * Generic update for every given entity
 * @param {json} newItems
 * @param {json} oldItemKeyValue
 * @param {string} table
 * @returns ??
 */
const updateItem = async (newItem, oldItem, table) => {
    let sentencia = `UPDATE ${table} SET `
    const numValues = Object.keys(newItem).length
    for (let i = 0; i < numValues; i++) {
        sentencia += Object.keys(newItem)[i].toString() + "=?"
        i < numValues - 1 ? sentencia += "," : sentencia += ""

    }
    sentencia += ` WHERE ${Object.keys(oldItem)} =?`
    const [rows, fields] = await connection.query(sentencia, [...Object.values(newItem), ...Object.values(oldItem)])
    return rows
}


/**
 * Generic item delete
 * @param {json} item json object with the data key we want to find placed in the first field
 * @param {string} table name of the table where we are gonna delete
 * @returns if no deletion has been done FALSE, otherwise TRUE
 */
const deleteItem = async (item, table) => {
    const sentencia = `DELETE FROM ${table} WHERE ${Object.keys(item)}=?`
    const consulta = await connection.query(sentencia, Object.values(item))
    return (consulta[0].affectedRows > 0 ? true : false)
}

//CONSULTAS AVANZADAS

/**
 * 
 * @param {object json} params 
 * @param {string} table 
 * @returns Array Object
 * @description Searchess in a table ny multiple parameters
 */
const getItemsMultiParams = async(params, table) => {
    try{

        const sentence = `SELECT * FROM ${table} ` + whereCreator(params)
        console.log(sentence)
        console.log(Object.values(params))
        const rows = await connection.query(sentence,Object.values(params))
        console.log(rows[0])
        return rows[0]

    }catch(error){
        console.warn(error.message)
    }
}

/**
 * 
 * @param {object json} params 
 * @returns string
 * @description return where for SQL query
 */
const whereCreator = (params) => {
    let key, operator, aux =""
    let sentence = 'WHERE '
    for (let i = 0; i< Object.keys(params).length; i++){
        key = Object.keys(params)[i]
        if(key.split('_')){
            aux = key.split('_')[0]
            if (aux ==="from"){
                operator='>'
            }else if(aux==="until"){
                operator='<'
            }else{
                operator='='
            }
        }

        if(i===0){
            sentence += `${Object.keys(params)[i]} ${operator} ?`
        }else{
            sentence += ` AND ${Object.keys(params)[i]} ${operator} ?`
        }
    }
    return sentence

}



module.exports = {
    save,
    getItems,
    findItem,
    filterItem,
    updateItem,
    deleteItem,
    getItemsMultiParams
}

