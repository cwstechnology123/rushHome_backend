const _ = require('lodash');
const config = require('../config/appconfig');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

function verifyAPIKey(req, res, next) {
	try {
		if (_.isUndefined(req.headers.authorization)) {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}
		const Basic = req.headers.authorization.split(' ')[0];

		if (!Basic || Basic !== 'Basic') {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}

		const apiKey = req.headers.authorization.split(' ')[1];

		if (!apiKey) {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}

		// verify api key
        if(config.apiAuth.api_key === apiKey){
            next();
        }
        else{
            requestHandler.throwError(401, 'Unauthorized', 'Invaid API Key.')();
        }
	} catch (err) {
		requestHandler.sendError(req, res, err);
	}
}


module.exports = { isAuthenticated : verifyAPIKey };