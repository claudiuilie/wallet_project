const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const express = require('express');
const config = new options();
let router = express.Router();
let mysql = new mysqlController(config.mysql);

router.get('/',(req,res) => {
    res.render('home',{layout:'login.hbs'});
});

router.post('/', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        mysql.select('accounts', {'username': username, 'password': password}, (error, results) => {
            if(error) {
                return next(error);
            }
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/home');
            } else {
                return next('Incorrect Username and/or Password!');
            }
            res.end();
        });
    }
});

module.exports = router;