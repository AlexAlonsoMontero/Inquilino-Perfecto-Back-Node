class errorInvalidToken extends Error {
    /**
     * 
     * @param {string} info 
     */
    constructor(info) {
        super();
        this.name = "errorInvalidToken";
        this.type = "token";
        this.message = `Invalid token ${info}`;
    }
}

module.exports = {
    errorInvalidToken:errorInvalidToken
}