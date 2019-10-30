const cron = require('node-cron');
const request = require('request');
const options = require('../config/config');
const connection = require('mysql');
const config = new options();
const mysql = connection.createConnection(config.mysql);

let params = {};
let date,year,month,day,hours,timestamp,currentDate,paramsIndex, query;


class Sql {

    constructor() {

    this.query = (query,date,results) => {

                 mysql.query(query,date,(error,res)=>{

                   return results(error,res);
            })
        }

    this.querys = {

            selectAll : ()=>{
                return `SELECT json_data FROM temperature_monitor WHERE date = ?;`
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
                WHERE date  = ?;`
            },

            insert : (params) => {

                return `INSERT INTO temperature_monitor(id,json_data,modified) VALUES (null ,'${JSON.stringify(params)}',null);`
            },

            update : (params) => {
                return `UPDATE temperature_monitor SET json_data = '${JSON.stringify(params)}' WHERE date = ?;`
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

    insert(params) {

                this.query(this.querys.insert(params),[],(error,res)=>{
                    let err = null;
                    if(error)
                        err = `{"code": "${error.code}" ,"sqlMessage": "${error.sqlMessage.replace(/'/g,"") }"}`
         
                    this.logData(params,res,err)
                })
    }

    update(params,currentDate,paramsIndex) {

        this.query(this.querys.selectAll(),[currentDate],(error,res)=>{
                if(error) 
                    console.log(error)

                    let newParams = JSON.parse(res[0].json_data)
                    newParams[paramsIndex] = params[paramsIndex]

                this.query(this.querys.update(newParams),[currentDate],(error,res)=>{
                    let err = null;
                    if(error)
                        err = `{"code": "${error.code}" ,"sqlMessage": "${error.sqlMessage.replace(/'/g,"") }"}`
         
                    this.logData(newParams,res,err)
                })
        })
    }

    validator(res,params,currentDate,paramsIndex) {

        switch (true) {
            case res[0].JSON_COUNT == 0 && res[0].id != null:
                    this.update(params,currentDate,paramsIndex);
                break;

            case res[0].JSON_COUNT == 0 && res[0].id == null:
                    this.insert(params);
                break;

            default:
                this.logData(JSON.stringify(params),'Duplicate entry','Duplicate entry')

        }
    }
}

const sql = new Sql();


class temperatureCron {
    constructor() {
        
        cron.schedule('5,10,15,20,25,30,35,40,45,50,55 * * * * *', () => {
             date = new Date();
             year = date.getFullYear();
             month = date.getMonth()+1;
             day = date.getDate();
             currentDate = `${year}-${month}-${day}`

             hours = date.getHours();
             paramsIndex = `hours_${hours}`;

            // request(`${config.arduino.host}/sensors`,  (error, response, body) => {
            //     if(error) {
            //         console.log(error);
            //     }

            //     let hour = new Date().getHours();
            //     let jsonData = JSON.parse(body);
            //     let arduSensors = JSON.parse(jsonData.sensors)

            //     for (let k in res){
            //         delete res[k]['relays']

            //     }

            // params[paramsIndex] = arduSensors
            // params[paramsIndex]["timestamp"] = date.toLocaleTimeString(); 

            //     console.log(params);
            //  });

//mock          
              
              let  arduSensors = [ { temp: 22, humidity: 81, icon: 'fas fa-bed' },
                  { temp: 22, humidity: 84, icon: 'fas fa-couch' },
                  { temp: 22, humidity: 81, icon: 'fas fa-utensils' }]

               params[paramsIndex] = arduSensors
               params[paramsIndex].push({"timestamp":date.toLocaleTimeString()}) 


               sql.query(sql.querys.check(paramsIndex),[currentDate], (error,res)=>{
                    if(error) 
                        console.log(error)

                     sql.validator(res,params,currentDate,paramsIndex);

                })
        });
    }
}


module.exports = temperatureCron;



// CREATE TABLE `temperature_monitor` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,
//   `json_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`json_data`)),
//   `modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
//   `date` date NOT NULL DEFAULT curdate(),
//   PRIMARY KEY (`id`),
//   UNIQUE KEY `date` (`date`)
// ) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;


// CREATE TABLE `temperature_monitor_logs` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,
//   `request` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
//   `response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
//   `error` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
//   `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
//   PRIMARY KEY (`id`)
// ) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=latin1;
