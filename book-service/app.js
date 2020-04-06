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
	
	const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
	const app = express()
	const CLSContext = require('zipkin-context-cls');
	const {Tracer} = require('zipkin');
	const {recorder} = require('./recorder');
	const ctxImpl = new CLSContext('zipkin');
	const localServiceName = 'book';
	const tracer = new Tracer({ctxImpl, recorder: recorder(localServiceName), localServiceName});
	app.use(zipkinMiddleware({tracer}));
	app.use(morgan('combined'))
	app.use(bodyParser.json());
	app.use("/books", bookRoutes);
	const PORT = process.env.PORT;
	app.listen(PORT, ()=>{
		console.log('Started books-service application on port ' + PORT);
	});
}