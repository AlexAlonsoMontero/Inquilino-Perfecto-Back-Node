class errorCouldNotUpdate extends Error {
    /**
     * Thrown when failed an update
     * @param {string} who user who triggered
     * @param {string} where method where triggered
     */
    constructor(where,who) {
        super();
        this.name = "errorCouldNotUpdate";
        this.type = "sql";
        this.message = `Could not update ${who} in ${where}`
    }
}

module.exports = {
    errorCouldNotUpdate:errorCouldNotUpdate
}