const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    database: 'project',
    user: 'root',
    password: 'Faraz.a1234'
});

module.exports = pool;