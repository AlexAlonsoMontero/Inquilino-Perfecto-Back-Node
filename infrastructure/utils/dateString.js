const dateString = (date) =>{
    return (`${date.getDate()}-${date.getMonth()+1}-${date.getFullYear(date)}`)
}

module.exports = {
    dateString
}