const { FORMAT_HTTP_HEADERS } = require('opentracing');
const config = {
  serviceName: process.env.JAEGER_SERVICE_NAME || 'service-name-not-found',
  sampler: {
      type: "const",
      param: parseFloat(process.env.SAMPELLING_PROB)
  },
  reporter: {
      collectorEndpoint: "http://"+process.env.JAEGER_COLLECTOR_HOST+":"+process.env.JAEGER_COLLECTOR_PORT+"/api/traces",
      agentHost: process.env.JAEGER_AGENT_HOST,
      agentPort: process.env.JAEGER_AGENT_PORT,
      logSpans: true
    }
}
const initTracer = require("jaeger-client").initTracer;
const tracer = initTracer(config);

const isValidConfig = config => {

    let hasReporterProperties = false
    let hasReporterEnvs = false
  
    if (config) {
      let { reporter } = config;
      if (reporter) {
        let { collectorEndpoint, agentHost, agentPort } = reporter;
        hasReporterProperties = (collectorEndpoint && agentHost && agentPort) ? true : false;
      }
    }
  
    let { JAEGER_COLLECTOR_ENDPOINT, JAEGER_AGENT_HOST, JAEGER_AGENT_PORT } = process.env;
    hasReporterEnvs = (JAEGER_AGENT_HOST && JAEGER_AGENT_PORT && JAEGER_COLLECTOR_ENDPOINT) ? true : false
  
    if (hasReporterEnvs || hasReporterProperties) {
      return true
    } else {
      return false
    }
}
  
const hasOwnService = (operationName, config = defaultConfig) => {
    if (operationName.includes(":")) {
      const serviceName = operationName.split(":")[0]
      const operation = operationName.split(":")[1]
      return { operation, configuration: { ...config, serviceName } }
    } else {
      return { operation: operationName, configuration: config }
    }
}
  
const track = (operationName, parent, tracer, config = defaultConfig()) => (req, res, next) => {

    let { operation, configuration } = hasOwnService(operationName, config)

    operationName = operation
    config = configuration

    if (isValidConfig(config)) {
        let { headers, path, url, method, body, query, params } = req;
        const context = tracer.extract(FORMAT_HTTP_HEADERS, headers)
        
        const span = tracer.startSpan(operationName, { childOf: parent || context });
        span.setTag("http.request.url", url);
        span.setTag("http.request.method", method);
        span.setTag("http.request.path", path);
        span.log({ body }).log({ query }).log({ params });

        tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
        req.headers = headers;
        next();

        res.once("finish", () => {
        span.setTag("http.response.status_code", res.statusCode);
        span.setTag("http.response.status_message", res.statusMessage);
        span.finish();
        });
    } else {
        next();
        throw new Error("Invalid configurations to the Jaeger Client. Please, be sure to pass a valid configuration by parameter or environment variables for express-jaeger middleware.")
    }

};
  
const trackMiddleware = function(operationName){
    return track(operationName, undefined, tracer, config);
}

module.exports = {trackMiddleware, tracer};