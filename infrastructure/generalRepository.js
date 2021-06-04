const bcrypt = require('bcryptjs')
const { getConnection } = require('./bd/db')

const save = async (user, table) => {
    user.password = bcrypt.hashSync(user.password, 10)
    const cont = Object.values(user).length
    let cadena = '?'
    for (let i=1; i<cont; i++){
        cadena = cadena +', ?'
    }
    const keys = Object.keys(user).toString()
    const connection = getConnection()
    let sentencia = `INSERT INTO ${table} (${keys}) VALUES (${cadena})`
    const values  = Object.values(user).map(value=> (typeof(value)==='string'? value = "'" + value + "'": value))
    console.log(keys)
    console.log(Object.values(user))
    await connection.query(sentencia,Object.values(user))
}

module.exports = {
    save
}

