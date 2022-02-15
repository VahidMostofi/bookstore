const express = require('express');
const User = require('../models/inMemUser');
const auth = require('../middleware/auth');
const { FORMAT_HTTP_HEADERS } = require('opentracing');
const router = express.Router()

router.get('/auth/health', async (req,res) => {
    res.status(200).end();
})

router.post('/auth/register', async (req, res) => {
    // Create a new user
    try {
        const user = req.body
        const userSaved = await User.save(user)
        const token = User.generateAuthToken(userSaved)
        res.status(201).send({ userSaved, token })
        // await user.save()
    } catch (error) {
        console.error(error)
        res.status(400).send({err: error.toString()})
    }
})

router.post('/auth/login', async(req, res) => {
    //Login a registered user
    const { email, password } = req.body;
    User.findByCredentials(email, password, async (err, user)=>{
        if (err || !user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = User.generateAuthToken(user);
        res.send({ user, token });
    });
})
//
// //deprecated need to fixed for tracing and ....
// router.get('/auth/me', auth, async(req, res) => {
//     // View logged in user profile
//     res.send(req.user)
// })
// //deprecated
// router.post('/auth/me/logout', auth, async (req, res) => {
//     // Log user out of the application
//     try {
//         req.user.tokens = req.user.tokens.filter((token) => {
//             return token.token != req.token
//         })
//         await req.user.save()
//         res.send()
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })
// //deprecated
// router.post('/auth/me/logoutall', auth, async(req, res) => {
//     // Log user out of all devices
//     try {
//         req.user.tokens.splice(0, req.user.tokens.length)
//         await req.user.save()
//         res.send()
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })

module.exports = router
