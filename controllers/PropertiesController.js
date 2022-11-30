const Joi = require('joi');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const auth = require('../utils/auth');
const PropertiesModel = require('../models/PropertiesModel');
const { string } = require('joi');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

// constructor
const PropertiesController = function(data) {

};

/**
 * 
 * getProperties:
 */
PropertiesController.getProperties = async (req, res, next) => {
    let params = req.params;
	try {
        PropertiesModel.getProperties(params,1,10, async function(err, result) {
            if(err) {
                res.status(500).json({
                    type: 'bad request', message: err,
                });
            }else {
                const propertiesInfo = await result;
                if(propertiesInfo.kind === 'not_found'){
                    return requestHandler.sendSuccess(res, 'Data Extracted')({ properties : "", message : 'Not found.'});
                }
                else{
                    return requestHandler.sendSuccess(res, 'Data Extracted')({ properties : propertiesInfo });
                }
            }
        })
	} catch (error) {
		return requestHandler.sendError(req, res, error);
	}
}

module.exports = PropertiesController;