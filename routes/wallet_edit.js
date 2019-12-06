const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const monthEntity = require('../assets/entity/month');
const express = require('express');
const config = new options();
const Date = require('../assets/entity/date');
const date = new Date();

let router = express.Router();
let mysql = new mysqlController(config.mysql);

router.get('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        if (Object.keys(req.query).length > 0) {

            let query = `Select * from income i 
                        LEFT JOIN outcome o on o.income_id = i.id 
                        where i.month = '${req.query.month}' and  year = '${req.query.year}';`

            mysql.connection.query(query, [], (error, results) => {
                if (error) {
                    return next(error);
                }
                let month = new monthEntity();
                month.getMonth(results[0]);
                res.render('wallet_edit', { month: month });
            });
        } else {
            res.redirect('/home');
        }
    }
});

router.post('/', (req, res, next) => {
    let month = new monthEntity();
    month.setMonth(req.body);

    let q = [
        'UPDATE',
        {
            'income': month.income,
            'income_modified': date.getDateAndTimestamp()
        },
        {
            'month': month.month,
            'year': month.year
        }
    ]
    mysql.query(config.mysql.income, q, (error, results) => {
        if (error) {
            return next(error);
        } else {
            if (results.affectedRows > 0) { // update
                let query = `UPDATE ${config.mysql.outcome} SET total_outcome='${month.total_outcome}', outcome_data = '${month.outcome_data}', outcome_modified = '${date.getDateAndTimestamp()}' WHERE income_id = (SELECT id FROM income WHERE month='${month.month}' AND year= '${month.year}');`

                mysql.connection.query(query, [], (error, results) => {
                    if (error) {
                        return next(error);
                    } else {
                        if (results.affectedRows > 0) {
                            res.redirect('/wallet');
                        }
                    }
                });
            }
        }
    });
});

module.exports = router;