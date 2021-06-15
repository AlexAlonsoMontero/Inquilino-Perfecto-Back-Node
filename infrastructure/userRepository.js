
// FUNCTION SAVE IN generalRepository.js

// const { validateLogin } = require('../validators/uservalidator')
const { getConnection } = require('./bd/db')

/**
 * 
 * @param {string} uuid_user 
 * @returns  user data in database without password
 */
const findUserNoPass = async (uuid_user) => {
    const connection = getConnection()
    const sentencia = 'SELECT user_uuid, username, email, tipo FROM usuarios WHERE user_uuid=?'
    const user = await connection.query(sentencia, uuid_user)
    return (user[0])
}

module.exports = {
    findUserNoPass
}

//TODO GESTIONAR CAMBI0 DE PASWORD
//TODO GESTIONAR USUARIO ADMIN

// /**
//  * 
//  * @param {*} email 
//  * @returns Datos de usuario password incluido
//  */
// const findUser = async (email) => {
//     const connection = getConnection()
//     const consulta = await connection.query(`SELECT * FROM usuarios WHERE email=?`, email)
//     return (consulta[0][0])


// }

// /**
//  * 
//  * @param {*} uuid 
//  * @returns Datos de usuario sin password
//  */
// const findUserBDD = async (uuid_user) => {
//     const connection = getConnection()
//     const sentencia = 'SELECT user_uuid, username, email, tipo FROM usuarios WHERE user_uuid=?'
//     const consulta = await connection.query(sentencia,uuid_user)
//     return (consulta[0][0])
// }


// const updateUser = async(newUser,uuid_user)=>{
//     const connection = getConnection()
//     const sentencia = 'UPDATE usuarios SET username=?, email=?, tipo=? WHERE user_uuid=?;'
//     return await connection.query(sentencia,[...Object.values(newUser),uuid_user])
// }

// const dropUser = async(uuid_user)=>{
//     const connection = getConnection()
//     const sentencia = 'DELETE FROM usuarios WHERE user_uuid=?'
//     return await connection.query(sentencia,uuid_user)
// }


// module.exports = {
//     findUser,
//     findUserBDD,
//     updateUser,
//     dropUser
// }

