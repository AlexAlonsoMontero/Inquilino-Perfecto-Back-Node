const express = require('express')
const { createNewUser, login } = require ('./controllers/usercontroller')
const { validateAuthorization } = require('./controllers/generalControlers')
const app = express()

app.use(express.json())


//RUTES
app.post('/api/login',login)
app.post('/api/users', createNewUser)

//USUARIOS
// app.get(endpointUser, getUser);
// app.post(endpointUser, createNewUser);
// app.put(endpointUser, modifyUser);
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
// app.get(endpointAdv, getAdvertisement);
// app.post(endpointAdv, cretateNewAdvertisement);
// app.put(endpointAdv, modifyAdvertisement);
// app.delete(endpointAdv, deleteAdvertisement);

app.listen(3000)