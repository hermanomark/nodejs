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
        });
});

router.get('/onprocess', ensureAuthenticated, (req, res) => {
    Ticket.find({status: 'onprocess'})
        .sort({date: 'desc'})
        .then(tickets => {
            if (req.user.isSupport === true) {
                res.render('tickets/onprocess', {
                    tickets: tickets
                });
            } else {
                res.redirect('/tickets');
            }
        })
});

router.get('/closed', ensureAuthenticated, (req, res) => {
    Ticket.find({status: 'closed'})
        .sort({date: 'desc'})
        .then(tickets => {
            if (req.user.isSupport === true) {
                res.render('tickets/closed', {
                    tickets: tickets
                });
            } else {
                res.redirect('/tickets');
            }
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

router.get('/show/:id', ensureAuthenticated, (req, res) => {
    Ticket.findOne({
        _id: req.params.id
    })
    .then(ticket => {
        if (ticket.user == req.user.id || req.user.isSupport === true) {
            res.render('tickets/show', {
                ticket: ticket
            });
        } else {
            res.redirect('/tickets')
        }
    });
});

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('tickets/add');
});

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Ticket.findOne({
        _id: req.params.id
    })
    .then(ticket => {
        if (ticket.user == req.user.id && ticket.status === 'open') {
            res.render('tickets/edit', {
                ticket: ticket
            });
        } else {
            res.redirect('/tickets');
        }
    });
});

router.get('/supportadd', ensureAuthenticated, (req, res) => {
    if (req.user.isSupport === true) {
        console.log('You are a support, accepted')
        res.render('tickets/supportadd')
    } else {
        console.log('You are not a support')
        res.redirect('/tickets');
    }
});

router.get('/supportedit/:id', ensureAuthenticated, (req, res) => {
    Ticket.findOne({
        _id: req.params.id
    })
    .then(ticket => {
        if (req.user.isSupport !== true) {
            console.log('You are not a support')
            res.redirect('/tickets');
        } else {
            console.log('You are a support, accepted')
            res.render('tickets/supportedit', {
                ticket: ticket
            });
        }
    });
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
                req.flash('success_msg', 'Ticket added');
                res.redirect('/tickets/dashboard');
            });
    }
});

router.post('/supportadd', ensureAuthenticated, (req, res) => {
    let errors = [];

    if (!req.body.problem) {
        errors.push({text: 'Please state your problem'});
    }
    if (!req.body.requestedBy) {
        errors.push({text: 'Please add a requester'});
    }
    if (!req.body.actionTaken) {
        errors.push({text: 'Please add an action taken'});
    }

    if(errors.length > 0) {
        res.render('tickets/supportadd', {
            errors: errors,
            problem: req.body.problem,
            requestedBy: req.body.requestedBy,
            actionTaken: req.body.actionTaken
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
            assignedTo: req.body.assignedTo,
            status: req.body.status,
            actionTaken: req.body.actionTaken,
            user: req.user.id
        }

        new Ticket(newTicket)
            .save()
            .then(ticket => {
                req.flash('success_msg', 'Ticket added');
                console.log(`Ticket added: ${ticket.status}`);
                if (ticket.status === 'onprocess') {
                    res.redirect('/tickets/onprocess');
                } else if (ticket.status === 'closed') {
                    res.redirect('/tickets/closed');
                } else {
                    res.redirect('/tickets');
                }
            });
    }
});

router.put('/:id', ensureAuthenticated, (req, res) => {
    let errors = [];

    if (!req.body.problem) {
        errors.push({text: 'Please add a problem'});
    }
    if (!req.body.requestedBy) {
        errors.push({text: 'Please add some requestedBy'});
    }

    Ticket.findOne({
        _id: req.params.id
    })
    .then(ticket => {
        if(errors.length > 0) {
            res.render('tickets/edit', {
                errors: errors,
                ticket: {
                    id: ticket.id,
                    requestedBy: req.body.title,
                    problem: req.body.problem,
                }
            });
        } else {
            ticket.department = req.body.department;
            ticket.local = req.body.local;
            ticket.typeOfWork = req.body.typeOfWork;
            ticket.system = req.body.system;
            ticket.problem = req.body.problem;

            ticket.save()
            .then(ticket => { 
                req.flash('success_msg', 'Ticket updated');
                console.log(`Ticket updated`);
                res.redirect('/tickets/dashboard')
            });
        }
    });
});

router.put('/supportedit/:id', ensureAuthenticated, (req, res) => {
    let errors = [];

    if (!req.body.problem) {
        errors.push({text: 'Please add a problem'});
    }
    if (!req.body.requestedBy) {
        errors.push({text: 'Please add some requestedBy'});
    }
    if (!req.body.actionTaken) {
        errors.push({text: 'Please add an action taken'});
    }

    Ticket.findOne({
        _id: req.params.id
    })
    .then(ticket => {
        if(errors.length > 0) {
            res.render('tickets/supportedit', {
                errors: errors,
                ticket: {
                    id: ticket.id,
                    requestedBy: req.body.requestedBy,
                    problem: req.body.problem,
                    actionTaken: req.body.actionTaken
                }
            });
        } else {
            ticket.requestedBy = req.body.requestedBy;
            ticket.department = req.body.department;
            ticket.local = req.body.local;
            ticket.typeOfWork = req.body.typeOfWork;
            ticket.system = req.body.system;
            ticket.problem = req.body.problem;
            ticket.assignedTo = req.body.assignedTo;
            ticket.status =  req.body.status;
            ticket.actionTaken = req.body.actionTaken;

            ticket.save()
            .then(ticket => { 
                req.flash('success_msg', 'Ticket updated');
                console.log(`Ticket updated: ${ticket.status}`);
                if (ticket.status === 'onprocess') {
                    res.redirect('/tickets/onprocess');
                } else if (ticket.status === 'closed') {
                    res.redirect('/tickets/closed');
                } else {
                    res.redirect('/tickets');
                }
            });
        }
    });
});

router.delete('/:id', (req, res) => {
    Ticket.remove({_id: req.params.id})
        .then(() => {
            res.redirect('/tickets/dashboard');
        });
});

module.exports = router;