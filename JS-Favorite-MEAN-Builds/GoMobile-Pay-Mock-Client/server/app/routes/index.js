'use strict';
var router = require('express').Router();

router.use('/tutorial', require('./tutorial'));
router.use('/members', require('./members'));
router.use('/micros', require('./micros'));
router.use('/blends', require('./blends'));
router.use('/orders', require('./orders'));
router.use('/reviews', require('./reviews'));
// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});

module.exports = router;