require('dotenv').config();

// config.js
module.exports = {
	app: {
		port: process.env.DEV_APP_PORT || 5001,
		appName: process.env.APP_NAME || 'rushhome_backend',
		env: process.env.NODE_ENV || 'development',
	},
	db: {
		port: process.env.DB_PORT || 3306,
		database: process.env.DB_NAME || 'retscloud',
		password: process.env.DB_PASS || '',
		username: process.env.DB_USER || 'root',
		host: process.env.DB_HOST || '127.0.0.1',
		dialect: 'mysql',
		logging: true,
	},
	winiston: {
		logpath: '/rushhome_backend/logs/',
	},
	auth: {
		jwt_secret: process.env.JWT_SECRET,
		jwt_expiresin: process.env.JWT_EXPIRES_IN || '1d',
		saltRounds: process.env.SALT_ROUND || 10,
		refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || 'VmVyeVBvd2VyZnVsbFNlY3JldA==',
		refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRES_IN || '2d', // 2 days
	},
	apiAuth: {
		api_key: process.env.API_KEY
	},
	sendgrid: {
		api_key: process.env.SEND_GRID_API_KEY,
		api_user: process.env.USERNAME,
		from_email: process.env.FROM_EMAIL || 'monika.kumari@cwsinfotech.com',
	},

};
