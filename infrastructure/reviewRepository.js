const { errorCouldNotUpdate } = require('../customErrors/errorCouldNotUpdate');
const { getConnection } = require('./bd/db');
const connection = getConnection()


/**
 * @param {json} uuid indicates which kind of user is (casero or inquilino)
 * @returns user data in database without password
 */
const updatePunctuation = async (uuidRes, uuid, tName) => {
    const avgQuery =
        `SELECT round(avg(puntuacion),2) AS 'puntuacion_media' FROM resenas 
        WHERE ${Object.keys(uuidRes)[0]} = ?`;
    const [rows, _] = await connection.query(avgQuery,Object.values(uuidRes)[0])
    const avg = rows[0]
    const updateUserQuery =
        `UPDATE ${tName} SET puntuacion_media = ${avg.puntuacion_media}
        WHERE ${Object.keys(uuid)[0]} = ?`
    const updateUser = await connection.query(updateUserQuery, Object.values(uuid)[0])
    if(updateUser < 1){
        throw new errorCouldNotUpdate('updatePunctuation',JSON.stringify(uuid));
    }
}


const checkIsInvolved = async (reqUser, validatedReview) => {
    let checkInvolved, usr;
    const tReservations = 'reservas'
    switch(reqUser.tipo){
        case 'INQUILINO':
            usr = {usr_inquilino_uuid:reqUser.user_uuid}
            checkInvolved = await getItemsMultiParams({...usr, reserva_uuid: validatedReview.reserva_uuid},tReservations)
            break;
        case 'CASERO':
            usr = {usr_casero_uuid:reqUser.user_uuid}
            checkInvolved = await getItemsMultiParams({...usr, reserva_uuid: validatedReview.reserva_uuid},tReservations)
            break;
        case 'INQUILINO/CASERO':
            usr = {
                usr_inquilino_uuid:reqUser.user_uuid,
                usr_casero_uuid:reqUser.user_uuid
            }
            const checkInvolvedInq = await getItemsMultiParams({
                usr_inquilino_uuid:reqUser.user_uuid,
                reserva_uuid: validatedReview.reserva_uuid},
                tReservations)
            const checkInvolvedCas = await getItemsMultiParams({
                usr_casero_uuid:reqUser.user_uuid,
                reserva_uuid: validatedReview.reserva_uuid},
                tReservations)
            checkInvolved = {...checkInvolvedInq, ...checkInvolvedCas}
            break;
        case 'ADMIN':
        default:
            checkInvolved = false
            break;
    }
    return checkInvolved
}

module.exports = {
    updatePunctuation, checkIsInvolved
}