const options = require('./assets/config/config');
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const exphbs  = require('express-handlebars');
const mysqltorest  = require('mysql-to-rest');
const mysqlController = require('./assets/js/mysqlController');
const monthEntity = require('./assets/entity/month');
const pieEntity = require('./assets/entity/pieChart');
const outcomeEntity = require('./assets/entity/outcomeChart');
const progressEntity = require('./assets/entity/progressChart');


var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'smtp.mail.yahoo.com',
    port: 465,
    service:'yahoo',
    secure: false,
    auth: {
        user: 'slow.motion3@yahoo.com',
        pass: 'bulgaria188'
    }
});
var mailOptions = {
    from: 'slow.motion3@yahoo.com',
    to: 'claudiu.ilie0322@gmail.com',
    subject: 'Test',
    text: 'That was easy!'
};
transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});



let config = new options();
let router = express.Router();
let app = express();
let mysql = new mysqlController(config.mysql);
let api = mysqltorest(app,mysql.connection);

app.engine('hbs', exphbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

app.use(session({
    secret: 'secret',  //de schimbat 
    resave: true,
    maxAge: 3600000,
    saveUninitialized: true
}));
app.use(function(req, res, next){
    res.locals.session = req.session;
    next();
});
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/', router);
app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', function(req, response) {

    if (req.session.loggedin) {
        response.redirect('/home');
    } else {
        response.render('home',{layout:'login.hbs'});
    }

});

app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
        mysql.select('accounts',{'username':username,'password': password},(err,results)=> {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/home');
            } else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

app.get('/home', function (req, res) {

    if (req.session.loggedin) {

        mysql.select('income' ,{'year':new Date().getFullYear()},(error,results)=>{
            if(error) {
                throw new Error(error);
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

    } else {
        res.redirect('/');
    }
});

app.get('/create', function (req, res) {

    if (req.session.loggedin) {
          res.render('createIncome');
    } else {
        res.redirect('/');
    }
});

app.post('/create', function (req, res) {

    let month = new monthEntity();
    month.setMonth(req.body);

    function validateMonth() {
        mysql.select('income',{'month_name':month.month_name,'year':month.year},(error,results) =>{
            if (error) {
                if(error) {
                    throw new Error(error);
                }
            } else {
                if (results.length == 0) {
                    postData()
                } else {
                    res.render('createIncome', {testText: `Exista deja date pentru luna ${month.month_name} ${month.year}` , errorModal: 'show'});
                }
            }
        });
    }

    function postData() {
        mysql.insert('income',month,(error,results) => {
            if (error) {
                if(error) {                    throw new Error(error);
                }
            } else {
                if (results.affectedRows > 0 ) {
                    res.render('createIncome', {testText: `Success: affected rows ${results.affectedRows}` , errorModal: 'show'});
                }
            }
        });
    }
    validateMonth();
});

app.get('/edit', function (req, res) {
    if (req.session.loggedin) {

       if (Object.keys(req.query).length > 0 ) {
           mysql.select('income' ,req.query,(error,results)=>{
               let month = new monthEntity()
               month.getMonth(results[0])

               res.render('editIncome', {month :month});
           });
       } else {
           res.redirect('/home');
       }
    } else {
        res.redirect('/');
    }

});

app.post('/edit', function (req, res) {
    let month = new monthEntity();
    month.setMonth(req.body);

    mysql.update('income',month,(error,results) => {
        if (error) {
                throw new Error(error);
        } else {
            if (results.affectedRows > 0 ) {
                res.redirect('home');
            }
        }
    });
});

app.get('/logout', function(req, res, next) {
  if (req.session) {
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

app.get('*', function (req, res) {
  res.redirect('/home');
});

app.listen(config.server.port,config.server.host,() => console.log(`Listening ${config.server.host}:${config.server.port}`));

// CREATE TABLE `income` (
//     `id` int(11) NOT NULL AUTO_INCREMENT,
//     `income_claudiu` int(11) DEFAULT NULL,
//     `income_frumy` int(11) DEFAULT NULL,
//     `outcome_casa` int(11) DEFAULT NULL,
//     `outcome_masina` int(11) DEFAULT NULL,
//     `outcome_avans` int(11) DEFAULT NULL,
//     `outcome_engie` int(11) DEFAULT NULL,
//     `outcome_enel` int(11) DEFAULT NULL,
//     `outcome_digi` int(11) DEFAULT NULL,
//     `outcome_intretinere` int(11) DEFAULT NULL,
//     `outcome_abonamente` int(11) DEFAULT NULL,
//     `outcome_vacanta` int(11) DEFAULT NULL,
//     `outcome_extra` varchar(1024) DEFAULT NULL,
//     `total_income` int(11) DEFAULT NULL,
//     `total_outcome` int(11) DEFAULT NULL,
//     `year` int(11) DEFAULT NULL,
//     `month_name` varchar(255) DEFAULT NULL,
//     `creation` datetime DEFAULT NULL,
//     PRIMARY KEY (`id`)
// ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

// CREATE TABLE IF NOT EXISTS `accounts` (
//   `id` int(11) NOT NULL,
//   `username` varchar(50) NOT NULL,
//   `password` varchar(255) NOT NULL,
//   `email` varchar(100) NOT NULL
// ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
//
// INSERT INTO `accounts` (`id`, `username`, `password`, `email`) VALUES (1, 'test', 'test', 'test@test.com');
//
// ALTER TABLE `accounts` ADD PRIMARY KEY (`id`);
// ALTER TABLE `accounts` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;