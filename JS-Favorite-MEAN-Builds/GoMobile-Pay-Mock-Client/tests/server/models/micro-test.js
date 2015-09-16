var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var supertest = require('supertest');
var express = require('express');

require('../../../server/db/models/user');
var User = mongoose.model('User');
require('../../../server/db/models/micro');
var Micro = mongoose.model('Micro');
require('../../../server/db/models/blend');
var Blend = mongoose.model('Blend');
require('../../../server/db/models/order');
var Order = mongoose.model('Order');
require('../../../server/db/models/review');
var Review = mongoose.model('Review');

var app = require('../../../server/app/index.js');
var agent = supertest.agent(app);


describe('Micro model', function () {

   beforeEach('establish DB connection', function (done) {
       if (mongoose.connection.db) return done();
       mongoose.connect(dbURI, done);
   });

   afterEach('clear test database', function (done) {
       clearDB(done);
   });

   it('should exist', function () {
       expect(Micro).to.be.a('function');
   });

   describe('Virtuals', function () {
       describe('available', function () {
           it('should return a boolean depending on whether the inventory is available', function () {
               var micro = new Micro({
                   name: 'Lazy Lettuce',
                   spice: 'mild',
                   price: 7,
                   description: 'Eating this lettuce will make you feel lazy.',
                   image: 'someURL',
                   inventory: 8
               });
               expect(micro.available).to.equal(true);
           });
       });
   });
   describe('required fields', function(){
      it ('should create a document with all required fields', function (done){
            var micro = new Micro({
                   name: 'Lazy Lettuce with all fields',
                   spice: 'mild',
                   price: 7,
                   description: 'Eating this lettuce will make you feel lazy.',
                   image: 'someURL',
                   inventory: 8
               });
            micro.validate(function (err){
              expect(err).to.be.equal(undefined);
              done();
            });
      });
      it('shouldn\'t create a document with a missing required field', function (done){
        var micro = new Micro({
           name: 'Missing Price Lettuce',
           spice: 'mild',
           description: 'Eating this lettuce will make you feel lazy.',
           image: 'someURL',
           inventory: 8
         });
        micro.validate(function (err){
          expect(err.errors).to.have.property('price');
          done();
        });
      });
    });


});