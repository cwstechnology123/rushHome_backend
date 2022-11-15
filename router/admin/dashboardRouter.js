var express = require('express');
var router = express.Router();
const dashboardController = require('../../controllers/AdminDashboardController');

router.use( function( req, res, next ) {
    sess = req.session;
    if(!sess.email){
        res.redirect('/admin');
    }
    else{
        res.locals.req = req;
        next(); 
    }

});

// Retrieve all users
router.get('/', dashboardController.countAllStats);

module.exports = router;