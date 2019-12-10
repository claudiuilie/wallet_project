const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const express = require('express');
const config = new options();
const passwordHash = require('password-hash');
const Date = require('../assets/entity/date');
const date = new Date();

let router = express.Router();
let mysql = new mysqlController(config.mysql);

router.get('/', (req, res) => {
    res.render('home', { layout: 'register.hbs' });
});

router.post('/', (req, res, next) => {
    let newUser = req.body;
    // if (username && password) {
        mysql.query(config.mysql.users, ['INSERT',{username: newUser.username, password: passwordHash.generate(newUser.password), email: newUser.email, avatar:'../img/claudiuAvatar.png', created:date.getDateAndTimestamp(), modified: date.getDateAndTimestamp() }], (error, results) => {
            if(error) {
                return next(error);
            }
            mysql.query(config.mysql.user_details,['INSERT',{user_id:results.insertId, city: newUser.city, country: newUser.country, sex: newUser.sex, first_name: newUser.first_name, last_name: newUser.last_name, created: date.getDateAndTimestamp(),modified: date.getDateAndTimestamp()}],(e,r)=> {
                if(e) {
                    return next(e);
                }

                res.render('home', {layout:'login.hbs', user:newUser.username, password: newUser.password });

            })
        });
});

router.post('/checkuser', (req, res, next) => {

    mysql.query(config.mysql.users, ['SELECT', ['*'], { 'username': req.body.username }], (error, results) => {
        if (error) {
            return next(error);
        }

        if (results.length > 0)
            res.send(true);
        else
            res.send(false)

    });

});

module.exports = router;