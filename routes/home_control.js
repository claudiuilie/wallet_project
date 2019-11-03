const express = require('express');
const request = require('request');
const options = require('../assets/config/config');
const ewelink = require('ewelink-api');
const mysqlController = require('../assets/js/mysqlController');
const DateAndTime = require('../assets/entity/date');
const Chart = require('../assets/entity/tempHistoryChart');
const config = new options();
const mysql = new mysqlController(config.mysql);
const date = new DateAndTime();

let router = express.Router();
let arduinoSensors, weatherData, sensorsData;

router.get('/',(req,res, next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {

        request(`${config.arduino.host}/sensors`,  (error, response, body) => {
            if(error) {
                return next(error);
            }
            arduinoSensors = JSON.parse(body);

            mysql.select(config.mysqlTables.tempMonitor,{"date":date.getCurrentDate()}, (error, results) => {
                if(error) {
                    return next(error);
                }

                for (let k in results) {
                    if(results[k].type == "sensors"){
                        sensorsData = results[k];
                        sensorsData.json_data = JSON.parse(sensorsData.json_data)
                    }

                    if(results[k].type == "weather") {
                        weatherData = results[k];
                        weatherData.json_data = JSON.parse(weatherData.json_data)
                    }

                }

                let chart = new Chart(sensorsData.json_data,weatherData.json_data)

                res.render('home_control',{
                    sensors: JSON.parse(arduinoSensors.sensors),
                    tempHistory: chart
                });
            });
        });
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
