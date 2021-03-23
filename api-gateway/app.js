const cluster = require('cluster');

const WorkerCount = Number(process.env.WorkerCount)

if (cluster.isMaster) {
    const workers = [];
	// Fork workers.
	for (let i = 0; i < WorkerCount; i++) {
        console.log("I'm the father, I'm starting a new worker");
        workers.push(cluster.fork());
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
    });
    
    process.on('SIGTERM', () => {
        console.log("I'm the father, they told me SIGTERM");
        console.log("I'll tell my children");
        for(var w in cluster.workers){
            // console.log(cluster.workers[w]);
            cluster.workers[w].send('SIGTERM');
            console.log("told one")
        }

    });
} else {
    const express = require('express');
    const port = process.env.PORT || 8080;
    const routes = require('./gateway_routes');
    const morgan = require('morgan');
    const app = express();
    const {trackMiddleware} = require('./trace_utils');
    let isHealthy = true;
    app.use(trackMiddleware('gateway'));
    app.use(morgan('combined'));
    app.use(express.json());
    app.use(routes);
    app.get('/health', async (req,res) => {
        if (isHealthy)
            res.status(200).end();
        else
            res.status(500).end();
	});
    
    app.listen(port, () => {
        console.log(`API GATEWAY on port ${port}`)
    });

    process.on('message', (msg) => {
        console.log("I'm a child and I've been told to:", msg);
        if (msg === 'SIGTERM'){
            isHealthy = false;
            console.log("I'm a child, they told me SIGTERM");
        }
    });
}
