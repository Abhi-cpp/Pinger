const mongoose = require('mongoose');
const user = require('./user')
const validator = require('validator');

const pingDataSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
    },
    status: {
        type: Boolean
    },
    responseTime: {
        type: Number
    },
    output: {
        type: Object
    },
    statusCode: {
        type: Number
    }
});

const pingSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error('URL is invalid');
            }
        }
    },
    delay: {
        type: Number,
        required: true,
        trim: true,
        // 1 minute minimum
        min: 60000,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    pingData: {
        type: [pingDataSchema]
    },
    active: {
        type: Boolean,
        default: true
    }
}
    , {
        timestamps: true
    }
)

// if size of pingData array is greater than 100, delete the first element
pingSchema.pre('save', async function (next) {
    const ping = this;
    if (ping.pingData.length > 100) {
        ping.pingData.shift();
    }
    next();
})

// remove some data while returning the ping object
pingSchema.methods.toJSON = function () {
    const ping = this;
    const pingObject = ping.toObject();

    delete pingObject.owner;
    delete pingObject.__v;
    delete pingObject._id;

    return pingObject;
}

const ping = mongoose.model('Ping', pingSchema);

module.exports = ping;