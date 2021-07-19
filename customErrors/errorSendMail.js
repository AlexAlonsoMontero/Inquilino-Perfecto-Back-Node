class errorSendMail extends Error{
    
    constructor(){
        super();
        this.name = "noSendMail"
        this.type = "mail"
        this.message ="No send mail."
    }
}

module.exports = {
    errorSendMail:errorSendMail
}