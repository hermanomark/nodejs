const express = require('express');
const mongoose = require('mongoose');
const Ticket = mongoose.model('tickets');
const User = mongoose.model('users');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');
const {performance} = require('perf_hooks');

router.get('/', ensureAuthenticated, (req, res) => {
    Ticket.find({status: 'open'})
        .populate('user')
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
                req.flash('error_msg', 'Access denied');
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
                req.flash('error_msg', 'Access denied');
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
    .populate('comments.commentUser')
    .then(ticket => {
        if (ticket.user == req.user.id || req.user.isSupport === true) {
            res.render('tickets/show', {
                ticket: ticket
            });
        } else {
            req.flash('error_msg', 'Access denied');
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
            req.flash('error_msg', 'Access denied');
            res.redirect('/tickets');
        }
    });
});

router.get('/supportadd', ensureAuthenticated, async (req, res) => {
    const users = await User.find({isSupport: true});

    if (req.user.isSupport === true) {
        res.render('tickets/supportadd', {users: users});
    } else {
        req.flash('error_msg', 'Access denied');
        res.redirect('/tickets');
    }
});

router.get('/supportedit/:id', ensureAuthenticated, (req, res) => {
    Ticket.findOne({
        _id: req.params.id
    })
    .then(ticket => {
        if (req.user.isSupport !== true) {
            req.flash('error_msg', 'Access denied');
            res.redirect('/tickets');
        } else {
            res.render('tickets/supportedit', {
                ticket: ticket
            });
        }
    });
});

router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];

    if (!req.body.local) {
        errors.push({text: 'Please add local'});
    }
    if (!req.body.problem) {
        errors.push({text: 'Please state your problem'});
    }

    if(errors.length > 0) {
        res.render('tickets/add', {
            errors: errors,
            department: req.body.department,
            local: req.body.local,
            typeOfWork: req.body.typeOfWork,
            system: req.body.system,
            problem: req.body.problem
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

    if (!req.body.requestedBy) {
        errors.push({text: 'Please add a requester'});
    }
    if (!req.body.local) {
        errors.push({text: 'Please add local'});
    }
    if (!req.body.problem) {
        errors.push({text: 'Please state your problem'});
    }

    if(errors.length > 0) {
        res.render('tickets/supportadd', {
            errors: errors,
            requestedBy: req.body.requestedBy,
            department: req.body.department,
            local: req.body.local,
            typeOfWork: req.body.typeOfWork,
            system: req.body.system,
            problem: req.body.problem,
            assignedTo: req.body.assignedTo,
            status: req.body.status,
            actionTaken: req.body.actionTaken
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

    if (!req.body.local) {
        errors.push({text: 'Please add local'});
    }
    if (!req.body.problem) {
        errors.push({text: 'Please state your problem'});
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
                    requestId: req.body.requestId,
                    department: req.body.department,
                    local: req.body.local,
                    typeOfWork: req.body.typeOfWork,
                    system: req.body.system,
                    problem: req.body.problem
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
                res.redirect('/tickets/dashboard')
            });
        }
    });
});

router.put('/supportedit/:id', ensureAuthenticated, (req, res) => {
    let errors = [];

    if (!req.body.requestedBy) {
        errors.push({text: 'Please add a requester'});
    }
    if (!req.body.local) {
        errors.push({text: 'Please add local'});
    }
    if (!req.body.problem) {
        errors.push({text: 'Please state your problem'});
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
                    requestId: req.body.requestId,
                    requestedBy: req.body.requestedBy,
                    department: req.body.department,
                    local: req.body.local,
                    typeOfWork: req.body.typeOfWork,
                    system: req.body.system,
                    problem: req.body.problem,
                    assignedTo: req.body.assignedTo,
                    status: req.body.status,
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

router.delete('/:id', ensureAuthenticated, (req, res) => {
    Ticket.findOne({
        _id: req.params.id
    })
    .then(ticket => {
        Ticket.remove({_id: req.params.id})
        .then(() => {
            req.flash('success_msg', 'Ticket deleted');
            if (ticket.user == req.user.id) {
                res.redirect('/tickets/dashboard');
            } else if (ticket.status === 'onprocess') {
                res.redirect('/tickets/onprocess');
            } else if (ticket.status === 'closed') {
                res.redirect('/tickets/closed');
            } else {
                res.redirect('/tickets');
            }
        });
    });
});

router.post('/comment/:id', (req, res) => {
    Ticket.findOne({
        _id: req.params.id
    })
    .then(ticket => {
        const newComment = {
            commentBody: req.body.commentBody,
            commentUser: req.user.id
        }

        ticket.comments.unshift(newComment);

        ticket.save()
            .then(ticket => {
                res.redirect(`/tickets/show/${ticket.id}`)
            });
    });
});

module.exports = router;