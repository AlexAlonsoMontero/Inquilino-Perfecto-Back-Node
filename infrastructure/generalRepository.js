const bcrypt = require('bcryptjs')
const { getConnection } = require('./bd/db')

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
    const connection = getConnection()
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
    const connection = getConnection()
    const consulta = await connection.query(sentencia)
    return consulta[0]

}

/**
 * Generic search in table by ONE PARAM
 * @param {json} item json object with the data key we want to find placed in the first field
 * @param {string} table srting name of the table where we are gonna search
 * @returns the query selected rows, otherwise 'undefined'
 */
const findItem = async(item, table) => {
    const connection = getConnection()
    const sentencia = `SELECT * FROM ${table} WHERE ${Object.keys(item)[0]}=?`
    const [rows, field] = await connection.query(sentencia, Object.values(item)[0])
    return rows.length > 0 ? rows : undefined
}

//TODO REALIZAR BUSQUEDA POR VARIOS PARAMETROS EN EL WHERE
//TODO VER FILTER PARA GENERAL Y USUARIOS
const filterItem = async(item, table) => {}

/**
 * Generic update for every given entity
 * @param {json} newItems
 * @param {json} oldItemKeyValue
 * @param {string} table
 * @returns ??
 */
const updateItem = async (newItem, oldItem, table) => {
    const connection = getConnection()
    let sentencia = `UPDATE ${table} SET `
    const numValues = Object.keys(newItem).length
    for (let i = 0; i < numValues; i++) {
        sentencia += Object.keys(newItem)[i].toString() +"=?"
        i<numValues-1 ? sentencia +="," : sentencia+=""

    }
    sentencia += ` WHERE ${Object.keys(oldItem)} =?`
    const [rows,fields] = await connection.query(sentencia, [...Object.values(newItem), ...Object.values(oldItem)])
    return rows
}


/**
 * Generic item delete
 * @param {json} item json object with the data key we want to find placed in the first field
 * @param {string} table name of the table where we are gonna delete
 * @returns if no deletion has been done FALSE, otherwise TRUE
 */
const deleteItem = async(item, table)=>{
    const connection = getConnection()
    const sentencia = `DELETE FROM ${table} WHERE ${Object.keys(item)}=?`
    const consulta = await connection.query(sentencia,Object.values(item))
    return (consulta[0].affectedRows > 0 ? true : false )
}


module.exports = {
    save,
    getItems,
    findItem,
    filterItem,
    updateItem,
    deleteItem
}

