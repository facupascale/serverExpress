const fs = require('fs')

class Contenedor {
	constructor(file = '') {
		this.file = file

		try {
			this.personas = fs.readFileSync(this.file, 'utf-8')
			this.personas = JSON.parse(this.personas)
		} catch (err) {
			this.personas = []
		}
	}

    getAll() {
        return this.personas
    }

	getByIdRandom() {
        let idRandom = Math.floor(Math.random() * ((3 + 1) - 1) + 1)
		let persona = this.personas
		for (let i = 0; i < persona.length; i++) {
			if(persona[i].id === idRandom){
				return persona[i]
			}
		}
	}

}

module.exports = Contenedor

//prueba.save('facundo', 'pascale')
//prueba.save('ailen', 'pascale')
//prueba.save('vico', 'pascale')
//prueba.getById(3)
//prueba.getById(5)
//prueba.getById(20)
//prueba.getAll()
//prueba.deletedById(1)
//prueba.deleteAll()