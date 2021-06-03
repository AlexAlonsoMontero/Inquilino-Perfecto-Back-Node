require('dotenv').config()
const { validateNewUser } = require('../validators/uservalidator')
const { save } = require ('../infrastructure//userRepository.js')
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



const createInsert = (objeto, table) => {
    objeto.password = bcrypt.hashSync(objeto.password,10)
    
        const prepareStrintToDb = Object.values(objeto).map(value =>{
            return (!typeof(value)==='string' ?  value :  "'" + value +"'") //Prepara las string para bd, añadiendo ' 
        });
 
        const keys = Object.keys(objeto).toString()
        const values = prepareStrintToDb.toString()
        return `INSERT INTO ${table} (${keys}) VALUES (${values});`


}


const confirmLogin = (objeto) =>{
    
}


module.exports = {
    createNewUser
}