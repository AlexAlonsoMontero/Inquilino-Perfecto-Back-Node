const express = require('express')
const { createNewUser, login } = require ('./controllers/usercontroller')
const { validateAuthorization } = require('./controllers/generalControlers')
const app = express()

app.use(express.json())


//RUTES
app.post('/api/login',login, validateAuthorization)
app.post('/api/users', createNewUser)




app.listen(3000)