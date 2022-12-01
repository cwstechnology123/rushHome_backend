const router = require('express').Router();
const PropertiesController = require('../../controllers/PropertiesController');
const apiAuth = require('../../utils/apiAuth');

/**
 * 
 * /api/properties/all:
 */
router.get('/:type', apiAuth.isAuthenticated, PropertiesController.getProperties);

module.exports = router;
