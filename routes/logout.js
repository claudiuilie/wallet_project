const express = require('express');
let router = express.Router();

router.get('/', (req, res, next) =>  {
  if (req.session) {
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/auth');
      }
    });
  }
});

module.exports = router;