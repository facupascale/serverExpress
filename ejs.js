const express = require('express')
const app = express()
const moment = require('moment')
let {Server: HttpServer} = require('http')
let {Server: SocketIO} = require('socket.io')
const PORT = 3000


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
let users = []
let products = []

io.on('connection', socket => {
    console.log('el cliente se conecto', socket.id);
    //formulario
    socket.emit('productsInit', products)
    socket.on('from_product', data => {
        products.push({...data, id: products.length + 1})
        io.sockets.emit('fill_product', products)
    })


    // chat
    socket.emit('init', {students, users})
    socket.on('from_front', data => {
        let lengthUser = false;
        if(students.length > 0 ) lengthUser = false;
        if(lengthUser) {
            if(auth(data, socket.id)) {
                users.push({email: data.email, id: socket.id, date: moment().format('HH:mm DD-MM-YYYY') });
                students.push({...data, id: socket.id, date: moment().format('HH:mm DD-MM-YYYY')});
            io.sockets.emit('fill_message', 
            students)
            } else {
                socket.emit('error', `El usuario ${data.email} ya esta en uso`);
            }
        } else {
            users.push({email: data.email, id: socket.id, status: 'active'})
            students.push({...data, id: socket.id, date: moment().format('HH:mm DD-MM-YYYY')})
            io.sockets.emit('fill_message', students)
        }
    })
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
