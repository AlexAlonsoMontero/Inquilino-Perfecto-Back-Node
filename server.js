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
const { createAdvertisemenet,    getAdvertisements,    getAdvertisementByAdv, getAdvertisementUser,    modifyAdvertisement,    deleteAdvertisement } 
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
const { uploadPropsMid, uploadRevsMid } = require('./infrastructure/middlewares/multerUploads')

app.use(cors())
app.use(express.urlencoded({extended: true}));
app.use(express.json()) 
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


//ENDPOINTS USER
const endpointUserProfile = '/api/users/:username';
const endpointUser = '/api/users';

//ENDPOINTS SELF
const endpointSelfAdvertisements = '/api/user/:username/advertisements';
const endpointSelfProperties = '/api/user/:username/properties';
const endpointSelfReservations = '/api/user/:username/reservations';
const endpointSelfReviews = '/api/user/:username/reviews';

//ENDPOINTS NoApi
const endpointVerifiacionUser = '/activation'
const endpointLogin = '/login';
const endpointLogout = '/logout';
    //ENDPOSINTS SEARCHER
        const endpointGenericSearcher='/search/:table';
        const endpointGenericMultiSearcher='/searches/:table1/:table2/:t1key/:t2key';


//RUTES LOGIN/LOGOUT
app.post(endpointLogin, login);
app.post(endpointLogout, validateAuthorization, logout);

// ficheros estáticos de la carpeta uploads
app.use('/uploadAvatars', express.static('uploadAvatars'))

//USUARIOS
app.get(endpointVerifiacionUser, activateValidationUser); //ok
app.get(endpointUserProfile, validateAuthorization, detectTypeNoGuests, getSelfUser); //ok
app.get(endpointUser, validateAuthorization, detectTypeNoGuests, getUsers); 
// app.post(endpointUser, createNewUser); //descomentar para crear el primer admin
app.post(endpointUser, detectType, upload.single('avatar'), createNewUser); //ok
app.put(endpointAdminUsersUuid, validateAuthorization, validateRolAdmin, updateUser); //ok
app.put(endpointUserProfile, validateAuthorization, detectTypeNoGuests, updateSelfUser); //ok
app.delete(endpointUser, validateAuthorization, detectTypeNoGuests, deleteUser); //ok

//INMUEBLES
app.get(endpointProperties, validateAuthorization, validateRolAdmin, getAllProperties); //ok
app.get(endpointPropertiesByProp, validateAuthorization, validateRolCasero, getPropertyByProp); //ok
app.get(endpointSelfProperties, validateAuthorization, validateRolCasero, getPropertiesSelf); //ok
app.post(endpointProperties, validateAuthorization, validateRolCasero, createNewProperty); //ok
//TODO upload imgs
    //uploadPropsMid, 
app.put(endpointPropertiesByProp, validateAuthorization, validateRolCasero, modifyProperty); //ok
//TODO actualizar imágenes
app.delete(endpointProperties, validateAuthorization, validateRolCasero, deleteProperty); //ok
//TODO borrar entradas de tabla imágenes al borrar

//ANUNCIOS
app.get(endpointAdv, detectType, getAdvertisements); //ok
app.get(enpointAdvByAdv, detectType, getAdvertisementByAdv); //ok
app.get(endpointSelfAdvertisements, detectType, getAdvertisementUser); //ok
app.post(endpointAdv, validateAuthorization, validateRolCasero, createAdvertisemenet); //ok
app.put(enpointAdvByAdv,  validateAuthorization, validateRolCasero, modifyAdvertisement); //ok
app.delete(endpointAdv, validateAuthorization, validateRolCasero, deleteAdvertisement); //ok

//RESERVAS
app.get(endpointReservations, validateAuthorization, validateRolAdmin, getAllReservations); //ok
app.get(endpointReservationsByRes, validateAuthorization, detectTypeNoGuests, getReservationByRes); //ok
app.get(endpointSelfReservations, validateAuthorization, detectTypeNoGuests, getReservationsSelf); //ok
app.post(endpointReservations, validateAuthorization, validateRolInquilino, createNewReservation); //ok
app.put(endpointReservationsByRes, validateAuthorization, validateRolCasero, modifyReservation); //ok
app.delete(endpointReservations, validateAuthorization, validateRolAdmin, deleteReservation); //ok



//REVIEWS
app.get(endpointReviews, validateAuthorization, validateRolAdmin, getAllReviews); //ok
app.get(endpointReviewByRev, detectType, getReviewByRev);
app.get(endpointSelfReviews, validateAuthorization, detectTypeNoGuests, getSelfReviews);
app.get(endpointReviewAvg, getReviewAvg) // Se puede obtener la puntuación haciendo check de los datos del inmueble
app.post(endpointReviews, detectTypeNoGuests, createNewReview);
app.put(endpointReviewByRev, detectTypeNoGuests, modifyReview);
app.delete(endpointReviews, detectTypeNoGuests, deleteReview);


//SEARCHER
app.get(endpointGenericSearcher, searchMultiParams)
app.get(endpointGenericMultiSearcher, searchMultiTableMultiParams)



//TODO PRUEBAS ENDOPOINT
const endpointPruebas = '/pruebas/adv'
//USER ADMIN
// app.post(endpointAdminUsers,validateAuthorization, validateRolAdmin, createNewUser);
// app.put(endpointAdminUsers,validateAuthorization,validateRolAdmin,updateUserForAdmin);
// app.delete(endpointAdminUsers,validateAuthorization,validateRolAdmin,deleteUser);
// app.get(endpointAdminUsers, validateAuthorization, validateRolAdmin, getUsersForAdmin);

let port = process.env.WEB_PORT
let host = process.env.WEB_HOST
app.listen(port, host, () => {
    console.log(`Server running at http//${host}:<${port}>`);
});