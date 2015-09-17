'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var body = require('body-parser');
var mongoose = require('mongoose');
var Promise = require('bluebird');

var Cart = mongoose.model('Cart');

router.get('/:id', function (req, res, next) {

    Cart.findOne({ user : req.params.id }, function (err, cart) {
        if(err) next(err);
        res.send(cart);
    });

});


router.post('/add', function (req, res, next) {

    if(req.body.user._id !== undefined){
        var user = req.body.user._id
        var cart = req.body.cart.map(function (cake) {
            return cake._id
        });
    }    
    else {
        var user = req.body.user.data.user._id;
        var cart = req.body.cart.map(function (cake) {
            return cake._id
        });
    }
    console.log("adding cart backend: user", user)
    console.log("adding cart backend: cart", cart)

    var newUserCart = new Cart({ user : user, cakes : cart });

    newUserCart.save(function (err) {
        if(err) return next(err);
        res.send("doneski");
    });

});

router.put('/update', function (req, res, next) {

    var user = req.body.user._id;
    var cart = {};

    Cart.findOne({ user : user }).exec().then(function (userCart) {

        if (_.isArray(req.body.cakes)) {

            cart = req.body.cakes.map(function (cake) {
                return cake._id;
            });

            cart.forEach(function (cake) {
                userCart.cakes.addToSet(cake);
            });


        } else {
            
            userCart.cakes.addToSet(req.body.cakes._id);

        }

        return userCart.save();
        

    }, next)
    .then(function(cart){
        res.send(cart)
    })



});


router.delete('/:id', function (req, res, next) {

    var cake = req.params.id;

    Cart.findOne({ user : req.user._id }).exec().then(function (userCart) {
        
        userCart.cakes.remove(cake);
        return userCart.save();

    }, next);



});
