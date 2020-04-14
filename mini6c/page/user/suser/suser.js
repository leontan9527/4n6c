const config = require('../../../config')
const app = getApp()

Page({

  onLoad: function () {

    //检查用户表时间撮，如果相同，从本地获取用户表 
    var lastModifyUserTime = wx.getStorageSync('GLB_LastModifyUserTime')

    if (!lastModifyUserTime){
      lastModifyUserTime = 0
    }

    //获取最新用户数据
    const self = this
    var sessionId = app.globalData.sessionId
    
    if (sessionId) {
      wx.request({
        url: config.domain + '/userCr/findAllUser',
        data: {
          lastModifyUserTime: lastModifyUserTime
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          var lasModifyUserTimeDB = result.data.obj
          var us =[]

          if (lasModifyUserTimeDB){
            //后台定义的规则：有值，说明有最新的时间戳，需要更细通讯录
            wx.setStorageSync('GLB_LastModifyUserTime', lasModifyUserTimeDB)
            var users = result.data.data
            for (let i = 0; i < users.length; i++){
              var item = { value: users[i].id, name: users[i].name }
              us.push(item)
            }
            //本地存储
            wx.setStorageSync('GLB_ORGUsers', us) 
            console.log('【从数据库中读取最新的userCr/items=】', us)

          } else {
            //获取本地存储的数据            
            us = wx.getStorageSync('GLB_ORGUsers')

            console.log('【从本地缓存中读取最新的userCr/items=】', us)

          }

          self.setData({
            items: us
          })
          
        },

        fail({ errMsg }) {
          console.log('【userCr/findAllUser fail】', errMsg)
        }
      })
    }

  },

  
  data: {
    items: []
  },

  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)

    const items = this.data.items
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = items[i].value === e.detail.value
    }

    this.setData({
      items
    })
  },
  selectOneUser: function (e) {
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name
    
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]
    prevPage.setData({
      userId: id,
      userName: name, 
      [`formData.userId`]: id
    })
    wx.navigateBack({
      delta: 1
    })
  },
})
