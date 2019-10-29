const cron = require('node-cron');
const request = require('request');
const mysqlController = require('../js/mysqlController');
const options = require('../config/config');
const config = new options();
const mysql = new mysqlController(config.mysql);



class temperatureCron {
    constructor() {

        cron.schedule('* 1-59 * * * *', () => {

            request(`${config.arduino.host}/sensors`,  (error, response, body) => {
                if(error) {
                    console.log(error);
                }

                let hour = new Date().getHours();
                let jsonData = JSON.parse(body);
                let res = JSON.parse(jsonData.sensors)

                for (let k in res){
                    delete res[k]['relays']

                }
                res.push({"timestamp": new Date().toLocaleTimeString()})

                console.log(res);

//mock
                //res = [ { temp: 22, humidity: 81, icon: 'fas fa-bed' },
                //   { temp: 22, humidity: 84, icon: 'fas fa-couch' },
                //   { temp: 22, humidity: 81, icon: 'fas fa-utensils' },
                //   { timestamp: '11:16:22 PM' } ]

                mysql.select('temperature_monitor',{[hour]: null},(error, results) => {
                    if(error) {
                        console.log(error);
                    }
                    if (results.length > 0) {
                        console.log(results)
                    }else {
                        console.log(false)
                        console.log(results)
                    }
                })
            });

        });
    }
}


module.exports = temperatureCron;
