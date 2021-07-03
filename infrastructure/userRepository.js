const { getConnection } = require('./bd/db')
const connection = getConnection()


/**
 * 
 * @param {string} uuid_user 
 * @returns  user data in database without password
 */
const getUserNoPass = async (uuid_user) => {
    const sentence = 'SELECT user_uuid, username, email, tipo FROM usuarios WHERE user_uuid=?'
    const user = await connection.query(sentence, uuid_user)
    return (user[0])
}

/**
 * 
 * @returns 
 */
const findUsersNoPass = async() =>{
    const sentence = "SELECT username, email, tipo FROM usuarios WHERE tipo !='ADMIN'"
    const [rows,fields] = await connection.query(sentence)
    return rows
}

module.exports = {
    getUserNoPass,
    findUsersNoPass
}

