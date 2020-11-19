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
    const port = process.env.PORT;
    const userRouter = require('./routers/user');
    const morgan = require('morgan');
    const mongoose = require('mongoose');
    require('./db/db');

    const app = express();
    const {trackMiddleware} = require('./trace_utils');
    app.use(trackMiddleware("auth"));
    app.use(morgan('combined'));
    app.use(express.json());
    app.use(userRouter);
    app.get('/health', async (req,res) => {
		if (mongoose.connection.readyState == 1){
			res.status(200).end();
		}else{
			res.status(500).end();
		}
	});

    app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
}
