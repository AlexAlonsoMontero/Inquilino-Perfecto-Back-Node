const { createNewUser, updateSelfUser, login, getSelfUser, updateUser, deleteUser, getUsers, logout } 
= require ('./controllers/userController')
const { searchMultiParams, searchMultiTableMultiParams } 
= require('./controllers/generalControllers')
const { detectType, validateAuthorization, validateRolAdmin, validateRolCasero, validateRolInquilino, validateSelfOrAdmin} 
= require('./infrastructure/middlewares/checkRolMiddle')
const { updateUserForAdmin, getUsersForAdmin } 
= require('./controllers/adminController')
const { getProperty, getAllProperties, getUserProperties, createNewProperty, modifyProperty, deleteProperty} 
= require ('./controllers/propertyController')
const { createAdvertisemenet,    getAdvertisements,    getAllVisibleAdvertisements,    getAdvertisementByUser,    getAdvertisementByAdv,    modifyAdvertisement,    deleteAdvertisement } 
= require('./controllers/advertisementController')
const { getReservationsByUsers, getReservationByRes, getAllReservations, getReservationsSelfInvolved, createNewReservation, modifyReservation, deleteReservation } 
= require('./controllers/reservationController')
const { getReviewByRev, getAllReviews, createNewReview, modifyReview, deleteReview } 
= require('./controllers/reviewController')

const multer= require('multer')
const express = require('express')
const cors = require('cors')
const upload = multer()
const app = express()
app.use(express.json())
app.use(cors())
app.use('/uploadAvatars', express.static('uploadAvatars'))

require('dotenv').config();

//ENDPOINTS ADMIN USER
const endpointAdminAdv = '/api/admin/adv';
const endpointAdminUsers='/api/admin/users';
const endpointAdminUsersUuid='/api/admin/users/:user_uuid';
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
const endpointUserProfile = '/api/users/:username';
const endpointUser = '/api/users';

//ENDPOINTS SELF
const endpointSelfAdvertisements = '/api/users/advertisements';
const endpointSelfProfile = '/api/users';
const endpointSelfProperties = '/api/users/properties';
const endpointSelfReservations = '/api/users/reservations';
const endpointSelfReviews = '/api/users/reviews';


//RUTES

app.post(endpointLogin, login);
app.post(endpointLogout, validateAuthorization, logout);


//USUARIOS
//TODO get por tipo de usuario
app.get(endpointUserProfile, validateAuthorization, validateSelfOrAdmin, getSelfUser);
// app.post(endpointUser, createNewUser); //descomentar para crear el primer admin
app.post(endpointUser, detectType, upload.single('avatar'), createNewUser);
app.get(endpointUser, validateAuthorization, validateRolCasero, getUsers);
app.put(endpointAdminUsersUuid, validateAuthorization, validateRolAdmin, updateUser);
app.put(endpointUserProfile, validateAuthorization, validateSelfOrAdmin, updateSelfUser);
app.delete(endpointUser, validateAuthorization, validateSelfOrAdmin, deleteUser);

//USER ADMIN
app.post(endpointAdminUsers,validateAuthorization, validateRolAdmin, createNewUser);
app.put(endpointAdminUsers,validateAuthorization,validateRolAdmin,updateUserForAdmin);
app.delete(endpointAdminUsers,validateAuthorization,validateRolAdmin,deleteUser);
app.get(endpointAdminUsers, validateAuthorization, validateRolAdmin, getUsersForAdmin);



//INMUEBLES
app.get(endpointProperties, getAllProperties);
app.get(endpointPropertiesByProp, getProperty);
app.get(endpointPropertiesByUser, getUserProperties);//done multi params search
app.post(endpointProperties, createNewProperty);
app.put(endpointPropertiesByProp, modifyProperty);
app.delete(endpointProperties, deleteProperty);



//ANUNCIOS
app.get(endpointAdv, detectType, getAdvertisements);
app.get(endpointAdminAdv, detectType, getAdvertisements);
app.post(endpointAdv, validateAuthorization, validateRolCasero, createAdvertisemenet);
app.put(enpointAdvByAdv, validateAuthorization, validateSelfOrAdmin, modifyAdvertisement);
app.delete(endpointAdv, validateAuthorization, validateSelfOrAdmin, deleteAdvertisement);



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

// Servimos los ficheros estáticos de la carpeta uploads
app.use('/uploadAvatars', express.static('uploadAvatars'))


let port = process.env.WEB_PORT
let host = process.env.WEB_HOST
app.listen(port, host, () => {
    console.log(`Server running at http//${host}:<${port}>`);
});