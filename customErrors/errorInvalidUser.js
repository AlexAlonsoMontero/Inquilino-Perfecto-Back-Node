class errorInvalidUser extends Error {
/**
 * 
 * @param {string} reason 
 */
    constructor(reason) {
        super();
        this.name = "errorInvalidUser";
        this.type = "access";
        this.message = `You Shall Not Pass ${reason ? reason :''}`;
    }
}

module.exports = {
    errorInvalidUser:errorInvalidUser
}