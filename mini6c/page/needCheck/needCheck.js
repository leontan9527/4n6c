const config = require('../../config')
var util = require("../../util/dateutil.js");
const app = getApp()

Page({

  data: {
    kpiPage: [],
    actionPage:[]
  },

  onLoad: function (options) {
    
    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {
      
      wx.request({
        url: config.domain + '/check/wxNeedCheck',
        data: {          
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          console.log('【targetCr/planTargetDetail=】', result.data.data.kpiPage)

          var kpiPage = result.data.data.kpiPage          
          var actionPage = result.data.data.actionPage

          var title = "当前待检查项"
          var num = 0

          if (kpiPage && kpiPage.length > 0) {
            num = num + kpiPage.length
          }

          if (actionPage && actionPage.length > 0) {
            num = num + actionPage.length
          }

          self.setData({
            kpiPage: kpiPage,
            actionPage: actionPage,
            title:title + " ( " + num + " )"
          })

        },

        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }

  }

})