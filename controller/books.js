const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'] // define what image file types we allow
const validator = require('validator')
const logModel = require('../models/logModel')



// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find() // allow for book search
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i')) // search books with no case sensitivity 
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore) // find books by published before date
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter) // find books by published after date
  }
  try {
    const books = await query.exec()
    res.render('books/index', { // render all this data to the books page 
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Book Route
router.get('/new', async (req, res) => { // Allows for one to get the new book page
  renderNewPage(res, new Book())
})

// Create Book Route
router.post('/', async (req, res) => {


  const book = new Book({
    title: validator.escape(req.body.title), // validate all form input
    author: validator.escape(req.body.author),
    publishDate: new Date(req.body.publishDate),
    copiesSold: validator.escape(req.body.copiesSold),
    description: validator.escape(req.body.description)
  })
  saveCover(book, req.body.cover) //savecover is a function we defined elsewhere

  try {
    const newBook = await book.save() // the magic of async functions is for the await function

    res.redirect(`books/${newBook.id}`) // redirect to the page of the book you just made
    let dateTimeNow = (new Date()).toISOString()  // log our changes
    logModel.addLogEntryBook(res.insertId, req,session.user.username, dateTimeNow)
  } catch {
    renderNewPage(res, book, true)
  }
})

// Show Book Route
router.get('/:id', async (req, res) => { // Allow one to get a page for a book 
  try {
    const book = await Book.findById(req.params.id)
      .populate('author') // pull from the author table to get the author of the book in 
      .exec()
    res.render('books/show', {
      book: book
    }) //render the book you clicked on 
  } catch {
    res.redirect('/')
  }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => { // async because we need to 'await' to find the book 

  try {
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book) // render in the book we just found 
  } catch {
    res.redirect('/')
  }
})

// Update Book Route
router.put('/:id', async (req, res) => {

  let book

  try {
    book = await Book.findById(req.params.id) // async's await to find the book we want to edit
    book.title = validator.escape(req.body.title)
    book.author = validator.escape(req.body.author)
    book.publishDate = new Date(req.body.publishDate) // validator on all form inputs
    book.copiesSold = validator.escape(req.body.copiesSold)
    book.description = validator.escape(req.body.description)
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
    let dateTimeNow = (new Date()).toISOString()  // log our changes
    logModel.addLogEntryBook(book.bookid, req,session.user.username, dateTimeNow) // save the book and redirect to the new books page

  } catch {
    if (book != null) {
      renderEditPage(res, book, true)
    } else {
      redirect('/')
    }
  }
})

// Delete Book Page
router.delete('/:id', async (req, res) => { // async so that we can 'await' to find the book 

  let book
  try {
    book = await Book.findById(req.params.id)
    await book.remove() // delete is as simple as using remove()
    res.redirect('/books')
  } catch {
    if (book != null) {
      res.render('books/show', { // show the book's page if error
        book: book,
        errorMessage: 'Could not remove book'
      })
    } else {
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Book'
      } else {
        params.errorMessage = 'Error Creating Book'
      }
    }
    res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
}
// convert out images to base64 in order to save intot the database
function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}

module.exports = router