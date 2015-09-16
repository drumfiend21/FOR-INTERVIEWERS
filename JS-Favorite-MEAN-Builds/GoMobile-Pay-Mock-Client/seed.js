/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

Refer to the q documentation for why and how q.invoke is used.

*/

var mongoose = require('mongoose');
var connectToDb = require('./server/db');
var User = mongoose.model('User');
var Micros = mongoose.model('Micro');
var Blends = mongoose.model('Blend');
var q = require('q');
var chalk = require('chalk');

var getCurrentUserData = function () {
    return q.ninvoke(User, 'find', {});
};

var getMicroData = function () {
    return q.ninvoke(Micros, 'find', {});
};

var getBlendData = function () {
    return q.ninvoke(Blends, 'find', {});
};

var seedUsers = function () {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password',
        },
        {
            email: 'obama@gmail.com',
            password: 'potus',
            admin: true
        },
        {
            email: 'fullstack@gmail.com',
            password: '1234',
            changepassword: true
        }
    ];

    return q.invoke(User, 'create', users);

};

var seedMicros = function () {

    var micros = [
    {
        name: 'Broccoli',
        spice: 'mild',
        price: 2,
        description: 'The vegetable that your parents always told you to eat',
        image: 'http://www.profproduce.com/wp-content/uploads/2013/04/Broccoli.jpg',
        inventory: 50
    },
    {
        name: 'Arugula',
        spice: 'medium',
        price: 3,
        description: 'You either love it or hate it. You are a loser if you do not love it',
        image: 'http://cdn2.johnnyseeds.com/images/product/large/385M.jpg',
        inventory: 50
    },
    {
        name: 'Basil',
        spice: 'medium-spicy',
        price: 4,
        description: 'Destroyer of phlegm',
        image: 'http://cdn2.johnnyseeds.com/images/product/large/944M.jpg',
        inventory: 50
    },
    {
        name: 'Mustard Greens',
        spice: 'spicy',
        price: 4,
        description: 'Gives you smooth poop',
        image: 'http://cdn2.johnnyseeds.com/images/product/large/2797M.jpg',
        inventory: 50
    },
    {
        name: 'Celery Leaf',
        spice: 'mild',
        price: 2,
        description: 'Meh',
        image: 'http://cdn2.johnnyseeds.com/images/product/large/922M.jpg',
        inventory: 50
    },
    {
        name: 'Kale',
        spice: 'mild',
        price: 5,
        description: 'Hipsters love this',
        image: 'http://cdn2.johnnyseeds.com/images/product/large/363MG.jpg',
        inventory: 100
    },
    {
        name: 'Spinach',
        spice: 'mild',
        price: 3,
        description: 'This should be your vegetable of choice if you are Popeye!',
        image: 'http://cdn2.johnnyseeds.com/images/product/large/383G.jpg',
        inventory: 100
    },
    {
        name: 'Swiss Chard',
        spice: 'mild',
        price: 4,
        description: 'Skinny watermelon',
        image: 'http://cdn1.johnnyseeds.com/images/Product/large/702MG.jpg',
        inventory: 100
    },
    {
        name: 'Cressida Cress',
        spice: 'medium',
        price: 4,
        description: 'Pretty, but bitter, like your ex',
        image: 'http://cdn1.johnnyseeds.com/images/product/large/382M.jpg',
        inventory: 100
    },
    {
        name: 'Lettuce',
        spice: 'mild',
        price: 2,
        description: 'You can put this on everything',
        image: 'http://www.microgreengarden.com/photos/LETTUCE-Endive-Escarole-microgreens-Asteraceae-Family-of-Leafy-Greens/05-AsteraceaeFamilyLettuceEndive-16Lettuce-romaine-red10day.jpg',
        inventory: 100
    },
    ];

    return q.invoke(Micros, 'create', micros);

};

var seedBlends = function (jArr, mArr, sArr, msArr){

    var blend = [
    {name: "Joe's Mega Blend", price: 12, micros: jArr},
    {name: "MEAN Greens Classic", price: 12, micros: mArr},
    {name: "Skinny Mini", price: 8, micros: sArr},
    {name: "Mini Spice", price: 8, micros: msArr}
    ];

    return q.invoke(Blends, 'create', blend);

};


connectToDb.then(function () {
    var seededUsers = getCurrentUserData().then(function (users) {
        // if (users.length === 0) {
        //     return seedUsers();
        // } else {
        //     console.log(chalk.magenta('Seems to already be user data'));
        //     return users;
        // }
        return users.length ? users : seedUsers();
    });
    var seededMicros = getMicroData().then(function (micros) {
        // if (micros.length === 0) {
        //     return seedMicros();
        // } else {
        //     console.log(chalk.magenta('Seems to already be micro data'));
        //     return micros;
        // }
        return micros.length ? micros : seedMicros();
    });
    // var seededBlends = getBlendData().then(function (blends) {
    //     return blends.length ? blends : seedBlends();
    // })
    return q.all([seededUsers, seededMicros])
}).spread(function (users, micros){
    var jA = function (){
        var arr = [];
        for (var i=0; i<micros.length-5; i++){
            arr.push(micros[i]._id);
        }
        return arr;
    }
    var mA = function () {
        var arr = [];
        for (var i=5; i<micros.length; i++){
            arr.push(micros[i]._id);
        }
        return arr;
    }
    var sA = function () {
        var arr = [];
        for (var i=3; i<micros.length-4; i++){
            arr.push(micros[i]._id);
        }
        return arr;
    }
    var msA = function () {
        var arr = [];
        arr.push(micros[8]._id, micros[1]._id, micros[3]._id);
        return arr;
    }
    return getBlendData().then(function (blends) {
        console.log(blends.length);
        return blends.length ? blends : seedBlends(jA(), mA(), sA(), msA());
    });
}).then(function (blends){
    console.log(blends);
    process.kill(0);
}).catch(console.error);

// .then(function (){
//     var seededBlends = getBlendData().then(function (blends) {
//         return blends.length ? blends : seedBlends();
//     });
//     process.kill(0);
// })