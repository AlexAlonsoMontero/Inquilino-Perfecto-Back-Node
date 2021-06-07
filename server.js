const express = require('express')
const { createNewUser, login } = require ('./controllers/usercontroller')
const { validateAuthorization } = require('./controllers/generalControlers')
const app = express()

app.use(express.json())


//RUTES
app.post('/api/login',login, validateAuthorization)
app.post('/api/users', createNewUser)

//USUARIOS
app.get(endpointUser, async function(req, res) {
    console.log(req.body);
    try{
        const testQuery = "SELECT * FROM usuarios"
        console.log();
    }
    catch(err){
        console.log();
    }
});
app.post(endpointUser, createNewUser)
app.put(endpointUser, async function(req, res) {
    console.log(req.body);
    try{
        console.log();
    }
    catch(err){
        console.log();
    }
});
app.delete(endpointUser, async function(req, res) {
    console.log(req.body);
    try{
        console.log();
    }
    catch(err){
        console.log();
    }
});

//INMUEBLES
app.get(endpointProperties, async function(req, res) {
    console.log(req.body);
    try{
        const testQuery = "SELECT * FROM usuarios"
        console.log();
    }
    catch(err){
        console.log();
    }
});
app.post(endpointProperties, createPrp)
app.put(endpointProperties, async function(req, res) {
    console.log(req.body);
    try{
        console.log();
    }
    catch(err){
        console.log();
    }
});
app.delete(endpointProperties, async function(req, res) {
    console.log(req.body);
    try{
        console.log();
    }
    catch(err){
        console.log();
    }
});

//RESEÑAS
app.get(endpointReviews, async function(req, res) {
    console.log(req.body);
    try{
        const testQuery = "SELECT * FROM usuarios"
        console.log();
    }
    catch(err){
        console.log();
    }
});
app.post(endpointReviews, createRev)
app.put(endpointReviews, async function(req, res) {
    console.log(req.body);
    try{
        console.log();
    }
    catch(err){
        console.log();
    }
});
app.delete(endpointReviews, async function(req, res) {
    console.log(req.body);
    try{
        console.log();
    }
    catch(err){
        console.log();
    }
});

//ANUNCIOS
app.get(endpointAdv, async function(req, res) {
    console.log(req.body);
    try{
        const testQuery = "SELECT * FROM usuarios"
        console.log();
    }
    catch(err){
        console.log();
    }
});
app.post(endpointAdv, createAdv)
app.put(endpointAdv, async function(req, res) {
    console.log(req.body);
    try{
        console.log();
    }
    catch(err){
        console.log();
    }
});
app.delete(endpointAdv, async function(req, res) {
    console.log(req.body);
    try{
        console.log();
    }
    catch(err){
        console.log();
    }
});

app.listen(3000)