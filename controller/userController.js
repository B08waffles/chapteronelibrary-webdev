/*
var express = require('express');
var router = express.Router();
var con  = require('../util/database');
 
 
//display login page
router.get('login', function(req, res, next){    
    // render to views/user/add.ejs
    res.render('users/login', {
        title: 'Login',
        email: '',
        password: ''     
    })
})
 
 
//authenticate user
router.post('/login', function(req, res, next) {
       
    var email = req.body.email;
    var password = req.body.password;
 
        con.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], function(err, rows, fields) {
            if(err) throw err
             
            // if user not found
            if (rows.length <= 0) {
                req.flash('error', 'Please correct enter email and Password!')
                res.redirect('/login')
            }
            else { // if user found
                // render to views/user/edit.ejs template file
                req.session.loggedin = true;
                req.session.name = name;
                res.redirect('/home');
 
            }            
        })
  
})
 
 
//display home page
router.get('/', function(req, res, next) {
    if (req.session.loggedin) {
         
        res.render('users/index', {
            title:"Dashboard",
            name: req.session.name,     
        });
 
    } else {
 
        req.flash('success', 'Please login first!');
        res.redirect('/login');
    }
});
 
// Logout user
router.get('/logout', function (req, res) {
  req.session.destroy();
  req.flash('success', 'Login Again Here');
  res.redirect('/login');
});
 
module.exports = router;

*/

var express = require('express');
var router = express.Router();
var con = require('../util/database');
const bcrypt = require("bcrypt");
const userModel = require('../models/userModel')

// display login user page
router.get('/login', function (req, res, next) {
    // render to login.ejs
    res.render('users/login', {
        username: '',
        password: ''
   })
})


router.post("/login", (req, res) => {
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
                    console.log("login successful")
                    res.redirect('/')
                } else {
                    // let teh client know login failed
                    console.log("login failed - User credentials are not valid")
                    res.render('login', { username, password })
                }
            } else {
                // No user found with that username
                console.log("that user doesn't exist!")
                res.render('login', { username, password })
            }
        })
        .catch((error) => {
            console.log("failed to get user - query error")
        })
})

router.post("/users/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) throw error;
        console.log('User logout.');
        res.redirect('/users/login');
      });
    });




// display user page
router.get('/index', function (req, res, next) {
    con.query('SELECT * FROM users ORDER BY userID desc', function (err, rows) {
        if (err) {
            req.flash('error', err);
            // render to views/users/index.ejs
            res.render('users/index', {
                data: ''
            });
        } else {
            // render to views/users/index.ejs
            res.render('users/index', {
                data: rows
            });
        }
    });
});

// display add user page
router.get('/register', function (req, res, next) {
    // render to add.ejs
    res.render('users/register', {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        accessRights: ''
    })
})

// add a new user
router.post('/register', function (req, res, next) {

    let firstName = req.body.firstName;
    let lastName = req.body.lastName
    let username = req.body.username;
    let email = req.body.email;
    // Hash the password before inserting into DB
    let hashedpassword = bcrypt.hashSync(req.body.password, 10);
    let accessRights = req.body.accessRights;
    let errors = false;


    if (username < 1 || email < 1) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter name and email");
        // render to register.ejs with flash message
        res.render('users/register', {
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            hashedPassword: '',
            accessRights: ''
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: hashedpassword,
            accessRights: accessRights,
        }

        // insert query
        con.query('INSERT INTO users SET ?', form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)

                // render to register.ejs
                res.render('users/register', {
                    firstName: form_data.firstName,
                    lastName: form_data.lastName,
                    username: form_data.username,
                    email: form_data.email,
                    password: form_data.password,
                    accessRights: form_data.accessRights
                })
            } else {
                req.flash('success', 'User successfully added');
                res.redirect('/index');
            }
        })
    }
})

// display edit user page
router.get('/edit/(:userID)', function (req, res, next) {

    let userID = req.params.userID;

    con.query('SELECT * FROM users WHERE userId = ' + userID, function (err, rows, fields) {
        if (err) throw err

        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'User not found with id = ' + userID)
            res.redirect('/users')
        }
        // if user found
        else {
            // render to edit.ejs
            res.render('users/edit', {
                title: 'Edit User',
                userID: rows[0].userID,
                firstName: rows[0].firstName,
                lastName: rows[0].lastName,
                username: rows[0].username,
                password: rows[0].password,
                email: rows[0].email,
                accessRights: rows[0].accessRights
            })
        }
    })
})

// update user data
router.post('/edit/:userID', function (req, res, next) {

    let userID = req.params.userID;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let username = req.body.userName;
    let email = req.body.email;
    let hashedpassword = bcrypt.hashSync(req.body.password, 10);
    let accessRights = req.body.accessRights;
    let errors = false;

    if (username.length === 0 || email.length === 0) {
        errors = true;
        // Only allow valid emails

        // set flash message
        req.flash('error', "Please enter name and email");
        // render to add.ejs with flash message
        res.render('users/edit', {
            userID: req.params.userID,
            firstName: req.params.firstName,
            lastName: req.params.lastName,
            lastName: req.params.lastName,
            username: req.params.username,
            email: req.params.email,
            accessRights: req.params.accessRights
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: hashedpassword,
            accessRights: accessRights
        }
        // update query
        con.query('UPDATE users SET ? WHERE userId = ' + userID, form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('users/edit', {
                    userId: req.params.userID,
                    firstName: form_data.firstName,
                    lastName: form_data.lastName,
                    username: form_data.username,
                    email: form_data.email,
                    position: form_data.position
                })
            } else {
                req.flash('success', 'User successfully updated');
                res.redirect('/users');
            }
        })
    }
})

// delete user
router.get('/delete/(:userID)', function (req, res, next) {

    let userID = req.params.userID;

    con.query('DELETE FROM users WHERE userID = ' + userID, function (err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to user page
            res.redirect('/users')
        } else {
            // set flash message
            req.flash('success', 'User successfully deleted! ID = ' + userID)
            // redirect to user page
            res.redirect('/users')
        }
    })
})

module.exports = router;




/*const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

router.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {
        name: req.user.name
    })
})

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

router.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

router.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            userId: req.body,userId,
            firstName: req.body.firstName,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

module.exports =  checkAuthenticated, checkNotAuthenticated, router; */
/* const express = require("express")
const router = express.Router()

router.use(logger)

router.get("/", (req, res) => {
  console.log(req.query.name)
  res.send("User List")
})

router.get("/new", (req, res) => {
  res.render("users/new")
})

router.post("/", (req, res) => {
  const isValid = false
  if (isValid) {
    users.push({ firstName: req.body.firstName })
    res.redirect(`/users/${users.length - 1}`)
  } else {
    console.log("Error")
    res.render("users/new", { firstName: req.body.firstName })
  }
})

router
  .route("/:id")
  .get((req, res) => {
    console.log(req.user)
    res.send(`Get User With ID ${req.params.id}`)
  })
  .put((req, res) => {
    res.send(`Update User With ID ${req.params.id}`)
  })
  .delete((req, res) => {
    res.send(`Delete User With ID ${req.params.id}`)
  })

const users = [{ name: "testname" }, { name: "testname" }]
router.param("id", (req, res, next, id) => {
  req.user = users[id]
  next()
})

function logger(req, res, next) {
  console.log(req.originalUrl)
  next()
}

module.exports = router */










































/*
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