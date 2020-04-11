const config = require('../../../config')
const app = getApp()

Page({

  onLoad: function () {

    //检查用户表时间撮，如果相同，从本地获取用户表    

    //获取最新用户数据
    const self = this
    var sessionId = app.globalData.sessionId
    
    if (sessionId) {
      wx.request({
        url: config.domain + '/userCr/findAllUser',
        data: {
          api: "findAllUser"
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          
          var users = result.data.data
          var us =[]
          for (let i = 0; i < users.length; i++){
            var item = { value: users[i].id, name: users[i].name }
            us.push(item)
          }

          console.log('【userCr/items=】', us)

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
    items: [
      { value: 'USA', name: '张三' },
      { value: 'CHN', name: '赵国明', checked: 'true' },
      { value: 'BRA', name: '王明月' },
      { value: 'JPN', name: '李哲凯' },
      { value: 'ENG', name: '张大明' },
      { value: 'FRA', name: '钱大妈' },
    ]
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
