const express = require('express');
const router = express.Router();

router.get('/', (res, req) => {
    res.send('TICKETS HOME');
});

module.exports = router;