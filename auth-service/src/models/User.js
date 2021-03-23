const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = function() {
    // Generate an auth token for the user
    const user = this;
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY);
    user.tokens = user.tokens.concat({token})
    while (user.tokens.length > 3){
        user.tokens.pop()
    }
    // user.save()
    return token;
}

userSchema.statics.findByCredentials = async (email, password, cb) => {
    // Search for a user by email and password.
    User.findOne({ email}, async(err, user)=>{
        if(err || !user){
            console.log('no user with',email, password);
            cb(new Error({ error: 'Invalid login credentials' }));
        }else{
            const isPasswordMatch = await bcrypt.compare(password, user.password)
            if (!isPasswordMatch) {
                return cb(new Error({ error: 'Invalid login credentials' }));
            }else{
                cb(undefined, user);
            }
        }
        
    });
}

const User = mongoose.model('User', userSchema)

module.exports = User