const config = require('../../../config')

const app = getApp()
Page({
  onShareAppMessage() {
    return {
      title: '数据请求测试',
      path: 'page/user/clipboard-data/clipboard-data'
    }
  },

  data: {
    value: 'edit and copy me',
    pasted: '',
  },

  valueChanged(e) {
    this.setData({
      value: e.detail.value
    })
  },

  copy() {
    wx.setClipboardData({
      data: this.data.value,
      success() {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 1000
        })
      }
    })
  },

  paste() {
    const self = this
    wx.getClipboardData({
      success(res) {
        self.setData({
          pasted: res.data
        })
        wx.showToast({
          title: '粘贴成功',
          icon: 'success',
          duration: 1000
        })
      }
    })
  },
  askServer(){
    const self = this
    //使用openid登陆，获取后台session
    //var sessionId = wx.getStorageSync('sessionId')
    var sessionId = app.globalData.sessionId

    /**
     * sessionId 有两种方法获取； 1. 本地存储中获取，2. 从全局变量中获取
     * Leon: 选择第1种方式的原因
     * 全局变量在小程序退出后就消失了，而后台Server中可能还没有销毁。
     * 而使用本地存储的方式，用户当关闭小程序后，可能又很快重新打开小程序，这个时候后台的Session还是有效的。
     */
    console.info('1.开始登陆,使用Cookie=' + sessionId)
    if (sessionId) {
      wx.request({
        url: config.wxTestUrl,
        data: {
          openid: "wxTestData"
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          console.log('【wxTestData=】', result.data.data)   
          self.setData({
            pasted: result.data.obj.deptName + "(" + result.data.data+")"
          })      
        },

        fail({ errMsg }) {
          console.log('【wxLogin fail】', errMsg)
          //this.globalData.sessionId = ''
        }
      })
      //登陆END
    }

  },
  getPhoneNumber: function (e) {
    var sessionId = app.globalData.sessionId
    
    console.log(e.detail.errMsg);
    console.log(e.detail.errMsg == "getPhoneNumber:ok");
    
      wx.request({
        url: config.domain +'/userCr/decodePhone',
        data: {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          sessionKey: sessionId,
          uid: "",
        },
        method: "post",
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success: function (res) {
          console.log(res);
        }
      })
    
  }
  
})
