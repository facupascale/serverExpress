const express = require('express')
const app = express()
const moment = require('moment')
let {Server: HttpServer} = require('http')
let {Server: SocketIO} = require('socket.io')
const PORT = 3000

// persistencia de datos con mariaDB
const { options } = require('./options/mariaDB.js')
const knex = require('knex')(options);
// persistencia de datos con sqlite3
const knexSqlite3 = require('knex')({
    client: 'sqlite3',
    connection: { filename: './mydb.sqlite' },
    useNullAsDefault: true
})


app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.set('view engine', 'ejs')
app.set('views', './views/ejs')

app.get('/', (req, res, next) => {
    res.render('index')
})

/* app.post('/personas', (req, res, next) => {
    personas.push(req.body)
    res.redirect('/')
}) */

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
    socket.on('from_front', data => {
        //let lengthUser = false;
        //if(students.length > 0 ) lengthUser = false;
        // if(lengthUser) {
        //     let tableExist = knexSqlite3.schema.hasTable('students')
        //     console.log(tableExist, 'soy table')
        //     if(!tableExist) { 
        //         knexSqlite3.schema.createTable('students', table => {
        //             table.string("id")
        //             table.string("email")
        //             table.string("user")
        //             table.string("message")
        //             table.string("date")
        //         })
        //     } else {
        //         console.log('Esta tabla existe')
        //     }
        //     if(auth(data, socket.id)) {
        //         students.push({...data, id: socket.id, date: moment().format('HH:mm DD-MM-YYYY')});
        //         knexSqlite3.from('students').insert(students)
        //             .then(() => console.log('Estudiante agregado'))
        //             .catch((err) => {console.log(err); throw err})
        //         students = []
        //         knexSqlite3.from('students').select('*')
        //             .then(data => io.sockets.emit('fill_message', data))
        //             .catch((err) => {console.log(err); throw err})
            
        //     } else {
        //         socket.emit('error', `El usuario ${data.email} ya esta en uso`);
        //     }
        // } else {
            let tableExist = knexSqlite3.schema.hasTable('students')
            if(!tableExist) { 
                knexSqlite3.schema.createTable('students', table => {
                    table.string("id")
                    table.string("email")
                    table.string("user")
                    table.string("message")
                    table.string("date")
                })
                .then(() => console.log('se creo correctamente'))
            } else {
                console.log('Esta tabla existe')
            }
            students.push({...data, id: socket.id, date: moment().format('HH:mm DD-MM-YYYY')})
            knexSqlite3.from('students').insert(students)
                .then(() => console.log('Estudiante agregado'))
                .catch((err) => {console.log(err); throw err})
            students = []
            knexSqlite3.from('students').select('*')
                .then(data => io.sockets.emit('fill_message', data))
                .catch((err) => {console.log(err); throw err})
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
