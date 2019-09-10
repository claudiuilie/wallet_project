const express = require('express');
let router = express.Router();

router.get('/', (req, res, next) =>  {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        res.render('profile');
    }
});

module.exports = router;