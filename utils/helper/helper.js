exports.calculatePercentage = (start, last) => {
    if(last === 0){
        let p = start*100
        return  Number(p.toFixed(0))
    }
    const percent = ((start - last) / last) * 100
    return Number(percent.toFixed(0))
}

exports.picChartPercentage = (count, total) => {
    const percent = ((count/total) * 100)
    return Number(percent.toFixed(0))
}