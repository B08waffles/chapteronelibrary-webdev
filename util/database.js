// Import mysql2 module so that we can talk to the database
const mysql = require("mysql2");

// Create a connection to the database
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'new_books'  //This is the provided sample database, just renamed
});

con.connect(function(err) {
  if (err) {
    return console.error('error:' + err.message);
  }
  console.log("Connected to MySQL2")
})

// This wrapper will allow the use of promise functions
// like .then() and .catch() so that we can use it in an async
// way along with expressJS.
const query = (sql, parameters) => {
  return new Promise((resolve, reject) => {
    con.query(sql, parameters, (error, results) => {
      if (error) {
        reject(error)
      } else {
        resolve(results)
      }
    })
  })
}


// export the new query function so that the models can use it
module.exports = {
  query
}
exports.connection = con

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  
  
  });

/*
// integrate MySQL database 
const Sequelize = require('sequelize');
const sequelize = new Sequelize("new_books", "root", "password", {
  dialect: "mysql",
  host: "localhost",
}); 

module.exports = sequelize
*/