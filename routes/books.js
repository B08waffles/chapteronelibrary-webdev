const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

const authCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect('../login')
    } else {
        next();
    }
}

// All Books Route 
router.get('/', authCheck, async (req, res) => {
    // Search for books with case insensitivity
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    // Search for books before a published date
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    // Search for books after a published date
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Book Route 
router.get('/new', authCheck, async (req, res) => {
    renderNewPage(res, new Book())


})

// Create Book Route
router.post('/', authCheck, async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    })
    saveCover(book, req.body.cover)

    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    } catch {
        renderNewPage(res, book, true)
    }
})

// Show Book Route
router.get('/:id', authCheck, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('author')
            .exec()
        res.render('books/show', {
            book: book
        })
    } catch {
        res.redirect('/')
    }
})

// Edit Book Route
router.get('/:id/edit', authCheck, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch {
        res.redirect('/')
    }
})

// Update Book Route
router.put('/:id', authCheck, async (req, res) => {
    let book

    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.copiesSold = req.body.copiesSold
        book.description = req.body.description
        book.lastupdated = new Date(req.body.lastUpdated)
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch {
        if (book != null) {
            renderEditPage(res, book, true)
        } else {
            redirect('/')
        }
    }
})

// Delete Book Page
router.delete('/:id', authCheck, async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch {
        if (book != null) {
            res.render('books/show', {
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
// dynamically render form
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

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router