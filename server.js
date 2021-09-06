const {
    createNewUser,
    updateSelfUser,
    login,
    getSelfUser,
    updateUser,
    activateValidationUser,
    deleteUser,
    getUsers,
    logout
} = require('./controllers/userController')
const {
    searchMultiParams,
    searchMultiTableMultiParams,
    getImages
} = require('./controllers/generalControllers')
const {
    detectTypeNoGuests,
    detectType,
    validateAuthorization,
    validateRolAdmin,
    validateRolCasero,
    validateRolInquilino,
    validateSelfOrAdmin
} = require('./infrastructure/middlewares/checkRolMiddle')
const {
    getPropertyByProp,
    getAllProperties,
    getPropertiesSelf,
    createNewProperty,
    modifyProperty,
    deleteProperty
} = require('./controllers/propertyController')
const {
    createAdvertisemenet,
    getAdvertisements,
    getAdvertisementByAdv,
    getAdvertisementUser,
    modifyAdvertisement,
    deleteAdvertisement
} = require('./controllers/advertisementController')
const {
    getReservationByUUID,
    getAllReservations,
    getReservationsSelf,
    createNewReservation,
    modifyReservation,
    deleteReservation,
    getInquilinoReservations
} = require('./controllers/reservationController')
const {
    getReviewByRev,
    getAllReviews,
    getSelfReviews,
    createNewReview,
    modifyReview,
    deleteReview,
    getReviewAvg
} = require('./controllers/reviewController')
const {
    storageProp,
    storageRev,
    storageUpdateProp,
    storageUpdateRev
} = require('./infrastructure/utils/multerUploads')


const multer = require('multer')
const express = require('express')
const cors = require('cors')
const { addListener } = require('nodemon')

const app = express()
const upload = multer()
const uploadPropCreation = multer({
    storage: storageProp
})
const uploadRevCreation = multer({
    storage: storageRev
})
const uploadPropUpdate = multer({
    storage: storageUpdateProp
})
const uploadRevsUpdate = multer({
    storage: storageUpdateRev
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));
app.use('/uploadAvatars', express.static('uploadAvatars'))
app.use('/imgs', express.static('imgs'))


require('dotenv').config();

//ENDPOINTS ADVERTISEMENT
const enpointAdvByAdv = '/api/adv/:anuncio_uuid';
const endpointAdv = '/api/adv/'
const endpointAdvByProp = '/api/adv/prop/:inmueble_uuid'
const endpointAdvByUser = '/api/adv/user/:usr_caser_uuid'

//ENDPOINTS PROPERTIES
const endpointProperties = '/api/properties';
const endpointPropertiesByProp = '/api/properties/:inmueble_uuid';

//ENDPOINTS RESERVATIONS
const endpointReservations = '/api/reservations';
const endpointReservationsByRes = '/api/reservations/:reserva_uuid';
const endpointReservationsByInmueble = '/api/reservations/property/:inmueble_uuid';
const endpointReservationsByUserUUID = '/api/reservations/user/:usr_casero_uuid';
const endpointReservationsInquilino = '/api/reservations/:rol/:usr_inquilino_uuid'


//ENDPOINTS REVIEWS
const endpointReviews = '/api/reviews';
const endpointReviewByRev = '/api/reviews-uuid/';
const endpointReviewAvg = '/api/avg-reviews/:table/:avg_param'

//ENDPOINTS USER
const endpointUserProfile = '/api/users/:username';
const endpointUser = '/api/users';

//ENDPOINTS SELF
const endpointSelfAdvertisements = '/api/self/advertisements/:username';
const endpointSelfProperties = '/api/self/properties/:username';
const endpointSelfReservations = '/api/self/reservations/:username';
const endpointSelfReviews = '/api/self/reviews/:username';

//ENDPOINTS NoApi
const endpointVerifiacionUser = '/activation'
const endpointLogin = '/login';
const endpointLogout = '/logout';

//ENDPOINT IMAGES
const endpointImages = '/img/:table/'

//RUTES LOGIN/LOGOUT
app.post(endpointLogin, login);
app.post(endpointLogout, validateAuthorization, logout);

// ficheros estáticos de la carpeta uploads
app.use('/uploadAvatars', express.static('uploadAvatars'))

// app.use((req, res, next) => {
//     console.log('peticion', req.url);
//     console.log('método', req.method)
//     next();
// })


//USUARIOS
// app.post(endpointUser, createNewUser); //descomentar para crear el primer admin
app.get(endpointVerifiacionUser, activateValidationUser); //ok
app.get(endpointUserProfile, validateAuthorization, detectTypeNoGuests, getSelfUser); //ok
app.get(endpointUser, validateAuthorization, detectTypeNoGuests, getUsers);
app.post(endpointUser, detectType, upload.single('avatar'), createNewUser); //ok
app.put(endpointUser, validateAuthorization, validateRolAdmin, updateUser); //ok
app.put(endpointUserProfile, validateAuthorization, detectTypeNoGuests, upload.single('avatar'), updateSelfUser); //ok

app.delete(endpointUser, validateAuthorization, detectTypeNoGuests, deleteUser); //ok

//INMUEBLES
app.get(endpointProperties, validateAuthorization, getAllProperties); //ok
app.get(endpointPropertiesByProp, validateAuthorization, validateRolCasero, getPropertyByProp); //ok
app.get(endpointSelfProperties, validateAuthorization, validateRolCasero, getPropertiesSelf); //ok
app.post(endpointProperties, validateAuthorization, validateRolCasero, uploadPropCreation.array('file', 12), createNewProperty); //ok
app.put(endpointPropertiesByProp, validateAuthorization, validateRolCasero, uploadPropUpdate.array('file', 12), modifyProperty); //ok
app.delete(endpointProperties, validateAuthorization, validateRolCasero, deleteProperty); //ok

//ANUNCIOS
app.get(endpointAdv, detectType, getAdvertisements); //ok
app.get(enpointAdvByAdv, detectType, getAdvertisementByAdv); //ok
app.get(endpointSelfAdvertisements, detectType, getAdvertisementUser); //ok
app.post(endpointAdv, validateAuthorization, validateRolCasero, createAdvertisemenet); //ok
app.put(enpointAdvByAdv, validateAuthorization, validateRolCasero, modifyAdvertisement); //ok
app.delete(endpointAdv, validateAuthorization, validateRolCasero, deleteAdvertisement); //ok
app.get(endpointAdvByProp, validateAuthorization,getAdvertisementByAdv)
app.get(endpointAdvByUser, validateAuthorization,getAdvertisementByAdv)

//RESERVAS
app.get(endpointReservations, validateAuthorization, validateRolCasero, getAllReservations); //ok
app.get(endpointReservationsByRes, validateAuthorization, detectTypeNoGuests, getReservationByUUID); //ok
app.get(endpointReservationsByInmueble,validateAuthorization,detectTypeNoGuests,getReservationByUUID)
app.get(endpointReservationsByUserUUID,validateAuthorization,detectTypeNoGuests,getReservationByUUID)
app.get(endpointSelfReservations, validateAuthorization, detectTypeNoGuests, getReservationsSelf); //ok
app.post(endpointReservations, validateAuthorization, validateRolInquilino, createNewReservation); //ok
app.put(endpointReservationsByRes, validateAuthorization, validateRolCasero, modifyReservation); //ok
app.delete(endpointReservations, validateAuthorization, validateRolAdmin, deleteReservation); //ok
//RESERVAS INQUILINO
app.get(endpointReservationsInquilino,validateAuthorization,validateRolInquilino,getInquilinoReservations)




//REVIEWS
app.get(endpointReviews, validateAuthorization, validateRolAdmin, getAllReviews); //ok
app.get(endpointReviewByRev, detectType, getReviewByRev); //ok
app.get(endpointSelfReviews, validateAuthorization, detectTypeNoGuests, getSelfReviews); //ok
app.get(endpointReviewAvg, getReviewAvg) // Se puede obtener la puntuación haciendo check de los datos del inmueble
app.post(endpointReviews, validateAuthorization, detectTypeNoGuests,  createNewReview); //ok uploadRevCreation.array('imgsrevs', 12),
app.put(endpointReviewByRev, validateAuthorization, detectTypeNoGuests,  modifyReview); //ok uploadRevsUpdate.array('imgsrevs', 12),
app.delete(endpointReviews, validateAuthorization, detectTypeNoGuests, deleteReview); //ok

//IMAGES
app.get(endpointImages, getImages)



let port = process.env.WEB_PORT
let host = process.env.WEB_HOST
app.listen(port, host, () => {
    console.log(`Server running at http//${host}:<${port}>`);
});