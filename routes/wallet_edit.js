const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const monthEntity = require('../assets/entity/month');
const express = require('express');
const config = new options();

let router = express.Router();
let mysql = new mysqlController(config.mysql);

router.get('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        if (Object.keys(req.query).length > 0 ) {

            

            let query = `Select * from income i 
                        LEFT JOIN outcome o on o.income_id = i.id 
                        where i.month = '${req.query.month}' and  year = '${req.query.year}';`

            mysql.query(query,[],(error,results)=>{
                if(error) {
                    return next(error);
                }
                let month = new monthEntity();
                month.getMonth(results[0]);
                res.render('wallet_edit', {month :month});
            });
        } else {
            res.redirect('/home');
        }
    }
});

router.post('/', (req, res, next) => {
    let month = new monthEntity();
    console.log(req.body)

    month.setMonth(req.body);
    console.log(month)
    // mysql.update('income',month,{'month': month.month, "year": month.year},(error,results) => {
    //     if(error) {
    //         return next(error);
    //     } else {
    //         if (results.affectedRows > 0 ) {
    //             res.redirect('/wallet');
    //         }
    //     }
    // });
});

module.exports = router;