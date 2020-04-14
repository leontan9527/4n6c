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
    scResult:false
  },

   scanCode() {
      const that = this
      wx.scanCode({
      success(res) {
         if(res.result){
            that.setData({
              qa: res.result               
            })  
            console.log('【1.scanCode success】', res.result)            
            that.gotoMark()
         } 
      },
      fail() {
         console.log('【1x.scanCode fail】')
         that.setData({
            qa: '',
            scResult: false
         })
      }
    })
   },

   gotoMark:function() {
    
     console.log('【2.gotoMark】' + app.globalData.openid)
     const self = this

     self.setData({
          loading: true
     })

      console.log('【3.begin wx.request')


      wx.request({
        url: config.domain +'/userController/wxBinding',
         data: {
          openid: app.globalData.openid,
          qa: this.data.qa            
         },
         method: 'POST',
         header: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
         success(result) {
              
          //使用openid登陆，获取后台session
          wx.request({
            url: config.domain +'/userController/wxLogin',
            data: {
              openid: getApp().globalData.openid
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            success(result) {
              console.log('【wxLogin cookies=】', result.data.data)
              //获取新的sessionId,并保存下来
              getApp().globalData.sessionId = result.data.data
              wx.setStorageSync('sessionId', result.data.data)
              
              wx.setStorageSync('GLB_ORGUsers', null) 
              wx.setStorageSync('GLB_LastModifyUserTime', null)

            },

            fail({ errMsg }) {
              console.log('【wxLogin fail】', errMsg)
              //this.globalData.sessionId = ''
            }
          })
          //登陆END
          

          wx.showToast({
              title: '绑定成功',
              icon: 'success',
              mask: true,
              duration:2000
          })
          self.setData({
              loading: false,
              scResult: true
          })
          console.log('【request success】', result.data.msg)    
                  
         },

         fail({ errMsg }) {
            console.log('【request fail】', errMsg)
            self.setData({
               loading: false,
               scResult: false
            })
         }
      })

      console.log('【4.End wx.request')

   },

   returnPage(){
      wx.reLaunch({
         url: '/page/home/home'
      })
   }
})
