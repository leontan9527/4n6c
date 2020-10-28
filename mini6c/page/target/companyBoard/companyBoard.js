const config = require('../../../config')
const app = getApp()

Page({
  onLoad: function () {    

    var hasLogin = app.globalData.hasLogin
    var userInfo = app.globalData.userInfo
    var bindingUser = getApp().globalData.bindingUser
    this.setData({
      hasLogin,
      bindingUser
    })

    if (userInfo) {
      //console.info('1. Home page 从全局变量中读取用户信息：' + userInfo.nickName)
      this.setData({
        userInfo
      })
    }
    this.getNewHomeData()

  },

  onShow: function () {
    this.getNewHomeData()
  },

  getNewHomeData: function () {
   
    const self = this
    var sessionId = getApp().globalData.sessionId          

    //获取绩效看板
    wx.request({
      url: config.domain + '/home/board',
      data: {
        api: "board"
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {          
        self.setData({
          targetList: result.data.targetList,
          targetYear: result.data.targetYear,
          targetMonth: result.data.targetMonth
        })
      },
      fail({ errMsg }) {
        console.log('4.【home/board fail】', errMsg)
      }
    }) //绩效看板
  },

  onShareAppMessage() {
    return {
      title: '绩效引擎',
      path: 'page/home/home'
    }
  },
 
  // 下拉刷新
  onPullDownRefresh: function (event) {
    let that = this;
    //获取最新消息数据
    this.getNewHomeData()
    //获取首页数据结束
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
  },
 
  toCompanyBoard() {
    wx.navigateTo({ url: '../target/companyBoard/companyBoard' })
  },

  open: function (e) {    
    var pid = e.currentTarget.dataset.pid

    //console.info("数据ID=" + pid)    
    wx.navigateTo({
      url: '../targetBar/targetBar?type=2' + '&pid=' + pid
    });
   
  }

})
