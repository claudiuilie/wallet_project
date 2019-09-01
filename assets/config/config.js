
class Options {
    constructor() {
        this.server =  {
            host:'192.168.1.101',
                port: 8000
        }

        this.mysql  =  {
            host     : 'localhost',
                user     : 'root',
                password : '',
                database : 'test'
        }
    }
}

module.exports = Options ;