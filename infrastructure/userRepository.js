const { errorNoEntryFound } = require('../customErrors/errorNoEntryFound');
const { findItems, getItems } = require('./generalRepository')

/**
 * @param {string} user_uuid admite SOLAMENTE el VALOR de la uuid
 * @returns user data in database without password
 */
const getUserNoPass = async (user_uuid) => {
    const aux = {user_uuid}
    let user = await findItems(aux, 'usuarios')
    user = user[0]
    if(user){
        delete user.password
        return user
    }else{
        throw new errorNoEntryFound(
            'finding user in bdd',
            'user uuid not found in database',
            'user_uuid',
            user_uuid
        )
    }
}

const getUserPass = async (user_uuid) => {
    const aux = {user_uuid}
    let user = await findItems(aux, 'usuarios')
    user = user[0]
    if(user){
        return user
    }else{
        throw new errorNoEntryFound(
            'finding user in bdd',
            'user uuid not found in database',
            'user_uuid',
            user_uuid
        )
    }
}


const findUsersNoPass = async() =>{
    let rows = await getItems('usuarios')
    if(rows){
        rows = rows
        .filter( (user) => {
            return user.tipo !== 'ADMIN'
        })
        .map( (user) => {
            delete user.password
            return user
        })
    }
    return rows
}

module.exports = {
    getUserNoPass,
    findUsersNoPass,
    getUserPass
}