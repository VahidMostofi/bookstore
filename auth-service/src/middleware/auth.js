const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async(req, res, next) => {
    try {
        const providedUser = req.body.user
        if (!providedUser)
            throw new Error()
        const token = req.header('Authorization').replace('Bearer ', '')
        const user = await User.findOne({ _id: providedUser._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
module.exports = auth