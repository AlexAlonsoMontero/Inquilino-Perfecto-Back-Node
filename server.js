const { createNewUser, updateSelfUser, login, getSelfUser, updateUser,activateValidationUser, deleteUser, getUsers, logout } 
= require ('./controllers/userController')
const { searchMultiParams, searchMultiTableMultiParams } 
= require('./controllers/generalControllers')
const { detectTypeNoGuests, detectType, validateAuthorization, validateRolAdmin, validateRolCasero, validateRolInquilino, validateSelfOrAdmin} 
= require('./infrastructure/middlewares/checkRolMiddle')
const { updateUserForAdmin, getUsersForAdmin } 
= require('./controllers/adminController')
const { getPropertyByProp, getAllProperties, getPropertiesSelf, createNewProperty, modifyProperty, deleteProperty} 
= require ('./controllers/propertyController')
const { createAdvertisemenet,    getAdvertisements,    getAdvertisementByAdv, getAdvertisementSelf,    modifyAdvertisement,    deleteAdvertisement, getAdvertisementsMultiJoin } 
= require('./controllers/advertisementController')
const { getReservationByRes, getAllReservations, getReservationsSelf, createNewReservation, modifyReservation, deleteReservation } 
= require('./controllers/reservationController')
const { getReviewByRev, getAllReviews, getSelfReviews, createNewReview, modifyReview, deleteReview, getReviewAvg } 
= require('./controllers/reviewController')

const multer= require('multer')
const express = require('express')
const cors = require('cors')

const app = express()
const upload = multer()

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

//ENDPOINTS NoApi
const endpointVerifiacionUser = '/activation'
const endpointLogin = '/login';
const endpointLogout = '/logout';


//ENDPOINTS PROPERTIES
const endpointProperties = '/api/properties';
const endpointPropertiesByProp = '/api/properties/:inmueble_uuid';

//ENDPOINTS RESERVATIONS
const endpointReservations = '/api/reservations';
const endpointReservationsByRes = '/api/reservations/:reserva_uuid';

//ENDPOINTS REVIEWS
const endpointReviews = '/api/reviews';
const endpointReviewByRev = '/api/reviews/:resena_uuid';
const endpointReviewAvg = '/api/avg-reviews/:table/:avg_param'

//ENDPOSINTS SEARCHER
const endpointGenericSearcher='/search/:table';
const endpointGenericMultiSearcher='/searches/:table1/:table2/:t1key/:t2key';

//ENDPOINTS USER
const endpointUserProfile = '/api/users/:username';
const endpointUser = '/api/users';

//ENDPOINTS SELF
const endpointSelfAdvertisements = '/api/user/:username/advertisements';
const endpointSelfProperties = '/api/user/:username/properties';
const endpointSelfReservations = '/api/user/:username/reservations';
const endpointSelfReviews = '/api/user/:username/reviews';


//PRUEBAS ENDOPOINT
const endpointPruebas = '/pruebas/adv'

//RUTES

app.post(endpointLogin, login);
app.post(endpointLogout, validateAuthorization, logout);


//USUARIOS
app.get(endpointVerifiacionUser, activateValidationUser);
app.get(endpointUserProfile, validateAuthorization, validateSelfOrAdmin, getSelfUser);
app.get(endpointUser, validateAuthorization, detectTypeNoGuests, getUsers);
// app.post(endpointUser, createNewUser); //descomentar para crear el primer admin
app.post(endpointUser, detectType, upload.single('avatar'), createNewUser);
app.put(endpointAdminUsersUuid, validateAuthorization, validateRolAdmin, updateUser);
app.put(endpointUserProfile, validateAuthorization, detectTypeNoGuests, updateSelfUser);
app.delete(endpointUser, validateAuthorization, validateSelfOrAdmin, deleteUser);

//USER ADMIN
// app.post(endpointAdminUsers,validateAuthorization, validateRolAdmin, createNewUser);
// app.put(endpointAdminUsers,validateAuthorization,validateRolAdmin,updateUserForAdmin);
// app.delete(endpointAdminUsers,validateAuthorization,validateRolAdmin,deleteUser);
// app.get(endpointAdminUsers, validateAuthorization, validateRolAdmin, getUsersForAdmin);



//INMUEBLES
app.get(endpointProperties, validateAuthorization, validateRolAdmin, getAllProperties);
app.get(endpointPropertiesByProp, validateAuthorization, validateRolCasero, getPropertyByProp);
app.get(endpointSelfProperties, validateAuthorization, validateRolCasero, getPropertiesSelf);
// app.post(endpointProperties, validateAuthorization, validateRolCasero, uploadProps.array('propImgs',12), createNewProperty);
app.put(endpointPropertiesByProp, validateAuthorization, validateSelfOrAdmin, modifyProperty);
app.delete(endpointProperties, validateAuthorization, validateSelfOrAdmin, deleteProperty);



//ANUNCIOS
app.get(endpointAdv, detectType, getAdvertisementsMultiJoin);
app.get(enpointAdvByAdv, detectType, getAdvertisementByAdv);
app.get(endpointSelfAdvertisements, validateAuthorization, validateSelfOrAdmin, getAdvertisementSelf);
app.post(endpointAdv, validateAuthorization, validateRolCasero, createAdvertisemenet);
app.put(enpointAdvByAdv,  validateAuthorization, validateRolCasero, modifyAdvertisement);
app.delete(endpointAdv, validateAuthorization, validateRolCasero, deleteAdvertisement);


//RESERVAS
app.get(endpointAdminReservations, validateAuthorization, validateRolAdmin, getAllReservations);
app.get(endpointReservationsByRes, validateAuthorization, validateSelfOrAdmin, getReservationByRes);
app.get(endpointSelfReservations, validateAuthorization, validateSelfOrAdmin, getReservationsSelf);
app.post(endpointReservations, detectType, createNewReservation);
app.put(endpointReservationsByRes, validateAuthorization, validateSelfOrAdmin, modifyReservation);
app.delete(endpointReservations, validateAuthorization, validateSelfOrAdmin, deleteReservation);



//REVIEWS
app.get(endpointReviews, validateAuthorization, validateRolAdmin, getAllReviews);
app.get(endpointReviewByRev, detectType, getReviewByRev);
app.get(endpointSelfReviews, validateAuthorization, validateSelfOrAdmin, getSelfReviews);
app.get(endpointReviewAvg,getReviewAvg)
app.post(endpointReviews, detectTypeNoGuests, createNewReview);
app.put(endpointReviewByRev, detectTypeNoGuests, modifyReview);
app.delete(endpointReviews, detectTypeNoGuests, deleteReview);


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