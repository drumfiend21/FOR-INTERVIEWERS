var mongoose = require('mongoose');
// Notice the `mongodb` protocol; Mongo is basically a kind of server,
// which handles database requests and sends responses. It's async!
mongoose.connect('mongodb://localhost/wikistack');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb connection error:'));

var pageSchema = new mongoose.Schema({
  title:    String,
  url_name: String,
  sec_url: String,
  owner_id: String,
  body:     String,
  date:     { type: Date, default: Date.now },
  status:   Number,
  tags: Array
});

var userSchema = new mongoose.Schema({
  name:  { first: String, last: String },
  email: String
});

pageSchema.virtual('full_route').get(function () {
  return '/wiki/' + this.url_name;
});


var Page = mongoose.model('Page', pageSchema);
var User = mongoose.model('User', userSchema);

module.exports = {
  Page: Page,
  User: User
};