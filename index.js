require ('dotenv').config()
const express = require ('express')
const { createInsert } = require('./initdb')
const { getConection } =require ('./db')
const { createValidatedUser } = require('./helper')
const app =  express()

app.use(express.json())

objUser1 = {
    user_uuid: 111111111111,
    username: "'ManoloPerlas'",
    password: "'password'",
    email: "'lll@lll.com'",
    tipo_usuario: "'CASERO'"
}

const createUser = async(request,response) =>{
    
    try{
        const conect = getConection()
        const user = createValidatedUser(request.body)
        const sentencia = createInsert(user,"usuarios");
        await conect.query(sentencia)
        response.statusCode = 200
        response.send("Add user to db")

    }catch(error){
        response.statusCode = 401
        response.send(error.message)
    }
}

app.post('/api/users',createUser)


app.listen(3000)