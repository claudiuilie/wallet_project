const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const exphbs  = require('express-handlebars');
const options = require('./assets/config/config');

let app = express();
let config = new options();

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
app.use(express.static(path.join(__dirname, 'assets')));

let authRouter = require('./routes/auth');
let homeRouter = require('./routes/home');
let profileRouter = require('./routes/profile');
let homeControltRouter = require('./routes/home_control');
let walletRouter = require('./routes/wallet');
let createWalletRouter = require('./routes/wallet_create');
let editWalletRouter = require('./routes/wallet_edit');
let logoutRouter = require('./routes/logout');

app.use('/auth', authRouter);
app.use('/home',homeRouter);
app.use('/profile',profileRouter);
app.use('/control',homeControltRouter);
app.use('/wallet', walletRouter);
app.use('/wallet/create', createWalletRouter);
app.use('/wallet/edit', editWalletRouter);
app.use('/logout', logoutRouter);

app.get('*', (req, res) => {
    res.render('home',{layout:'error.hbs'});
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

// ALTER TABLE `accounts` ADD PRIMARY KEY (`id`);
// ALTER TABLE `accounts` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;