const express = require('express');
const router = express.Router();
const axios = require('axios');
const http = require('http');
//================TRACE=================
const {trackMiddleware,extractSpanMiddleware, applyTracingInterceptors, tracer} = require('./trace_utils');
//================TRACE=================
const accessTokenSecret = process.env.JWT_KEY;
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authenticateSpan = tracer.startSpan("authenticate", {childOf: req.span});
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

router.post('/auth/register',[trackMiddleware('auth_register'), extractSpanMiddleware], async (req, res) => {
    let authAPI = axios.create({baseURL:"http://auth:3007"});
    applyTracingInterceptors(authAPI, {span: req.span});
    authAPI.post(req.path, req.body, req.header)
        .then(resp => {
            res.setHeader('traceId',req.headers['uber-trace-id']);
            res.send(resp.data, resp.status);
            return
        })
        .catch(err=>{
            res.setHeader('traceId',req.headers['uber-trace-id']);
            res.send(err.response.data, err.response.status);
            return;
        });
});

router.post('/auth/login',[trackMiddleware('auth_login'), extractSpanMiddleware], async(req, res) => {
    // let authAPI = axios.create({baseURL:"http://auth:3007"});
    // applyTracingInterceptors(authAPI, {span: req.span});
    // authAPI.post(req.path, req.body, req.header)
    //     .then(resp => {
    //         res.setHeader('traceId',req.headers['uber-trace-id']);
    //         res.send(resp.data, resp.status);
    //         return;
    //     })
    //     .catch(err=>{
    //         res.setHeader('traceId',req.headers['uber-trace-id']);
    //         res.send(err.response.data, err.response.status);
    //         return;
    //     });
    const loginRequest = tracer.startSpan("auth_req_login", {childOf: req.span});
    const loginConnect = tracer.startSpan("auth_connect", {childOf: loginRequest});
    const data = JSON.stringify(req.body);
    const header = req.headers;
    header['content-length'] = data.length;
    var options = {
        'method': 'post',
        'host':'auth',
        'port':3007,
        'headers': header,
        'path': req.path,
    };
    const request = http.request(options, (response)=>{
        let data = '';
        response.on('data', (chunk)=>{
            data += chunk;
        });
        response.on('end',()=>{
            loginRequest.finish();
            res.setHeader('traceId', req.headers['uber-trace-id']);
            res.setHeader('Content-Type', response.headers['content-type']);
            res.send(data, response.statusCode);
        });
    });
    request.on('socket', function(s){
        s.on('connect', function(){
            loginConnect.finish();
        });
    });
    request.write(data);
    request.end();
});

router.post('/books', [trackMiddleware('create_book'), extractSpanMiddleware, authenticateJWT], async(req, res) => {
    const bookAPI = axios.create({baseURL:"http://books:3009"});
    applyTracingInterceptors(bookAPI, {span: req.span});
    bookAPI.post(req.path, req.body, req.header)
        .then(resp => {
            res.setHeader('traceId',req.headers['uber-trace-id']);
            res.send(resp.data, resp.status);
            return;
        })
        .catch(err=>{
            res.setHeader('traceId',req.headers['uber-trace-id']);
            res.send(err.response.data, err.response.status);
            return;
        });
});

router.get('/books/*', [trackMiddleware('get_book'), extractSpanMiddleware, authenticateJWT], async(req, res) => {
    // const bookAPI = axios.create({baseURL:"http://books:3009"});
    // applyTracingInterceptors(bookAPI, {span: req.span});
    // bookAPI.get(req.path, req.body, req.header)
    //     .then(resp => {
    //         res.setHeader('traceId',req.headers['uber-trace-id']);
    //         res.send(resp.data, resp.status);
    //         return;
    //     })
    //     .catch(err=>{
    //         res.send(err.response.data, err.response.status);
    //         return;
    //     });
    const getBookRequest = tracer.startSpan("books_get_book", {childOf: req.span});
    const requestConnect = tracer.startSpan("books_connect", {childOf: getBookRequest});

    var options = {
        'method': 'get',
        'host':'books',
        'port':3009,
        'headers': req.headers,
        'path': req.path,
    };
    const request = http.request(options, (response)=>{
        let data = '';
        response.on('data', (chunk)=>{
            data += chunk;
        });
        response.on('end',()=>{
            // console.log(data);
            getBookRequest.finish();
            res.setHeader('traceId', req.headers['uber-trace-id']);
            res.setHeader('Content-Type', response.headers['content-type']);
            res.send(data, response.statusCode);
        });
    });
    request.on('socket', function(s){
        s.on('connect', function(){
            // console.log('Connected!', process.hrtime()[0]);
            requestConnect.finish();
        });
    });
    request.end();
});

router.put('/books/*', [trackMiddleware('update_book'), extractSpanMiddleware, authenticateJWT], async(req, res) => {
    // const bookAPI = axios.create({baseURL:"http://books:3009"});
    // applyTracingInterceptors(bookAPI, {span: req.span});
    // bookAPI.put(req.path, req.body, req.header)
    //     .then(resp => {
    //         res.setHeader('traceId',req.headers['uber-trace-id']);
    //         res.send(resp.data, resp.status);
    //         return;
    //     })
    //     .catch(err=>{
    //         res.setHeader('traceId',req.headers['uber-trace-id']);
    //         res.send(err.response.data, err.response.status);
    //         return;
    //     });
    const editBookRequest = tracer.startSpan("books_edit_book", {childOf: req.span});
    const getBookConnect = tracer.startSpan("books_connect", {childOf: editBookRequest});
    const data = JSON.stringify(req.body);
    const header = req.headers;
    header['content-length'] = data.length;
    var options = {
        'method': 'put',
        'host':'books',
        'port':3009,
        'headers': header,
        'path': req.path,
    };
    const request = http.request(options, (response)=>{
        let data = '';
        response.on('data', (chunk)=>{
            data += chunk;
        });
        response.on('end',()=>{
            editBookRequest.finish();
            res.setHeader('traceId', req.headers['uber-trace-id']);
            res.setHeader('Content-Type', response.headers['content-type']);
            res.send(data, response.statusCode);
        });
    });
    request.on('socket', function(s){
        s.on('connect', function(){
            getBookConnect.finish();
        });
    });
    request.write(data);
    request.end();
});

router.get('/books', [trackMiddleware('list_books'), extractSpanMiddleware, authenticateJWT], async(req, res) => {
    const bookAPI = axios.create({baseURL:"http://books:3009"});
    applyTracingInterceptors(bookAPI, {span: req.span});
    bookAPI.get(req.path, req.body, req.header)
        .then(resp => {
            res.setHeader('traceId',req.headers['uber-trace-id']);
            res.send(resp.data, resp.status);
            return;
        })
        .catch(err=>{
            res.setHeader('traceId',req.headers['uber-trace-id']);
            res.send(err.response.data, err.response.status);
            return;
        });
});

module.exports = router