const express = require('express')
const router = express.Router()
const Book = require('../models/book')
// allow the use of the sites home page
router.get('/', async (req, res) => {
  let books
  try { // want to render books to the homepage if they exist
    books = await Book.find().sort({
      publishDate: 'desc'
    }).limit(10).exec()
  } catch {
    books = []
  }
  res.render('index', {
    books: books
  })
})
// let us call upon this controller as indexRouter in server.js
module.exports = router