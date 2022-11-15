const Joi = require('joi');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const config = require('../config/appconfig');
const auth = require('../utils/auth');
const UsersModel = require('../models/UsersModel');
const bcrypt = require('bcrypt');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

// constructor
const UsersController = function(user) {
	this.email = user.email;
	this.username = user.username;
};

UsersController.getUserById = async (req, res, next) => {
	try {
		const tokenFromHeader = auth.getJwtToken(req);
		const user = jwt.decode(tokenFromHeader);

		const reqParam = req.params.id;
		if(parseInt(user.payload.id) == parseInt(req.params.id)){
			UsersModel.findById(reqParam, async function(err, result) {
				if(err) {
					requestHandler.throwError(res, 500, err)
				}else {
					const userinfo = await result;
					if(userinfo.kind === 'not_found'){
						return requestHandler.sendSuccess(res, 'Not Found.')();
					}
					else{
						const profile = _.omit(userinfo, ['password', 'created_at', 'updated_at']);
						return requestHandler.sendSuccess(res, 'User Data Extracted')({ profile });
					}
				}
			})
		}
		else{
			res.status(400).json({
				type: 'bad request', message: 'please provide a vaid user id or token ,either user id is wrong or your token might be expired',
			});
		}

	} catch (error) {
		return requestHandler.sendError(req, res, error);
	}
}

UsersController.deleteById = async (req, res, next) => {
	try {
		const result = {}
		//const result = await super.deleteById(req, 'Users');
		return requestHandler.sendSuccess(res, 'User Deleted Successfully')({ result });
	} catch (err) {
		return requestHandler.sendError(req, res, err);
	}
}

UsersController.getProfile = async (req, res, next) => {
	try {
		const tokenFromHeader = auth.getJwtToken(req);
		const user = jwt.decode(tokenFromHeader);
		//console.log(user)
		UsersModel.findById(user.payload.id, async function(err, userinfoRes) {
			if(err) {
				requestHandler.throwError(res, 500, err)
			}else {
				const userinfo = await userinfoRes;
				if(userinfo.kind === 'not_found'){
					return requestHandler.sendSuccess(res, 'Not Found.')();
				}
				else{
					const profile = _.omit(userinfo, ['password', 'created_at', 'updated_at']);
					return requestHandler.sendSuccess(res, 'User Profile fetched Successfully')({ profile });
				}
			}
		})
	} catch (err) {
		return requestHandler.sendError(req, res, err);
	}
}

UsersController.updateProfile = async (req, res, next) => {
	try {
		const tokenFromHeader = auth.getJwtToken(req);
		const user = jwt.decode(tokenFromHeader);
		const data = req.body;
		let updateData = {};
		
		const schema = Joi.object({
			email:Joi.string().min(4).required().email(),
			first_name:Joi.string().min(1).required(),
			last_name:Joi.string().min(1).required()
		});
		const { error } = schema.validate(req.body);
		requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

		updateData = {
			email:data.email,
			first_name:data.first_name,
			last_name:data.last_name
		}
			
		if(updateData && parseInt(user.payload.id) == parseInt(req.params.id)){
			UsersModel.findById(req.params.id, async function(err, userinfoRes) {
				if(err) {
					requestHandler.throwError(res, 500, err)
				}else {
					const userinfo = await userinfoRes;
					if(userinfo.kind === 'not_found'){
						return requestHandler.sendSuccess(res, 'Not Found.')();
					}
					else{
						UsersModel.updateById(req.params.id, updateData, async function(err, updateRes) {
							if(err) {
								requestHandler.throwError(res, 500, err)
							}else {
								const profile = _.omit(data, ['password', 'new_password', 'current_password', 'confirm_password', 'created_at', 'updated_at']);
								requestHandler.sendSuccess(res, 'User data updated Successfully')({ profile });
							}
						})	
					}
				}
			})
		}
		else{
			res.status(400).json({
				type: 'bad request', message: 'please provide a vaid user id or token ,either user id is wrong or your token might be expired',
			});
		}

	} catch (err) {
		requestHandler.sendError(req, res, err);
	}
}

UsersController.changePassword = async (req, res, next) => {
	try {
		const tokenFromHeader = auth.getJwtToken(req);
		const user = jwt.decode(tokenFromHeader);
		const data = req.body;
		let updateData = {};
		
		const schema = Joi.object({
			current_password: Joi.string().min(6).max(15).required().label('Current Password').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/).options({
				messages : {'string.pattern.base': '{{#label}} Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character.'}
				}),
			new_password: Joi.string().min(6).max(15).required().label('New Password').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/).options({
				messages : {'string.pattern.base': '{{#label}} Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character.'}
				}),
			confirm_password: Joi.any().equal(Joi.ref('new_password'))
				.required()
				.label('Confirm password')
				.options({ messages: { 'any.only': '{{#label}} does not match'} })
		});

		const { error } = schema.validate(req.body);
		requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		const password = data.new_password;
		const hashedPass = bcrypt.hashSync(password, config.auth.saltRounds);
		data.password = hashedPass;
		updateData = {
			password:data.password
		}
		
		if(updateData && parseInt(user.payload.id) == parseInt(req.params.id)){
		UsersModel.findById(req.params.id, async function(err, userinfoRes) {
			if(err) {
				requestHandler.throwError(res, 500, err)
			}else {
				const userinfo = await userinfoRes;
				if(userinfo.kind === 'not_found'){
					return requestHandler.sendSuccess(res, 'Not Found.')();
				}
				else{
					const comparision = await bcrypt.compare(data.current_password, userinfo.password);
					if(comparision){
						UsersModel.updateById(req.params.id, updateData, async function(err, updateRes) {
							if(err) {
								requestHandler.throwError(res, 500, err)
							}else {
								const profile = _.omit(data, ['password', 'new_password', 'current_password', 'confirm_password', 'created_at', 'updated_at']);
								requestHandler.sendSuccess(res, 'Changed Password Successfully')({ profile });
							}
						})
					}
					else{
						res.status(400).json({
							type: 'error', message: 'Current Password is wrong.',
						});
					}
				}
			}
		})
	}
	else{
		res.status(400).json({
			type: 'bad request', message: 'please provide a vaid user id or token ,either user id is wrong or your token might be expired',
		});
	}

	} catch (err) {
		requestHandler.sendError(req, res, err);
	}
}

module.exports = UsersController;
