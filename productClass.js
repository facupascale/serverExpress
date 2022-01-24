//const fs = require('fs')

class Producto {
	constructor(title, price) {
		this.title = title
		this.price = price
	}
}


class Contenedor {
	constructor(file = '', productos = []) {
		this.file = file
		this.productos = productos
	}

	getAll() {
		return this.productos
	}

	getById(id) {
		let findProduct = this.productos.find((prod) => prod.id == id)
		if (findProduct === undefined) {
			return {error: 'Producto no encontrado'}
		} else {
			return findProduct
		}
	}

	postById(title, price) {
		let newProduct = new Producto(title, price)
		this.productos.push(newProduct)
		newProduct.id = this.productos.length + 1
		return newProduct
	}

	actualiceById(title, price, id) {
		const index = this.productos.findIndex((prod) => prod.id == id)
		this.productos[index] = {
			title: title,
			price: price,
			id: id,
		}
		return this.productos[index]
	}

	deleteById(id) {
		const productos = this.productos.filter((prod) => prod.id != id)
		this.productos = productos
	}

}

module.exports = Contenedor
