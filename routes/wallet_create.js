const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const monthEntity = require('../assets/entity/month');
const express = require('express');
const config = new options();

let router = express.Router();
let mysql = new mysqlController(config.mysql);

router.get('/', (req, res) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else
        res.render('create_wallet');
});

router.post('/', (req, res, next) => {

    let month = new monthEntity();
    month.setMonth(req.body);

    function validateMonth() {
        mysql.select('income',{'month_name':month.month_name,'year':month.year},(error,results) =>{
            if(error) {
                return next(error);
            } else {
                if (results.length == 0) {
                    postData()
                } else {
                    res.render('create_wallet', {testText: `Exista deja date pentru ${month.month_name} ${month.year}` , errorModal: 'show'});
                }
            }
        });
    }

    function postData() {
        mysql.insert('income',month,(error,results) => {
            if(error) {
                return next(error);
            } else {
                if (results.affectedRows > 0 ) {
                    res.render('create_wallet', {testText: `Success: affected rows ${results.affectedRows}` , errorModal: 'show'});
                }
            }
        });
    }
    validateMonth();
});

module.exports = router;
