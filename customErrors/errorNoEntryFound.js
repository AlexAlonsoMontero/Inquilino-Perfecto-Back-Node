class errorNoEntryFound extends Error {
    /**
     * 
     * @param {string} where in which part of the code is the error
     * @param {string} why guess why
     * @param {string} what1 element that could detonate the error
     * @param {string} what2 value of 'what1'
     */
    constructor(where, why, what1, what2) {
        super();
        this.name = "errorNoEntryFound";
        this.type = "sql";
        this.message = `Not entry was found in '${where}' where '${what1}' is '${what2}', because '${why}'`;
    }
}

module.exports = {
    errorNoEntryFound:errorNoEntryFound
}