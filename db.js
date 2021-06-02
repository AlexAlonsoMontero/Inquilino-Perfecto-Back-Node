require('dotenv').config()

const mysql = require('mysql2/promise')

let pool

const getConection = () => {
    if (!pool){
        pool =  mysql.createPool ({
            connectionLimit: 10,
            host: process.env.DB_HOST,
            database:process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
            
        })
    }
    return pool
}

module.exports = { getConection }