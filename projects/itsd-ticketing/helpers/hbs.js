const moment = require('moment');

module.exports = {
    formatDate: function(date, format) {
        return moment(date).format(format);
    },
    select: function(selected, options) {
        return options.fn(this).replace(new RegExp(' value=\"' + selected + '\"'), '$& selected="selected"').replace(new RegExp('>' + selected + '</option>'), ' selected="selected" $&');
    },
    openTicket: function(status, options) {
        if (status === 'open') {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    takenTicket: function(status, options) {
        if (status === 'onprocess' || status === 'closed') {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    adminRole: function(isAdmin, options) {
        if (isAdmin === true) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    supportRole: function(isSupport, options) {
        if (isSupport === true) {
            return options.fn(this);
        }
        return options.inverse(this);
    }
}