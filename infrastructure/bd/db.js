const mysql = require('mysql2/promise')
require('dotenv').config()

const getConnection = () => {
    let pool
    if (!pool){
        pool = mysql.createPool ({
            connectionLimit: 10,
            host: process.env.DB_HOST,
            database:process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASS
            
        })
    }
    return pool
}

module.exports = { getConnection }