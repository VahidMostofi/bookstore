const express = require('express');
const router = express.Router();
const axios = require('axios');
//================TRACE=================
//================TRACE=================
const accessTokenSecret = process.env.JWT_KEY;
const jwt = require('jsonwebtoken');

const axiosRetry = require('axios-retry');

axiosRetry(axios, { retries: 3 });
const authenticateJWT = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

router.post('/auth/register', async (req, res) => {
    let authAPI = axios.create({baseURL:"http://auth:3007"});
    axiosRetry(authAPI, { retries: 3 });
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

router.post('/auth/login', async(req, res) => {
    const headers = req.headers;
    
    axios.post('http://auth:3007/auth/login', req.body, {headers})
    .then((resp)=>{
        res.send(resp.data, resp.status);
        return;
    })
    .catch((err)=>{
        res.send(err).status(500);
        return;
    });
});


router.get('/auth/metrics', async(req, res) => {
    const headers = req.headers;

    axios.get('http://auth:3027/metrics', req.body, {headers})
        .then((resp)=>{
            res.send(resp.data, resp.status);
            return;
        })
        .catch((err)=>{
            res.send(err).status(500);
            return;
        });
});


router.get('/books/metrics', async(req, res) => {
    const headers = req.headers;

    axios.get('http://books:3029/metrics', req.body, {headers})
        .then((resp)=>{
            res.send(resp.data, resp.status);
            return;
        })
        .catch((err)=>{
            res.send(err).status(500);
            return;
        });
});


router.get('/gateway/metrics', async(req, res) => {
    const headers = req.headers;

    axios.get('http://gateway:8020/metrics', req.body, {headers})
        .then((resp)=>{
            res.send(resp.data, resp.status);
            return;
        })
        .catch((err)=>{
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

router.get('/books/*', [authenticateJWT], async(req, res) => {
    const headers = req.headers;
    
    axios.get('http://books:3009' + req.path, {headers})
    .then((resp)=>{
        res.send(resp.data, resp.status);
        return;
    })
    .catch((err)=>{
        res.send(err).status(500);
        return;
    });
});

router.put('/books/*',[authenticateJWT], async(req, res) => {
    const headers = req.headers;
    
    axios.put('http://books:3009' + req.path, req.body, {headers})
    .then((resp)=>{
        res.send(resp.data, resp.status);
        return;
    })
    .catch((err)=>{
        res.send(err).status(500);
        return;
    });
});

router.get('/books', [authenticateJWT], async(req, res) => {
    const bookAPI = axios.create({baseURL:"http://books:3009"});
    axiosRetry(bookAPI, { retries: 3 });
    bookAPI.get(req.path, req.body, req.header)
        .then(resp => {
            res.send(resp.data, resp.status);
            return;
        })
        .catch(err=>{
            res.send(err.response.data, err.response.status);
            return;
        });
});

module.exports = router
