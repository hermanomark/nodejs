const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const User = mongoose.model('users');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

router.get('/', ensureAuthenticated, (req, res) => {
    if (req.user.isAdmin === true) {
        User.find()
            .sort({date: 'desc'})
            .then(users => {
                req.flash('success_msg', 'Access to page accepted');
                res.render('users/index', {
                    users: users
                });
            });
    } else {
        req.flash('error_msg', 'Access to page denied');
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
        res.render('users/add');
    } else {
        req.flash('error_msg', 'Access to page denied');
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
        req.flash('error_msg', 'Access to page denied');
        res.redirect('/tickets');
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/tickets',
        failureRedirect: '/users/login',
        failureFlash: true
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
                    req.flash('error_msg', 'Email already reigstered');
                    res.redirect('/users/register');
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
                                    req.flash('success_msg', 'You are now registered and can log in');
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
    req.flash('success_msg', 'You are logged out');
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

    if (!req.body.email) {
        errors.push({text: 'Please add an email'});
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
                    req.flash('error_msg', 'Email already reigstered');
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
                                    req.flash('success_msg', 'User registered');
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

router.put('/:id', ensureAuthenticated, (req, res) => {
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

    if (!req.body.email) {
        errors.push({text: 'Please add an email'});
    }

    User.findOne({
        _id: req.params.id
    })
    .then(user => {
        if(errors.length > 0) {
            res.render('users/edit', {
                errors: errors,
                user: {
                    name: req.body.name,
                    email: req.body.email,
                    isSupport: isSupport,
                    isUser: isUser,
                    isAdmin: isAdmin
                }
            });
        } else {
            // new values
            user.name = req.body.name;
            user.email = req.body.email;
            user.isSupport = isSupport;
            user.isUser = isUser;
            user.isAdmin = isAdmin;

            user.save()
            .then(user => { 
                req.flash('success_msg', 'User updated');
                res.redirect('/users')
            });
        }
    });
});

router.delete('/:id', (req, res) => {
    User.remove({_id: req.params.id})
        .then(() => {
            req.flash('success_msg', 'User deleted');
            res.redirect('/users');
        });
});

module.exports = router;