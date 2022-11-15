const router = require('express').Router();
const AuthController = require('../../controllers/AuthController');
const auth = require('../../utils/auth');

/**
  *
  * /signUp:
  */
router.post('/signUp', AuthController.signUp);

/**
  *
  * /login:
  */
router.post('/login', AuthController.login);

/**
  *
  * /refreshToken:
  *   post:
  *     tags:
  *       - Auth
  *     security:
  *       - Bearer: []
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       description: the refresh token
  *       required: true
  *       schema:
  *         type: object
  *         required:
  *           - refreshToken
  *         properties:
  *           refreshToken:
  *             type: string
  *     responses:
  *       200:
  *         description: a new jwt token with a new expiry date is issued
  */
router.post('/refreshToken', auth.isAuthenticated, AuthController.refreshToken);

/**
 * 
 * /logout:
 */
router.post('/logout', auth.isAuthenticated, AuthController.logOut);

module.exports = router;
