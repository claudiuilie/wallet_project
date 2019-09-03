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


// middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//     console.log('Time: ', Date.now())
//     next()
// })

router.get('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        mysql.select('income' ,{'year':new Date().getFullYear()},(error,results)=>{
            if(error) {
                return next(error);
            }
            if (results.length > 0) {
                let year = results;
                let progressChart = new progressEntity(year);
                let month = new monthEntity();
                month.getMonth(year[year.length - 1]);
                let pieChart = new pieEntity(month);
                let outcomeChart = new outcomeEntity(month);
                progressChart.shortMonths();

                res.render('home', {
                    pieData: pieChart,
                    outcomeData: outcomeChart,
                    progressData: progressChart
                });

            } else {
                res.render('home', {})
            }
        });
    }
});

module.exports = router;