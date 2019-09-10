const express = require('express');
let router = express.Router();
var jsonData = {
    "tempSensors": [
        { "temp": 20, "badge": "Bedroom Temp :", "unit": "°C" },
        { "temp": 20, "badge": "Livin Temp :", "unit": "°C" },
        { "temp": 20, "badge": "Kitchen Temp :", "unit": "°C" },
        { "temp": 20, "badge": "Bathroom Temp :", "unit": "°C" }],
    "humiditySensors": [
        { "humidity": 20, "badge": "Bedroom humidity :", "unit": "%" },
        { "humidity": 20, "badge": "Living humidity :", "unit": "%" },
        { "humidity": 20, "badge": "Kitchen humidity :", "unit": "%" },
        { "humidity": 20, "badge": "Bathroom humidity :", "unit": "%" }],
    "relayStatus":
        {
            "bedroom":
                { "status": true, "trigger": "<a href='/?relay1on'>on<a>" }
        }
}

router.get('/',(req,res) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        res.render('home_control',{
            sensors: jsonData
        });
    }
});

module.exports = router;