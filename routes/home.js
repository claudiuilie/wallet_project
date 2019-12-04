const express = require('express');
const request = require('request');
const options = require('../assets/config/config');

let config = new options();
let router = express.Router();
let url;

router.get('/',(req,res,next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {

        res.render('home');
    }
});

module.exports = router;


