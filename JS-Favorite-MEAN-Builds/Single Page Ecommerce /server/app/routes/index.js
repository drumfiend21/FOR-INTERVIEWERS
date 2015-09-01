'use strict';
var router = require('express').Router();
module.exports = router;

router.param('storeId', function (req, res, next) {
	req.storeId = req.params.storeId;
	return next();
})

// router.use('/tutorial', require('./tutorial'));
router.use('/create', require('./storeCreate'));
router.use('/members', require('./members'));
router.use('/store/:storeId/cake_builder', require('./cake_builder'));
router.use('/cake', require('./cake'));
router.use('/review', require('./review'));
router.use('/cart', require('./cart'));
router.use('/order', require('./order'));
router.use('/store/:storeId/admin', require('./admin'));
router.use('/store', require('./store'));


// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});