const express = require('express')
const { createNewUser, login } = require ('./controllers/usercontroller')
const app = express()

app.use(express.json())


const endpointUser = "/api/users";
const endpointProperties = "/api/properties";
const endpointReviews = "/api/reviews";
const endpointAdv = "/api/adv";

//LOGEO
app.post('/api/login', login, wrongUser)

//USUARIOS
app.get(endpointUser, getUser);
app.post(endpointUser, createNewUser);
app.put(endpointUser, modifyUser);
app.delete(endpointUser, deleteUser);

//INMUEBLES
app.get(endpointProperties, getProperty);
app.post(endpointProperties, createNewProperty);
app.put(endpointProperties, modifyProperty);
app.delete(endpointProperties, deleteProperty);

//RESEÑAS
app.get(endpointReviews,  getReview);
app.post(endpointReviews, createNewReview);
app.put(endpointReviews, modifyReview);
app.delete(endpointReviews, deleteReview);

//ANUNCIOS
app.get(endpointAdv, getAdvertisement);
app.post(endpointAdv, cretateNewAdvertisement);
app.put(endpointAdv, modifyAdvertisement);
app.delete(endpointAdv, deleteAdvertisement);

app.listen(3000)