let { mongoose } = require('../config/mongoDb')
let { Schema, model } = mongoose;

// const messageSchema = new Schema({
//     id: { type: String, required: true },
//     nombre: { type: String, required: true },
//     apellido: { type: String, required: true },
//     edad: { type: Number, required: true },
//     alias: { type: String, required: true },
//     avatar: { type: String, required: true },
// })
//MONGO
const messageStudentSchema = new Schema({
    post: { type: Object, required: true }
})

let AuthorModel =  new model ('Author', messageStudentSchema);

//normalizr
const { schema, normalize, denormalize } = require("normalizr")

const student = new schema.Entity('author')
const messages = new schema.Entity('mensajes')
const post = new schema.Entity('post', {
    author: [student],
    posts: { mensajes: [messages]},
})

class ContenedorMongo {
    
    async postAdd(data) {
        const normalizeData = normalize(data, post)
        let authorModel = new AuthorModel({
            post: normalizeData
        })
        try {
            await authorModel.save();
            return true
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async getAll() {
        try {
            const data = await AuthorModel.find({})
            console.log(data, 'data')
            let posts = []
            data?.map(message => { 
                console.log(message.post, 'soy messagfe')
                posts.push(denormalize(message.post.result, post, message.post.entities))
            })
            return posts
        } catch (error) {
            console.log(error);
            return error;
        }
    }
}

module.exports = {ContenedorMongo}