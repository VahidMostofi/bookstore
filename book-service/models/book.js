var mongoose = require('mongoose');

//Book schema

var bookSchema = mongoose.Schema({
	userId: {
		type: mongoose.Types.ObjectId,
		required: true,
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	author: {
		type: String,
		required: true
	},
	publisher: {
		type: String
	},
	pages: {
		type: Number
	},
	img_url: {
		type: String
	},
	buy_url: {
		type: String
	},
	created_date: {
		type: Date,
		default: Date.now
	}
});

//this object can be accessed outside
var Book = module.exports = mongoose.model('Book', bookSchema);

//Function to get bookSchema
module.exports.getBooks = function (callback, limit) {
	Book.find(callback).limit(limit);
}

//Function to get book by ID
module.exports.getBookById = function (id, callback) {
	Book.findById(id, callback);
}

//Function to add a book
module.exports.addBook = function (book, callback) {
	book.userId = mongoose.Types.ObjectId(book.userId);
	Book.create(book, callback);
}

//Function to update Book
module.exports.updateBook = function (id, book, options, callback) {
	var query = {
		_id: id
	};
	var update = {
		title: book.title,
		genre: book.genre,
		description: book.description,
		author: book.author,
		publisher: book.publisher,
		pages: book.pages,
		img_url: book.img_url,
		buy_url: book.buy_url
	}
	Book.findOneAndUpdate(query, update, options, callback);
}

//Function to delete a Book
module.exports.deleteBook = function (id, callback) {
	var query = {
		_id: id
	};
	Book.remove(query, callback);
}