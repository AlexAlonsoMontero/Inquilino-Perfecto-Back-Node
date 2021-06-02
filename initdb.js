require('dotenv').config()
const { getConection } = require('./db')






// objUser = {
//     pk_codigo_usuario: "'perlita'",
//     nombre_usuario: "'ManoloPerlas'",
//     password: "'password'",
//     email: "'lll@lll.com'",
//     nombre: "'Pablo'",
//     bio: "'Asi soy yo un tio super majo, y super guay'",
//     foto: "'ruta/de/la_foto.jpg'",
//     es_casero: true,
//     es_inquilino: true,
//     telefono: "'999999999'"
// }

const createInsert = (objeto, table) => {
    
        const keys = Object.keys(objeto).toString()
        const values = Object.values(objeto).toString()
        return `INSERT INTO ${table} (${keys}) VALUES (${values});`
    


}


module.exports = {
    createInsert
}