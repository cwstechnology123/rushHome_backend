const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const async = require('async');
const jwt = require('jsonwebtoken');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const UsersModel = require('../models/UsersModel');
//const email = require('../utils/email');
const config = require('../config/appconfig');
const auth = require('../utils/auth');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const tokenList = {};

// constructor
const AuthController = function(user) {
	this.email = user.email;
	this.username = user.username;
};

AuthController.login = async (req, res, next) => {
	try {
		const schema = Joi.object({
			email:Joi.string().min(4).required().email(),
			password: Joi.string().min(6).max(15).required().label('Password').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/).options({
				messages : {'string.pattern.base': '{{#label}} Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character.'}
			  })
		});
		
		const { error } = schema.validate(req.body);
		requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

		const options = "where email = '"+req.body.email+"'";

		UsersModel.getByCustomOptions(options,async function(err, result) {
			if(err) {
				requestHandler.throwError(res, 500, err)
			}else {
				const user = await result;
				if (user.kind ==  "not_found") {
					res.status(400).json({
						type: 'bad request', message: 'invalid email address',
					});
				}
				else{
					const comparision = await bcrypt.compare(req.body.password, user.password);
					if(comparision){
						const data = {
							last_login_date: new Date(),
						};
						UsersModel.updateById(user.id, data, async function(err, userinfoRes) {
							if(err) {
								requestHandler.throwError(res, 500, err)
							}else {
								const userRes = await userinfoRes;
								const payload = _.omit(user, ['password', 'created_at', 'updated_at']);
								//console.log('payload', payload)
								const token = jwt.sign({ payload }, config.auth.jwt_secret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
								const refreshToken = jwt.sign({
									payload,
								}, config.auth.refresh_token_secret, {
									expiresIn: config.auth.refresh_token_expiresin,
								});
								const response = {
									status: 'Logged in',
									token,
									refreshToken,
								};
								tokenList[refreshToken] = response;
								requestHandler.sendSuccess(res, 'User logged in Successfully')({ token, refreshToken, profile : payload });
							}
						})
					}
					else{
						res.status(400).json({
							type: 'bad request', message: 'failed to login bad credentials',
						});
					}	
				}
			}
		})
	} catch (error) {
		console.log('catch error')
		requestHandler.sendError(req, res, error);
	}
}

AuthController.signUp = async (req, res, next) => {
	try {
		const data = req.body;

		const schema = Joi.object({
			email:Joi.string().min(4).required().email(),
			first_name:Joi.string().min(1).required(),
			last_name:Joi.string().min(1).required(),
			password: Joi.string().min(6).max(15).required().label('Password').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/).options({
				messages : {'string.pattern.base': '{{#label}} Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character.'}
			  }),
			confirm_password: Joi.any().equal(Joi.ref('password'))
				.required()
				.label('Confirm password')
				.options({ messages: { 'any.only': '{{#label}} does not match'} })
		});
		
		const password = data.password;

		const { error } = schema.validate(req.body);

		requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

		const options = "where email = '"+data.email+"'";

		UsersModel.getByCustomOptions(options,async function(err, result) {
			if(err) {
				requestHandler.throwError(res, 500, err)
			}else {
				const user = await result;
				if (user.kind ==  "not_found") {
					// async.parallel([
					// 	function one(callback) {
					// 		email.sendEmail(
					// 			callback,
					// 			config.sendgrid.from_email,
					// 			[data.email],
					// 			' iLearn Microlearning ',
					// 			`please consider the following as your password${password}`,
					// 			`<p style="font-size: 32px;">Hello ${data.name}</p>  please consider the following as your password: ${password}`,
					// 		);
					// 	},
					// ], (err, results) => {
					// 	if (err) {
					// 		requestHandler.throwError(res, 500, 'internal Server Error', 'failed to send password email')();
					// 	} else {
					// 		logger.log(`an email has been sent at: ${new Date()} to : ${data.email} with the following results ${results}`, 'info');
					// 	}
					// });

					const hashedPass = bcrypt.hashSync(password, config.auth.saltRounds);
					data.password = hashedPass;
					const insertData = {
						email:data.email,
						first_name:data.first_name,
						last_name:data.last_name,
						username:UsersModel.generateUsername(data.first_name),
						password:data.password
					}
					
					UsersModel.create(insertData, async function(err, insertDataResult) {
						if(err) {
							requestHandler.throwError(res, 500, err)
						}else {
							const createdUser = await insertDataResult;
							if (!(_.isNull(createdUser))) {
								const payload = _.omit(insertData, ['password']);
								requestHandler.sendSuccess(res, 'Account created successfully', 201)({profile: payload});
							} else {
								requestHandler.throwError(res, 422, 'Unprocessable Entity', 'unable to process the contained instructions')();
							}
						}
					})					
				}
				else{
					res.status(400).json({
						type: 'error', message: 'email already exist.',
					});
				}
			}
		})
	} catch (err) {
		requestHandler.sendError(req, res, err);
	}
}

AuthController.refreshToken = async (req, res, next) => {
	try {
		const data = req.body;
		if (_.isNull(data)) {
			requestHandler.throwError(res, 400, 'bad request', 'please provide the refresh token in request body')();
		}
		const schema = {
			refreshToken: Joi.string().required(),
		};
		const { error } = Joi.validate({ refreshToken: req.body.refreshToken }, schema);
		requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		const tokenFromHeader = auth.getJwtToken(req);
		const user = jwt.decode(tokenFromHeader);

		if ((data.refreshToken) && (data.refreshToken in tokenList)) {
			const token = jwt.sign({ user }, config.auth.jwt_secret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
			const response = {
				token,
			};
			// update the token in the list
			tokenList[data.refreshToken].token = token;
			requestHandler.sendSuccess(res, 'a new token is issued ', 200)(response);
		} else {
			requestHandler.throwError(res, 400, 'bad request', 'no refresh token present in refresh token list')();
		}
	} catch (err) {
		requestHandler.sendError(req, res, err);
	}
}

AuthController.checkUserById = async (req, res, next) => {
	try {
		let params = req.body;
		if(params.user_id === undefined || params.user_id == '') {
		  let res_json = {result: 'failure', message: 'User Id is missing'};
		  res.send(res_json);
		  return;
		}
		UsersModel.findById(params.user_id,async function(err, result) {
		  if(err) {
			res.send(err);
		  } else {
			if(result.kind == 'not_found') {
				res.status(400).json({
					type: 'error', message: 'User does not exist.',
				});
				return;
			}
			else{
				next();
			}
		  }
		});
	} catch (err) {
		requestHandler.sendError(req, res, err);
	}
}

AuthController.logOut = async (req, res, next) => {
	try {
		const tokenFromHeader = auth.getJwtToken(req);
		const user = jwt.decode(tokenFromHeader);
		requestHandler.sendSuccess(res, 'User Logged Out Successfully')();
	} catch (err) {
		requestHandler.sendError(req, res, err);
	}
}

module.exports = AuthController;
