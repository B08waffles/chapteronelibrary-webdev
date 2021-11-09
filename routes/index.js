const express = require('express')
const router = express.Router()
const Book = require('../models/books')

router.get('/', (req, res) => {
    let books = []
    try {
        books = Book.find().sort({ lastUpdated: 'desc' }) //sort by most recently updated
        .limit(10).exec() //show 10 books 
    } catch { 

    }
    res.render('index', { books: books})
})

module.exports = router