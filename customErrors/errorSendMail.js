class errorSendMail extends Error{
    
    constructor(){
        super();
        this.name = "noSendMail"
        this.type = "mail"
        this.message ="No mail was sent"
    }
}

module.exports = {
    errorSendMail:errorSendMail
}