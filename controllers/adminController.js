require('dotenv').config()
const bcrypt = require('bcryptjs')
const { validateAdminUpdateUser,validateNewUser } = require('../validators/userValidator')
const { updateItem, findItem, getItems,save } = require('../infrastructure/generalRepository')

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


const getUsersForAdmin = async(request, response) => {
    try{
        let users=""
        if(Object.keys(request.query).length===0){
            users = await getItems('usuarios')
        }else{
            users = await findItem(request.query,'usuarios')
        }
        if(!users){
            console.warn("No se ha localizado usuario")
            response.status(400).send("No existen usuarios para los parametros de búsqueda")
        }else{
            response.status(200).send({ info: "Usuarios localizados",   data: users})
        }

    }catch(error){
        console.warn(error.message)
        response.status(400).response.send("No se han localizado usuarios por los parametros sollicitados")
    }
}

const createNewAdminUser = async (request, response) => {
    try {
        console.log("entra")
        const newUser = validateNewUser(request.body)
        await save(newUser, 'usuarios')
        response.statusCode = 201
        response.send({
            info: "usuario guardado",
            newUser
        })
    
    } catch (error) {

        response.statusCode = 400
        console.warn(error.message)
        response.send("No se ha podido añadir el usuario")

    }

}


module.exports = {
    updateUserForAdmin,
    getUsersForAdmin,
    createNewAdminUser
}