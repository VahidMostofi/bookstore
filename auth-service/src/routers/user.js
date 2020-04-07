const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const {trackMiddleware, tracer} = require('../trace_utils');

const router = express.Router()

router.get('/auth/health', trackMiddleware('heath'), async (req,res) => {
    res.status(200).end();
})

router.post('/auth/register', trackMiddleware('register'),async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        const queryDBSpan = tracer.startSpan("saveDB", {childOf: req.span});
        await user.save()
        queryDBSpan.finish();
        const genTokenSpan = tracer.startSpan("generateAuthToken", {childOf: req.span});
        const token = await user.generateAuthToken()
        genTokenSpan.finish();
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/auth/login', trackMiddleware('login'), async(req, res) => {
    //Login a registered user
    const { email, password } = req.body;
    const queryDBSpan = tracer.startSpan("queryDB", {childOf: req.span});
    User.findByCredentials(email, password, async (err, user)=>{
        queryDBSpan.finish();
        if (err || !user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const genTokenSpan = tracer.startSpan("generateAuthToken", {childOf: req.span});
        const token = user.generateAuthToken();
        genTokenSpan.finish();
        res.send({ user, token });
    });
})

//deprecated need to fixed for tracing and ....
router.get('/auth/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})
//deprecated
router.post('/auth/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})
//deprecated
router.post('/auth/me/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router