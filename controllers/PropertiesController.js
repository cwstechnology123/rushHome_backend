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
        const numPerPage = parseInt(params.page_limit, 10) || 10;
        const page = parseInt(params.page_record, 10) || 1;
        PropertiesModel.getProperties(params, page, numPerPage, async function(err, result) {
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
                    PropertiesModel.updatePropertiesObj(propertiesInfo.list, async function(objCallBackFun){
                        let properties = await objCallBackFun;
                        return requestHandler.sendSuccess(res, 'Data Extracted')({ properties : properties, pagination : propertiesInfo.pagination });
                    })
                }
            }
        })
	} catch (error) {
		return requestHandler.sendError(req, res, error);
	}
}

/**
 * 
 * getPropertyById:
 */
 PropertiesController.getPropertyById = async (req, res, next) => {
    let params = req.params;
	try {
        PropertiesModel.getPropertyById(params.id, async function(err, result) {
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
                    PropertiesModel.updatePropertiesObj(propertiesInfo.list, async function(objCallBackFun){
                        let properties = await objCallBackFun;
                        return requestHandler.sendSuccess(res, 'Data Extracted')({ propertyDetails : properties[0] });
                    })
                }
            }
        })
	} catch (error) {
		return requestHandler.sendError(req, res, error);
	}
}

module.exports = PropertiesController;