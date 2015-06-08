var express = require('express');
var router = express.Router();
router.mergeParams = true;

var config = require('../../config/config');
var controller = require(config.controllersDir + "/user-checkout");

router.get('/', controller.index);

router.get('/shipping', controller.shipping);
router.get('/payment', controller.payment);
router.get('/review', controller.review);
router.get('/complete', controller.complete);

module.exports = router;