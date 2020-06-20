function timestampToTime(timestamp, withTime) {
  //added by wuhuawu 2020-04-20
  //如果传递过来的时间为null，则直接返回空，否则页面会默认显示1970-01-01号这种内置时间，这样是不对的
  if(timestamp==null){
    return ''
  }

  var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) ;//modify by wuhuawu 空格不能在这个地方加，否则传递参数是false时候，显示年月日的后面带有空格，页面解析回有问题
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());

  if (withTime==0){
    return Y + M + D+ ' ' + h + m  + ':'+ s;//modify by wuhuawu空格移动到这个地方加
  }else if(withTime==1) {
    return M + D+ ' ' + h + m  + ':' + s;//modify by wuhuawu空格移动到这个地方加
  }else if(withTime==2){
    return M + D+ ' ' + h + m ;//modify by wuhuawu空格移动到这个地方加
  }else {
    return Y + M + D;
  }
}

function formatNull(strValue) {
  if (strValue == null) {
    return ''
  }
  return strValue
}

/*
  对传递过来的double类型数据进行处理，如果传递过来是null，则返回''给前台页面
  如果传递过来的是多位小数点，则只保留2位小数点
*/
function formatDouble(numberValue,digit) {
  if (numberValue == null) {
    return ''
  }else{
    numberValue=numberValue.toFixed(digit)
    return numberValue
  }
}

module.exports = {
  timestampToTime: timestampToTime,
  formatNull:formatNull,
  formatDouble:formatDouble
};