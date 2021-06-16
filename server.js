require('dotenv').config();
const express = require('express')
const { createAdvertisemenet, findAdvertisement } = require('./controllers/advertisementController')
const { createNewUser, login, showUser, updateUser, deleteUser, getUsers } = require ('./controllers/userController')
const { getProperty, getAllProperties, getUserProperties, createNewProperty, modifyProperty, deleteProperty} = require ('./controllers/propertyController')
const { validateAuthorization } = require('./controllers/generalControlers')


const app = express()
app.use(express.json())


//ENDPOINTS ADVERTISEMENT
const endpointAdv = "/api/adv";
//ENDPOINTS LOGIN
const endpointLogin = '/login';
//ENDPOINTS PROPERTIES
const endpointProperties = "/api/properties";
const endpointPropertiesByUser = '/api/properties/:usr_casero_uuid';
//ENDPOINTS RESERVATIONS
const endpointReservations = "/api/reservations";
//ENDPOINTS REVIEWS
const endpointReviews = "/api/reviews";
//ENDPOINTS USER
const endpointUser = "/api/users";
const endpointUserProfile = "/api/users/:username"


//RUTES
app.post(endpointLogin,login)


//USUARIOS
app.get(endpointUserProfile, validateAuthorization,showUser);
app.post(endpointUser, createNewUser);
app.get(endpointUser,getUsers)
app.put(endpointUserProfile, validateAuthorization, updateUser);
app.delete(endpointUser, deleteUser);


//INMUEBLES
app.get(endpointProperties, getProperty);
app.post(endpointProperties, createNewProperty);
app.get(endpointPropertiesByUser, getUserProperties);
app.put(endpointProperties, modifyProperty);
app.delete(endpointProperties, deleteProperty);


// //ANUNCIOS
// app.get(endpointAdv, findAdvertisement);
app.post(endpointAdv, createAdvertisemenet);
// app.put(endpointAdv, modifyAdvertisement);
// app.delete(endpointAdv, deleteAdvertisement);


//REVIEWS
// app.get(endpointReviews,  getReview);
// app.post(endpointReviews, createNewReview);
// app.put(endpointReviews, modifyReview);
// app.delete(endpointReviews, deleteReview);


//RESERVAS
// app.get(endpointReservations, getReservation);
// app.post(endpointReservations, cretateNewReservation);
// app.put(endpointReservations, modifyReservation);
// app.delete(endpointReservations, deleteReservation);


let port = process.env.WEB_PORT
let host = process.env.WEB_HOST
app.listen(port, host, () => {
    console.log(`Server running at http//${host}:<${port}>`);
});