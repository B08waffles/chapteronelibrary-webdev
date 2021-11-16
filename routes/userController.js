const express = require("express")
const bcrypt = require("bcrypt")
const validator = require("validator")

const router = express.Router()

const userModel = require("../models/userModel")

router.get("/users", (req, res) => {
    userModel.getAllUsers()
        .then((results) => {
            res.status(200).json(results)
        })
        .catch((error) => {
            console.log(error)
            res.status(500).json("query error")
        })
})

router.post("/users/create", (req, res) => {
    // Only allow admins to use this endpoint
    if (req.session.user.accessRights != "admin") {
        // Send back an error message
        res.status(403).json("admin only action")
        // Stop this response handler here
        return;
    }

    // req.body represents the form field data (json in body of fetch)
    let user = req.body

    // Only allow valid emails
    if (validator.isEmail(user.email) == false) {
        res.status(300).json("invalid email")
        return;
    }

    // Hash the password before inserting into DB
    let hashedPassword = bcrypt.hashSync(user.password, 6)

    // Each of the following names reference the "name"
    // attribute in the inputs of the form.
    userModel.createUser(
        validator.escape(user.firstName),
        validator.escape(user.lastName),
        validator.escape(user.email),
        validator.escape(user.username),
        hashedPassword, // We now store the hashed version of the password
        validator.escape(user.accessRights)
    )
    .then((result) => {
        res.status(200).json("user created with id " + result.insertId)
        
        // Log user creation
        logModel.addLogEntryCreate(req.session.user.userID, result.insertId)
    })
    .catch((error) => {
        console.log(error)
        res.status(500).json("query error - failed to create user")
    })

})

// !!! You should add a comment here explaining this block in your own words.
// Well it looks to me like your trying to find a user by their userID parameter
router.get("/users/:id", (req, res) => {
    userModel.getUserById(req.params.id)
        .then((results) => {
            if (results.length > 0) {
                res.status(200).json(results[0])
            } else {
                res.status(404).json("failed to get user by id")
            }
        })
        .catch((error) => {
            console.log(error)
            res.status(500).json("failed to get user - query error")
        }) 
})

// Define an /api/users/update endpoint that updates an existing user
router.post("/users/update", (req, res) => {
    // the req.body represents the posted json data
    let user = req.body

    let password = user.password

    // If the string does NOT start with a $ then we need to hash it.
    // Existing passwords that do start with $ are already hashed.
    if (!password.startsWith("$")) {
        password = bcrypt.hashSync(password, 6)
    }
    
    // Each of the names below reference the "name" attribute in the form
    userModel.updateUser(
        user.userId,
        user.firstName,
        user.lastName,
        user.email,
        user.username,
        password, // Use the hashed password
        user.accessRights
    )
    .then((result) => {
        if (result.affectedRows > 0) {
            res.status(200).json("user updated")
        } else {
            res.status(404).json("user not found")
        }
    })
    .catch((error) => {
        console.log(error)
        res.status(500).json("failed to update user - query error")
    })
})

router.post("/users/delete", (req, res) => {
    // Access the user id from the body of the request
    let userId = req.body.userId

    // Ask the model to delete the user with userId
    userModel.deleteUser(userId)
        .then((result) => {
            if (result.affectedRows > 0) {
                res.status(200).json("user deleted")
            } else {
                res.status(404).json("user not found")
            }
        })
        .catch((error) => {
            console.log(error)
            res.status(500).json("failed to delete user - query error")
        })
})

router.post("/users/login", (req, res) => {
    let login = req.body

    userModel.getUserByUsername(login.username)
        .then((results) => {
            if (results.length > 0) {
                // We found a user with that username,
                // next we check their password.
                let user = results[0]

                // Check if the login password matches the users password hash
                if (bcrypt.compareSync(login.password, user.password)) {
                    // setup session information
                    req.session.user = {
                        userID: user.userID,
                        accessRights: user.accessRights,
                    }

                    // let the client know login was successful
                    res.status(200).json("login successful")
                } else {
                    // let teh client know login failed
                    res.status(401).json("login failed")
                }
            } else {
                // No user found with that username
                res.status(404).json("that user doesn't exist!")
            }
        })
        .catch((error) => {
            console.log(error)
            res.status(500).json("failed to get user - query error")
        })
})

router.post("/users/logout", (req, res) => {
    req.session.destroy()
    res.status(200).json("logged out")
})

// This allows the server.js to import (require) the routes
// defined in this file.
module.exports = router



/* const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const sequelize = require("../util/database");
const users = require("../models/userModel")

router.get('/register', checkNotAuthenticated, async (req, res) => {
    try { // passwords to be stored in database like '$2b$10$vfSMEbYBGRoXwpOO5jtbmOB4fHrfG1yd2yTXhklaOlLtSWOBnnB4q'
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    console.log(hashedPassword)
    users.push({
        userID: req.body.userID,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword,
        accessRights: req.body.accessRights,
      })
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
    console.log(users)
  });
module.exports = router */