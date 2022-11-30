const router = require('express').Router();
const PropertiesController = require('../../controllers/PropertiesController');
const auth = require('../../utils/auth');

/**
 * 
 * /api/properties/all:
 */
router.get('/:type', PropertiesController.getProperties);

module.exports = router;
