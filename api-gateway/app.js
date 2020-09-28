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
    const port = process.env.PORT || 9080;
    const routes = require('./gateway_routes');
    const morgan = require('morgan');
    const app = express();
    const {trackMiddleware} = require('./trace_utils');
    app.use(trackMiddleware('gateway'));
    app.use(morgan('combined'));
    app.use(express.json());
    app.use(routes);
    
    app.listen(port, () => {
        console.log(`API GATEWAY on port ${port}`)
    })
}
