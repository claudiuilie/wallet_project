const cron = require('node-cron');
const request = require('request');
const options = require('../config/config');
const connection = require('mysql');
const config = new options();
const mysql = connection.createConnection(config.mysql);
const DateAndTime = require('../entity/date');


let params = {};
let weatherParams = {};
let paramsIndex, currentDate;

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

               return  `SELECT id,COUNT(json_data),
                    CASE
                       WHEN json_data REGEXP '"${index}":' is null then 0 
                       WHEN json_data REGEXP '"${index}":' =  1 then 1 
                      ELSE 0
                    END  AS "JSON_COUNT"
                    FROM temperature_monitor
                WHERE date  = ? and type = ?;`
            },

            insert : (params,type, currentDate) => {

                return `INSERT INTO temperature_monitor(id,type,json_data,modified,date) VALUES (null ,'${type}','${JSON.stringify(params)}',null, '${currentDate}');`
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

                this.query(this.querys.insert(params, type, currentDate),[],(error,res)=>{
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
            let Date = new DateAndTime();
            currentDate = Date.getCurrentDate();
            paramsIndex = `hours_${Date.getHours()}`;

//arduino request
            request(`${config.arduino.host}/sensors`,  (error, response, body) => {
                let rawData,sensors;
                let err = null;
                    if(error){
                        console.log(error)
                        err = `{"flow":"arduino_api","code": "${error}"}`
                    }

                sql.logData({'req_url': config.arduino.host},response,err);

                rawData = JSON.parse(body)
                sensors = JSON.parse(rawData.sensors);

                for (let k in sensors)
                    delete sensors[k].relays;

                params[paramsIndex] = sensors;
                params[paramsIndex].push({"timestamp": Date.getTimestamp()});

                sql.query(sql.querys.check(paramsIndex),[currentDate, 'sensors'], (error,res)=>{
                    if(error)
                        console.log(error)

                    sql.validator(res,params,currentDate,paramsIndex,"sensors");
                })
             });

// weather api request
            request(`${config.weather.host}?q=${config.weather.city}&appid=${config.weather.key}&units=${config.weather.units}`,(error, response, body) => {
                let weatherSensors=[];
                let err = null;
                    if(error){
                        console.log(error)
                        err = `{"flow":"weather_api","code": "${error}"}`
                    }
         
                sql.logData({'req_url': config.weather.host, 'body' :{'city':config.weather.city,'units':config.weather.units}},response,err);

                weatherSensors.push(JSON.parse(body));
                weatherParams[paramsIndex] = weatherSensors;
                weatherParams[paramsIndex].push({"timestamp":Date.getTimestamp()});

                sql.query(sql.querys.check(paramsIndex),[currentDate, 'weather'], (error,res)=>{
                    if(error)
                        console.log(error);

                    sql.validator(res,weatherParams,currentDate,paramsIndex,"weather");

                });
            });
        });
    }
}


module.exports = temperatureCron;



