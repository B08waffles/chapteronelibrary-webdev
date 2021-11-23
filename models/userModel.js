// Access the database connection from database.js

const con = require("../util/database")


module.exports.getAllUsers = () => {
    return con.query("SELECT userID, firstName, lastName, email, username, accessRights FROM users")
}

module.exports.createUser = (firstName, lastName, email, username, password, accessRights) => {
    return con.query("INSERT INTO users (firstName, lastName, email, username, password, accessRights) "
        + `VALUES (?, ?, ?, ?, ?, ?)`, [firstName, lastName, email, username, password, accessRights])
}

module.exports.getUserById = (userId) => {
    return con.query("SELECT * FROM users WHERE userId = ?", [userId])
}

module.exports.getUserByUsername = (username) => {
    return con.query("SELECT * FROM users WHERE username = ?", [username])

}

module.exports.updateUser = (userId, firstName, lastName, email, username, password, accessRights) => {
    return con.query("UPDATE users SET firstName = ?, lastName = ?, email = ?, username = ?, password = ?, accessRights = ? WHERE userId = ?", [firstName, lastName, email, username, password, accessRights, userId])
}

module.exports.deleteUser = (userId) => {
    return con.query("DELETE FROM users WHERE userId = ?", [userId])
}

 
































/*
function authUser(req, res, next) {
    if (req.user == null) {
      res.status(403)
      return res.send('You need to sign in')
    }
  
    next()
  }
  
  function authRole(role) {
    return (req, res, next) => {
      if (req.user.role !== role) {
        res.status(401)
        return res.send('Not allowed')
      }
  
      next()
    }
  }
  
  module.exports = {
    authUser,
    authRole
  }
*/


/* const Sequelize = require("sequelize");
const sequelize = require("../util/database");


const userSchema = sequelize.define("user", {
    userID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    accessRights: {
        type: Sequelize.STRING,
        allowNull: true,
    },

});

module.exports = sequelize.model('user', userSchema)

//not actually using this for now, storing users locally in server.js file 
/*
const mongoose = require('mongoose')
const ROLE = {
    ADMIN: 'admin',
    BASIC: 'basic'
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userId: {
        type: Date(toString()), 
        default: Date.now
    }
    
})
module.exports = mongoose.model('User', userSchema) */ 