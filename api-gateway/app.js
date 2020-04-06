const express = require('express')
const port = process.env.PORT || 9080;
const routes = require('./gateway_routes')
const morgan = require('morgan')
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
const app = express()
const CLSContext = require('zipkin-context-cls');
const {Tracer} = require('zipkin');
const {recorder} = require('./recorder');
const ctxImpl = new CLSContext('zipkin');
const localServiceName = 'gateway';
const tracer = new Tracer({ctxImpl, recorder: recorder(localServiceName), localServiceName});
app.use(zipkinMiddleware({tracer}));
app.use(morgan('combined'));
app.use(express.json());
app.use(routes);

app.listen(port, () => {
    console.log(`API GATEWAY on port ${port}`)
})