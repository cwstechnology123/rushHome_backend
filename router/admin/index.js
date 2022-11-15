const router = require('express').Router();
const expressLayout = require('express-ejs-layouts');

router.use('/', require('./loginRouter'));
router.use(expressLayout);
router.use('/dashboard', require('./dashboardRouter'));
router.use('/users', require('./adminUsersRouter'));

module.exports = router;