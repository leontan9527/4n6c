const app = getApp()
Page({
  onShareAppMessage() {
    return {
      title: '微信登录',
      path: 'page/API/pages/login/login'
    }
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },
  data: {},
  getUserInfo(info) {
    var userInfo = info.detail.userInfo
    if(userInfo) {  
      //console.info('获取cloudID:' + info.detail.cloudID)
      //1.存用户信息到本地存储
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('cloudID', info.detail.cloudID)
      //2.存用户信息到全局变量
      app.globalData.userInfo = userInfo
      //console.info('获取用户授权，重新获取用户信息END')
      
      wx.redirectTo({ url: '../../user/scan-code/scan-code' })     

    }
    
  }
})
