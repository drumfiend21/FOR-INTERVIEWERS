'use strict';
var router = require('express').Router();
module.exports = router;

var ensureAdminAuthenticated = function(req, res, next) {
    if(req.isAuthenticated() && req.user.admin) {
        next();
    } else {
        res.status(401).end();
    }
}
router.use('/', ensureAdminAuthenticated);

router.use('/cake', require('./cake'));
router.use('/order', require('./order'));
router.use('/users', require('./users'));
router.use('/category', require('./item'));