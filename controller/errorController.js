const express = require('express')
const router = express.Router()

router.get('/error', (req, res) => {
    res.render('/error/401')
})

router.get('/error', (req, res) => {
    res.render('/error/403')
})


module.exports = router
