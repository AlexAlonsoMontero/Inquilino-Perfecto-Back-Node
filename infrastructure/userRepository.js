const { getConnection } = require('./bd/db')
const { findItem, getItems } = require('./generalRepository')
const connection = getConnection()


/**
 * @param {string} user_uuid admite SOLAMENTE el VALOR de la uuid
 * @returns user data in database without password
 */
const getUserNoPass = async (user_uuid) => {
    // const sentence = 'SELECT user_uuid, username, email, tipo FROM usuarios WHERE user_uuid=?'
    // const user = await connection.query(sentence, uuid_user)
    const aux = {"user_uuid":user_uuid}
    let user = await findItem(aux, 'usuarios')
    delete user.password
    return user
}

/**
 * 
 * @returns 
 */
const findUsersNoPass = async() =>{
    let rows = await getItems('usuarios')
    rows = rows
        .filter( (user) => {
            return user.tipo !== 'ADMIN'
        })
        .map( (user) => {
            delete user.password
            return user
        })
    return rows
}

module.exports = {
    getUserNoPass,
    findUsersNoPass
}

