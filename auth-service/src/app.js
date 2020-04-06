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
    const express = require('express')
    const port = process.env.PORT
    const userRouter = require('./routers/user')
    const morgan = require('morgan')
    require('./db/db')

    const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
	const app = express()
	const CLSContext = require('zipkin-context-cls');
	const {Tracer} = require('zipkin');
	const {recorder} = require('./recorder');
	const ctxImpl = new CLSContext('zipkin');
	const localServiceName = 'auth';
	const tracer = new Tracer({ctxImpl, recorder: recorder(localServiceName), localServiceName});
	app.use(zipkinMiddleware({tracer}));
    app.use(morgan('combined'));
    app.use(express.json());
    app.use(userRouter);

    app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
}
