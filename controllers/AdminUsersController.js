const User = require("../models/AdminUsersModel.js");
const moment = require('moment-timezone');
const tzone = "Asia/Kolkata";
const bcrypt = require('bcrypt');

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const { check, validationResult, matchedData } = require('express-validator');

exports.getAll = function(req, res) {
    res.render('users/user_list', { title: 'User List'});
};

exports.ajaxUserList = function(req, res) {
     console.log(req.body);
    var draw = req.body.draw;
    var row = req.body.start;
    var count = 1+parseInt(row);
    var rowperpage = req.body.length; // Rows display per page

    var searchStr = req.body.search.value;
    if(searchStr)
    {
            var search_key = req.body.search.value.trim();
            searchStr = {search_key:search_key };
    }
    else
    {
         searchStr={};
    }

    var orderStr = req.body.order ? req.body.order[0] : '';
   
    var tagDataobj = {
        draw:draw,
        row : row,
        rowperpage : rowperpage,
        count : count,
        searchStr:searchStr,
        orderStr:orderStr
    };
    console.log(tagDataobj);
    User.ajaxUserList(tagDataobj,function(err, resultData) {
        console.log('controller')
        if (err)
        res.send(err);
        res.send(resultData);
    });

};

exports.addViewPage = function(req, res) {
    backURL=req.header('Referer');
    
    res.render('users/addedit_users', { title: 'Add User',editUser:'',backURL:backURL,
        data: {},
        errors: {}
    });
};

exports.create = function(req, res) {
    backURL=req.header('Referer');
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {  
        res.render('users/addedit_users', { title: 'Add User',editUser:'',backURL:backURL,
            data: req.body,
            errors: errors.mapped()
        });
        return;
    }
    var params = req.body;  
    console.log(params);
    result=null;
    User.findByEmail(params.email, function(err, result) {
        if(err) {
          res.send(err);
          return;
        } else {
            if(result.kind == 'not_found') {
                params.username = User.generateUsername(params.first_name);
                const hash = bcrypt.hashSync('Gos@'+params.username, salt);
                params.password = hash;
                params.created_at = moment().tz(tzone).format('YYYY-MM-DD HH:mm:ss');

                User.create(params, function(err, user) {
                    if (err)
                    res.send(err);
                    req.flash('success_messages', ' User added successfully!');
                    res.redirect('/admin/users');
                });
            }
            else {    
                console.log('update a user' + result.id);  
                res.render('users/addedit_users', { title: 'Add User',editUser:'',backURL:backURL,
                    data: req.body,
                    errors: {
                                email: {
                                msg: 'E-mail already in use'
                                }
                            }
                });

                return;
            }
        }
    })
};


exports.findById = function(req, res) {
    backURL=req.header('Referer');
    User.findById(req.params.id, function(err, user) {
        if (err)
        res.send(err);
        res.render('users/addedit_users', { title: 'Edit User',editUser:user,backURL:backURL,
            data: {},
            errors: {}
        });
    });
};


exports.updateById = function(req, res) {
    var params = req.body;
    result = null;
    if(req.body.constructor === Object && Object.keys(req.body).length === 0){
        res.status(400).send({ error:true, message: 'Please provide all required field' });
    }else{
        params.updated_at = moment().tz(tzone).format('YYYY-MM-DD HH:mm:ss');

        User.updateById(params.id, params, function(err, user) {
            if (err)
            res.send(err);
            req.flash('success_messages', ' User successfully updated!');
            res.redirect('/admin/users');
        });
    }
  
};

exports.changeUserStatusById = function(req, res) {
    var params = req.body;
    result = null;
    params.updated_at  = moment().tz(tzone).format('YYYY-MM-DD HH:mm:ss');
    params.status = params.status ? 1 : 0 ;
    console.log(params);
    User.changeUserStatusById(params.id, params, function(err, user) {
        if (err){
            res.send(err);
        }
        else{
            req.flash('success_messages', ' Status successfully updated!');   
            res.redirect('/admin/users');
        }
    });
};


exports.remove = function(req, res) {

    User.findById(req.params.id, function(err, device) {
        if (err)
        res.send(err);
        User.remove( req.params.id, function(err, user) {
            if (err)
            res.send(err);
            req.flash('success_messages', ' User successfully deleted');     
            
            res.redirect('/admin/users');
        });
    })
};