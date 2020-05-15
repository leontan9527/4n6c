const config = require('../../../config')
const app = getApp()

Page({

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({     
      meetingId:options.meetingId
    })

    //获取最新消息数据
    this.meetingDetail()
  },

  meetingDetail: function (e) {

    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {
      wx.request({
        url: config.domain + '/meetingCr/meetingDetail',
        data: {
          meetingId:self.data.meetingId
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
  
          if(result.data.success){
            
            var header=result.data.header
            var attend=result.data.attend
            var not_attend=result.data.not_attend
            var ccUser=result.data.ccUser
            var agendas=result.data.agendas

            self.setData({
              header: header,
              attend:attend,
              not_attend:not_attend,
              ccUser:ccUser,
              agendas:agendas,
            })
            
          }
        },
  
        fail({ errMsg }) {
          console.log('【meetingDetail/meetingDetail fail】', errMsg)
        }
      })
    }
  },

  toMeetingMinutes: function (e) {
    
    var meetingId = e.currentTarget.dataset.meetingid
    wx.navigateTo({ url: '../meetingMinutes/meetingMinutes?meetingId='+ this.data.meetingId })
  },

})