const mysql = require('mysql');

class mysqlController {

    constructor() {
        this.connection = mysql.createConnection({
            host     : '192.168.1.102',
            user     : 'incomeapp',
            password : 'Bulgaria188',
            database : 'test'
        });
    }

    select(database,request,results) {

            let querry = `SELECT * FROM ${database} WHERE `;

            for (let k in request) {
                querry += `${k} = ?`;
                if (Object.keys(request).length > 1 && k !== Object.keys(request).pop() ) {
                    querry += ' AND '
                }
            }

            this.connection.query(querry,Object.values(request),(error,res)=>{
		return results(error,res);
            });
    }

    insert(database,request,results) {
            let values = '?,'
            let querry = `INSERT INTO ${database} (${Object.keys(request)}) VALUES (${values.repeat(Object.keys(request).length).slice(0, -1)});`

            this.connection.query(querry,Object.values(request),(error,res)=> {
                return results(error,res);
            })
    }
}

module.exports = mysqlController;



