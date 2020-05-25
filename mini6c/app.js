const config = require('./config')

App({
  
  globalData: {
    hasLogin: false
  },
  onLaunch(opts) {
    //console.info('App Launch', opts)     

    if (!wx.cloud) {
      //console.error('App 请使用 2.2.3 或以上的基础库以使用云能力')      
    } else {
      wx.cloud.init({
        env: config.envId,
        traceUser: true,
      })
    }
    
    //用户微信信息：头像，昵称
    var userInfo = wx.getStorageSync('userInfo')               
    if (userInfo){
      //console.info('App 1.应用加载：从本地读取用户信息：' + userInfo.nickName)
      this.globalData.userInfo  = userInfo 
    } else {
      //这里需要处理请求用户登陆的页面或者处理逻辑
      //pending...
      //wx.navigateTo({
        //url: '../wxBingding/wxBingding',
      //}) 
    }

    var cloudID = wx.getStorageSync('cloudID') 
    //console.info('App 2.本地存储的cloudID:' + cloudID)

    //用户微信和本小程序的openid
    this.globalData.openid = wx.getStorageSync('openid')
    //console.info('App 3.本地存储的openid:' + this.globalData.openid)

    //如果没有，需要获取openid
    if (!this.globalData.openid){
      // 调用云函数
      wx.cloud.callFunction({
        name: 'login',
        data: { weRunData: wx.cloud.CloudID(cloudID)},
        success: res => {
          //console.log('App 【3.1云函数】[login] 返回 openid: ', res.result.openid)
          //console.log('【云函数】[login] 返回 appid: ', res.result.appid)
          //console.log('【云函数】[login] 返回 unionid: ', res.result.unionid)
          //console.log('【云函数】[login] 返回 env: ', res.result.env)
          //console.log('【云函数】[login] 返回 event: ', res.result.event)

          wx.setStorageSync('openid', res.result.openid)

          this.globalData.openid = res.result.openid
          //console.log('App 【3.2设置全局变量】openid: ', this.globalData.openid)
           
          this.wxLogin()              

        },
        fail: err => {
          console.error('App [云函数] [login] 调用失败', err)          
        }
      })
    } else {
      this.wxLogin()
    }
    
  },
  wxLogin: function () {
    //使用openid登陆，获取后台session
    var sessionId = wx.getStorageSync('sessionId')
    /**
     * sessionId 有两种方法获取； 1. 本地存储中获取，2. 从全局变量中获取
     * Leon: 选择第1种方式的原因
     * 全局变量在小程序退出后就消失了，而后台Server中可能还没有销毁。
     * 而使用本地存储的方式，用户当关闭小程序后，可能又很快重新打开小程序，这个时候后台的Session还是有效的。
     */
    console.info('App 4.开始openid登陆,使用openid=' + this.globalData.openid)
    if (this.globalData.openid) {

      wx.request({
        url: config.domain + '/userController/wxLogin',
        data: {
          openid: this.globalData.openid
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          if (result.data.success){
            getApp().globalData.hasLogin = true
            //console.log('App 5.userController wxLogin=】登录成功')
            //console.log('App 5.【wxLogin cookies=】', result.data.data)
            //获取新的sessionId,并保存下来
            getApp().globalData.sessionId = result.data.data
            wx.setStorageSync('sessionId', result.data.data)
          } else {
            //console.log('App 5.userController wxLogin= 失败，没有绑定】')
            getApp().globalData.hasLogin = false
            getApp().globalData.sessionId = null

            //wx.navigateTo({ url: '../user/scan-code/scan-code' })

          }
        },

        fail({ errMsg }) {
          console.log('App 【 wxLogin fail】', errMsg)
          //this.globalData.sessionId = ''
        }
      })
      //登陆END
    }
  },
  onShow(opts) {
    //console.log('App Show', opts)
  },
  onHide() {
    //console.log('App Hide')
  }
  
})
