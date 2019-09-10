const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const express = require('express');
const config = new options();
const passwordHash = require('password-hash');

// console.log(passwordHash.generate('test')); // generate hash

let router = express.Router();
let mysql = new mysqlController(config.mysql);

router.get('/',(req,res) => {
    res.render('home',{layout:'login.hbs'});
});

router.post('/', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        mysql.select('accounts', {'username': username}, (error, results) => {
            if(error) {
                return next(error);
            }
            if (results.length > 0) {
                if(passwordHash.verify(password, results[0].password)) {
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.redirect('/home');
                } else {
                    return next('Incorrect Password!');
                }
            } else {
                return next('Incorrect Username!');
            }
            res.end();
        });
    }
});

module.exports = router;

// console.log(passwordHash.verify('bulgaria188', 'sha1$f15aa13a$1$d21ad877e10446d0bb17c099b7cc1753e27911b2')); // true
// console.log(passwordHash.verify('Password0', 'sha1$f15aa13a$1$d21ad877e10446d0bb17c099b7cc1753e27911b2')); // false


