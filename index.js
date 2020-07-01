// Library Imports
const express = require("express");
const app = express();  
const bodyParser = require("body-parser");
const session = require("express-session");
const connection = require("./database/database");

// Import Control Routes
const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const userController = require("./user/UserController");

//Import Models
const Category = require("./categories/Category");
const Article = require("./articles/Article");
const User = require("./user/User");

// View engine
app.set('view engine', 'ejs');  

// Sessions
app.use(session({
    secret: "zxcvlmaoiregjasdlçfkas",
    cookie: {maxAge: 300000}
}));

// Static
app.use(express.static('public'));

// Body Parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Database Connection
connection
    .authenticate()
    .then(() => {
        console.log("Conexão realizada com sucesso!");
    })
    .catch((err) =>{
        console.log(err);
    });


// Control Routes
app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", userController);

// Main Route    
app.get("/", (req, res) => {

    Article.findAll({
        order: [
            ['id', 'DESC']
        ],
        limit: 4
    }).then(articles => {
        Category.findAll({
            oder: [
                ['id', 'DESC']
            ]
        }).then(categories => {
            res.render("index", {articles: articles, categories: categories})
        });
    });
});

// Slug Article Route
app.get("/:slug", (req, res) => {
    var slug = req.params.slug;

    Article.findOne({
        where: {slug: slug}
    }).then(article => {
        if(article != undefined) {
            Category.findAll().then(categories => {
                res.render("article", {
                    article: article,
                    categories: categories
                });
            });
        } else {
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
        console.log(err);
    });
});

// Slug Category Route
app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug;

    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}]
    }).then(category => {
        if(category != undefined) {           
            Category.findAll().then(categories => {
                res.render("index", {
                    articles: category.articles,
                    categories: categories
                });
            });
        } else {
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    })
});

// Port Connection
app.listen(8080, () => {
    console.log("O servidor está rodando");
});