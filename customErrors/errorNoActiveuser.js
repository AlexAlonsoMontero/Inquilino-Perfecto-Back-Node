class errorNoActiveUser extends Error{
    constructor(){
        super();
        this.name = "errorNoActivateUser";
        this.type = "user";
        this.message = "No activate user"
    }
}

module.exports ={
    errorNoActiveUser:errorNoActiveUser
}