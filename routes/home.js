const express = require('express');
let router = express.Router();

router.get('/',(req,res) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        res.render('home');
    }
});

module.exports = router;