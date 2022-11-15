const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const tzone = "Asia/Kolkata";

const { check, validationResult, matchedData } = require('express-validator');
const userController = require('../../controllers/AdminUsersController');

router.use( function( req, res, next ) {
    sess = req.session;
    if(!sess.email){
        res.redirect('/admin');
    }
    else{
          if ( req.query._method == 'DELETE' ) {
              // change the original METHOD
              // into DELETE method
              req.method = 'DELETE';
              // and set requested url to /admin/users/12
              req.url = req.path;
          }
          res.locals.moment = moment; 
          res.locals.tzone = tzone;   
          res.locals.req = req;    
          next(); 
    }

});

// Retrieve all users
router.get('/', userController.getAll);

// Retrieve all ajax users list
router.post('/ajax_user_list', userController.ajaxUserList);

//show Add view page
router.get('/add', userController.addViewPage); 

// Create a new user
router.post('/add',[
    check('email')
      .not().isEmpty().withMessage('Please enter email address'),
    check('first_name')
      .not().isEmpty().withMessage('Please enter first name'),
    check('email').isEmail().withMessage('Please enter valid email')
  ], userController.create);

// Retrieve a single user with id
router.get('/add/:id', userController.findById);

// Update a user with id
router.post('/add/:id', userController.updateById);

// Change a user status with id and status
router.post('/change_user_status', userController.changeUserStatusById);

// Delete a user with id
router.delete('/:id', userController.remove);

module.exports = router;
