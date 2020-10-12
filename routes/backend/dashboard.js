var express = require('express');
var router = express.Router();


/* GET dashboard page. */
router.get('/', (req, res, next) => {
  res.render('pages/dashboard/index', { title: 'Dashboard Page' })
});

module.exports = router;
