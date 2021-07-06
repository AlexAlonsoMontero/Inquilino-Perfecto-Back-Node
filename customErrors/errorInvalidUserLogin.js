class errorInvalidUserLogin extends Error {
/**
 * 
 * @param {string} mailValue 
 * @param {string} passwordValue 
 * @param {boolean} mailInDB true when pass fails
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
    errorInvalidUserLogin:errorInvalidUserLogin
}