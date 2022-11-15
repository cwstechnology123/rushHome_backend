const router = require('express').Router();
const UsersController = require('../../controllers/UsersController');
const auth = require('../../utils/auth');

/**
 * 
 * /users/profile/{userId}:
 */
router.get('/profile/:id', auth.isAuthenticated, UsersController.getUserById);

/**
 *
 * /users/{userId}:
 */
router.delete('/:id', UsersController.deleteById);

/**
 * 
 * /users/profile:
 */
router.get('/profile', auth.isAuthenticated, UsersController.getProfile);

/**
 * /users/updateProfile
 */
router.post('/updateProfile/:id', auth.isAuthenticated, UsersController.updateProfile);

/**
 * /users/changePassword
 */
 router.post('/changePassword/:id', auth.isAuthenticated, UsersController.changePassword);


module.exports = router;
