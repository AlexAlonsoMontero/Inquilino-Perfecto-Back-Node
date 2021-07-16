const { createNewUser, updateSelfUser, login, getSelfUser, updateUser,activateValidationUser, deleteUser, getUsers, logout } 
= require ('./controllers/userController')
const { searchMultiParams, searchMultiTableMultiParams } 
= require('./controllers/generalControllers')
const { detectType, validateAuthorization, validateRolAdmin, validateRolCasero, validateRolInquilino, validateSelfOrAdmin} 
= require('./infrastructure/middlewares/checkRolMiddle')
const { updateUserForAdmin, getUsersForAdmin } 
= require('./controllers/adminController')
const { getProperty, getAllProperties, getPropertiesSelf, createNewProperty, modifyProperty, deleteProperty} 
= require ('./controllers/propertyController')
const { createAdvertisemenet,    getAdvertisements,    getAdvertisementByAdv, getAdvertisementSelf,    modifyAdvertisement,    deleteAdvertisement } 
= require('./controllers/advertisementController')
const { getReservationByRes, getAllReservations, getReservationsSelf, createNewReservation, modifyReservation, deleteReservation } 
= require('./controllers/reservationController')
const { getReviewByRev, getAllReviews, getSelfReviews, createNewReview, modifyReview, deleteReview } 
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
const endpointAdminUsers='/api/admin/users';
const endpointAdminUsersUuid='/api/admin/users/:user_uuid';
const endpointAdminReviews = '/api/admin/reviews';
const endpointAdminReservations = '/api/admin/reservations';


//ENDPOINTS ADVERTISEMENT
const enpointAdvByAdv = '/api/adv/:anuncio_uuid';
const endpointAdv = '/api/adv/'

//ENDPOINTS LOGIN  
const endpointLogin = '/login';
const endpointLogout = '/logout';


//ENDPOINTS PROPERTIES
const endpointProperties = '/api/properties';
const endpointPropertiesByProp = '/api/properties/:inmueble_uuid';

//ENDPOINTS RESERVATIONS
const endpointReservations = '/api/reservations';
const endpointReservationsByRes = '/api/reservations/:alquiler_uuid';

//ENDPOINTS REVIEWS
const endpointReviews = '/api/reviews';
const endpointReviewByRev = '/api/reviews/:resena_uuid';

//ENDPOSINTS SEARCHER
const endpointGenericSearcher='/search/:table';
const endpointGenericMultiSearcher='/searches/:table1/:table2/:t1key/:t2key';

//ENDPOINTS USER
const endpointUserProfile = '/api/users/:username';
const endpointUser = '/api/users';
const endpointVerifiacionUser = '/verification'

//ENDPOINTS SELF
const endpointSelfAdvertisements = '/api/users/advertisements';
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
app.get(endpointVerifiacionUser, activateValidationUser);  
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
app.get(endpointProperties, validateAuthorization, validateRolAdmin, getAllProperties); //TODO QUERY PARAMS
app.get(endpointPropertiesByProp, validateAuthorization, validateSelfOrAdmin, getProperty);
app.get(endpointSelfProperties, validateAuthorization, validateSelfOrAdmin, getPropertiesSelf); //TODO
app.post(endpointProperties, validateAuthorization, validateRolCasero, createNewProperty);
app.put(endpointPropertiesByProp, validateAuthorization, validateSelfOrAdmin, modifyProperty);
app.delete(endpointProperties, validateAuthorization, validateSelfOrAdmin, deleteProperty);



//ANUNCIOS
app.get(endpointAdv, detectType, getAdvertisements);
app.get(enpointAdvByAdv, detectType, getAdvertisementByAdv);
app.get(endpointSelfAdvertisements, validateAuthorization, validateSelfOrAdmin, getAdvertisementSelf); //TODO
app.post(endpointAdv, validateAuthorization, validateRolCasero, createAdvertisemenet);
app.put(enpointAdvByAdv, validateAuthorization, validateSelfOrAdmin, modifyAdvertisement);
app.delete(endpointAdv, validateAuthorization, validateSelfOrAdmin, deleteAdvertisement);



//RESERVAS
app.get(endpointAdminReservations, validateAuthorization, validateRolAdmin, getAllReservations); //TODO query params
app.get(endpointReservationsByRes, validateAuthorization, validateSelfOrAdmin, getReservationByRes);
app.get(endpointSelfReservations, validateAuthorization, validateSelfOrAdmin, getReservationsSelf);
app.post(endpointReservations, detectType, createNewReservation);
app.put(endpointReservationsByRes, validateAuthorization, validateSelfOrAdmin, modifyReservation);
app.delete(endpointReservations, validateAuthorization, validateSelfOrAdmin, deleteReservation);



//REVIEWS
app.get(endpointReviews, validateAuthorization, validateRolAdmin, getAllReviews); //TODO QUERYS
//create detect registred, restringe a no registrados
app.get(endpointReviewByRev, detectType, getReviewByRev);
app.get(endpointSelfReviews, validateAuthorization, validateSelfOrAdmin, getSelfReviews);
app.post(endpointReviews, createNewReview);
//create detect registred, restringe a no registrados
//create repository middle where it checks user is involved with reservation
//TODO CHECK IF USER HAS RESERVATION
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