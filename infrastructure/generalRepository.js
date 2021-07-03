const bcrypt = require('bcryptjs')
const {getConnection} = require('./bd/db')
const connection = getConnection()

/**
 * CREA la tupla dada en la BDD
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
    // try {
    //     const sentencia = `SELECT * FROM ${table} WHERE ${Object.keys(item)[0]}=?`
    //     const [rows, field] = await connection.query(sentencia, Object.values(item)[0])
    //     return rows.length > 0 ? rows : undefined
    // } catch (error) {
    //     console.warn(error.message)
    // }
    const sentencia = `SELECT * FROM ${table} WHERE ${Object.keys(item)[0]}=?`
    const [rows, field] = await connection.query(sentencia, Object.values(item)[0])
    return rows[0]
}

/**
 * Generic update for every given entity
 * @param {json} newItems
 * @param {json} oldItemKeyValue
 * @param {string} table
 * @returns 
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
    return rows.affectedRows
}


/**
 * Generic item delete
 * @param {json} item data key we want to find placed in the first field
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
 * @param {json} params
 * @param {string} table
 * @returns query result
 * @description Searches in a table with multiple conditions
 */
const getItemsMultiParams = async (params, table) => {
    try {
        console.log(table)
        const sentence = `SELECT * FROM ${table} ` + whereCreator(params)
        const rows = await connection.query(sentence, Object.values(params))

        return rows[0]

    } catch (error) {
        console.warn(error.message)
    }
}
/**
 * Joins two tables and searches with multiple conditions
 * @param {t1, t2, t1k, t2k} param0 path params with the corresponding info
 * @param {string} queryParams conditions of the search
 * @returns
 */
const getItemsMultiTable = async ({table1,table2, t1key, t2key}, queryParams) => {
    let rows =""
    let sentence = `SELECT * FROM ${table1}` +
                    ` INNER JOIN ${table2} ON ${table1}.${t1key} = ${table2}.${t2key} `
    if( Object.keys(queryParams).length === 0){console.log("entra")
    console.log(sentence)
        rows = await connection.query(sentence)
    }else{
        const whereCondition = whereCreator(queryParams)
        sentence += whereCondition
        rows= await connection.query(sentence,Object.values(Object.values(queryParams)))
    }
    return rows[0]
}

/**
 * Builds a WHERE condition from chained query params
 * @param {json} queryParams
 * @returns chained formated conditions of the 
 * @description return where for SQL query
 */
const whereCreator = (queryParams) => {
    let key, operator, aux = ""
    let queryKeys = []
    let sentence = 'WHERE '
    for (let i = 0; i < Object.keys(queryParams).length; i++) {
        key = Object.keys(queryParams)[i]
        if (key.split('-').length > 1) {
            aux = key.split('-')[0]
            if (aux === "from") {
                queryKeys.push([key.split('-')[1]])
                operator = '>='
            } else if (aux === "until") {

                queryKeys.push([key.split('-')[1]])
                operator = '<='
            }
        } else {
            operator = '='
            queryKeys.push(key)

        }

        if (i === 0) {
            sentence += `${queryKeys[i]} ${operator} ?`
        } else {
            sentence += ` AND ${queryKeys[i]} ${operator} ?`
        }
    }
    return sentence
}



module.exports = {
    save,
    getItems,
    findItem,
    updateItem,
    deleteItem,
    getItemsMultiParams,
    getItemsMultiTable
}