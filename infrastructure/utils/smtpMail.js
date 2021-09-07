const nodemailer = require ('nodemailer')
const { FRONT_HOST, FRONT_PORT, SMTP_PORT, SMTP_HOST, SMTP_USER, SMTP_PASS,SMTP_FROM } = process.env

//NOTE SI DB_HOST =/= backend_host SE QUEDA BACKEND

const transporter = nodemailer.createTransport({ port:SMTP_PORT,host:SMTP_HOST, auth:{ user: SMTP_USER, pass: SMTP_PASS },secure:false })

const sendRegistrationMail = async(userName, userMail, verificationCode) =>{
    const activationLink = `http://${FRONT_HOST}:${FRONT_PORT}/activation?activated_code=${verificationCode}`
    const mailData ={ from:SMTP_FROM, to:userMail,cc:"lxalonso@gmail.com", subject:"Mail verificación usuario",
    html:`<p>Hola ${userName} para activar tu cuenta pulsa aquí</p>
        <a href="${activationLink}"><button>Verificar</button></a>` 
    }
    const data = await transporter.sendMail(mailData)
    return data
}

const sendConfirmUserActivation = async(userName, userMail) => {
    const mailData ={ from:SMTP_FROM, to:userMail,cc:"lxalonso@gmail.com", subject:"Mail activaciion usuario",
    html:`<p>Hola ${userName} tu cuenta ha sido activada </p>` 
    }
    const data = await transporter.sendMail(mailData)
    return data
}

//RESERVAS
//MAILS CASERO
const sendStarReservationCasero = async(userName, userMail)=>{
    const mailData ={from:SMTP_FROM, to:userMail,cc:'lxalonso@gmail.com' , subject: "Nueva solicitud de reserva",
        html:`<p>Hola ${userName} tienes una nueva sollicitud de reserva consulta que perfil de inquilino perfecto </p>
        <a href="http://127.0.0.1:3000"><button>Visitar Web</button></a>`
    }
    const data = await transporter.sendMail(mailData)
    return data
}


//MAILS INQUILINO
const sendStarReservationInquilino = async(userName, userMail)=>{
    const mailData ={from:SMTP_FROM, to:userMail,cc:'lxalonso@gmail.com', subject: "Nueva solicitud de reserva",
        html:`<p>Hola ${userName} has ralizado una nueva sollicitud de reserva consulta que perfil de inquilino perfecto </p>
        <a href="http://127.0.0.1:3000"><button>Visitar web</button></a>`
    }
    const data = await transporter.sendMail(mailData)
    return data
}



module.exports = {
    sendConfirmUserActivation,
    sendRegistrationMail,
    sendStarReservationCasero,
    sendStarReservationInquilino
}