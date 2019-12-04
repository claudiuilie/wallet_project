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

function builder(req,res,next, params){

    let year;
    let progressChart;
    let month = new monthEntity();

    mysql.select(config.mysql.income, {'year' : date.getFullYear()}, (error, results) => {
        if(error) {
            return next(error);
        }
        year = results;


        progressChart = new progressEntity(year);

        let query = `Select * from income i 
                        LEFT JOIN outcome o on o.income_id = i.id 
                        where i.month = '${params.month}';`

        mysql.query(query,[],(error,results)=>{
            if(error) {
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

    // if (!req.session.loggedin) res.redirect('/auth');

    // else {
        let params = {'month': date.toLocaleString('default', { month: 'long' }),'year': date.getFullYear()}
        builder(req,res,next,params);
    // }
});

router.post('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        builder(req,res,next, req.body);
    }
});

module.exports = router;