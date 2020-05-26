const config = require('../../../config')
const app = getApp()

Page({

  onLoad: function (options) {
    /*
      有些页面需要在选择用户的时候执行操作后台服务器的操作，因此在调用人员选择
      器的页面传递参数给人员选择器页面,通过参数类型判断是否与后台服务器进行交付
    */
    this.setData({     
      type:options.type,
      refrenceId: options.refrenceId,
      refrenceCode:options.refrenceCode
    })

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
    
    //如果是会议回执调用人员选取器，则需要调用会议回执后台接口
    if(this.data.type==1){
      this.replyStatusFun(id,name)
    }else{
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2]
      prevPage.setData({
        userId: id,
        userName: name, 
        [`formData.userId`]: id,
        [`formData.inspectorName`]: name
      })
      wx.navigateBack({
        delta: 1
      })
    }
  
  },

  //修改会议回执状态
  replyStatusFun:function(userId,name){

    var that = this;
    var sessionId = app.globalData.sessionId
    
    wx.request({
      url: config.domain + '/meetingCr/replayMeeting',
      data : {
        meetingId: that.data.refrenceId,
        replayStatus:that.data.refrenceCode,
        assignUserId:userId,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {
          if(result.data.success){
            var not_attend=result.data.not_attend
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2]
            prevPage.setData({
              not_attend:not_attend,
            })
            wx.navigateBack({
              delta: 1
            })
          }else{ 
            //创建失败，提示错误信息
          }
      },
      fail({ errMsg }) {
        //创建失败提示错误信息代码开始
      }
    })
     
  },

})
