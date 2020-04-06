const express = require('express');
const router = express.Router();
//================TRACE=================
const CLSContext = require('zipkin-context-cls');
const {Tracer} = require('zipkin');
const {recorder} = require('./recorder');
const ctxImpl = new CLSContext('zipkin');
const localServiceName = 'gateway';
const tracer = new Tracer({ctxImpl, recorder: recorder(localServiceName), localServiceName});
const wrapAxios = require('zipkin-instrumentation-axiosjs');
const axios = wrapAxios(require('axios'), {tracer});
//================TRACE=================
const accessTokenSecret = process.env.JWT_KEY;
const jwt = require('jsonwebtoken');

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
    axios.post("http://auth:3007" + req.path, req.body, req.header)
    .then(resp => {
        res.send(resp.data, resp.status);
        return
    })
    .catch(err=>{
        res.send(err.response.data, err.response.status);
        return;
    });
});

router.post('/auth/login', async(req, res) => {
    axios.post("http://auth:3007" + req.path, req.body, req.header)
    .then(resp => {
        res.send(resp.data, resp.status);
        return;
    })
    .catch(err=>{
        res.send(err.response.data, err.response.status);
        return;
    });
});

router.post('/books', authenticateJWT, async(req, res) => {
    axios.post("http://books:3009" + req.path, req.body, req.header)
    .then(resp => {
        res.send(resp.data, resp.status);
        return;
    })
    .catch(err=>{
        res.send(err.response.data, err.response.status);
        return;
    });
});

router.get('/books/*', authenticateJWT, async(req, res) => {
    axios.get("http://books:3009" + req.path, req.body, req.header)
    .then(resp => {
        res.send(resp.data, resp.status);
        return;
    })
    .catch(err=>{
        res.send(err.response.data, err.response.status);
        return;
    });
});

router.put('/books/*', authenticateJWT, async(req, res) => {
    axios.put("http://books:3009" + req.path, req.body, req.header)
    .then(resp => {
        res.send(resp.data, resp.status);
        return;
    })
    .catch(err=>{
        res.send(err.response.data, err.response.status);
        return;
    });
});

router.get('/books', authenticateJWT, async(req, res) => {
    axios.get("http://books:3009" + req.path, req.body, req.header)
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