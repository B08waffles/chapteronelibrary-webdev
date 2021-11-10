if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
};

// type "npm run devStart to enter dev mode with nodemon and use our .env file, localhost:3000"
const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
// define the routes/controller paths
const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');
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


// integrate database 
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));

// host application locally for testing purposes, type in browser localhost:3000 to access
app.listen(process.env.PORT || 3000);

// authenticate user 

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

const users = [];


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

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs',  { name: req.user.name
  })
});

// create endpoints for books
app.use('/books/', bookRouter); 
app.use('/authors/', authorRouter);

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
});

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
});

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
        // create endpoints
        app.use('/', indexRouter);
    return next()

  }

  res.redirect('/login')
};

app.get('/books/edit', checkAuthenticated, (req, res) => {
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

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
};