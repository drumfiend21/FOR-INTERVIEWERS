'use strict';
var passport = require('passport');
var _ = require('lodash');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');
var body = require('body-parser');

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

    passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, strategyFn));

    // A POST /login route is created to handle login.
    app.post('/login', function (req, res, next) {

        var authCb = function (err, user) {

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

    //SIGNUP
    app.post('/signup', function (req, res, next) {
        console.log(req.body);
        UserModel.findOne({email: req.body.email}, function (err, user) {
            if(err) return next(err);
            else if(user) return next('USER ALREADY EXISTS');
            else {
                var newUser = new UserModel();
                newUser.email = req.body.email;
                newUser.password = req.body.password;
                newUser.save(function (err, nUser) {
                    if(err) return next(err);
                    else {
                        console.log(nUser);
                        req.logIn(nUser, function (err) {
                            if(err) return next(err);
                            res.status(200).send({ user: _.omit(nUser.toJSON(), ['password', 'salt']) });
                        });
                    }
                });
            }
        });
    });

};