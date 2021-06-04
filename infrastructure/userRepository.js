
// FUNCTION SAVE IN generalRepository.js

const { validateLogin } = require('../validators/uservalidator')
const { getConnection } = require('./bd/db')



const findUser = async (email) => {
    const connection = getConnection()
    const consulta = await connection.query(`SELECT * FROM usuarios WHERE email=?`, email)
    return (consulta[0][0])

    
}


const getUser = async (id) => {

}

module.exports = {
    findUser
}