const config = require('../../../config')
const app = getApp()
Page({
  onLoad: function () {
  },

  onShareAppMessage() {
    return {
      title: '用户认证',
      path: 'page/user/scan-code/scan-code'
    }
  },

  data: {
    qa: '',
    scResult: false
  },

  phonelogin(e) {
    //console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var userNo = e.detail.value.userNo
    var password = e.detail.value.password
    
    if (userNo.length != 11){
      wx.showToast({
        title: '请输入11位手机号码',
        icon: 'none',
        mask: true,
        duration: 1000
      })

      return false;
    }

    if (password.length == 0) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none',
        mask: true,
        duration: 1000
      })

      return false;
    }



    const self = this

    self.setData({
      loading: true
    })
  
    wx.request({
      url: config.domain + '/userController/wxBindingPhone',
      data: {
        openid: app.globalData.openid,
        userNo: userNo,
        password: password
      },
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      success(result) {
        if(result.data.success){
          //使用openid登陆，获取后台session
          wx.request({
            url: config.domain + '/userController/wxLogin',
            data: {
              openid: getApp().globalData.openid
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            success(result) {
              //获取新的sessionId,并保存下来
              getApp().globalData.sessionId = result.data.data
              wx.setStorageSync('sessionId', result.data.data)
              getApp().globalData.bindingUser = result.data.obj

              //绑定成功，默认登录了，不需要用户再重新登录，改善用户体验
              getApp().globalData.hasLogin = true
              
            },

            fail({ errMsg }) {
              console.log('【wxLogin fail】', errMsg)            
            }
          })
          //登陆END
        } else {
          wx.showToast({
            title: '账户或密码错误',
            icon: 'none',
            mask: true,
            duration: 1000
          })
          return false;
        }


        wx.showToast({
          title: '绑定成功',
          icon: 'success',
          mask: true,
          duration: 1000
        })

        wx.reLaunch({
          url: '/page/home/home'
        })

        self.setData({
          loading: false,
          scResult: true
        })
        //console.log('【request success】', result.data.msg)    

      },

      fail({ errMsg }) {
        console.log('【request fail】', errMsg)
        self.setData({
          loading: false,
          scResult: false
        })
      }
    })

    //console.log('【4.End wx.request')

  },

  returnPage() {
    wx.redirectTo({ url: '../../user/scan-code/scan-code' })     
  }
})
