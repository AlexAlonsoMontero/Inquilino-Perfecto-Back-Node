
// FUNCTION SAVE IN generalRepository.js

const { validateLogin } = require('../validators/uservalidator')
const { getConnection } = require('./bd/db')



const find = async (username) => {
    const connection = getConnection()
    connection.query(`SELECT * FROM usuarios WHERE username=?`,username,function(err,results){
        console.log(results)
    })

}

const get = async (id) => {

}

