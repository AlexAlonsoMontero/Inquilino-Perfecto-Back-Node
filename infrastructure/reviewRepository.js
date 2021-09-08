const { errorCouldNotUpdate } = require('../customErrors/errorCouldNotUpdate');
const { getConnection } = require('./bd/db');
const connection = getConnection()


/**
 * @param {json} uuid indicates which kind of user is (casero or inquilino)
 * @returns user data in database without password
 */
const updatePuntuation = async (uuidRes, uuid, tName) => {
    const avgQuery =
        `SELECT round(avg(puntuacion),2) AS 'puntuacion_media' FROM resenas 
        WHERE ${Object.keys(uuidRes)[0]} = ?`;
    const [rows, _] = await connection.query(avgQuery,Object.values(uuidRes)[0])
    const avg = rows[0]
    console.log(avg.puntuacion_media);
    const updateUserQuery =
        `UPDATE ${tName} SET puntuacion_media = ${avg.puntuacion_media} WHERE ${Object.keys(uuid)[0]} = ?`
    const updateUser = await connection.query(updateUserQuery, Object.values(uuid)[0])
    if(updateUser < 1){
        throw new errorCouldNotUpdate('updatePuntuation',JSON.stringify(uuid));
    }
}

module.exports = {
    updatePuntuation
}