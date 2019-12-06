const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const monthEntity = require('../assets/entity/month');
const pieEntity = require('../assets/entity/pieChart');
const outcomeEntity = require('../assets/entity/outcomeChart');
const progressEntity = require('../assets/entity/progressChart');

let config = new options();
let express = require('express');
let router = express.Router();
let mysql = new mysqlController(config.mysql);
let date = new Date();

function builder(req, res, next, params) {
    let conditions;
    let year;
    let progressChart;
    let month = new monthEntity();

    mysql.query(config.mysql.income, ['SELECT',['*'],{ 'year': date.getFullYear() }], (error, results) => {
        if (error) {
            return next(error);
        }
        year = results;
        progressChart = new progressEntity(year);

        if(params.default)
            conditions = `WHERE i.year = '${params.year}' ORDER BY i.income_created DESC LIMIT 1 `
        else
            conditions = `WHERE i.month = '${params.month}' and year = '${params.year}'`

        let query = `SELECT * FROM income i 
                        LEFT JOIN outcome o ON o.income_id = i.id ${conditions} ;`

        mysql.connection.query(query, [], (error, results) => {
            if (error) {
                return next(error);
            }

            if (results.length > 0) {

                month.getMonth(results[0]);

                let pieChart = new pieEntity(month);
                let outcomeChart = new outcomeEntity(month);
                progressChart.shortMonths();

                res.render('wallet', {
                    pieData: pieChart,
                    outcomeData: outcomeChart,
                    progressData: progressChart
                });

            } else {
                res.render('wallet', {})
            }
        });
    });
}

router.get('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        let params = {
            'year': date.getFullYear(),
            'default': true
        }

        builder(req, res, next, params);
    }
});

router.post('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        builder(req, res, next, req.body);
    }
});

router.post('/delete', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        mysql.query(config.mysql.income,['DELETE',{ year : req.body.year, month : req.body.month }],(err,results) => {
            if (err)
                next(err);

            res.send(results);
        })
    }
});

module.exports = router;