const config = require('../../config')

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this    
      var sessionId = getApp().globalData.sessionId

      console.info('2. Home page 开始请求数据,使用sessionId=' + sessionId)
      if (sessionId) {
        wx.request({
          url: config.domain + '/targetCr/getExcuteProcress',
          data: {
          },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Cookie': 'JSESSIONID=' + sessionId
          },
          success(result) {
            self.setData({
              targetMonthExcute: result.data.targetMonthExcute, 
              targetMinExcuteRadioDept: result.data.targetMinExcuteRadioDept,
              targetMAXExcuteRadioDept: result.data.targetMAXExcuteRadioDept,
              monthExcuteBulletinBoard: result.data.monthExcuteBulletinBoard,
              monthMinExcuteRadioDept: result.data.monthMinExcuteRadioDept,
              monthMaxExcuteRadioDept: result.data.monthMaxExcuteRadioDept,
              weekExcuteBulletinBoard: result.data.weekExcuteBulletinBoard,
              weekMinExcuteRadioDept: result.data.weekMinExcuteRadioDept,
              weekMaxExcuteRadioDept: result.data.weekMaxExcuteRadioDept,
            })
          },

          fail({ errMsg }) {
            console.log('3.【home/message fail】', errMsg)          
          }
        })      
      }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

})