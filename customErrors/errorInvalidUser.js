class errorInvalidUser extends Error {
/**
 * 
 * @param {string} mailValue 
 * @param {string} passwordValue 
 */
    constructor(mailValue, passwordValue, mailInDB) {
        super();
        this.name = "errorInvalidUser";
        this.type = "login";
        const mailExists = mailInDB ? 'exists':'not exists'
        this.message = `Failed to log in as '${mailValue}' which ${mailExists}, with password '${passwordValue}'`;
    }
}

module.exports = {
    errorInvalidUser:errorInvalidUser
}