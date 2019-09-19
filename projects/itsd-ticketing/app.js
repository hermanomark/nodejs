const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const passport = require('passport');
const mongoose = require('mongoose');

// Load Models
require('./models/User');
require('./models/Ticket');

// Load Routes
const index = require('./routes/index');
const users = require('./routes/users');
const tickets = require('./routes/tickets');

// Passport Config
require('./config/passport')(passport);

// Load Keys
const keys = require('./config/keys');

// Handlebars Helpers
const {
    select,
    formatDate,
    openTicket,
    adminRole
} = require('./helpers/hbs');

// Map global promises
mongoose.Promise = global.Promise;

// Mongoose Connect
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const app = express();

// Handlebars middleware
app.engine('handlebars', exphbs({
    helpers: {
        select: select,
        formatDate: formatDate,
        openTicket: openTicket,
        adminRole: adminRole
    },
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser moddileware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method Override Middleware
app.use(methodOverride('_method'));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware (must be after session middleware)
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function(req, res, next) {
    // res.locals.success_msg = req.flash('success_msg');
    // res.locals.error_msg = req.flash('error_msg');
    // res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Use Routes
app.use('/', index);
app.use('/users', users);
app.use('/tickets', tickets);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on ${port}`);
});