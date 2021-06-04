const express = require('express')
const { createNewUser } = require ('./controllers/usercontroller')
const app = express()

app.use(express.json())

app.post('/api/users', createNewUser)
// app.post ('/api/users',login)



app.listen(3000)