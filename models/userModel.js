// Access the database connection from database.js
const db2 = require("../util/database")

module.exports.getAllUsers = () => {
    return db2.query("SELECT userID, firstName, lastName, email, username, accessRights FROM users")
}

module.exports.createUser = (firstName, lastName, email, username, password, accessRights) => {
    return db2.query("INSERT INTO users (firstName, lastName, email, username, password, accessRights) "
        + `VALUES (?, ?, ?, ?, ?, ?)`, [firstName, lastName, email, username, password, accessRights])
}

module.exports.getUserById = (userId) => {
    return db2.query("SELECT * FROM users WHERE userId = ?", [userId])
}

module.exports.getUserByUsername = (username) => {
    return db2.query("SELECT * FROM users WHERE username = ?", [username])

}

module.exports.updateUser = (userId, firstName, lastName, email, username, password, accessRights) => {
    return db2.query("UPDATE users SET firstName = ?, lastName = ?, email = ?, username = ?, password = ?, accessRights = ? WHERE userId = ?", [firstName, lastName, email, username, password, accessRights, userId])
}

module.exports.deleteUser = (userId) => {
    return db2.query("DELETE FROM users WHERE userId = ?", [userId])
}


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