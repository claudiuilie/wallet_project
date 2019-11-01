const cron = require('node-cron');
const request = require('request');
const options = require('../config/config');
const connection = require('mysql');
const config = new options();
const mysql = connection.createConnection(config.mysql);
const DateAndTime = require('../entity/date');
const Date = new DateAndTime();

let params = {};
let weatherParams = {};
let paramsIndex, query, currentDate;

let mock = "http://www.mocky.io/v2/5dbac0d23000003dc60291b5"


class Sql {

    constructor() {

    this.query = (query,date,results) => {

                 mysql.query(query,date,(error,res)=>{

                   return results(error,res);
            })
        }

    this.querys = {

            selectAll : ()=>{
                return `SELECT json_data FROM temperature_monitor WHERE date = ? and type = ?;`
            },

            check : (index) => {

               return  `SELECT id,
                    CASE
                    WHEN SUM(
                        CASE 
                            WHEN JSON_EXTRACT(json_data, "$.${index}") IS NOT null  THEN 1 
                                ELSE 0
                                END) = 1 THEN 1
                            ELSE 0
                        END  AS "JSON_COUNT"
                    FROM temperature_monitor
                WHERE date  = ? and type = ?;`
            },

            insert : (params,type) => {

                return `INSERT INTO temperature_monitor(id,type,json_data,modified) VALUES (null ,'${type}','${JSON.stringify(params)}',null);`
            },

            update : (params) => {
                return `UPDATE temperature_monitor SET json_data = '${JSON.stringify(params)}' WHERE date = ? and type = ?;`
            }, 

            logs: (request,response,error) => {
                return `INSERT INTO temperature_monitor_logs(id,request,response,error,timestamp) values (null,'${JSON.stringify(request)}' ,'${JSON.stringify(response)}' ,'${error}', null)`
            }
        } 
    }

    logData(request,response,error){
        this.query(this.querys.logs(request,response,error),[],(error,res)=>{
            if(error)
                console.log(error)
        })
    }

    insert(params, type) {

                this.query(this.querys.insert(params, type),[],(error,res)=>{
                    let err = null;
                    if(error)
                        err = `{"flow":"sql_insert","code": "${error.code}" ,"sqlMessage": "${error.sqlMessage.replace(/'/g,"") }"}`
         
                    this.logData(params,res,err)
                })
    }

    update(params,currentDate,paramsIndex, type) {

        this.query(this.querys.selectAll(),[currentDate, type],(error,res)=>{
                if(error) 
                    console.log(error)

                    let newParams = JSON.parse(res[0].json_data)
                    newParams[paramsIndex] = params[paramsIndex]

                this.query(this.querys.update(newParams),[currentDate, type],(error,res)=>{
                    let err = null;
                    if(error)
                        err = `{"flow":"sql_update","code": "${error.code}" ,"sqlMessage": "${error.sqlMessage.replace(/'/g,"") }"}`
         
                    this.logData(newParams,res,err)
                })
        })
    }

    validator(res,params,currentDate,paramsIndex, type) {

        switch (true) {
            case res[0].JSON_COUNT == 0 && res[0].id != null:
                    this.update(params,currentDate,paramsIndex, type);
                break;

            case res[0].JSON_COUNT == 0 && res[0].id == null:
                    this.insert(params, type);
                break;

            default:
                this.logData(JSON.stringify(params),'Duplicate entry','Duplicate entry')

        }
    }
}

const sql = new Sql();

class temperatureCron {
    constructor() {
        
        cron.schedule(config.crons.temperatureCron.interval, () => {
            console.log('1')
            currentDate = Date.getCurrentDate();
            paramsIndex = `hours_${Date.getHours()}`;

//arduino request
            request(`${config.arduino.host}/sensors`,  (error, response, body) => {
                    let err = null;
                    if(error){
                        console.log(error)
                        err = `{"flow":"arduino_api","code": "${error}"}`
                    }
         
                sql.logData(body,response,err)

                // let hour = new Date().getHours();
                // let jsonData = JSON.parse(body);
                // let arduSensors = JSON.parse(jsonData.sensors)

                // for (let k in res){
                //     delete res[k]['relays']

                // }
                // console.log(params);
             });

// weather api request
            request(`${config.weather.host}?q=${config.weather.city}&appid=${config.weather.key}&units=${config.weather.units}`,(error, response, body) => {
                    let err = null;
                    if(error){
                        console.log(error)
                        err = `{"flow":"weather_api","code": "${error}"}`
                    }
         
                sql.logData(body,response,err)

            })
//mock          
              let weatherSensors = [{"coord":{"lon":25.98,"lat":44.37},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"base":"stations","main":{"temp":5.96,"pressure":1027,"humidity":87,"temp_min":5.56,"temp_max":6.11},"visibility":10000,"wind":{"speed":5.1,"deg":60},"clouds":{"all":90},"dt":1572520041,"sys":{"type":1,"id":6911,"country":"RO","sunrise":1572497467,"sunset":1572534488},"timezone":7200,"id":683914,"name":"Bragadiru","cod":200}]
              
              let  arduSensors = [ { temp: 22, humidity: 81, icon: 'fas fa-bed' },
                  { temp: 22, humidity: 84, icon: 'fas fa-couch' },
                  { temp: 22, humidity: 81, icon: 'fas fa-utensils' }]
//mock


               params[paramsIndex] = arduSensors
               params[paramsIndex].push({"timestamp": Date.getTimestamp()}) 

               weatherParams[paramsIndex] = weatherSensors
               weatherParams[paramsIndex].push({"timestamp":Date.getTimestamp()}) 

// select dupa raspuns din arduino/weather api
               sql.query(sql.querys.check(paramsIndex),[currentDate, 'sensors'], (error,res)=>{
                    if(error) 
                        console.log(error)

                     sql.validator(res,params,currentDate,paramsIndex,"sensors");

                })

                sql.query(sql.querys.check(paramsIndex),[currentDate, 'weather'], (error,res)=>{
                    if(error) 
                        console.log(error)

                     sql.validator(res,weatherParams,currentDate,paramsIndex,"weather");

                })
// select dupa raspuns din arduino/weather api
        });
    }
}


module.exports = temperatureCron;



// CREATE TABLE `temperature_monitor` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,
//   `type` varchar(100) NOT NULL,
//   `json_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`json_data`)),
//   `modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
//   `date` date NOT NULL DEFAULT curdate(),
//   PRIMARY KEY (`id`)
// ) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;



// CREATE TABLE `temperature_monitor_logs` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,
//   `request` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
//   `response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
//   `error` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
//   `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
//   PRIMARY KEY (`id`)
// ) ENGINE=InnoDB AUTO_INCREMENT=415 DEFAULT CHARSET=latin1;


// CREATE TABLE `accounts` (
//     `id` int(11) NOT NULL AUTO_INCREMENT,
//     `username` varchar(50) NOT NULL,
//     `password` varchar(255) NOT NULL,
//     `email` varchar(100) NOT NULL,
//     `avatar` text,
//     PRIMARY KEY (`id`)
// ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

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
// ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

// INSERT INTO test.accounts
// (id, username, password, email, avatar)
// VALUES(2, 'frumy', 'sha1$bf2b6bd2$1$342e6ae170c2c5433f352e219c46bf8d75dfff7f', 'andreea_14_02@yahoo.com', '''/img/frumyAvatar.png''');

// INSERT INTO test.accounts
// (id, username, password, email, avatar)
// VALUES(3, 'claudiu', 'sha1$5f992b5e$1$42a34631b6e33aa1ccdbc7e2482db83075d53c7e', 'claudiu.ilie0322@gmail.com', '''/img/claudiuAvatar.png''');

// INSERT INTO test.income
// (id, income_claudiu, income_frumy, outcome_casa, outcome_masina, outcome_avans, outcome_engie, outcome_enel, outcome_digi, outcome_intretinere, outcome_abonamente, outcome_vacanta, outcome_extra, total_income, total_outcome, `year`, month_name, creation)
// VALUES(1, 6500, 2700, 630, 380, 235, 35, 65, 87, 110, 200, 0, '{"Facultate":"1700","Mom":"1000","Weeks":"2000","Avantaj":"250","Masina":"250","Tricouri":"210","Medic":"400","Team building":"250"}', 9200, 7802, 2019, 'september', '2019-09-12 11:54:11.000');
//
// INSERT INTO test.income
// (id, income_claudiu, income_frumy, outcome_casa, outcome_masina, outcome_avans, outcome_engie, outcome_enel, outcome_digi, outcome_intretinere, outcome_abonamente, outcome_vacanta, outcome_extra, total_income, total_outcome, `year`, month_name, creation)
// VALUES(2, 6500, 3600, 632, 380, 235, 20, 60, 87, 30, 200, 3000, '{"Mom":"1000","Weeks":"2000","Avantaj":"450","Revizie masina":"400","Munte":"800","Haine":"600"}', 10100, 9894, 2019, 'october', '2019-10-23 16:09:02.000');
//
// INSERT INTO test.income
// (id, income_claudiu, income_frumy, outcome_casa, outcome_masina, outcome_avans, outcome_engie, outcome_enel, outcome_digi, outcome_intretinere, outcome_abonamente, outcome_vacanta, outcome_extra, total_income, total_outcome, `year`, month_name, creation)
// VALUES(3, 6500, 3500, 620, 380, 235, 0, 60, 87, 90, 200, 3000, '{"Avantaj":"375","Mom":"1000","Weeks":"2000","Revizie masina":"400"}', 10000, 8447, 2019, 'November', '2019-10-24 19:55:46.000');

/*
    1.add to config 

            this.crons = {
            temperatureCron : {
                interval : '00 00 0-23 * * *'
            }
        }
            this.weather = {
                host: "https://api.openweathermap.org/data/2.5/weather",
                city:"Bragadiru",
                key: "cd86b6b78b174125bfddf3cc26d7105a",
                units: "metric"
            }
        this.mysqlTables = {
            tempMonitor: 'temperature_monitor',
            tempMonitorLogs: 'temperature_monitor_logs'
        }

*/



