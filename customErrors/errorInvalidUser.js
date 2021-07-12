class errorInvalidUser extends Error {
/**
 * Used when you don't allow a user to be there (403)
 * @param {string} reason you can specify why
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