const config = require('../../config')
const app = getApp()

Page({

  onLoad: function () {

    this.setData({
      hasUserInfo: false,
      icon_year: 'pic/icon_2.png',
      icon_month: 'pic/icon_1.png',
      icon_week: 'pic/icon_0.png',
      icon_add: '../images/add.png'
    })

    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    console.info('1. onLoad 开始登陆,使用Cookie=')
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/unReadProcess',
        data: {
          api: "unReadProcess"
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          console.log('【plan/unReadProcess=】', result.data.data)
          self.setData({
            planList: result.data.data
          })
        },

        fail({ errMsg }) {
          console.log('【plan/unReadProcess fail】', errMsg)
        }
      })
    }

  },
  
  toPlanDetail:function(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '../planDetail/planDetail?id=' + id })
  }
})
