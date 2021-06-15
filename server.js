const express = require('express')
const { validateAuthorization } = require('./controllers/generalControlers')
const { createAdvertisemenet, findAdvertisement } = require('./controllers/advertisementController')

const { createNewUser, login, showUser, updateUser, deleteUser, getUsers } = require ('./controllers/usercontroller')

const app = express()

app.use(express.json())


//ENDPOINTS USER
const endpointUser = "/api/users/";
const endpointProperties = "/api/properties";
const endpointUserProfile = "/api/users/:username"
const endpointReviews = "/api/reviews";

//ENDPOINTS ADVERTISEMENT
const endpointAdv = "/api/adv";

//RUTES
app.post('/login',login)


//USUARIOS

app.get(endpointUserProfile, validateAuthorization,showUser);
app.post(endpointUser, createNewUser);
app.get(endpointUser,getUsers)
app.put(endpointUserProfile, validateAuthorization, updateUser);
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
// app.get(endpointAdv, findAdvertisement);
app.post(endpointAdv, createAdvertisemenet);
// app.put(endpointAdv, modifyAdvertisement);
// app.delete(endpointAdv, deleteAdvertisement);

app.listen(3000)