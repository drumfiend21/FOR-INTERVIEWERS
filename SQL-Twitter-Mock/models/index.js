// pull in the Sequelize library
var Sequelize = require('sequelize');

// create an instance of a database connection
// which abstractly represents our app's mysql database
var twitterjsDB = new Sequelize('twitterjs', 'root', null, {
    dialect: "mysql",
    port:    3306,
});

var Tweet = require('./tweet')(twitterjsDB);
var User = require('./user')(twitterjsDB);




// open the connection to our database
twitterjsDB
  .authenticate()
  .catch(function(err) {
    console.log('Unable to connect to the database:', err);
  })
  .then(function() {
    console.log('Connection has been established successfully.');
  });

				




															// 	  										  .authenticate()
														 //  .catch(function(err) {
														 //    console.log('Unable to connect to the database:', err);
														 //  })
														 //  .then(function() {
														 //    console.log('Connection has been established successfully.');
														 //    User.findAll({ include: [Tweet] }).then(function(user) {
															//   //   user.getTweets().then(function(tweets) {
															//   //       console.log(tweets);
															//   // });
														 //    // console.log(JSON.stringify(user))
														 //    console.log(JSON.stringify(user[0].dataValues), JSON.stringify(user[0].Tweets[0].dataValues))
														 //    // console.log()
														 //    // console.log(user)
															// }).catch(console.warn);
														 //  });



																						



// adds a UserId foreign key to the `Tweet` table
User.hasMany(Tweet);
Tweet.belongsTo(User);

module.exports = {
    User: User,
    Tweet: Tweet
};