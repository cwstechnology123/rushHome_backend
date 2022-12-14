const router = require('express').Router();
const PropertiesController = require('../../controllers/PropertiesController');
const apiAuth = require('../../utils/apiAuth');

/**
 * 
 * /api/properties/all:
 */
router.get('/:type/:page_record/:page_limit', apiAuth.isAuthenticated, PropertiesController.getProperties);

/**
 * 
 * /api/properties/details/:propertyId:
 */
 router.get('/details/:id', apiAuth.isAuthenticated, PropertiesController.getPropertyById);

module.exports = router;
