const db = require('../db/inMemDb')

module.exports = {
	find: function (callback) {
		const docs = db.find({}).toArray().then(docs => callback(null, docs)).catch(err => callback(err, null))
	},
	findOne: function (bookId, callback) {
		const docs = db.find(bookId).toArray().then(docs => callback(null, docs[0])).catch(err => callback(err, null))
	},
	save: function (book, callback) {
		const docs = db.insertOne(book).then(book => callback(null, book)).catch(err => callback(err, null))
	},
	updateOne: function (id, book, callback) {
		const docs = db.updateOne(id, book).then(book => callback(null, book)).catch(err => callback(err, null))
	},
	remove: function (id, callback) {
		const docs = db.deleteOne(id).then(book => callback(null, book)).catch(err => callback(err, null))
	},
}