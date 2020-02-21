const express = require('express');
const bodyParser = require('body-parser');
const bookRoute = require('./routes/books-route');
const morgan = require('morgan');
require('./db/db');

const app = express();
app.use(morgan('combined'))
app.use(bodyParser.json());
app.use(bookRoute);
const PORT = process.env.PORT;
app.listen(PORT, ()=>{
	console.log('Started books-service application on port ' + PORT);
});