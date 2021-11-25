const express = require('express')
const Book = require('../models/book')
const router = express.Router()
const Author = require('../models/author')
const validator = require('validator')

// All Authors Route 
router.get('/', async (req, res) => {
    let searchOptions = {}
    //make sure author cant be empty 
    if (req.query.name != null && req.query.name !== '') {
        // make searching for authors case insensitive
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        // populate the search bar with the searched author 
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')

    }

})

//New Author Route 
router.get('/new', (req, res) => {
    res.render('authors/new', {
        author: new Author()
    })
})

// Create Author Route
router.post('/', async (req, res) => {
    const author = new Author({
        name: validator.escape(req.body.name)
    })
    try {
        const newAuthor = await author.save()
        res.redirect(`authors/${newAuthor.id}`)
    } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
})
// search author route
router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({
            author: author.id
        }).limit(6).exec()
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    } catch {
        res.redirect('/')
    }
})
// render edit author page 
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', {
            author: author
        })
    } catch {
        res.redirect('/authors')
    }
})
// update author route 
router.put('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = validator.escape(req.body.name)
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch {
        if (author == null) {
            res.redirect('/')
        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating Author'
            })
        }
    }
})
// delete an author route
router.delete('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect('/authors')
    } catch {
        if (author == null) {
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router