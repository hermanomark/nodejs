const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');

router.get('/', ensureAuthenticated, (req, res) => {
    res.render('tickets/index');
});

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('tickets/add')
});

router.get('/edit', ensureAuthenticated, (req, res) => {
    res.render('tickets/edit')
});

module.exports = router;