class Account {

    setAccount(body) {
        for (let k in body) {
            this[k] = body[k];
        }
        
    }

    set(key, value) {
        this[key] = value;
    }
}

module.exports = Account;