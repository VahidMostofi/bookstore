const express = require('express');
const router = express.Router();
const axios = require('axios');
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
    let authAPI = axios.create({baseURL:"http://auth:3007"});
    applyTracingInterceptors(authAPI, {span: req.span});
    authAPI.post(req.path, req.body, req.header)
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
    const bookAPI = axios.create({baseURL:"http://books:3009"});
    applyTracingInterceptors(bookAPI, {span: req.span});
    bookAPI.get(req.path, req.body, req.header)
        .then(resp => {
            res.setHeader('traceId',req.headers['uber-trace-id']);
            res.send(resp.data, resp.status);
            return;
        })
        .catch(err=>{
            res.send(err.response.data, err.response.status);
            return;
        });
});

router.put('/books/*', [trackMiddleware('update_book'), extractSpanMiddleware, authenticateJWT], async(req, res) => {
    const bookAPI = axios.create({baseURL:"http://books:3009"});
    applyTracingInterceptors(bookAPI, {span: req.span});
    bookAPI.put(req.path, req.body, req.header)
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