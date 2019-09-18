const express = require('express');
const request = require('request');
const options = require('../assets/config/config');

let config = new options();
let router = express.Router();
let jsonData;

router.get('/',(req,res, next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        // request(config.arduino.host, function (error, response, body) {
        //     if(error) {
        //         return next(error);
        //     }
        //     jsonData = JSON.parse(body);
        //     res.render('home_control',{
        //         sensors: jsonData
        //     });
        // });

        /// manual data ///
        // temp: variabila cu temperatura senzorului
        jsonData = {
            "sensors":[
                {
                    "temp":25,
                    "tempProcent": (25/50)*100,
                    "humidity": 50,
                    "icon": "fas fa-bed",
                    "relays": []
                },
                {
                    "temp":30,
                    "tempProcent": (30/50)*100,
                    "humidity": 50,
                    "icon": "fas fa-couch",
                    "relays": [
                        {
                            "status" : false,
                            "name" : "Living lights",
                            "id" : 1
                        }
                    ]
                },
                {
                    "temp":10,
                    "tempProcent": (10/50)*100,
                    "humidity": 50,
                    "icon": "fas fa-utensils",
                    "relays": [
                        {
                            "status" : true,
                            "name" : "Kitchen LED",
                            "id" : 2 // id-ul pinului la care e conectat
                        }
                    ]
                },
                {
                    "temp":45,
                    "tempProcent": (45/50)*100,
                    "humidity": 50,
                    "icon": "fas fa-bath",
                    "relays": []
                }
            ]
        };
        res.render('home_control',{
            sensors: jsonData
        });
    }
});

router.post('/', (req,res,next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        console.log(req.body);
        res.send('ok')
    }
});

module.exports = router;