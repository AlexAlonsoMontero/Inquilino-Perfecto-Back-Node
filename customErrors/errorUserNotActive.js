class errorUserNotActive extends Error{
    constructor(message){
        super();
        this.name = "errorUserNotActive";
        this.type = "user";
        this.message = message ? message : "User was not activated";
    }
}

module.exports ={
    errorUserNotActive:errorUserNotActive
}