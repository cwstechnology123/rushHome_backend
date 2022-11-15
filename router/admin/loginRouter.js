const express = require('express');
const router = express.Router();
const sql = require('../../config/db_connection');
const bcrypt = require('bcrypt');

/* GET login page. */
router.get('/', function(req, res, next) {
  sess = req.session;
  res.render('login', { title: 'Login'});
});

/* POST login */
router.post('/auth',async function(req, res, next) {
	sess = req.session;					
  	const email = req.body.email;
	const password = req.body.password;

	let data = '';
	let sendData='';
	if (email && password) {

	try {
			sendData = {
				'email':email,
				'password':password
			}
			checkValidity(sendData,async function (callbackcheckValidity){
				const data = await callbackcheckValidity;
				if(data.status==400){
					req.flash('error_messages', data.message);
					res.redirect('/admin');
				}
				else if(data.status==200){
					req.flash('success_messages', data.message);
					res.redirect('/admin/dashboard');
				}
				else if(data.status==204){
					req.flash('error_messages', data.message);
					res.redirect('/admin');
				}
				else if(data.status==206){
					req.flash('error_messages', data.message);
					res.redirect('/admin');
				}
			})

		} catch (err) {
			console.log(err);
		}
	} else {
		req.flash('error_messages', "Please enter email and Password!");
		res.redirect('/admin');
		res.end();
	}
});

async function checkValidity(sendData=null,callbackcheckValidity=null){

	let returnData = '';

	const promiseUser = await new Promise((resolve, reject) => {
		const sqlQuery = 'SELECT id,email,username,first_name,last_name,password FROM gos_users WHERE email = "'+sendData.email+'" AND user_type=1';
		console.log(sqlQuery);
		sql.query(sqlQuery, async function (error, results, fields) {
			    if (error) {
			    	console.log(error);
				    returnData =  {
				        "status":400,
				        "failed":"error ocurred",
				        "message":"Something went wrong!"
				      }
			         resolve(returnData);

			    }else{
			      if(results.length >0){

			        const comparision = await bcrypt.compare(sendData.password, results[0].password)
			        if(comparision){
			        	sess.user_id = results[0].id;
			        	sess.email = results[0].email;
						sess.username = results[0].username;
						sess.first_name = results[0].first_name ? results[0].first_name : '';
						sess.last_name = results[0].last_name ? results[0].last_name : '';
						sess.profile_pic = results[0].profile_pic;
						console.log(sess);
			        	returnData = {
			              "status":200,
			              "message":"login sucessfully"
			            }
			            resolve(returnData);

			        }
			        else{

			            returnData = {
			               "status":204,
			               "message":"Email and password does not match"
			            }
			           resolve(returnData);

			        }
			      }
			      else{

			      	    returnData = {
				          "status":206,
				          "message":"Email does not exits"
			            }
			           resolve(returnData);
			      }
			    }
		    });
	});

	Promise.all([promiseUser]).then((values) => {
	  		console.log(values);
	  		callbackcheckValidity(values[0]);
	});
}

router.get('/logout',(req,res) => {
	console.log('logoutcontroller');
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/admin');
    });

});

module.exports = router;
