const express = require('express')
const { createNewUser, login } = require ('./controllers/usercontroller')
const app = express()

app.use(express.json())


//RUTES
app.post('/api/login',login)
app.post('/api/users', createNewUser)




app.listen(3000)