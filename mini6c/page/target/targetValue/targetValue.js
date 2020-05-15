const config = require('../../../config')
var util = require("../../../util/dateutil.js");
const app = getApp()

Page({

  data: {
    list: []  
  },

  onLoad: function (options) {
    var pid = options.pid
   
    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {
      //console.log('【targetCr/planTargetDetail=】', pid)
      wx.request({
        url: config.domain + '/targetCr/planTargetDetail',
        data: {
          pid: pid
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          //console.log('【targetCr/planTargetDetail=】', result.data.data.targets)
          
          var targets = result.data.data.targets 
          var title = result.data.data.title
          var score = result.data.data.score

          self.setData({
            list: targets,
            title: title,
            score: score            
          })

        },

        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }

  }

})
