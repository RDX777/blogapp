const mongoose = require("mongoose")

mongoose.Promise = global.Promise

mongoose.connect("mongodb://10.1.0.2:27017/aprendendo", {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => {
    console.log("Conectado com sucesso");
}).catch((MongoError) => {
    console.log("Erro ao conectar: " + MongoError)
})

const UsuarioSchema = mongoose.Schema({
    nome: {
        type: String,
        require: true
    },
    sobrenome: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    idade: {
        type: Number,
        require: true,
    },
    pais: {
        type: String,
        require: false
    }
})

mongoose.model('usuarios', UsuarioSchema)

const usuario = mongoose.model('usuarios')

new usuario({
    nome: "Nome do usuario",
    sobrenome: "Sobrenome do usuario",
    email: "email@a-mail.com",
    idade: 23,
    pais: "Brasil"
}).save().then(() => {
    console.log('Salvo com sucesso')
}).catch((erro) => {
    console.log("Erro ao cadastrar: " + erro)
})