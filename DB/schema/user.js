const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const Ping = require('./ping')

const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    password: {
        type: String,
        require: true,
        trim: true,
        minLength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password'))
                throw new Error('Passowrd must not contain word "password"')
        }
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},
    {
        timestamps: true
    })

userSchema.virtual('pings', {
    ref: 'Ping',
    localField: '_id',
    foreignField: 'owner'
})
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) throw new Error('Unable to find User')
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error('wrong email or password')
    return user
}
//hashing the pw
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next();
})


userSchema.pre('deleteOne', async function (next) {
    const user = await this.model.findOne(this.getQuery())
    await Ping.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)
User.createIndexes();
module.exports = User