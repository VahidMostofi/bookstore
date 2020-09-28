var bookModel = require('../models/bookModel.js');
const {tracer} = require('../trace_utils');
const { FORMAT_HTTP_HEADERS } = require('opentracing');
/**
 * bookController.js
 *
 * @description :: Server-side logic for managing books.
 */
module.exports = {

    /**
     * bookController.list()
     */
    list: function (req, res) {
        const dbSpan = tracer.startSpan("DB",{childOf:req.span});
        bookModel.find(function (err, books) {
            dbSpan.finish();
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting book.',
                    error: err
                });
            }
            return res.json(books);
        });
    },

    /**
     * bookController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        const parentSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
        const dbSpan = tracer.startSpan("DB",{childOf: parentSpan});
        bookModel.findOne({_id: id}, function (err, book) {
            dbSpan.finish();
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting book.',
                    error: err
                });
            }
            if (!book) {
                return res.status(404).json({
                    message: 'No such book'
                });
            }
            return res.json(book);
        });
    },

    /**
     * bookController.create()
     */
    create: function (req, res) {
        var book = new bookModel({
			title : req.body.title,
			description : req.body.description,
			author : req.body.author,
			publisher : req.body.publisher,
			pages : req.body.pages,
			img_url : req.body.img_url,
			buy_url : req.body.buy_url,
			created_date : req.body.created_date

        });
        const dbSpan = tracer.startSpan("DB",{childOf:req.span});
        book.save(function (err, book) {
            dbSpan.finish();
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating book',
                    error: err
                });
            }
            return res.status(201).json(book);
        });
    },

    /**
     * bookController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        const parentSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
        const dbSpan = tracer.startSpan("DB",{childOf: parentSpan});
        bookModel.findOne({_id: id}, function (err, book) {
            dbSpan.finish();
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting book',
                    error: err
                });
            }
            if (!book) {
                return res.status(404).json({
                    message: 'No such book'
                });
            }

            book.title = req.body.title ? req.body.title : book.title;
			book.description = req.body.description ? req.body.description : book.description;
			book.author = req.body.author ? req.body.author : book.author;
			book.publisher = req.body.publisher ? req.body.publisher : book.publisher;
			book.pages = req.body.pages ? req.body.pages : book.pages;
			book.img_url = req.body.img_url ? req.body.img_url : book.img_url;
			book.buy_url = req.body.buy_url ? req.body.buy_url : book.buy_url;
			book.created_date = req.body.created_date ? req.body.created_date : book.created_date;
			
            book.save(function (err, book) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating book.',
                        error: err
                    });
                }

                return res.json(book);
            });
        });
    },

    /**
     * bookController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        const dbSpan = tracer.startSpan("DB",{childOf:req.span});
        bookModel.findByIdAndRemove(id, function (err, book) {
            dbSpan.finish();
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the book.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};
