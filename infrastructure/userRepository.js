const bcrypt = require('bcryptjs')
const { getConnection } = require('./bd/db')

const save = async (user, table) => {
    
        user.password = bcrypt.hashSync(user.password, 10)
        const prepareStrintToDb = Object.values(user).map(value => {
            return (!typeof (value) === 'string' ? value : "'" + value + "'") //Prepara las string para bd, añadiendo ' 
        });
        const keys = Object.keys(user).toString()
        const values = prepareStrintToDb.toString()
        const connection = getConnection()
        await connection.query(`INSERT INTO ${table} (${keys}) VALUES (${values});`)
    
}

const find = async ({ }) => {

}

const get = async (id) => {

}

module.exports = {
    save
}