class errorInvalidField extends Error {
    /**
     * 
     * @param {string} where in which part of the code is the error
     * @param {string} why guess why
     * @param {string} what1 element that could detonate the error
     * @param {string} what2 value of 'what1
     */
    constructor(where, why, what1, what2) {
        super();
        this.what_1 = what1
        this.what_2 = what2
        this.name = "errorInvalidField";
        this.type = "joi";
        this.message = `Not data valid in '${where}' where '${what1}' is '${what2}', because '${why}'`;
        this.messageEsp = `Datos inválidos en '${where}' donde '${what1}' es '${what2}', porque '${why}'`;
    }
}

module.exports = {
    errorInvalidField:errorInvalidField
}