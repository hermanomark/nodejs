const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// How middleware works
// app.use(function(req, res, next) {
//     console.log(Date.now());
//     req.name = 'Mark Hermano';
//     next();
// });

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', {
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');

// Handlebars middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Body parser moddileware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Index Route
app.get('/', (req, res) => {
    // console.log(req.name);
    // res.send('INDEX');
    const title = 'Welcome';
    res.render('index', {
        title: title
    });
});

// About Route
app.get('/about', (req, res) => {
    // res.send('ABOUT1');
    res.render('about');
});

// Idea Index Page
app.get('/ideas', (req, res) => {
    Idea.find({})
        .sort({date:'desc'})
        .then(ideas => {
            res.render('ideas/index', {
                ideas:ideas
            });
        });
});

// Add Idea Form
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');
});

// Process Form
app.post('/ideas', (req, res) => {
    // console.log(req.body);
    // res.send('ok');
    let errors = [];

    if (!req.body.title) {
        errors.push({text: 'Please add a title'});
    }
    if (!req.body.details) {
        errors.push({text: 'Please add some details'});
    }

    if(errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        // res.send('passed');
        const newUser = {
            title: req.body.title,
            details: req.body.details
        }

        new Idea(newUser)
            .save()
            .then(idea => {
                res.redirect('/ideas');
            });
    }
});

const port = 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});