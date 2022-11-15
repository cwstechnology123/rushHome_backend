const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const compression = require('compression');
const uuid = require('uuid').v4;
const config = require('../config/appconfig');
const Logger = require('../utils/logger.js');

const logger = new Logger();
const app = express();
app.set('config', config); // the system configrationsx

// parse application/x-www-form-urlencoded
app.use(bodyParser.json({limit:'50mb'})); 
app.use(bodyParser.urlencoded({extended:true, limit:'50mb',parameterLimit:50000}));

app.use(require('method-override')());

app.use(compression());
app.use(cors());

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
var sess; // global session

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

process.on('SIGINT', () => {
	logger.log('stopping the server', 'info');
	process.exit();
});

app.set('port', process.env.DEV_APP_PORT);

app.use((req, res, next) => {
	req.identifier = uuid();
	const email = req.body.email ? req.body.email : '';
	const logString = `a request has been made with the following uuid [${req.identifier}] ${req.url} ${req.headers['user-agent']} ${email}`;
	logger.log(logString, 'info');
	next();
});

// for flash messages
app.use(flash());
app.use(function(req, res, next){
	//console.log(req);
    sess = req.session;
	res.locals.flash_messages = req.flash();
    next();
});

app.use(require('../router'));

app.use((req, res, next) => {
	logger.log('the url you are trying to reach is not hosted on our server', 'error');
	const err = new Error('Not Found');
	err.status = 404;
	res.status(err.status).json({ type: 'error', message: 'the url you are trying to reach is not hosted on our server' });
	next(err);
});

const server = app.listen(process.env.PORT || 5000, () => {
	const port = server.address().port;
	console.log(`Express is working on port ${port}`);
});

module.exports = app;
