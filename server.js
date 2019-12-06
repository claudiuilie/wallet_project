const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const exphbs  = require('express-handlebars');
const options = require('./assets/config/config');
const mysql = require('mysql');
const passwordHash = require('password-hash');

let app = express();
let config = new options();

app.engine('hbs', exphbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

app.use(session({
    secret: passwordHash.generate('secret'),  //de schimbat 
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
app.use(express.static(path.join(__dirname, 'assets')));

const authRouter = require('./routes/auth');
const homeRouter = require('./routes/home');
const profileRouter = require('./routes/profile');
const walletRouter = require('./routes/wallet');
const createWalletRouter = require('./routes/wallet_create');
const editWalletRouter = require('./routes/wallet_edit');
const logoutRouter = require('./routes/logout');

app.use('/auth', authRouter);
app.use('/home',homeRouter);
app.use('/profile',profileRouter);
app.use('/wallet', walletRouter);
app.use('/wallet/create', createWalletRouter);
app.use('/wallet/edit', editWalletRouter);
app.use('/logout', logoutRouter);

app.get('*', (req, res) => {
    res.render('home',{layout:'error.hbs'});
});


app.listen(config.server.port,config.server.host,() => console.log(`Listening ${config.server.host}:${config.server.port}`));

// CREATE TABLE `income` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,
//   `income` int(11) DEFAULT NULL,
//   `month` varchar(225) NOT NULL,
//   `year` int(11) NOT NULL,
//   `income_created` datetime DEFAULT NULL,
//   `income_modified` datetime DEFAULT NULL,
//   PRIMARY KEY (`id`)
// ) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;


// CREATE TABLE `outcome` (
//   `outcome_id` int(11) NOT NULL AUTO_INCREMENT,
//   `total_outcome` int(11) DEFAULT NULL,
//   `income_id` int(11) DEFAULT NULL,
//   `outcome_created` datetime DEFAULT NULL,
//   `outcome_modified` datetime DEFAULT NULL,
//   `outcome_data` varchar(1024) NOT NULL DEFAULT '{}',
//   PRIMARY KEY (`outcome_id`),
//   KEY `outcome_income_fk` (`income_id`),
//   CONSTRAINT `outcome_income_fk` FOREIGN KEY (`income_id`) REFERENCES `income` (`id`) ON DELETE CASCADE
// ) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;


// CREATE TABLE `user_details` (
//   `user_id` int(11) NOT NULL,
//   `adress` varchar(255) NOT NULL,
//   `city` varchar(100) NOT NULL,
//   `phone_number` int(10) DEFAULT NULL,
//   `sex` char(1) DEFAULT NULL,
//   `birth_date` date DEFAULT NULL,
//   `created` datetime DEFAULT NULL,
//   `modified` datetime DEFAULT NULL,
//   KEY `user_details_users_fk` (`user_id`),
//   CONSTRAINT `user_details_users_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


// CREATE TABLE `users` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,
//   `username` varchar(50) NOT NULL,
//   `password` varchar(255) NOT NULL,
//   `email` varchar(100) NOT NULL,
//   `avatar` text DEFAULT NULL,
//   `created` datetime DEFAULT NULL,
//   `modified` datetime DEFAULT NULL,
//   PRIMARY KEY (`id`)
// ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;



// class Config {
//     constructor () {
//         this.mysql = {
//             host: 'localhost',
//             user: 'root',
//             password:'',
//             database: 'wallet',
//             income: 'income',
//             outcome: 'outcome',
//             users: 'users',
//             user_details: 'user_details'
//         }
//         this.server = {
//             host:'localhost',
//             port:8000
//         }
//     }
// }

// module.exports = Config;