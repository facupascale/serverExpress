const Contenedor = require('./productClass')
const express = require("express");
const {Router} = express
const router = Router()

let contenedor = new Contenedor('./bd.txt')

router.get("/", (req, res, next) => {
    res.send(`<h1 style="color:blue">Hola, bienvenidos a mi servidor</h1>`);
})

router.get("/productos", (req, res, next) => {
    res.json(contenedor.getAll());
})

router.get("/productos/:id", (req, res, next) => {
    let id = req.params.id
    res.json(contenedor.getById(id));
})


router.post("/productos", (req, res, next) => {
    const {title, price} = req.body
    res.json(contenedor.postById(title, price));
})


router.put("/productos/:id", (req, res, next) => {
    let id = req.params.id
    let title = req.body.title
    let price = req.body.price
    res.json(contenedor.actualiceById(title, price, id))
})

router.delete("/productos/:id", (req, res, next) => {
    let id = req.params.id
    res.json(contenedor.deleteById(id))
})

module.exports = router
