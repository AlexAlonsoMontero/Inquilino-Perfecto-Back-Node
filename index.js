require ('dotenv').config()
const express = require ('express')
const { createInsert } = require('./initdb')
const { getConection } =require ('./db')
const app =  express()

app.use(express.json())

objUser1 = {
    pk_codigo_usuario: "'perlita'",
    nombre_usuario: "'ManoloPerlas'",
    password: "'password'",
    email: "'lll@lll.com'",
    nombre: "'Pablo'",
    bio: "'Asi soy yo un tio super majo, y super guay'",
    foto: "'ruta/de/la_foto.jpg'",
    es_casero: true,
    es_inquilino: true,
    telefono: "'999999999'"
}



const createUser = async(request,response) =>{
    
    try{
        const conect = getConection()
        const sentencia = createInsert(request.body,"usuarios");
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