require('dotenv').config()
const bcrypt = require('bcryptjs')
const { validateAdminUpdateUser } = require('../validators/userValidator')
const { updateItem } = require('../infrastructure/generalRepository')
/**
 * 
 * @param {newUser,uuidOlduiser} request 
 * @param {*} response 
 * @description Update user in BD
 */
const updateUserForAdmin = async (request, response) => {
    try {

        const newUser = request.body.newUser
        validateAdminUpdateUser(newUser)
        newUser.password = bcrypt.hashSync(newUser.password)
        const oldUser = { user_uuid: request.auth.token.user_uuid }
        const consulta = await updateItem(request.body.newUser, request.body.oldUser,'usuarios')
        response.statusCode = 200
        response.send({ info: "Usuario modificado", data: consulta })
    } catch (error) {
        response.statusCode = 400
        console.warn(error.message)
        response.send("No se ha podido actualizar el usuario")
    }

}

module.exports = {
    updateUserForAdmin
}