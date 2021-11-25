// Determine whether we are in production or development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
};
// Enable Express and define Express as a const of "server"
const express = require("express"); // runs express on node, alternative is hapi 
const server = express(); //define express as 'server'
const bcrypt = require('bcrypt') //password hashing package
/*const { body, validationResult } = require('express-validator');
const cookieSession = require('cookie-session'); */
const validator = require('express-validator')
const cookieParser = require('cookie-parser');
const session = require("express-session"); // allows us to overcome the stateless nature of http 
const expressLayouts = require('express-ejs-layouts'); //define our view engine as ejs
const bodyParser = require('body-parser');
const methodOverride = require('method-override');  // allows us to override form functions like post and put

server.use(cookieParser());
const flash = require('express-flash'); //flash is for error messages
// integrate database    This mongodb is setup for books and authors, see /util/database for sql users setup
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));

const logger = require('morgan');  // puts everything into the console any action anyone takes


// enable form method overides
server.use(methodOverride('_method'));// override form actions like post
server.use(express.static('public')); //define 'public' as an accessable folder

server.use(logger('dev')); //tells us what is happening when we run a request
// Enable session and cookie to overcome the stateless nature of http protocol. 
server.use(session({
  secret: 'secret phrase abc123',
  resave: true,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60, // 1 hour
    sameSite: true
  },

}))

// Define the view engine to us Express Layouts and to read .ejs files
server.set('view engine', 'ejs');  // ejs is a template language
server.set('views', __dirname + '/views'); // make it so that views dont show in the url bar
// put all common html elements in the one file "layouts" to be added to other pages
server.set('layout', 'layouts/layout'); // every page we use will use layouts/layout.ejs
server.use(expressLayouts);



// Enable error pages 
//server.use((req, res) => {
//  res.status(404).render('404');
//});

// host application locally for testing purposes, type in browser localhost:3000 to access
server.listen(process.env.PORT || 3000);

// Enable middleware for JSON and urlencoded form data
server.use(express.json());
server.use(express.urlencoded({
  extended: true
}));
//server.use(cookieParser());

server.use(flash());
//server.use(expressValidator());



// Jaspers code
// Setup our own access control middleware
// Must happen after JSON and session middleware but before static files
server.use((req, res, next) => {
  // The user is logged in if they have session data
  let userLoggedIn = req.session.user != null

  // URLs we will allow for non logged in clients (guests)
  let guestAllowedURLs = [
    "/users/login",
    "/layout/layout.ejs",
    "/partials/errorMessage",
    "/partials/header.ejs",
    "/public/styles/main.css",
    "/books/",
    "/authors/",
    "/",
  ]
  if (userLoggedIn) {
    // Allow the request through
    next()
  } else {
    // Check that the guest page is only
    // asking for an allowed resource
    if (guestAllowedURLs.includes(req.originalUrl)) {
      // Allow the guest user through
      next()
    } else {
      // Redirect them to the login page
      res.redirect("/users/login")
    }
  }
});


// Serve static frontend resources
server.use(express.static("views"))

// define the routes/controller paths
const userController = require("./controller/userController")
const indexRouter = require('./controller/index');
const authorRouter = require('./controller/authors');
const bookRouter = require('./controller/books');
// use the routes/controllers
server.use("/users", userController)
server.use('/', indexRouter)
server.use('/authors', authorRouter)
server.use('/books', bookRouter)




//server.use('/users', userController)

// Link up the author controller
//const authorController = require("./backend/controllers/authorController")
//server.use("/api", authorController)

// Start the express server
//server.listen(port, () => {
//    console.log("Backend listening on http://localhost:"+port)
//})



/* My code before Jasper released his on Connect
// type "npm run devStart" to enter dev mode with nodemon and our .env file on localhost:3000"

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
// define the routes/controller paths
const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');
const userRouter = require('./routes/users');
//bcrypt for password hashing
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
// allow sessions for logged in users
const session = require('express-session');
// allow server to use .ejs files 
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
// put all common html elements in the one file "layouts" to be added to other pages
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
// allow the use of json syntax 
app.use(express.json());
// enable form method overides
app.use(methodOverride('_method'));
app.use(express.static('public'));
// encode data in a way we can use it    
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: false
}));
// implement sequelize ORM for SQL and user model
const sequelize = require("./util/database");
const User = require("./models/user");

sequelize.sync().then(result => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
// integrate database 
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));

// MySQL database integration can be found via ../util/database.js its currently set for the users table

// host application locally for testing purposes, type in browser localhost:3000 to access
app.listen(process.env.PORT || 3000);

// authenticate user 

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);



/*
app.get(authorRouter, checkAuthenticated, (req, res) => {
  res.get('author/', authorRouter, {
    name: req.user.username
  })
});

app.get(bookRouter, checkAuthenticated, (req, res) => {
  res.get('books/', bookRouter, {
    name: req.user.username
  })
});
*/
/*
app.use(express.urlencoded({
  extended: false
}));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', userRouter)

app.get('/', checkAuthenticated, (req, res) => {
  if (req.user) {
    res.render('index.ejs', {
      name: req.user.name
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
});
// give successfully logged in user express passport-local 
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
});

// Create New User 
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try { // passwords to be stored in database like '$2b$10$vfSMEbYBGRoXwpOO5jtbmOB4fHrfG1yd2yTXhklaOlLtSWOBnnB4q'
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
  console.log(users)
});


// Middleware to check if logged in           
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    app.use('/', indexRouter);
    app.use('/books', bookRouter);
    app.use('/authors', authorRouter);
    // not sure if these app gets below are working 
    app.get('/books', checkAuthenticated, (req, res) => {
      res.render('books/index.ejs', {
        name: req.user.name
      })
    });

    app.get('/authors', checkAuthenticated, (req, res) => {
      res.render('authors/index.ejs', {
        name: req.user.name
      })
    });

    app.get('/books/edit', checkAuthenticated, (req, res, next) => {
      res.render('books/edit.ejs', {
        name: req.user.name
      })
    });

    app.get('/books/new', checkAuthenticated, (req, res) => {
      res.render('books/new.ejs', {
        name: req.user.name
      })
    });

    app.get('/authors/edit', checkAuthenticated, (req, res) => {
      res.render('authors/edit.ejs', {
        name: req.user.name
      })
    });

    app.get('/authors/new', checkAuthenticated, (req, res) => {
      res.render('authors/new.ejs', {
        name: req.user.name
      })
    });
    return next();
  }

  return res.redirect('/login')
};

// Logout user
// app.delete('/logout', (req, res) => {
//   //req.logOut();
//   req.session.destroy();
//   res.redirect('/login');
// });

//Logout
indexRouter.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/');
  });
  req.logout();
  req.session = null;
});

app.use('/', indexRouter);

// app.get('/logout', function (req, res) {
//   req.logout();
//   req.session.destroy();
//   res.redirect('/');
// });

// middleware check user is NOT logged in 
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/')
  }
  next()
};

*/

// create endpoints for books 
//app.use('/books/', bookRouter); 
//app.use('/authors/', authorRouter);




/* heres a copy paste from WebDevSimplified's original code for the setting up node passport users video 

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
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

app.listen(3000)*/

/* This is the original code from the WebDevSimplified Full Stack course 
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)

app.listen(process.env.PORT || 3000)*/