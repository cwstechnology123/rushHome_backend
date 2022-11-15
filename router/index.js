const router = require('express').Router();

router.use('/api/v1', require('./api'));

router.use('/admin', require('./admin'));

module.exports = router;
