var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, '/angularApp/dist')));
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost/basic_mongoose');

var AuthorSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3 },
    quotes: [{
        quote: { type: String, required: true, minlength: 3 },
        rating: { type: Number, default: 0 }
    }]
}, { timestamps: true });
mongoose.model('Author', AuthorSchema);
var Author = mongoose.model('Author');

app.get('/authors', (req,res) => {
    Author.find({}, (err, authors)=>{
        if (err){
            res.json({ message: "Error", error: err });
        }
        else {
            res.json({ message: "Success", authors: authors });
        }
    })
});

app.get('/author/:id', (req,res) => {
    Author.findOne({ _id: req.params.id }, (err, author)=>{
        if (err){
            res.json({ message: "Error", error: err });
        }
        else {
            res.json({ author: author });
        }
    })
});

app.post('/addAuthor', (req,res) =>{
    let newAuthor = new Author( req.body );
    newAuthor.save((err)=>{
        if (err){
            res.json({ message: "Error", error: err });
        } 
        else{
            res.json({ message: "Success. New author has been added." });
        }
    });
});

app.delete('/deleteQuote/:author_id/:quote_id', (req,res)=>{
    Author.findOne({ _id: req.params.author_id }, (err, author)=>{
        if (err){
            res.json({ message:"Error", error: err });
        }
        else{
            for(var i = 0; i < author.quotes.length; i++) {
                if(author.quotes[i]._id == req.params.quote_id) {
                    author.quotes.splice(i, 1);
                    break;
                }
            }
            author.save(err => {
                if (err){
                    res.json({ message: "Error", error: err });
                } else{
                    res.json({ message: "Success. Requested quote has been removed."})
                }
            })
        }
    });
});

app.post('/addQuote/:id', (req,res) => {
    Author.findOne({ _id: req.params.id }, (err,author)=>{
        if (err){
            res.json({ message: "Error", error: err });
        } else{
            author.quotes.push({ 'quote': req.body.quote });
            author.save(err =>{
                if (err){
                    res.json({ message: "Error", error: err });
                } else{
                    res.json({ message: "Success. New quote has been added." });
                }
            });
        }
    });
});

app.put('/updateAuthor', function(req, res){
    Author.update({ _id: req.body['_id'] }, req.body, { runValidators: true }, function(err, data){
        if (err){
            res.json({ message: "Error", error: err});
        }
        else{
            res.json({ message: path.join("Success. Requested author has been updated.") });
        } 
    });
});

app.put('/voteQuote/:author_id/:quote_id', (req,res)=>{
    Author.findOne({ _id: req.params.author_id }, (err, author)=>{
        if (err){
            res.json({ message:"Error", error: err });
        }
        else{
            for(var i = 0; i < author.quotes.length; i++) {
                if(author.quotes[i]._id == req.params.quote_id) {
                    author.quotes[i].rating += req.body.vote;
                    break;
                }
            }
            author.save(err => {
                if (err){
                    res.json({ message: "Error", error: err });
                } else{
                    res.json({ message: "Success. Your vote has been counted."})
                }
            });
        }
    });       
});

app.get('*', (req,res,next) => {
    res.sendFile(path.resolve('./angularApp/dist/index.html'));
});

app.listen(8000);