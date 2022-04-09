const mongoose = require('mongoose');
const { mongo_db } = require('./index');

const MONGO_URI = `${mongo_db.uri}/${mongo_db.name}`;
const MONGO_ATLAS = `${mongo_db.mongo_atlas}`;

let connection; 

(async () => {
    try {
        connection = await mongoose.connect(MONGO_ATLAS, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('Conectado a Mongo Atlas');
    } catch (error){
        console.log('Error al conectar a Mongo Atlas', error);
    }
})();

module.exports = { connection, mongoose }