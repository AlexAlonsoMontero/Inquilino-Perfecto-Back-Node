class errorSendMail extends Error{
    
    constructor(message){
        super();
        this.name = "noSendMail"
        this.type = "mail"
        this.message = message ? message : 'el mensaje no fue enviado'
    }
}

module.exports = {
    errorSendMail:errorSendMail
}