const express = require('express')
// const { createNewUser, login, findUser, modifyUser, deleteUser} = require ('./controllers/usercontroller')
const { validateAuthorization } = require('./controllers/generalControlers')
// const { createAdvertisemenet, findAdvertisement } = require('./controllers/advertisementController')



const { createNewUser, login, showUser } = require ('./controllers/usercontroller')
//prueba general repository
const { generalGet, generalFind,generalUpdate, generalDrop } = require ('./controllers/pruebaGeneralRepositories.js')

//***************************************************************************** */
/*
GUIA
GET SELECT TODOS LOS ELEMENTOS
GET SELECT TODOS LOS ELEMENTOS DE UN ITEM PARAM
GET FILTER QUERY
DROP INSERT Y UPDATE SE PASAN LOS DATOSS EN EL
*/ 
const app = express()



app.use(express.json())


//ENDPOINTS USER
const endpoinUsers = "/api/users/";
const endpointProperties = "/api/properties";
const endpointUserProfile = "/api/users/:username"
const endpointReviews = "/api/reviews";

//ENDPOINTS ADVERTISEMENT
const endpointAdv = "/api/adv";

//PRUEBAS GENERAL REPOSITORY
app.get('/prueba/api/users', generalGet)
app.get('/prueba/api/finduser', generalFind)
app.get('/prueba/api/modifyuser',generalUpdate)
app.get('/prueba/api/dropuser', generalDrop)

//RUTES
app.post('/login',login)


//USUARIOS

/app.get(endpointUserProfile, validateAuthorization,showUser);
app.post(endpoinUsers, createNewUser);
// app.get(endpointUserProfile,*********)
// app.put(endpointUser, validateAuthorization, modifyUser);
// app.delete(endpointUser, deleteUser);

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
// app.get(endpointAdv, findAdvertisement);
// app.post(endpointAdv, createAdvertisemenet);
// app.put(endpointAdv, modifyAdvertisement);
// app.delete(endpointAdv, deleteAdvertisement);

app.listen(3000)