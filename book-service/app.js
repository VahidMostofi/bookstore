const cluster = require('cluster');

const WorkerCount = Number(process.env.WorkerCount)

if (cluster.isMaster) {
	// Fork workers.
	for (let i = 0; i < WorkerCount; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
	});
} else {
	const express = require('express');
	const bodyParser = require('body-parser');
	const bookRoutes = require('./routes/bookRoutes');
	const morgan = require('morgan');
	require('./db/db');
	
	const app = express()
    const {extractSpanMiddleware} = require('./trace_utils');
    app.use(extractSpanMiddleware);
	app.use(morgan('combined'))
	app.use(bodyParser.json());
	app.use("/books", bookRoutes);
	const PORT = process.env.PORT;
	app.listen(PORT, ()=>{
		console.log('Started books-service application on port ' + PORT);
	});
}