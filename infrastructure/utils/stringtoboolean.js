const stringToBoolean = (objecitems)=>{
    
    const aux = Object.entries(objecitems).map(item=>{
        if(item[1]==="true" || item[1]==="1"){
            return [item[0],item[1]=true]
        }else if(item[1]==="false" || item[1]==="0"){
            return [item[0],item[1]=false]
        }
        else{
            return [item[0], item[1]]
        }
    })
    return Object.fromEntries(aux)
}

module.exports = {
    stringToBoolean
}