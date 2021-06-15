const bcrypt = require('bcryptjs')
const { getConnection } = require('./bd/db')

/**
 * 
 * @param {*} entity 
 * @param {*} table 
 * @returns object
 * @description save an object in the assigned table
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

const getItems = async (table) => {
    const sentencia = `SELECT * FROM ${table}`
    
    const connection = getConnection()
    
    const consulta = await connection.query(sentencia)
    
    return consulta[0]

}


const findItem = async(item, table) => {
    const connection = getConnection()
    const sentencia = `SELECT * FROM ${table} WHERE ${Object.keys(item)[0]}=?`
    const [rows, field] = await connection.query(sentencia, Object.values(item)[0])
    return rows
}

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

const dropItem = async(item, table)=>{
    const connection = getConnection()
    const sentencia = `DELETE FROM ${table} WHERE ${Object.keys(item)}=?`
    const consulta = await connection.query(sentencia,Object.values(item))
    return (consulta[0].affectedRows>0)

}
//TODO VER FILTER PARA GENERAL Y USUARIOS
//TODO REALIZAR BUSQUEDA POR VARIOS PARAMETROS EN EL WHERE




module.exports = {
    save,
    getItems,
    findItem,
    updateItem,
    dropItem
}

