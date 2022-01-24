// GET /api/productos => devuelve todos los productos
// GET /api/productos/:id => devuelve un producto segun su id
// POST /api/productos => recibe y agrega un producto, y lo devuelve con su id asignado
// PUT /api/productos/:id => recibe y actualiza un producto segun su id
// DELETE /api/productos/:id => elimina un producto segun su id

const express = require("express");
const app = express();
const PORT = 8080;
const router = require('./routes')

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/api', router)

const server = app.listen(PORT, () => {
    console.log(`Server on http://localhost:${server.address().port}`);
})

server.on("error", error => console.log(error))
