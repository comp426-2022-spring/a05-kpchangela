"use strict";

const Database = require('better-sqlite3');

// Connect to log database or create one if it doesn't exit yet
const db = new Database('./data/log/log.db');

// Is the database initialized or do we need to initalize it?
const stmt = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`
);

// Define row using 'get()' from better-sqlite3
let row = stmt.get();

// Check if there is a table. If row is undefined then no table exists.
if (row === undefined) {
    //console.log('Your database appears to be empty. I will initialize it now.')
    // Set a const that will contina your SQL commands to initialize the database
    const sqlInit = `CREATE TABLE accesslog ( id INTEGER PRIMARY KEY, remoteaddr TEXT, remoteuser BLOB, time INTEGER, method TEXT, url TEXT, protocol TEXT, httpversion TEXT, secure INTEGER, status INTEGER, referer TEXT, useragent TEXT )`;
    // Execute SQL commands above
    db.exec(sqlInit);
    // Echo info about initializations
    console.log('Your database has been initalized with a new table');
} else {
    console.log('Database exists.');
}

module.exports = db;