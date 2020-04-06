const { track } = require("express-jaeger");
const { FORMAT_HTTP_HEADERS } = require('opentracing');
const config = {
    serviceName: "gateway",
    sampler: {
        type: "const",
        param: 1
    },
    reporter: {
        collectorEndpoint: "http://jaeger:14268/api/traces",
        agentHost: "jaeger",
        agentPort: "6831",
        logSpans: true
      }
}
const initTracer = require("jaeger-client").initTracer;
const tracer = initTracer(config);
const trackMiddleware = function(serviceName){
    return track(serviceName, undefined, config);
}
const extractSpanMiddleware = (req,res,next)=>{
    req.span = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
    next();
};
const createAxiosTracing = require('axios-opentracing').default;
const applyTracingInterceptors = createAxiosTracing(tracer);


module.exports = {trackMiddleware, extractSpanMiddleware, applyTracingInterceptors, tracer};