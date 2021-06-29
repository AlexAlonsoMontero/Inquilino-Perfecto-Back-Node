require('dotenv').config();
const express = require('express')
const { createAdvertisemenet, findAdvertisement, modifyAdvertisement, getAllAdvertisements, deleteAdvertisement } = require('./controllers/advertisementController')
const { createNewUser, login, showUser, updateUser, deleteUser, getUsers, logout } = require ('./controllers/userController')
const { getProperty, getAllProperties, getUserProperties, createNewProperty, modifyProperty, deleteProperty} = require ('./controllers/propertyController')
const { validateAuthorization,validateRolAdmin, searchMultiParams, searchMultiTableMultiParams } = require('./controllers/generalControlers')
const { updateUserForAdmin, getUsersForAdmin } = require('./controllers/adminControler')

const app = express()
app.use(express.json())


//ENDPOINTS ADMIN USER
const endpointAdvAdmin = '/api/admin/adv'
const endpointAdminUsers='/api/admin/users'
//ENDPOINTS ADVERTISEMENT
const enpointAdvByUser = "/api/adv/:usr_casero_uuid/:estado";
const enpointAdvByAdv = "/api/adv/:anuncio_uuid";
const endpointAdv = '/api/adv/'
//ENDPOINTS LOGIN
const endpointLogin = '/login';
const endpointLogout = '/logout'
//ENDPOINTS PROPERTIES
const endpointProperties = "/api/properties";
const endpointPropertiesByProp = "/api/properties/:inmueble_uuid";
const endpointPropertiesByUser = '/api/properties/:usr_casero_uuid/:inmueble_uuid';
//ENDPOINTS RESERVATIONS
const endpointReservations = "/api/reservations";
//ENDPOINTS REVIEWS
const endpointReviews = "/api/reviews";
//ENDPOSINTS SEARCHER
const endpointGenericSearcher='/search/:table'
const endpointGenericMultiSearcher='/searches/:table1/:table2/:t1key/:t2key'
//ENDPOINTS USER
const endpointUser = "/api/users";
const endpointUserProfile = "/api/users/:username"



//RUTES

app.post(endpointLogin, login)
app.post(endpointLogout, validateAuthorization, logout)


//USUARIOS
app.get(endpointUserProfile, validateAuthorization,showUser);
app.post(endpointUser, createNewUser);
app.get(endpointUser,validateAuthorization, getUsers);
app.put(endpointUserProfile, validateAuthorization, updateUser);
app.delete(endpointUser, validateAuthorization, validateRolAdmin, deleteUser);



//USER ADMIN
app.post(endpointAdminUsers,validateAuthorization, validateRolAdmin, createNewUser)
app.put(endpointAdminUsers,validateAuthorization,validateRolAdmin,updateUserForAdmin)
app.delete(endpointAdminUsers,validateAuthorization,validateRolAdmin,deleteUser)
app.get(endpointAdminUsers, validateAuthorization, validateRolAdmin, getUsersForAdmin)



//INMUEBLES
app.get(endpointProperties, getAllProperties);
app.get(endpointPropertiesByProp, getProperty);
app.get(endpointPropertiesByUser, getUserProperties);
app.post(endpointProperties, createNewProperty);
app.put(endpointPropertiesByProp, modifyProperty);
app.delete(endpointProperties, deleteProperty);



//ANUNCIOS
app.get(endpointAdvAdmin, validateAuthorization, validateRolAdmin, getAllAdvertisements);
// app.get(enpointAdvByUser, getAdvertisementByUser);
// app.get(enpointAdvByAdv, getAdvertisementByAdv);
// app.get(endpointAdv, getAllVisibleAdvertisements);
// app.post(endpointAdv, createAdvertisemenet);
// app.put(enpointAdvByAdv, modifyAdvertisement);
// app.delete(endpointAdv, deleteAdvertisement);



//RESERVAS
// app.get(endpointAdminReservations, getAllReservations);
// app.get(endpointReservationsUsers, getReservation);
// app.post(endpointReservations, cretateNewReservation);
// app.put(endpointReservations, modifyReservation);
// app.delete(endpointReservations, deleteReservation);



//REVIEWS
// app.get(endpointReviews,  getReview);
// app.post(endpointReviews, createNewReview);
// app.put(endpointReviews, modifyReview);
// app.delete(endpointReviews, deleteReview);



//SEARCHER
app.get(endpointGenericSearcher, searchMultiParams)
app.get(endpointGenericMultiSearcher, searchMultiTableMultiParams)



let port = process.env.WEB_PORT
let host = process.env.WEB_HOST
app.listen(port, host, () => {
    console.log(`Server running at http//${host}:<${port}>`);
});