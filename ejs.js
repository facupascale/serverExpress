const express = require('express')
const app = express()
const PORT = 3000
let personas = []

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.set('views', './views/ejs')

app.get('/', (req, res, next) => {
    res.render('index', {personas})
})

app.post('/personas', (req, res, next) => {
    personas.push(req.body)
    res.redirect('/')
})

const server = app.listen(PORT, () => {
    console.log(`Server on http://localhost:${server.address().port}`);
})

server.on("error", error => console.log(error))
