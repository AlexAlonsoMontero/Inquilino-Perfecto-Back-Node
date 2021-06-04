require('dotenv').config()
const { validateNewUser, validateLogin } = require('../validators/uservalidator')
const { save } = require ('../infrastructure/generalRepository')
const bcrypt  = require('bcrypt')
const jwt = require('jsonwebtoken')
const { response } = require('express')


const createNewUser = async (request,response) => {
    try{
        const newUser = validateNewUser(request.body)
        await save(newUser,'usuarios')
        response.statusCode = 201
        response.send("Usuario guardado")
    }catch(error){
        
        response.statusCode = 400
        response.send("No se ha podido añadir el usuario")
        
    }
}


const login = async(request,response) =>{
    console.log(request.body)
    if (validateLogin(request.body)){
        //await find (request.body.username)
        console.log("usuario validado")
        response.statusCode = 200
        response.send("Usuario validado")
    }else{
        console.warn("Formato de datos incorrecto")
        response.statusCode = 400
        response.send ("Usuario o contraseña incorrectos, revisa el formato de entrada")
    }

}


const confirmLogin = (objeto) =>{
    
}


module.exports = {
    createNewUser,
    login
}