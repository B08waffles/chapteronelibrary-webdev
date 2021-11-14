//not actually using this for now, storing users locally in server.js file 
/*
const mongoose = require('mongoose')
const ROLE = {
    ADMIN: 'admin',
    BASIC: 'basic'
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userId: {
        type: Date(toString()), 
        default: Date.now
    }
    
})
module.exports = mongoose.model('User', userSchema) */