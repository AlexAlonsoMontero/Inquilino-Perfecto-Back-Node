const validateAuthorization = async(request,response) =>{
    try{
        const { authorization } = request.headers
        console.log(authorization)
        

    }catch(error){

    }
}

module.exports = {
    validateAuthorization
}