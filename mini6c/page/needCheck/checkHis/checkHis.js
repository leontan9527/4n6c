const config = require('../../../config')
var util = require("../../../util/dateutil.js");
const app = getApp()

Page({

  data: {
    kpiPage: [],
    actionPage: [],
    num: 0,
    theDate:'',
    theDateStr : ''
  },

  onLoad: function (options) {    
    this.getData(new Date())
  },
  getData(theDate){
    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId
    //console.info("theDate = " + theDate)

    if (sessionId) {

      wx.request({
        url: config.domain + '/check/checkHis',
        data: {
          theDate: theDate
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {          

          var kpiPage = result.data.data.kpiPage
          var actionPage = result.data.data.actionPage
          var title = result.data.data.yearMonth          

          var num = 0

          if (kpiPage && kpiPage.length > 0) {
            num = num + kpiPage.length
          }

          if (actionPage && actionPage.length > 0) {
            num = num + actionPage.length
          }
          
          self.setData({
            theDate:theDate,
            theDateStr: self.DateFormat(theDate),
            kpiPage: kpiPage,
            actionPage: actionPage,
            num: num,
            title: title
          })

        },

        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }
  },
  preMonth:function(){
    var theDate = this.data.theDate
    var year = theDate.getFullYear()
    var month = theDate.getMonth()

    theDate = new Date(year, month, 1)
    theDate.setMonth(theDate.getMonth() - 1);    

    this.getData(theDate)

  },
  nextMonth: function () {
    var theDate = this.data.theDate
    var year = theDate.getFullYear()
    var month = theDate.getMonth()

    theDate = new Date(year, month, 1)
    theDate.setMonth(theDate.getMonth() + 1);

    this.getData(theDate)
  },

  bindDateChange: function (e) {
   //console.log('【e.detail.value】', e.detail.value)
    var theDate = new Date(e.detail.value + "-01")
    //console.log('【e.detail.value 2】', theDate.toLocaleString()) 
    this.getData(theDate)
  },
  
  DateFormat(theDate){
    return theDate.getFullYear() + "年" + (theDate.getMonth() + 1) + "月"
  }

})
