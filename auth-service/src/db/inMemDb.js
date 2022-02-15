const PicoDB = require('picodb');
const db = PicoDB()
const fs = require('fs');

function init() {
    const json = require('./users.json')
    db.insertMany(json);
}

init()

module.exports = db
