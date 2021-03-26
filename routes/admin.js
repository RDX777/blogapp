const express = require("express")
const router = express.Router()

const mongoose = require("mongoose")

require("../models/Categoria")
const Categoria = mongoose.model("categorias")

require("../models/Postagem")
const Postagem = mongoose.model("postagem")

const {eAdmin} = require("../helpers/eAdmin")

router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) => {
    res.send("Pagina posts do painel adm")
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).lean().then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) =>{
        req.flash("error_msg", "Erro ao listar")
        res.redirect("/admin")
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", eAdmin, (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: "Nome Invalido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({text: "Slug Invalido"})
    }

    if (req.body.nome.length < 2){
        erros.push({text: "Nome da categoria pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao cadastrar a categora")
            res.redirect("/admin")
        })
    }
})

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) =>{
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Essa categoria não existe")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "houve um erro interno ao salvar a edição da categoria")
            res.redirect("/admin/categorias")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria removida com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um problema para remover esta categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", eAdmin, (req, res) => {
    Postagem.find().lean().populate("categoria_fk").sort({data: "desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
        //res.json(postagens)
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })

})

router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formularios")
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", eAdmin, (req, res) => {
    
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({text: "Categoria invalida, registre uma categoria"})
    }

    if(erros.length > 0) {
        res.render("admin/addpostagem", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria_fk: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao cadastrar a postagem: " + err)
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) =>{
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {postagem: postagem, categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario de edição")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/edit", eAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.categoria_fk = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((erro) => {
            req.flash("error_msg", "Erro interno" + erro)
            res.redirect("/admin/postagens")
        })

    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao editar a postagem: " + erro)
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao deletar a postagem: " + erro)
        res.redirect("/admin/postagens")
    })
})

module.exports = router