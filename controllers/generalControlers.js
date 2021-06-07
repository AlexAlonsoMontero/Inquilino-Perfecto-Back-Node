const validateAuthorization = async(request,response) =>{
    try{
        const { authorization } = request.headers
        console.log(authorization)  
        console.log("entro")
        

    }catch(error){

    }
}

module.exports = {
    validateAuthorization
}