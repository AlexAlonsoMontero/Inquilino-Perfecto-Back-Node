class errorNoAuthorization extends Error {
    /**
     * 
     * @param {*} who 
     * @param {*} whoRol 
     * @param {*} where in which part of the code is the error
     * @param {string} why guess why
     */
    constructor( who, whoRol ,where, why) {
        super();
        this.name = "errorNoAuthorization";
        this.type = "permision";
        this.message = `Not permission for ${who} with rol ${whoRol} in '${where}' because '${why}'`;
    }
}

module.exports = {
    errorNoAuthorization:errorNoAuthorization
}