const mysql = require('mysql');

class mysqlController {

    constructor(config) {
        this.connection = mysql.createConnection(config);
    }

    setConditions(c) {

        let s = '';
        for (let k in c) {

            s += `${k} = '${c[k]}'`;
            if (Object.keys(c).length > 1 && k !== Object.keys(c).pop()) {
                s += ' AND '
            }
        }
        return s;
    }

    query(table, query, results) {

        let q;
        let p;
        let c;

        switch (query[0]) {

            case "SELECT":
                c = this.setConditions(query[2]);
                q = `SELECT ${query[1].join()} FROM ${table} WHERE ${c}`;
                break;
            case "UPDATE":
                c = this.setConditions(query[2]);
                q = `UPDATE ${table} SET ? WHERE ${c}`
                p = query[1]
                break;
            case "INSERT":
                let v = '?,'
                q = `INSERT INTO ${table} (${Object.keys(query[1])}) VALUES (${v.repeat(Object.keys(query[1]).length).slice(0, -1)});`
                p = Object.values(query[1])
                break;
            case "DELETE":
                c = this.setConditions(query[1]);
                q = `DELETE FROM ${table} WHERE ${c}`;
                break;
            default:
                q = query;
        }
        this.connection.query(q, p, (e, r) => {
            return results(e, r);
        })
    }
}

module.exports = mysqlController;

// ['SELECT', [fields] , {conditions}]
// ['UPDATE', {field:value} ,{conditions}]
// ['INSERT', {field:value}]
// ['DELETE', {conditions}]
