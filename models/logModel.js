const con = require("../util/database")

module.exports.addLogEntryBook = (bookid, username, dateCreated) => {
    return con.query("INSERT INTO changelog (bookid, username, dateCreated) " + "VALUES (?, ?, ?)", [bookid, username, dateCreated])
}

module.exports.updateLogEntryBook = (bookid, username, dateChanged) => {
    return con.query("UPDATE changelog set username=?, dateChanged=? WHERE bookid=?", [username, dateChanged, bookid])
}