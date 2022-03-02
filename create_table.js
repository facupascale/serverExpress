const { options } = require('./options/mariaDB.js')
const knex = require('knex')(options);

// Se crea una nueva tabla con la funcion createTable() del esquema Knex.js Definimos el esquema para que contenga tres columnasL: id, nomre y precio 

knex.schema.createTable('products', table => {
    table.increments('id')
    table.string('name')
    table.string('urlFoto')
    table.integer('price')
})
    .then(() => console.log('tabla creada'))
    .catch((err) => {console.log(err); throw err})
    .finally(() => { 
        knex.destroy()
    })