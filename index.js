const Contenedor = require('./productClass')
const express = require("express");
const app = express();
const PORT = 3000;

let contenedor = new Contenedor('./bd.txt')

app.get("/", (req, res, next)=>{
    res.send(`<h1 style="color:blue">Hola, bienvenidos a mi servidor</h1>`);
})

app.get("/productos", (req, res, next)=>{
    res.json(contenedor.getAll());
})

app.get("/productoRandom", (req, res, next)=>{
    console.log(res)
    res.json(contenedor.getByIdRandom());
})

const server = app.listen(PORT, ()=>{
    console.log(`Server on http://localhost:${PORT}`);
})

server.on("error", error => console.log(error))