const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const express = require('express');
const config = new options();

let router = express.Router();
let mysql = new mysqlController(config.mysql);

router.get('/',(req,res,next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        res.render('vacations',{});
    }
});

module.exports = router;