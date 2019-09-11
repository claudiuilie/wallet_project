const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const monthEntity = require('../assets/entity/month');
const express = require('express');
const config = new options();

let router = express.Router();


router.get('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        if (Object.keys(req.query).length > 0 ) {
            let mysql = new mysqlController(config.mysql);
            mysql.select('income' ,req.query,(error,results)=>{
                if(error) {
                    return next(error);
                }
                let month = new monthEntity()
                month.getMonth(results[0])
                res.render('wallet_edit', {month :month});
            });
        } else {
            res.redirect('/home');
        }
    }
});

router.post('/', (req, res, next) => {
    let month = new monthEntity();
    month.setMonth(req.body);
    let mysql = new mysqlController(config.mysql);
    mysql.update('income',month,{'month_name': month.month_name, "year": month.year},(error,results) => {
        if(error) {
            return next(error);
        } else {
            if (results.affectedRows > 0 ) {
                res.redirect('/wallet');
            }
        }
    });
});

module.exports = router;