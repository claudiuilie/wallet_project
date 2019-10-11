const express = require('express');
const request = require('request');
const options = require('../assets/config/config');
const ewelink = require('ewelink-api');



let config = new options();
let router = express.Router();
let jsonData;
// ewelink api


router.get('/',(req,res, next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        request(`${config.arduino.host}/sensors`,  (error, response, body) => {
            if(error) {
                return next(error);
            }
            jsonData = JSON.parse(body);
            res.render('home_control',{
                sensors: JSON.parse(jsonData.sensors)
            });
        });

        // / manual data ///
        // temp: variabila cu temperatura senzorului
        // jsonData = 
        //     [
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
        //                     "name" : "Living lights",
        //                     "id" : 1,
        //                     "webhook": "living_lights_"
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
        //                     "status" : true,
        //                     "name" : "Kitchen LED",
        //                     "id" : 2 // id-ul pinului la care e conectat
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
        //     ]
        // ;
        // res.render('home_control',{
        //     sensors: jsonData
        // });
    }
});

router.post('/', (req,res,next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        let url;
        let sonoffStatus;

        if (req.body.switch) {

            if (req.body.status == 'true') {
                sonoffStatus = 'on';
                url = `${config.arduino.host}/sonoff?status=1`;
            } else {
                sonoffStatus= 'off';
                url = `${config.arduino.host}/sonoff?status=0`;
            }
            (async () => {

                const connection = new ewelink(config.eWelink);
                try{

                    /* get all devices */
                    // const devices = await connection.getDevices();
                    // console.log(devices);

                    /* get specific devi info */
                    // const device = await connection.getDevice('100062aeb3');
                    // console.log(device);

                    //status
                    // const statuss = await connection.getDevicePowerState(req.body.relayId);
                    // console.log(statuss);
                    // res.send(statuss);

                    // change status
                    const status = await connection.setDevicePowerState(req.body.relayId, sonoffStatus);
                    res.send(status);
                }
                catch(err){
                    next(err);
                }
            })();

            request(url,  (error) => {
                if(error) {
                    return next(error);
                }
            });

        } else {

            if (req.body.status == 'true' && !req.body.switch)
                url = `${config.arduino.host}/digital/${req.body.relayId}/1`;
            else 
                url = `${config.arduino.host}/digital/${req.body.relayId}/0`;

            request(url,  (error, response) => {
                if(error) {
                    return next(error);
                }

                res.send(response);
            });
        }

    }
});

module.exports = router;




// class Config {
//     constructor () {
//         this.mysql = {
//             host: 'localhost',
//             user: 'root',
//             password:'',
//             database: 'test'
//         }
//         this.server = {
//             host:'localhost',
//             port:8000
//         }
//         this.arduino = {
//             host: 'http://192.168.1.200'
//         }
//         this.webhook = {
//             uri: 'https://maker.ifttt.com/trigger/',
//             key:'/with/key/bJjeDiN4hyh_X4V2UdowDd'
//         }
//     }
// }

// module.exports = Config;