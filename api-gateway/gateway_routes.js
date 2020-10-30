const express = require('express');
const router = express.Router();
const axios = require('axios');
//================TRACE=================
const {trackMiddleware, tracer} = require('./trace_utils');
const { FORMAT_HTTP_HEADERS } = require('opentracing');
//================TRACE=================
const accessTokenSecret = process.env.JWT_KEY;
const jwt = require('jsonwebtoken');

const axiosRetry = require('axios-retry');

axiosRetry(axios, { retries: 3 });
const authenticateJWT = (req, res, next) => {

    const parentSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
    const authenticateSpan = tracer.startSpan("authenticate", {childOf: parentSpan});
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, accessTokenSecret, (err, user) => {
            authenticateSpan.finish();
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        authenticateSpan.finish();
        res.sendStatus(401);
    }
};

router.post('/auth/register',[trackMiddleware('auth_register')], async (req, res) => {
    let authAPI = axios.create({baseURL:"http://auth:3007"});
    axiosRetry(authAPI, { retries: 3 });
    authAPI.post(req.path, req.body, req.header)
        .then(resp => {
            if (req.headers['uber-trace-id']){
                res.setHeader('traceId',req.headers['uber-trace-id']);
            }
            res.send(resp.data, resp.status);
            return
        })
        .catch(err=>{
            if (req.headers['uber-trace-id']){
                res.setHeader('traceId',req.headers['uber-trace-id']);
            }
            res.send(err.response.data, err.response.status);
            return;
        });
});

router.post('/auth/login',[trackMiddleware('auth_login')], async(req, res) => {
    const parentSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);

    const callSpan = tracer.startSpan("call", {childOf: parentSpan});
    const headers = req.headers;
    tracer.inject(callSpan, FORMAT_HTTP_HEADERS, headers);
    
    axios.post('http://auth:3007/auth/login', req.body, {headers})
    .then((resp)=>{
        callSpan.finish();
        if (req.headers['uber-trace-id']){
            res.setHeader('traceId',req.headers['uber-trace-id']);
        }
        res.send(resp.data, resp.status);
        return;
    })
    .catch((err)=>{
        callSpan.finish();
        if (req.headers['uber-trace-id']){
            res.setHeader('traceId',req.headers['uber-trace-id']);
        }
        res.send(err).status(500);
        return;
    });
});

// router.post('/books', [trackMiddleware('create_book'), authenticateJWT], async(req, res) => {
//     const parentSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);

//     const callSpan = tracer.startSpan("call", {childOf: parentSpan});
//     const headers = req.headers;
//     tracer.inject(callSpan, FORMAT_HTTP_HEADERS, headers);
    
//     axios.get('http://books:3009/' + req.path, req.body)
//     .then((resp)=>{
//         callSpan.finish();
//         res.setHeader('traceId',req.headers['uber-trace-id']);
//         res.send(resp.data, resp.status);
//         return;
//     })
//     .catch((err)=>{
//         callSpan.finish();
//         res.setHeader('traceId',req.headers['uber-trace-id']);
//         res.send(err).status(500);
//         return;
//     });
// });

router.get('/books/*', [trackMiddleware('get_book'), authenticateJWT], async(req, res) => {
    const parentSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);

    const callSpan = tracer.startSpan("call", {childOf: parentSpan});
    const headers = req.headers;
    tracer.inject(callSpan, FORMAT_HTTP_HEADERS, headers);
    
    axios.get('http://books:3009' + req.path, {headers})
    .then((resp)=>{
        callSpan.finish();
        if (req.headers['uber-trace-id']){
            res.setHeader('traceId',req.headers['uber-trace-id']);
        }
        res.send(resp.data, resp.status);
        return;
    })
    .catch((err)=>{
        callSpan.finish();
        if (req.headers['uber-trace-id']){
            res.setHeader('traceId',req.headers['uber-trace-id']);
        }
        res.send(err).status(500);
        return;
    });
});

router.put('/books/*', [trackMiddleware('update_book'), authenticateJWT], async(req, res) => {
    const parentSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);

    const callSpan = tracer.startSpan("call", {childOf: parentSpan});
    const headers = req.headers;
    tracer.inject(callSpan, FORMAT_HTTP_HEADERS, headers);
    
    axios.put('http://books:3009' + req.path, req.body, {headers})
    .then((resp)=>{
        callSpan.finish();
        if (req.headers['uber-trace-id']){
            res.setHeader('traceId',req.headers['uber-trace-id']);
        }
        res.send(resp.data, resp.status);
        return;
    })
    .catch((err)=>{
        callSpan.finish();
        if (req.headers['uber-trace-id']){
            res.setHeader('traceId',req.headers['uber-trace-id']);
        }
        res.send(err).status(500);
        return;
    });
});

router.get('/books', [trackMiddleware('list_books'), authenticateJWT], async(req, res) => {
    const bookAPI = axios.create({baseURL:"http://books:3009"});
    axiosRetry(bookAPI, { retries: 3 });
    applyTracingInterceptors(bookAPI, {span: req.span});
    bookAPI.get(req.path, req.body, req.header)
        .then(resp => {
            if (req.headers['uber-trace-id']){
                res.setHeader('traceId',req.headers['uber-trace-id']);
            }
            res.send(resp.data, resp.status);
            return;
        })
        .catch(err=>{
            if (req.headers['uber-trace-id']){
                res.setHeader('traceId',req.headers['uber-trace-id']);
            }
            res.send(err.response.data, err.response.status);
            return;
        });
});

module.exports = router