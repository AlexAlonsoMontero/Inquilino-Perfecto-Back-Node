const bcrypt = require('bcryptjs')
const { query } = require('express')
const {getConnection} = require('./bd/db')
const connection = getConnection()
const { dateString } = require('../infrastructure/utils/dateString') 

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
 * @param {string} queryParams conditions of the searchºº
 * @returns
 */
const getItemsMultiTable = async ({table1,table2, t1key, t2key}, queryParams) => {
    let rows =""
    let sentence = `SELECT * FROM ${table1}` +
                    ` INNER JOIN ${table2} ON ${table1}.${t1key} = ${table2}.${t2key} `
    if( Object.keys(queryParams).length === 0){
        console.log(queryParams)
        rows = await connection.query(sentence)
    }else{
        const whereCondition = whereCreator(queryParams)
        sentence += whereCondition
        const qparam = qParamsBoolValidator(Object.values(queryParams))
        rows= await connection.query(sentence,qparam)
    }
    
    return rows[0]
}
/**
 * 
 * @param [] tables 
 * @param [] tkeys 
 * @param {*} queryParams 
 * @returns 
 */
const getItemsMultiJoi = async (qtable, tables, tkeys, queryParams) => {
    let rows =""
    let sentence = `SELECT * FROM ${qtable} ` 
                    // ` INNER JOIN ${table2} ON ${table1}.${t1key} = ${table2}.${t2key} `
    for(let cont = 0; cont < tables.length; cont++){
        sentence +=`INNER JOIN ${tables[cont]} `
        sentence += `ON ${tkeys[cont][0]} = ${tkeys[cont][1]} `
    }
    if( Object.keys(queryParams).length === 0){
        rows = await connection.query(sentence)
    }else{
        const whereCondition = whereCreator(queryParams)
        sentence += whereCondition
        const qparam = qParamsBoolValidator(Object.values(queryParams))
        rows= await connection.query(sentence,qparam)
    }
    rows[0].forEach(element => {
        if(element?.password){delete element.password}
        if (element?.fecha_disponibilidad){element.fecha_disponibilidad=dateString(element.fecha_disponibilidad)}
    });
    
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
    const separator = '__'

    for (let i = 0; i < Object.keys(queryParams).length; i++) {
        key = Object.keys(queryParams)[i]
        if (key.split(separator).length > 1) {
            aux = key.split(separator)[0]
            if (aux === "from") {
                queryKeys.push([key.split(separator)[1]])
                operator = '>='
            } else if (aux === "until") {
                queryKeys.push([key.split(separator)[1]])
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

/**
 * 
 * @param []  
 * @returns []
 * @description Al recibir el queryparams interpreta bollean como un string, corregimos ese error con este metodo
 */
const qParamsBoolValidator =(params) =>{
    return params.map(item=>{
        if(item==='true'){
            return true
        }else if (item === 'false'){
            return false
        }else{
            return item
        }
    })
    
}
/**
 * 
 * @param { string } showParams 
 * @param {string} avgParam 
 * @param {string} groupParam 
 * @param {{}} whereParams 
 * @param {string} table 
 * @returns 
 */
const getAvgItems = async(showParam,avgParam,groupParam,whereParams, table) =>{
    let query =`SELECT ${showParam}, AVG(${avgParam}) as ${avgParam} FROM ${table} 
             ${whereCreator(whereParams)} 
             GROUP BY ${groupParam}`
    const rows = await connection.query(query,Object.values(whereParams))
    return rows[0]

}
module.exports = {
    save,
    getItems,
    findItem,
    updateItem,
    deleteItem,
    getItemsMultiParams,
    getItemsMultiTable,
    getItemsMultiJoi,
    getAvgItems
}
