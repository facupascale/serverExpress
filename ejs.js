const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const session = require('express-session')
const https = require('https')
let {Server: SocketIO} = require('socket.io')
const PORT = 8080
const fs = require('fs');

// ----------------- Persistencia con MARIADB -----------------
const { options } = require('./options/mariaDB.js')
const knex = require('knex')(options);
// ------------------------------------------------------------

// ----------------- Persistencia con SQLITE3 -----------------
const knexSqlite3 = require('knex')({
    client: 'sqlite3',
    connection: { filename: './mydb.sqlite' },
    useNullAsDefault: true
})
// ------------------------------------------------------------

// ------------------ Persistencia con MONGODB ------------------
const {ContenedorMongo} = require('./database/messagesMongoDB')
let contenedor = new ContenedorMongo()
// ------------------------------------------------------------


app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.set('view engine', 'ejs')
app.set('views', './views/ejs')

app.get('/datos', (req, res, next) => {
    res.render('index')
})

app.get('/', (req, res, next) => {
    res.redirect('/login')
})

app.get('/login', (req, res, next) => { 
    res.render('login')
})

// ------------------------- FAKER ---------------------------------
const {faker} = require('@faker-js/faker')

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
// -----------------------------------------------------------------

// ------------------------ MONGO SESSION --------------------------
const MongoStore = require('connect-mongo')
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }

app.use(cookieParser())
app.use(session({
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://facundo:facu2410@finalcoder.wazuo.mongodb.net/serverexpress?retryWrites=true&w=majority', mongoOptions: advancedOptions }),
    secret: 'sh',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: false,
        secure: true,
        maxAge: 600 * 1000,
        sameSite: 'none'
        } 
    
}))
// -----------------------------------------------------------------

// ------------ PASSPORT & PASSPORT-FACEBOOK ------------
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

app.use(passport.initialize());
app.use(passport.session())

passport.use(new FacebookStrategy({
        clientID: '1109957979550535',
        clientSecret: 'fbbba54e037299cf10268200917f1351',
        callbackUrl: 'https://localhost:8080/auth/facebook/callback'
    },
        function(accesToken, refreshToken, profile, done) {
            console.log(profile, 'soy profile')
            User.findOrCreate(profile.id, function(err, user) {
                if(err) return done(err);
                done(null, user);
            })
        }
))

app.get('/auth/facebook', passport.authenticate('facebook'))
app.get('/auth/facebook/callback', passport.authenticate('facebook', 
            {   succesRedirect: 'products-test',
                failureRedirect: 'error'
            }))

// --------------------------------------------------------

// ------------------ SESSIONS ------------------

app.post('/loginUsername', (req, res, next) => {
    req.session.user = {
        username: req.body.username,
        password: req.body.password,
    }
    req.session.save(err => {
        if(err) {
            console.log(err)
        } else {
            res.status(200).send(req.session.user)
        }
    })
})

app.get('/end', (req, res, next) => {
    req.session.destroy(err => {
        if(err) {
            console.log(err)
        } else {
            res.status(200).send('session destroyed')
        }
    })
})

// ---------------------------------------------------

// --------------------- Https ----------------------

const httpsOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
}

const httpsServer = https.createServer(httpsOptions, app);

// ------------------------- SOCKET productos => MARIADB, chat => MONGODB  -------------------------
let io = new SocketIO(httpsServer)
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

const server = httpsServer.listen(PORT,'localhost', (err) => {
    if (err) {
        console.log("Error while starting server")
    } else {
        console.log(`Servidor https escuchando en el puerto ${server.address().port}
                        Open link to https://localhost:${server.address().port}`)
        }
    }
)

server.on('error', error => {
    console.log(error)
})