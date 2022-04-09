const express = require('express')
const app = express()
let {Server: HttpServer} = require('http')
let {Server: SocketIO} = require('socket.io')
const PORT = 3000
//faker js
const {faker} = require('@faker-js/faker')

// persistencia de datos con mariaDB
const { options } = require('./options/mariaDB.js')
const knex = require('knex')(options);

// persistencia de datos con sqlite3
const knexSqlite3 = require('knex')({
    client: 'sqlite3',
    connection: { filename: './mydb.sqlite' },
    useNullAsDefault: true
})

// persistencia de datos con MONGO
const {ContenedorMongo} = require('./database/messagesMongoDB')
let contenedor = new ContenedorMongo()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.set('view engine', 'ejs')
app.set('views', './views/ejs')

app.get('/', (req, res, next) => {
    res.render('index')
})

app.get('/products-test', (req, res, next) => {
    let products = [
        {name: faker.commerce.productName(), price: faker.commerce.price(), fotoUrl: faker.image.imageUrl()},
        {name: faker.commerce.productName(), price: faker.commerce.price(), fotoUrl: faker.image.imageUrl()},
        {name: faker.commerce.productName(), price: faker.commerce.price(), fotoUrl: faker.image.imageUrl()},
        {name: faker.commerce.productName(), price: faker.commerce.price(), fotoUrl: faker.image.imageUrl()},
        {name: faker.commerce.productName(), price: faker.commerce.price(), fotoUrl: faker.image.imageUrl()},
    ]
    res.render('products-test', {products: products})
}) 

let http = new HttpServer(app)
let io = new SocketIO(http)
let students = []
let products = []

io.on('connection', socket => {
    console.log('el cliente se conecto', socket.id);
    //formulario
    socket.emit('productsInit', products)
    socket.on('from_product', data => {
        let tableExist = knex.schema.hasTable('products')
        if(!tableExist) { 
            knex.schema.createTable('products', table => {
                table.increments("id").primary()
                table.string("name")
                table.float("price")      
                table.string("picUrl")
            })
        } else {
            console.log('Esta tabla ya existe')
        }
        knex.from('products').insert(data)
            .then(() => console.log('Producto agregado'))
            .catch((err) => {console.log(err); throw err})
        knex.from('products').select('*')
        .then(data => io.sockets.emit('fill_product', data))
        .catch((err) => {console.log(err); throw err})
    })


    // chat
    socket.emit('init', {students})
    socket.on('from_front', async data => {
        console.table(data)
                let student = {
                    id: socket.id,
                    author: [
                        {
                            id: data.email,
                            nombre: data.nombre,
                            apellido: data.apellido,
                            edad: data.edad,
                            alias: data.alias,
                            avatar: data.avatar
                        },
                    ],
                    posts: {
                        mensajes: [
                            {id: 'mensajes', mensajes: data.mensaje}
                        ]
                    }
                }
                await contenedor.postAdd(student)
                const result = await contenedor.getAll()
                io.sockets.emit('fill_message', result)
        }
    )
})

const auth = (data, socket_id) => { 
    let estudiante = students.find(st => st.id === socket_id);
    if(!estudiante) return false
    
    let email = students.find(st => st.email == data.email)
    if(!email) return false

    return true
}

http.listen(PORT, err => {
    console.log(`Server on http://localhost:${PORT}`)
})

/* const server = app.listen(PORT, () => {
    console.log(`Server on http://localhost:${server.address().port}`);
}) */

// server.on("error", error => console.log(error))
