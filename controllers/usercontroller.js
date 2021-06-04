require('dotenv').config()
const { validateNewUser } = require('../validators/uservalidator')
const { save } = require ('../infrastructure/generalRepository')
const bcrypt  = require('bcrypt')


const createNewUser = async (request,response) => {
    try{
        const newUser = validateNewUser(request.body)
        await save(newUser,'usuarios')
        response.statusCode = 201
        response.send("Usuario guardado")
    }catch(error){
        
        response.statusCode = 401
        response.send(error.message)
        
    }
}


const login = (request,resposee) =>{

}


const confirmLogin = (objeto) =>{
    
}


module.exports = {
    createNewUser
}