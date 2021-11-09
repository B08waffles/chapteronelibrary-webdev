const mongoose = require('mongoose')
const path = require('path')

const coverImageBasePath = 'uploads/bookCovers'

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    copiesSold: {
        type: Number,
        required: true
    },
    publishDate: {
        type: Date,
        required: true 
    },
    lastUpdated: {
        type: Date, 
        default: Date.now
    },
    coverImageName: {
        type: String, 
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }
})
// Create a function that allows book covers to be displayed on All Books page 
bookSchema.virtual('coverImagePath').get(function() {
    if (this.coverImageName != null) {
        return path.join('/', coverImageBasePath, this.coverImageName)
    }
})

module.exports = mongoose.model('Book', bookSchema)
module.exports.coverImageBasePath = coverImageBasePath