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
var Shape = mongoose.model('Shape');
var Icing = mongoose.model('Icing');
var Filling = mongoose.model('Filling');
var Store = mongoose.model('Store');
var Review = mongoose.model('Review');
var Cake = mongoose.model('Cake');
var q = require('q');
var chalk = require('chalk');


var randomize = function (arr) {
	return Math.floor(Math.random() * arr.length);
}


// STORES
var getStoresData = function () {
    return q.ninvoke(Store, 'find', {});
};


var seedStores = function (users) {

    var stores = [{
            name: 'Main Store',
			description: 'Main store description',
			logo: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=200%C3%97150&w=200&h=150',
			address: '1111 Wall St New York, NY 22222',
			phone: '1234567890',
			owner: users[randomize(users)]._id
    }];

    return q.invoke(Store, 'create', stores);

};

// USERS
var getCurrentUserData = function () {
    return q.ninvoke(User, 'find', {});
};


var seedUsers = function () {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus'
        }
    ];

    return q.invoke(User, 'create', users);

};


// SHAPES
var getShapesData = function () {
    return q.ninvoke(Shape, 'find', {});
};

var seedShapes = function (stores) {
    var shapes = [{
        name: 'round',
        description: 'round description',
        storeId: stores[randomize(stores)]._id
    }, {
        name: 'square',
        description: 'square description',
        storeId: stores[randomize(stores)]._id
    }, {
        name: 'rectangle',
        description: 'rectangle description',
        storeId: stores[randomize(stores)]._id
    }];

    return q.invoke(Shape, 'create', shapes)
}


// FILLING
var getFillingsData = function () {
    return q.ninvoke(Filling, 'find', {});
};

var seedFilling = function (stores) {

    var fillings = [{
        name: 'chocolate',
        description: 'chocolate description',
        price: 20,
        storeId: stores[randomize(stores)]._id
    }, {
        name: 'vanilla',
        description: 'vanilla description',
        price: 30,
        storeId: stores[randomize(stores)]._id
    }, {
        name: 'strawberry',
        description: 'strawberry description',
        color: '#ff69b4',
        price: 40,
        storeId: stores[randomize(stores)]._id
    }];

    return q.invoke(Filling, 'create', fillings)
}


// ICING
var getIcingsData = function () {
    return q.ninvoke(Icing, 'find', {});
};

var seedIcing = function (stores) {

    var icings = [{
        name: 'chocolate',
        description: 'chocolate description',
        price: 5,
        storeId: stores[randomize(stores)]._id
    }, {
        name: 'vanilla',
        description: 'vanilla description',
        price: 10,
        storeId: stores[randomize(stores)]._id
    }, {
        name: 'strawberry',
        description: 'strawberry description',
        color: '#ff69b4',
        price: 15,
        storeId: stores[randomize(stores)]._id
    }];

    return q.invoke(Icing, 'create', icings)
}


// CAKE REVIEWS
var getReviewsData = function () {
    return q.ninvoke(Review, 'find', {});
};

var seedReviews = function (users) {

    var reviews = [{
        user: users[randomize(users)]._id,
        summary: 'top notch cake',
        description: 'description top notch cake',
        stars: 5
    }, {
        user: users[randomize(users)]._id,
        summary: 'horrib cake',
        description: 'description horrid cake',
        stars: 1
    }, {
        user: users[randomize(users)]._id,
        summary: 'kickass cake',
        description: 'description kickass cake',
        stars: 4
    }];

    return q.invoke(Review, 'create', reviews)
}



var seedCakes = function (shapes, icings, fillings, reviews, stores) {

    var prices = [30, 40, 50, 60, 70];
    var quantities = [5, 10, 15, 20];

    //query for icings
    var cakes = [
        // no price or quantity defined on first cake
        {
            name: 'Stock Cake 1',
            type: 'stock', // custom or stock
            storeId: stores[randomize(stores)]._id,
            shape: shapes[randomize(shapes)]._id,
            icing: icings[randomize(icings)]._id,
            layers: [{
			        position: 1,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 2,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 3,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 4,
			        filling: fillings[randomize(fillings)]._id
		    }],
            reviews: reviews[randomize(reviews)]._id
        },
        {
            name: 'Stock Cake 2',
            type: 'stock', // custom or stock
            storeId: stores[randomize(stores)]._id,
            price: prices[randomize(prices)],
            shape: shapes[randomize(shapes)]._id,
            icing: icings[randomize(icings)]._id,
            layers: [{
			        position: 1,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 2,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 3,
			        filling: fillings[randomize(fillings)]._id
		    }],
            reviews: reviews[randomize(reviews)]._id,
            quantity: quantities[randomize(quantities)]
        },
        {
            name: 'Stock Cake 3',
            type: 'stock', // custom or stock
            storeId: stores[randomize(stores)]._id,
            price: prices[randomize(prices)],
            shape: shapes[randomize(shapes)]._id,
            icing: icings[randomize(icings)]._id,
            layers: [{
			        position: 1,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 2,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 3,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 4,
			        filling: fillings[randomize(fillings)]._id
		    }],
            reviews: reviews[randomize(reviews)]._id,
            quantity: quantities[randomize(quantities)]
        },
        {
            name: 'Stock Cake 4',
            type: 'stock', // custom or stock
            storeId: stores[randomize(stores)]._id,
            price: prices[randomize(prices)],
            shape: shapes[randomize(shapes)]._id,
            icing: icings[randomize(icings)]._id,
            layers: [{
			        position: 1,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 2,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 3,
			        filling: fillings[randomize(fillings)]._id
		    }],
            reviews: reviews[randomize(reviews)]._id,
            quantity: quantities[randomize(quantities)]
        },
        {
            name: 'Stock Cake 5',
            type: 'stock', // custom or stock
            storeId: stores[randomize(stores)]._id,
            price: prices[randomize(prices)],
            shape: shapes[randomize(shapes)]._id,
            icing: icings[randomize(icings)]._id,
            layers: [{
			        position: 1,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 2,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 3,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 4,
			        filling: fillings[randomize(fillings)]._id
		    }],
            reviews: reviews[randomize(reviews)]._id,
            quantity: quantities[randomize(quantities)]
        },
        {
            name: 'Stock Cake 6',
            type: 'stock', // custom or stock
            storeId: stores[randomize(stores)]._id,
            price: prices[randomize(prices)],
            shape: shapes[randomize(shapes)]._id,
            icing: icings[randomize(icings)]._id,
            layers: [{
			        position: 1,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 2,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 3,
			        filling: fillings[randomize(fillings)]._id
		    }],
            reviews: reviews[randomize(reviews)]._id,
            quantity: quantities[randomize(quantities)]
        },
        {
            name: 'Stock Cake 7',
            type: 'stock', // custom or stock
            storeId: stores[randomize(stores)]._id,
            price: prices[randomize(prices)],
            shape: shapes[randomize(shapes)]._id,
            icing: icings[randomize(icings)]._id,
            layers: [{
			        position: 1,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 2,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 3,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 4,
			        filling: fillings[randomize(fillings)]._id
		    }],
            reviews: reviews[randomize(reviews)]._id,
            quantity: quantities[randomize(quantities)]
        },
        {
            name: 'Stock Cake 8',
            type: 'stock', // custom or stock
            storeId: stores[randomize(stores)]._id,
            price: prices[randomize(prices)],
            shape: shapes[randomize(shapes)]._id,
            icing: icings[randomize(icings)]._id,
            layers: [{
			        position: 1,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 2,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 3,
			        filling: fillings[randomize(fillings)]._id
		    }],
            reviews: reviews[randomize(reviews)]._id,
            quantity: quantities[randomize(quantities)]
        },
        {
            name: 'Stock Cake 9',
            type: 'stock', // custom or stock
            storeId: stores[randomize(stores)]._id,
            price: prices[randomize(prices)],
            shape: shapes[randomize(shapes)]._id,
            icing: icings[randomize(icings)]._id,
            layers: [{
			        position: 1,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 2,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 3,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 4,
			        filling: fillings[randomize(fillings)]._id
		    }],
            reviews: reviews[randomize(reviews)]._id,
            quantity: quantities[randomize(quantities)]
        },
        {
            name: 'Stock Cake 10',
            type: 'stock', // custom or stock
            storeId: stores[randomize(stores)]._id,
            price: prices[randomize(prices)],
            shape: shapes[randomize(shapes)]._id,
            icing: icings[randomize(icings)]._id,
            layers: [{
			        position: 1,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 2,
			        filling: fillings[randomize(fillings)]._id
			    },
			    {
			        position: 3,
			        filling: fillings[randomize(fillings)]._id
		    }],
            reviews: reviews[randomize(reviews)]._id,
            quantity: quantities[randomize(quantities)]
        }

    ];

    return q.invoke(Cake, 'create', cakes);

};



connectToDb.then(function () {
    getCurrentUserData().then(function (users) {
        if (users.length === 0) {
            return seedUsers();
        } else {
            console.log(chalk.magenta('Seems to already be user data, exiting!'));
        }
    }).then(function () {
        return q.ninvoke(User, 'find', {});
    }).then(function (users) {
        return seedReviews(users);
    }).then(function () {
        return q.ninvoke(User, 'find', {});
    }).then(function (users) {
        return seedStores(users);
    }).then(function () {
    	return q.all([getShapesData(), getStoresData()]);
    }).spread(function (shapes, stores) {
        if (shapes.length === 0) {
            return seedShapes(stores);
        } else {
            console.log(chalk.magenta('Seems to already be shape data, exiting!'));
        }
    }).then(function () {
    	return q.all([getFillingsData(), getStoresData()]);
    }).spread(function (filling, stores) {
        if (filling.length === 0) {
            return seedFilling(stores);
        } else {
            console.log(chalk.magenta('Seems to already be filling data, exiting!'));
        }
    }).then(function () {
    	return q.all([getIcingsData(), getStoresData()]);
    }).spread(function (icings, stores) {
        if (icings.length === 0) {
            return seedIcing(stores);
        } else {
            console.log(chalk.magenta('Seems to already be icing data, exiting!'));
        }
    }).then(function () {
        return q.all([getShapesData(), getIcingsData(), getFillingsData(), getReviewsData(), getStoresData()]);
    })
    .spread(function (shapes, icings, fillings, reviews, stores) {
        return seedCakes(shapes, icings, fillings, reviews, stores);
    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    }).catch(function (err) {
        console.error(err);
        process.kill(1);
    });
});







