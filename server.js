const { createNewUser, login, showUser, updateUser, deleteUser, getUsers, logout } = require ('./controllers/userController')
const { searchMultiParams, searchMultiTableMultiParams } = require('./controllers/generalControllers')
const { validateAuthorization, validateRolAdmin, validateRolCasero, validateRolInquilino} = require('./infrastructure/middlewares/checkRolMiddle')
const { updateUserForAdmin, getUsersForAdmin, createNewAdminUser } = require('./controllers/adminController')
const { getProperty, getAllProperties, getUserProperties, createNewProperty, modifyProperty, deleteProperty} = require ('./controllers/propertyController')
const { createAdvertisemenet,    getAllAdvertisements,    getAllVisibleAdvertisements,    getAdvertisementByUser,    getAdvertisementByAdv,    modifyAdvertisement,    deleteAdvertisement } = require('./controllers/advertisementController')
const { getReservationsByUsers, getReservationByRes, getAllReservations, getReservationsSelfInvolved, createNewReservation, modifyReservation, deleteReservation } = require('./controllers/reservationController')
const { getReviewByRev, getAllReviews, createNewReview, modifyReview, deleteReview } = require('./controllers/reviewController')
require('dotenv').config();
const express = require('express')
const app = express()
app.use(express.json())


//ENDPOINTS ADMIN USER
const endpointAdminAdv = '/api/admin/adv';
const endpointAdminUsers='/api/admin/users';
const endpointAdminReviews = '/api/admin/reviews';
const endpointAdminReservations = '/api/admin/reservations';

//ENDPOINTS ADVERTISEMENT
const enpointAdvByUser = '/api/adv/:usr_casero_uuid/:estado';
const enpointAdvByAdv = '/api/adv/:anuncio_uuid';
const endpointAdv = '/api/adv/'

//ENDPOINTS LOGIN
const endpointLogin = '/login';
const endpointLogout = '/logout';

//ENDPOINTS PROPERTIES
const endpointProperties = '/api/properties';
const endpointPropertiesByProp = '/api/properties/:inmueble_uuid';
const endpointPropertiesByUser = '/api/properties/:usr_casero_uuid/:inmueble_uuid';

//ENDPOINTS RESERVATIONS
const endpointReservations = '/api/reservations';
const endpointReservationsByUsers = '/api/reservations/:usr_casero_uuid/:usr_inquilino_uuid';
const endpointReservationsByRes = '/api/reservations/:alquiler_uuid';

//ENDPOINTS REVIEWS
const endpointReviews = '/api/reviews';
const endpointReviewByRev = '/api/reviews/:resena_uuid';
const endpointReviewByUsr = '/api/reviews/:usr_casero_uuid/:usr_inquilino_uuid';

//ENDPOSINTS SEARCHER
const endpointGenericSearcher='/search/:table';
const endpointGenericMultiSearcher='/searches/:table1/:table2/:t1key/:t2key';

//ENDPOINTS USER
const endpointUser = '/api/users';
const endpointUserProfile = '/api/users/:username';

//ENDPOINTS SELF
const endpointSelfAdvertisements = '/api/user/:username/advertisements';
const endpointSelfProfile = '/api/users/me';
const endpointSelfProperties = '/api/user/:username/properties';
const endpointSelfReservations = '/api/user/:username/reservations';
const endpointSelfReviews = '/api/user/:username/reviews';


//RUTES

app.post(endpointLogin, login);
app.post(endpointLogout, validateAuthorization, logout);


//USUARIOS
app.get(endpointUserProfile, validateAuthorization,showUser);
app.post(endpointUser, createNewUser);
app.get(endpointUser,validateAuthorization, getUsers);
app.put(endpointUserProfile, validateAuthorization, updateUser);
app.delete(endpointUser, validateAuthorization, validateRolAdmin, deleteUser);



//USER ADMIN
app.post(endpointAdminUsers,validateAuthorization, validateRolAdmin, createNewUser);
app.put(endpointAdminUsers,validateAuthorization,validateRolAdmin,updateUserForAdmin);
app.delete(endpointAdminUsers,validateAuthorization,validateRolAdmin,deleteUser);
app.get(endpointAdminUsers, validateAuthorization, validateRolAdmin, getUsersForAdmin);



//INMUEBLES
app.get(endpointProperties, getAllProperties); //admin
app.get(endpointPropertiesByProp, getProperty);
app.get(endpointPropertiesByUser, getUserProperties);//done multi params search
app.post(endpointProperties, createNewProperty);
app.put(endpointPropertiesByProp, modifyProperty);
app.delete(endpointProperties, deleteProperty);



//ANUNCIOS
// app.get(endpointAdminAdv, validateAuthorization, validateRolAdmin, getAllAdvertisements);
app.get(endpointAdminAdv, getAllAdvertisements);
app.get(enpointAdvByUser, getAdvertisementByUser);
app.get(enpointAdvByUser, getAdvertisementByUser);
app.get(enpointAdvByAdv, getAdvertisementByAdv);
app.get(endpointAdv, getAllVisibleAdvertisements);
app.post(endpointAdv, createAdvertisemenet);
app.put(enpointAdvByAdv, modifyAdvertisement);
app.delete(endpointAdv, deleteAdvertisement); //check existencia de reserva



//RESERVAS
app.get(endpointAdminReservations, getAllReservations);
app.get(endpointReservationsByUsers, getReservationsByUsers);
app.get(endpointSelfReservations, getReservationsSelfInvolved);
app.get(endpointReservationsByRes, getReservationByRes);
app.post(endpointReservations,  createNewReservation);
app.put(endpointReservationsByRes, modifyReservation);
app.delete(endpointReservations, deleteReservation);



//REVIEWS
app.get(endpointAdminReviews,  getAllReviews);
app.get(endpointReviewByRev,  getReviewByRev);
app.post(endpointReviews, createNewReview);
app.put(endpointReviewByRev, modifyReview);
app.delete(endpointReviews, deleteReview);


//SEARCHER
app.get(endpointGenericSearcher, searchMultiParams)
app.get(endpointGenericMultiSearcher, searchMultiTableMultiParams)



let port = process.env.WEB_PORT
let host = process.env.WEB_HOST
app.listen(port, host, () => {
    console.log(`Server running at http//${host}:<${port}>`);
});