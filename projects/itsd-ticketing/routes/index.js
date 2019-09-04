const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

router.get('/', ensureGuest, (req, res) => {
    res.render('index/welcome');
});

router.get('/about', (req, res) => {
    res.render('index/about');
});

module.exports = router;