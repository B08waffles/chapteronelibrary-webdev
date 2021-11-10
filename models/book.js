const mongoose = require('mongoose')


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
    coverImage: {
        type: Buffer, 
        required: true
    },
    coverImageType: {
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
    if (this.coverImage != null && this.coverImageType != null) {
      return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
  })
  
  module.exports = mongoose.model('Book', bookSchema)
