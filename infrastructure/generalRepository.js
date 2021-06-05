const bcrypt = require('bcryptjs')
const { getConnection } = require('./bd/db')

/**
 * Guarda en la base de datos los datos correspondientes a la entidad dada
 * @param {json} entity correspondiente al dato a insertar
 * @param {string} table correspondiente a dónde será insertado el dato
 */
const save = async (entity, table) => {
    entity.password = bcrypt.hashSync(entity.password, 10)
    const cont = Object.values(entity).length
    let cadena = '?'
    for (let i=1; i<cont; i++){
        cadena = cadena +', ?'
    }
    const keys = Object.keys(entity).toString()
    const connection = getConnection()
    let sentencia = `INSERT INTO ${table} (${keys}) VALUES (${cadena})`
    const values  = Object.values(entity).map(value=> (typeof(value)==='string'? value = "'" + value + "'": value))
    await connection.query(sentencia,Object.values(entity))
}

module.exports = {
    save
}

