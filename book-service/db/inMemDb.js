const PicoDB = require('picodb');
const db = PicoDB()

function init() {
	const json = require('./books.json')
	db.insertMany(json)
}
init()

module.exports = db