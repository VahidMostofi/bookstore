'use strict';
const router = require('express').Router();
const Book = require('../models/book');

const auth = (req, res, next) =>{
	if (!req.header("user")){
		res.send({message: "need to identify user"}).status(401);
	}
	req.body.userId = JSON.parse(req.header('user'))._id;
	next();
}

// To add a new book to the database
router.post('/books', auth, function (req, res) {
	var book = req.body;
	Book.addBook(book, function (err, book) {
		if (err) {
			if (err.name == 'ValidationError'){
				res.send({message: err.message}).status(400);
			}
		}
		res.json(book);
	});
});

//To get a book details using it's id
router.get('/books/:_id', function (req, res) {
	Book.getBookById(req.params._id, function (err, book) {
		if (err) {
			if (err.name == 'CastError'){
				return res.send({message:'invalid id'}).status(400);
			}
		}
		if (book == null){
			return res.status(404).end();
		}
		res.json(book);
	});
});

//To update a book details by its id
router.put('/:_id', function (req, res) {
	var id = req.params._id;
	var book = req.body;
	Book.updateBook(id, book, {}, function (err, book) {
		if (err) {
			throw err;
		}
		res.json(book);
	});
});

module.exports = router;