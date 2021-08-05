const { getConnection } = require('./bd/db');
const connection = getConnection()
const { errorCouldNotUpdate } = require('../customErrors/errorCouldNotUpdate');


/**
 * @param {json} uuid indicates which kind of user is (casero or inquilino)
 * @returns user data in database without password
 */
const updateUserPunctuation = async (uuid) => {
    const avgQuery =
        `SELECT round(avg(puntuacion),2) AS 'puntuacion_media' FROM resenas 
        WHERE ${Object.keys(uuid)[0]} = ?`;
    const [rows, _] = await connection.query(avgQuery,Object.values(uuid)[0])
    const avg = rows[0]
    const updateUserQuery =
        `UPDATE usuarios SET puntuacion_media = ${avg.puntuacion_media}
        WHERE ${Object.keys(uuid)} = ?`
    const updateUser = await connection.query(updateUserQuery,...Object.values(uuid)[0])
    if(updateUser < 1){
        throw new errorCouldNotUpdate('updateUserPunctuation',JSON.stringify(uuid));
    }
}

module.exports = {
    updateUserPunctuation
}