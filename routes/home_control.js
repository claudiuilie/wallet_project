const express = require('express');
const request = require('request');
const options = require('../assets/config/config');

let config = new options();
let router = express.Router();
let jsonData;

router.get('/',(req,res, next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        request(config.arduino.host, function (error, response, body) {
            if(error) {
                return next(error);
            }
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
            jsonData = body;
            res.render('home_control',{
                sensors: jsonData
            });
        });
    }
});

module.exports = router;