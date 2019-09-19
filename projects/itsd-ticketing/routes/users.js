const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const User = mongoose.model('users');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

router.get('/', ensureAuthenticated, (req, res) => {
    if (req.user.isAdmin === true) {
        console.log('Access to admin ' + req.user.email + ' has been accepted');
        User.find()
            .sort({date: 'desc'})
            .then(users => {
                res.render('users/index', {
                    users: users
                });
            });
    } else {
        console.log('You are not an admin');
        res.redirect('/tickets');
    }
});

router.get('/register', ensureGuest, (req, res) => {
    res.render('users/register');
});

router.get('/login', ensureGuest, (req, res) => {
    res.render('users/login');
});

router.get('/add', ensureAuthenticated, (req, res) => {
    if (req.user.isAdmin === true) {
        console.log('Access to admin ' + req.user.email + ' has been accepted');
        res.render('users/add');
    } else {
        console.log('You are not an admin');
        res.redirect('/tickets');
    }
});

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    if (req.user.isAdmin === true) {
        User.findOne({
            _id: req.params.id
        })
        .then(user => {
            res.render('users/edit', {
                user: user
            });
        });
    } else {
        console.log('You are not an admin');
        res.redirect('/tickets');
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/tickets',
        failureRedirect: '/users/login'
        // failureFlash: true
    })(req, res, next);
});

router.post('/register', (req, res) => {
    let errors = [];

    if (req.body.password !== req.body.password2) {
        errors.push({text: "Password do not match"});
    }

    if (req.body.password.length < 4) {
        errors.push({text: 'Password must be at least 4 characters'});
    }

    if (errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2
        });
    } else {
        User.findOne({email: req.body.email})
            .then(user => {
                if (user) {
                    // req.flash('error_msg', 'Email already reigstered');
                    res.redirect('/users/register')
                } else {
                    const newUser = new User ({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password,
                        user: true
                    });
            
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    // req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('/users/login');
                                })
                                .catch(err => {
                                    console.log(err);
                                    return;
                                })
                        });
                    });
                }
            });
    }
});

router.get('/logout', (req, res) => {
    req.logout();
    // req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

router.post('/add', (req, res) => {
    let errors = [];
    let isSupport;
    let isAdmin;
    let isUser;

    if (req.body.isSupport) {
        isSupport = true;
    } else {
        isSupport = false;
    }

    if (req.body.isAdmin) {
        isAdmin = true;
    } else {
        isAdmin = false;
    }

    if (req.body.isUser) {
        isUser = true;
    } else {
        isUser = false;
    }

    if (req.body.password !== req.body.password2) {
        errors.push({text: "Password do not match"});
    }

    if (req.body.password.length < 4) {
        errors.push({text: 'Password must be at least 4 characters'});
    }

    if (errors.length > 0) {
        res.render('users/add', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            isSupport: isSupport,
            isUser: isUser,
            isAdmin: isAdmin,
            password: req.body.password,
            password2: req.body.password2
        });
    } else {
        User.findOne({email: req.body.email})
            .then(user => {
                if (user) {
                    // req.flash('error_msg', 'Email already reigstered');
                    console.log('email is already registered')
                    res.redirect('/users/add')
                } else {
                    const newUser = new User ({
                        name: req.body.name,
                        email: req.body.email,
                        isSupport: isSupport,
                        isUser: isUser,
                        isAdmin: isAdmin,
                        password: req.body.password
                    });
            
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    // req.flash('success_msg', 'You are now registered and can log in');
                                    console.log('user successfully registered')
                                    res.redirect('/users');
                                })
                                .catch(err => {
                                    console.log(err);
                                    return;
                                })
                        });
                    });
                }
            });
    }
});

router.delete('/:id', (req, res) => {
    User.remove({_id: req.params.id})
        .then(() => {
            res.redirect('/users');
        });
});

module.exports = router;