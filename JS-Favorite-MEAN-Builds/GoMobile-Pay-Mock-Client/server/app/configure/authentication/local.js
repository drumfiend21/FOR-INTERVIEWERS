'use strict';
var passport = require('passport');
var _ = require('lodash');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');

module.exports = function (app) {

    // When passport.authenticate('local') is used, this function will receive
    // the email and password to run the actual authentication logic.
    var strategyFn = function (email, password, done) {
        UserModel.findOne({ email: email }, function (err, user) {
            if (err) return done(err);
            // user.correctPassword is a method from our UserModel schema.
            if (!user || !user.correctPassword(password)) return done(null, false);
            // Properly authenticated.
            done(null, user);
        });
    };

    function isAuthenticatedUser (req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.sendStatus(401);
        }
    }

    function hasAdminPower(req, res, next){
      console.log('this is req.user', req.user);  
      if(req.user.admin) next();
      else res.status(403).end();
    }

    function needsToChangePassword(req, res, next) {
        console.log('this user needs to change password', req.user);
        if(req.user.changepassword) next();
        else res.status(403).end();
    }

    passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, strategyFn));
    // A GET / route is created to find all users
    app.get('/users', hasAdminPower, function (req, res, next){
        console.log('this hits the get /users route!');
        UserModel.find({}).exec()
        .then(function (users){
            console.log('this is users', users);
            res.status(200).send(users);
          })
        .then(null, next); 
      });


    app.get('/users/:id', hasAdminPower, function (req, res, next) {
        // console.log('hitting the get user by id route')
        UserModel.findById(req.params.id).exec()
        .then(function (user) {
            res.status(200).send({ user: _.omit(user.toJSON(),['password', 'salt']) });
        })
        .then(null, next);
    });


    //find user by email
    app.get('/users/email/:email', hasAdminPower, function (req, res, next) {
        UserModel.findOne({email: req.params.email}).exec()
        .then(function (user){
            res.status(200).send({ user: _.omit(user.toJSON(), ['password', 'salt']) });
        })
        .then(null, next);
    });

    // A POST /signup route is created to handle registering users
    app.post('/signup', function (req, res, next) {
        console.log('hit the /signup post route!');
        UserModel.create(req.body, function (err, user) {
            console.log('this is req.body from signup', req.body)
            if (err) next(err);
            else {
                req.logIn(user, function (err){
                  if (err) return next(err);
                  res.status(201).send({ user: _.omit(user.toJSON(),['password', 'salt']) });
                });

            }
        });
    });


    // A POST /login route is created to handle login.
    app.post('/login', function (req, res, next) {
      console.log('Logging in');
        var authCb = function (err, user) {
            console.log('this is user from authcallback', user)
            if (err) return next(err);

            if (!user) {
                var error = new Error('Invalid login credentials');
                error.status = 401;
                return next(error);
            }

            // req.logIn will establish our session.
            req.logIn(user, function (err) {
                if (err) return next(err);
                // We respond with a reponse object that has user with _id and email.
                res.status(200).send({ user: _.omit(user.toJSON(), ['password', 'salt']) });
            });

        };

        passport.authenticate('local', authCb)(req, res, next);

    });
    
    // A PUT route is created to promote users to admin status
    app.put('/promote/:id', hasAdminPower, function (req, res, next) {
        console.log('this hits the put route!', typeof req.params.id);
        UserModel.findById(req.params.id).exec()
        .then(function (user) {
            console.log('do you enter this functioN?', req.body.admin);
            user.admin = req.body.admin;
            return user.save(function(user) {
                res.status(201).end();
            });
        })
        .then(null, next);
    });

//trigger email reset

    app.put('/reset/trigger/:email', hasAdminPower, function (req, res, next) {
        UserModel.findOne({email: req.params.email}).exec()
            .then(function (user) {
                user.changepassword = req.body.changepassword;
                return user.save(function (user) {
                    res.status(201).end();
                })
            })
    })

    // A PUT route is created to add order to the particular user checking out from the cart

    app.put('/orderonuser/:id', isAuthenticatedUser, function (req, res, next) {
        console.log('this hits the orderonuser route!')
        UserModel.findById(req.params.id).exec()
        .then(function (user) {
            console.log('this is req.body from orderonuser', req.body);
            console.log('this is req.body.order: ', req.body._id)
            console.log('this is user.orders', user.orders)
            user.orders.push(req.body._id)
            return user.save()
        })
        .then(function(user) {
            res.status(201).send(user);
        })
        .then(null, function(err) {
            console.log('error: ', err)
            next()
        });
    });

    // A DELETE route is created to delete a user
    app.delete('/delete/:id', hasAdminPower, function (req, res, next) {
        UserModel.remove({ _id: req.params.id }).exec()
        .then(function () {
            res.status(200).send();
        })
        .then(null, next);
    });

    // A PUT route is created to enable password reset for user

    app.put('/reset/:id', function (req, res, next) {
        console.log('this will enable password reset for user');
        UserModel.findById(req.params.id).exec()
        .then(function (user) {
            console.log('this is req.body from put route', req.body);
            user.password = req.body.password;
            user.changepassword = false;
            return user.save();
        })
        .then(function(user) {
            res.status(201).end();
        })
        .then(null, next);  
    });
};