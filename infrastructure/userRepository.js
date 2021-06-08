
// FUNCTION SAVE IN generalRepository.js

const { validateLogin } = require('../validators/uservalidator')
const { getConnection } = require('./bd/db')


/**
 * 
 * @param {*} email 
 * @returns Datos de usuario password incluido
 */
const findUser = async (email) => {
    const connection = getConnection()
    const consulta = await connection.query(`SELECT * FROM usuarios WHERE email=?`, email)
    return (consulta[0][0])

    
}

/**
 * 
 * @param {*} email 
 * @returns Datos de usuario sin password
 */
const getUserBDD = async (user_uuid) => {
    const connection = getConnection()
    const consulta = await connection.query('SELECT user_uuid, username, password, email, tipo FROM usuarios')
    return (consulta[0][0])
}

module.exports = {
    findUser,
    getUserBDD
}