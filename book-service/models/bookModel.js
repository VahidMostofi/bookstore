var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var bookSchema = new Schema({
	'title' : String,
	'description' : String,
	'author' : String,
	'publisher' : String,
	'pages' : Number,
	'img_url' : String,
	'buy_url' : String,
	'created_date' : Date
});

module.exports = mongoose.model('book', bookSchema);
