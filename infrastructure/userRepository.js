const { getConnection } = require('./bd/db')
const { findItems, getItems } = require('./generalRepository')
const connection = getConnection()


/**
 * @param {string} user_uuid admite SOLAMENTE el VALOR de la uuid
 * @returns user data in database without password
 */
const getUserNoPass = async (user_uuid) => {
    const aux = {"user_uuid":user_uuid}
    let user = await findItems(aux, 'usuarios')
    if(user){
        delete user.password
    }
    return user
}

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

