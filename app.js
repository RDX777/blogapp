// Carregando modulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const app = express()
    const bodyParser = require('body-parser')
    const mongoose = require('mongoose')
    const admin = require("./routes/admin")
    const usuarios = require("./routes/usuario")
    const path = require('path') //manipula pastas
    const session = require("express-session")
    const flash = require("connect-flash")
    require("./models/Postagem")
    const Postagem = mongoose.model("postagem")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    
    const passport = require("passport")
    require("./config/auth")(passport)

    const db = require("./config/db")

// Configurações
    //Sessão
        app.use(session({
            secret: "crusnodenode",
            resave: true,
            saveUninitialized: true
        }))
        //configuração de sessão
        app.use(passport.initialize())
        app.use(passport.session())
        //Configuração de flash
        app.use(flash())
    //middlwwares
        app.use((req, res, next) =>{
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })
    //body parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    //handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI, {
            useNewUrlParser: true, 
            useUnifiedTopology: true
            }).then(() => {
            console.log("Conectado ao banco de dados mongo")
        }).catch((err) => {
            console.log("Erro ao se conectar no banco: " + err)
        })
    // pasta Public
        app.use(express.static(path.join(__dirname, 'public')))
//Rotas
    app.get('/', (req, res) => {

        Postagem.find().lean().populate("categoria_fk").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                Postagem.find({categoria_fk: categoria._id}).lean().then((postagens =>{
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                    //res.json({postagens: postagens, categoria: categoria})
                }))
            }else{
                req.flash("error_msg", "Houve um erro ao listar os posts")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao listar as categorias")
            res.redirect("/")
        })
    })

    app.get("/404", (req, res) => {
        res.send("Erro 404")
    })

    app.use('/admin', admin)

    app.use("/usuarios", usuarios)

//Outro
const PORT = process.env.Port || 8081
app.listen(PORT, () => {
    console.log("Servidor iniciado na porta: " + PORT)
})

