const express = require('express');
const mongoose = require('mongoose');
const Ticket = mongoose.model('tickets');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');
const {performance} = require('perf_hooks');

router.get('/', ensureAuthenticated, (req, res) => {
    Ticket.find({status: 'open'})
        .sort({date: 'desc'})
        .then(tickets => {
            res.render('tickets/index', {
                tickets: tickets
            });
        })
});

router.get('/onprocess', ensureAuthenticated, (req, res) => {
    Ticket.find({status: 'onprocess'})
        .sort({date: 'desc'})
        .then(tickets => {
            res.render('tickets/onprocess', {
                tickets: tickets
            });
        })
});

router.get('/closed', ensureAuthenticated, (req, res) => {
    Ticket.find({status: 'closed'})
        .sort({date: 'desc'})
        .then(tickets => {
            res.render('tickets/closed', {
                tickets: tickets
            });
        })
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    Ticket.find({user: req.user.id})
        .sort({date:'desc'})
        .then(tickets => {
            res.render('tickets/dashboard', {
                tickets: tickets
            });
        });
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
        res.render('tickets/add', {
            errors: errors,
            problem: req.body.problem,
            requestedBy: req.body.requestedBy
        });

        errors.forEach((error) => {
            console.log(error.text);
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
            assignedTo: '',
            status: 'open',
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

router.delete('/:id', (req, res) => {
    Ticket.remove({_id: req.params.id})
        .then(() => {
            res.redirect('tickets/dashboard');
        });
});

module.exports = router;