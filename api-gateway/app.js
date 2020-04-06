const express = require('express');
const port = process.env.PORT || 9080;
const routes = require('./gateway_routes');
const morgan = require('morgan');
const app = express();
const {trackMiddleware, extractSpanMiddleware} = require('./trace_utils');
app.use(morgan('combined'));
app.use(express.json());
app.use(routes);

app.listen(port, () => {
    console.log(`API GATEWAY on port ${port}`)
})