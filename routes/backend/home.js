var express = require('express');
var router = express.Router();


router.get('/', (req, res, next) => {
    res.render('pages/home/index', { title: 'Home Page'});
})

module.exports = router;