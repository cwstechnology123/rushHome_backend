const _ = require('lodash');
const config = require('../config/appconfig');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

function verifyAPIKey(req, res, next) {
	try {
		if (_.isUndefined(req.headers["x-api-key"])) {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}
		const apiKey = req.headers["x-api-key"];

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