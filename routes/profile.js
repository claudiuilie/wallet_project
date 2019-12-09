const express = require('express');
const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const config = new options();
const passwordHash = require('password-hash');

let Account = require('../assets/entity/account');
let router = express.Router();

router.get('/', (req, res, next) =>  {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        let mysql = new mysqlController(config.mysql);
        let account = new Account();
        let query = `SELECT u.id,u.username,u.email,ud.phone_number,ud.city,ud.adress,ud.sex,ud.birth_date,u.avatar
                         FROM users u 
                            LEFT JOIN user_details ud on ud.user_id = u.id 
                         WHERE u.username = '${req.session.username}' ;`

        mysql.connection.query(query,[],(error,results) => {
            account.setAccount(results[0]);
            res.render('profile', {account: account});
        });
    }
});

router.post('/', (req, res, next) =>  {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        let mysql = new mysqlController(config.mysql);
        let account = new Account();
        account.set( Object.keys(req.body)[0],req.body.username);
        account.set( Object.keys(req.body)[1],passwordHash.generate(req.body.password));

        mysql.query(config.mysql.users,['UPDATE',account,{'username': account.username}],(error,results) => {
            if (error) {
               return next(error);
            }
            mysql.query(config.mysql.users,['SELECT',['*'],{'username' : account.username}], (error,params) => {
                if (error) {
                    return next(error);
                }
                res.render('profile', {message: `Success: affected rows ${results.affectedRows}` , infoModal: 'show', account: params[0]});
            });
        });
    }
});

module.exports = router;