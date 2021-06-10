const express = require('express')
const { createNewUser, login, getUser, modifyUser, deleteUser} = require ('./controllers/usercontroller')
const { validateAuthorization } = require('./controllers/generalControlers')
//prueba general repository
const { generalGet, generalFind,generalUpdate, generalDrop } = require ('./controllers/pruebaGeneralRepositories.js')

//***************************************************************************** */

const app = express()



app.use(express.json())

const endpointAddUser = '/api/users'
const endpointUser = "/api/users/";
const endpointProperties = "/api/properties";
const endpointReviews = "/api/reviews";
const endpointAdv = "/api/adv";


//PRUEBAS GENERAL REPOSITORY
app.get('/prueba/api/users', generalGet)
app.get('/prueba/api/finduser', generalFind)
app.get('/prueba/api/modifyuser',generalUpdate)
app.get('/prueba/api/dropuser', generalDrop)

//RUTES
app.post('/login',login)


//USUARIOS

app.get(endpointUser, validateAuthorization,getUser);
app.post(endpointAddUser, createNewUser);
app.put(endpointUser, validateAuthorization, modifyUser);
app.delete(endpointUser, deleteUser);

// //INMUEBLES
// app.get(endpointProperties, getProperty);
// app.post(endpointProperties, createNewProperty);
// app.put(endpointProperties, modifyProperty);
// app.delete(endpointProperties, deleteProperty);

// //RESEÑAS
// app.get(endpointReviews,  getReview);
// app.post(endpointReviews, createNewReview);
// app.put(endpointReviews, modifyReview);
// app.delete(endpointReviews, deleteReview);

// //ANUNCIOS
// app.get(endpointAdv, getAdvertisement);
// app.post(endpointAdv, cretateNewAdvertisement);
// app.put(endpointAdv, modifyAdvertisement);
// app.delete(endpointAdv, deleteAdvertisement);

app.listen(3000)