const mongoose = require('mongoose')
const User = require('.user')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    }
    password: { 
        
    }
})