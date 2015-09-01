'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/tutorial', require('./tutorial'));
router.use('/members', require('./members'));
router.use('/register', require('./registration'));
router.use('/account', require('./account'));
router.use('/checkout', require('./checkout'));
router.use('/mock-web-app', require('./home-mock-web-app'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});


