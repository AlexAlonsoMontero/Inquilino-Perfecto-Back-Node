require('dotenv').config()
const { getConection } = require('./db')

const createInsert = (objeto, table) => {
        const prepareStrintToDb = Object.values(objeto).map(value =>{
            return (!typeof(value)==='string' ?  value :  "'" + value +"'") //Prepara las string para bd, añadiendo ' 
        });
 
        const keys = Object.keys(objeto).toString()
        const values = prepareStrintToDb.toString()
        console.log( `INSERT INTO ${table} (${keys}) VALUES (${values});`)
        return `INSERT INTO ${table} (${keys}) VALUES (${values});`


}


module.exports = {
    createInsert
}