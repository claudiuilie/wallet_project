const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const monthEntity = require('../assets/entity/month');
const express = require('express');
const config = new options();
const Date = require('../assets/entity/date');

let router = express.Router();
let mysql = new mysqlController(config.mysql);
let date = new Date();

router.get('/', (req, res) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else
        res.render('wallet_create');
});

router.post('/', (req, res, next) => {

    let month = new monthEntity();
    month.setMonth(req.body);

    function validateMonth() {
        mysql.select(config.mysql.income,{'month':month.month,'year':month.year},(error,results) =>{
            if(error) {
                return next(error);
            } else {
                if (results.length == 0) {
                    postData(month);
                } else {
                    res.render('wallet_create', {message: `Duplicate entry: ${month.month} ${month.year}` , infoModal: 'show'});
                }
            }
        });
    }

    function postData(month) {

        mysql.insert(config.mysql.income,{ 'income' : month.income,'month': month.month, 'year':  month.year, 'income_created': date.getDateAndTimestamp(), 'income_modified': date.getDateAndTimestamp()},(error,results) => {

            if(error) {
                return next(error);
            } else {
                if (results.affectedRows > 0 ) {
                    
                    mysql.insert(config.mysql.outcome,{'total_outcome':month.total_outcome,'income_id': results.insertId, 'outcome_data':month.outcome_data, 'outcome_created': date.getDateAndTimestamp(), 'outcome_modified': date.getDateAndTimestamp()},(error,results) => {
                        if(error) {
                            return next(error);
                        } else {
                            if (results.affectedRows > 0 ) {

                                res.render('wallet_create', {message: `Success: affected rows ${results.affectedRows}` , infoModal: 'show'});
                            }
                        }
                    });
                }
            }
        });
    }
    validateMonth();
});

module.exports = router;
