var mysql = require('mysql');
const config = require('../config/appconfig');

var connectionPool = mysql.createPool({
	host: config.db.host,
	user: config.db.username,
	password: config.db.password,
	database: config.db.database,
	port: 3306,
	debug: false,
	charset : 'utf8mb4'
});

connectionPool.getConnection(function(err, connection) {
	if(err)
		throw err;
	/*else
		console.log(connection);*/
});

module.exports = connectionPool;