let instance;
const dbUserName = "pinchiachen";
const dbUserPw = "chen830125";

class Setting {
    constructor() {
        this.dbUserName = dbUserName;
        this.dbUserPw = dbUserPw;
    }
    
    getName() {
        return this.dbUserName
    }

    getPasswd() {
        return this.dbUserPw
    }
    
}

module.exports = (function () {
    if (!instance) {
        instance = new Setting();
    }

    return instance;
})();