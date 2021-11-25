const mongoose = require('mongoose')
const Book = require('./book')
// new schema for authors, everything in mongoDB is a schema 
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})
// Ensure books always have Author, don't allow Authors associated with book(s) get deleted
authorSchema.pre('remove', function (next) {
    Book.find({
        author: this.id
    }, (err, books) => {
        if (err) {
            next(err)
        } else if (books.length > 0) {
            next(new Error('This author has books still'))
        } else {
            next()
        }
    })
})
// export Author and authorschema so we may call upon them elsewhere
module.exports = mongoose.model('Author', authorSchema)