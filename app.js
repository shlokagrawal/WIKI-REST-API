const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
require('dotenv').config()

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

// Database initialization
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(process.env.DATABASE);
    console.log("Database Connected Successfully!");
}

const articleSchema = mongoose.Schema({
    title: String,
    content: String
});

const Article = mongoose.model("Article", articleSchema);

app.get("/",function (req,res) {
    res.send("call localhost:3000/articles");
});

// app.get("/articles", function (req,res) {
//     async function getArticles() {
//         const articles = await Article.find({});
//         res.send(articles);
//     }
//     getArticles();
// });

// now mongoose don't accept callback function so we have to write out our API like this.
app.get("/articles", async (req, res) => {
    try {
        const articles = await Article.find({});
        res.send(articles);
    } catch (err) {
        console.log(err);
    }
});

// way 1 
// app.post("/articles", async (req, res) => {
//     try {
//         const article = new Article({
//             title: req.body.title,
//             content: req.body.content
//         })
//         article.save();
//         res.send("Successfully Added a new Article.");
//     } catch (err) {
//         res.send(err);
//     }
// });

// way 2
// we can also write like this, which ever is favourable.
app.post("/articles", function (req,res) {
    async function addArticle(title, content) {
        try {
            const article = new Article({
                title: title,
                content: content
            })
            await article.save();
            res.send("Successfully Added a new Article.");
        } catch (error) {
            res.send(error);
        }  
    }
    addArticle(req.body.title, req.body.content);
})

app.delete("/articles", function (req,res) {
    async function deleteALL() {
        try {
            const result = await Article.deleteMany();
            res.send("Deleted - " + result.deletedCount + " Articles.");
        } catch (error) {
            res.send(error);
        }        
    }
    deleteALL();
})

// ///////////////////////////////// REQUEST TARGETING A SPECIFIC ARTICLE ///////////////////

app.get("/articles/:articleTitle", function (req,res) {
    async function findArticle(articleTitle) {
        try {
            const query = Article.where({ title: articleTitle });
            const article = await query.findOne();
            res.send(article);
        } catch (error) {
            res.send(error);
        }
    }
    findArticle(req.params.articleTitle);
})

// PUT - replaces whole document. 
// PATCH - replace part of document.
app.put("/articles/:articleTitle",function (req,res) {
    async function replaceArticle(articleTitle, newArticleTitle, newArticleContent) {
        try {
            const result = await Article.replaceOne({ title: articleTitle }, {title:newArticleTitle, content: newArticleContent });
            res.send("Replaced: "+result.acknowledged);
        } catch (error) {
            res.send(error);
        }
    }
    replaceArticle(req.params.articleTitle, req.body.title, req.body.content);
})

app.patch("/articles/:articleTitle",function (req,res) {
    async function updateArticle(articleTitle) {
        try {
            const result = await Article.updateOne({ title: articleTitle }, { $set: req.body });
            res.send("Updated: "+result.acknowledged)
        } catch (error) {
            console.log(error);
        }
    }
    updateArticle(req.params.articleTitle);
})

app.delete("/articles/:articleTitle", function (req,res) {
    async function deleteArticle(articleTitle){
        try {
            const result = await Article.deleteOne({ title: articleTitle});
            res.send("Deleted: "+result.deletedCount);
        } catch (error) {
            console.log(error);
        }
    }
    deleteArticle(req.params.articleTitle);
})


app.listen(3000, function() {
    console.log("Server started at port 3000!");
});