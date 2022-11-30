const router = require('express').Router();

router.use('/users', require('./usersRouter'));

//router.use('/email', require('./sendEmail'));

router.use('/', require('./authRouter'));

router.use('/properties', require('./propertiesRouter'));

module.exports = router;