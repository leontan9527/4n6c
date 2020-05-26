const config = require('../../../config')
const app = getApp()

Page({

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({     
      meetingId:options.meetingId,
      showWriteMask: false,
      replayStatus:3,
      userId:''
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
            var label_attend=result.data.label_attend

            self.setData({
              header: header,
              attend:attend,
              not_attend:not_attend,
              ccUser:ccUser,
              agendas:agendas,
              label_attend:label_attend,
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

  radioChange(e) {
    var replayStatus=e.detail.value
    this.setData({
      replayStatus:replayStatus
    })
  },

  //隐藏模态对话框
  hideModal: function() {
    this.setData({
      showWriteMask: false
    });
  },

  //对话框取消按钮点击事件
  onCancel: function() {
    this.hideModal()
  },
  //发送计划进程消息代码                    结束
  
  //显示发送文字消息   开始
  showWriteDialog:function(e){
    if(this.data.showWriteMask){
      this.setData({
        showWriteMask:false,
        replayStatus:3
      })
    }else{
      this.setData({
          showWriteMask:true,
          replayStatus:3
      })
    }
  },

  //修改会议回执状态
  replyStatusFun:function(e){

    var that = this;
    var sessionId = app.globalData.sessionId

    console.log('replayStatus=='+that.data.replayStatus)
    if(that.data.replayStatus == 3){
      that.hideModal()
      wx.navigateTo({ 
        url: '../../user/suser/suser?type=1&refrenceCode=3&refrenceId='+that.data.meetingId
      })
    }else{
      wx.request({
        url: config.domain + '/meetingCr/replayMeeting',
        data : {
          meetingId: that.data.meetingId,
          replayStatus:that.data.replayStatus,
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
  
            if(result.data.success){
              that.hideModal()
              var attend=result.data.attend
              var not_attend=result.data.not_attend
              var label_attend=result.data.label_attend
              that.setData({
                attend:attend,
                not_attend:not_attend,
                label_attend:label_attend
            })
            }else{ 
              //创建失败，提示错误信息
            }
        },
        fail({ errMsg }) {
          //创建失败提示错误信息代码开始
        }
      })

    }   
     
  },

})