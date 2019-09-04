const express = require('express');
const mongoose = require('mongoose');
const Ticket = mongoose.model('tickets');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');
const {performance} = require('perf_hooks');

router.get('/', ensureAuthenticated, (req, res) => {
    res.render('tickets/index');
});

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('tickets/add')
});

router.get('/edit', ensureAuthenticated, (req, res) => {
    res.render('tickets/edit')
});

router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];

    if (!req.body.problem) {
        errors.push({text: 'Please state your problem'});
    }
    if (!req.body.requestedBy) {
        errors.push({text: 'Please add a requester'});
    }

    if(errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            problem: req.body.problem,
            requestedBy: req.body.requestedBy
        });
    } else {
        const randomId = () => {
            return (
                Number(String(Math.random()).slice(2)) + 
                Date.now() + 
                Math.round(performance.now())
            ).toString(36);
        }

        const requestId = randomId();

        const newTicket = {
            requestId: requestId,
            requestedBy: req.body.requestedBy,
            department: req.body.department,
            local: req.body.local,
            typeOfWork: req.body.typeOfWork,
            system: req.body.system,
            problem: req.body.problem,
            assignedTo: req.body.assignedTo,
            status: req.body.status,
            user: req.user.id
        }

        new Ticket(newTicket)
            .save()
            .then(ticket => {
                // req.flash('success_msg', 'Video idea added');
                res.redirect('/tickets');
            });
    }
});

module.exports = router;