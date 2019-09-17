const express = require('express');
const request = require('request');
const options = require('../assets/config/config');

let config = new options();
let router = express.Router();
let jsonData;

router.get('/',(req,res, next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        request(config.arduino.host, function (error, response, body) {
            if(error) {
                return next(error);
            }
            jsonData = JSON.parse(body);
            res.render('home_control',{
                sensors: jsonData
            });
        });

        /// manual data ///
        // temp: variabila cu temperatura senzorului
        // jsonData = {
        //     "sensors":[
        //         {
        //             "temp":25,
        //             "tempProcent": (25/50)*100,
        //             "humidity": 50,
        //             "icon": "fas fa-bed",
        //             "relays": []
        //         },
        //         {
        //             "temp":30,
        //             "tempProcent": (30/50)*100,
        //             "humidity": 50,
        //             "icon": "fas fa-couch",
        //             "relays": [
        //                 {
        //                     "status" : false,
        //                     "name" : "living lights"
        //                 }
        //             ]
        //         },
        //         {
        //             "temp":10,
        //             "tempProcent": (10/50)*100,
        //             "humidity": 50,
        //             "icon": "fas fa-utensils",
        //             "relays": [
        //                 {
        //                     "status" : false,
        //                     "name" : "kitchen lights"
        //                 }
        //             ]
        //         },
        //         {
        //             "temp":45,
        //             "tempProcent": (45/50)*100,
        //             "humidity": 50,
        //             "icon": "fas fa-bath",
        //             "relays": []
        //         }
        //     ],
        //     "relays": [
        //         {
        //             "name": "kitchen lights",
        //             "icon":"fas fa-utensils",
        //             "status": true
        //         }
        //     ]
        // };
        // res.render('home_control',{
        //     sensors: jsonData
        // });
    }
});

module.exports = router;