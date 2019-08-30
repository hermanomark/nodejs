const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    requestId: {
        type: String,
        required: true
    },
    requestedBy: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    local: {
        type: Number,
        required: true
    },
    tpyeOfWork: {
        type: String,
        required: true
    },
    system: {
        type: String,
        required: true
    },
    problem: {
        type: String,
        required: true
    },
    assignedTo: {
        type: String,
        required: true
    },
    actionTaken: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    comments: [{
        commentBody: {
            type: String,
            required: true
        },
        commentDate: {
            type: Date,
            default: Date.now
        },
        commentUser: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('tickets', TicketSchema);