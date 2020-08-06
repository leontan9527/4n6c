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
      serarchName:"",
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
    var currentUserId = app.globalData.bindingUserId
    
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
            //console.log('【从数据库中读取最新的userCr/items=】', us)
          } else {
            //获取本地存储的数据            
            us = wx.getStorageSync('GLB_ORGUsers')
            //console.log('【从本地缓存中读取最新的userCr/items=】', us)
          }

          //将最新常用的置顶
          var lastUseUser = wx.getStorageSync('GLB_LastUseUser_' + currentUserId)
          if (!lastUseUser) {
            lastUseUser = []
          }
                               
          //最多置顶5个
          var max = 5    

          if (lastUseUser.length > max){            
            lastUseUser = lastUseUser.slice(0, max);
          }

          //console.info(lastUseUser)
          //console.info("+++++++++++++++++++++")
          //lastUseUser = lastUseUser.concat(us)  
          //console.info(lastUseUser)


          //置顶结束

          self.setData({
            items: us,
            lastUse: lastUseUser
          })
          
        },

        fail({ errMsg }) {
          console.log('【userCr/findAllUser fail】', errMsg)
        }
      })
    }

  }, 
  getBlurInputValue: function (e) {

    var value = e.detail.value    
    this.setData({
      serarchName: value
    })
  },
  searchUser: function () {    
    //获取查询最新用户数据
    const self = this
    var sessionId = app.globalData.sessionId
    var queryStr = self.data.serarchName

    if (sessionId) {
      wx.request({
        url: config.domain + '/userCr/findUserByName',
        data: {
          queryStr: queryStr
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          
          var us = []
          
          var users = result.data.data
          for (let i = 0; i < users.length; i++) {
            var item = { value: users[i].id, name: users[i].name }
            us.push(item)
          }      

          self.setData({
            items: us,
            lastUse: []
          })

        },

        fail({ errMsg }) {
          console.log('【userCr/findUserByName fail】', errMsg)
        }
      })
    }
  },

  
  data: {
    items: [],
    lastUse:[]
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
    var currentUserId = app.globalData.bindingUserId

    //记录用户常用的用户==============================================    
    var compare = function (obj1, obj2) {
      var val1 = obj1.times;
      var val2 = obj2.times;
      if (val1 > val2) {
        return -1;
      } else if (val1 < val2) {
        return 1;
      } else {
        return 0;
      }
    }
        
    var lastUseUser = wx.getStorageSync('GLB_LastUseUser_' + currentUserId)
    //wx.removeStorageSync('GLB_LastUseUser_' + currentUserId)
    if (!lastUseUser){
      lastUseUser = []
    }

    var findIndex = -1   
    for (let i = 0; i < lastUseUser.length; i++) {
      if (id == lastUseUser[i].value){
        findIndex = i
        break          
      }        
    }

    var dateNow = new Date()
    var ltime = dateNow.getTime()  

    if (findIndex >= 0) {
      lastUseUser[findIndex].times = ltime
    } else {
      var item = { value: id, name: name, times: ltime }
      lastUseUser.push(item)
    } 
    //对数字进行排序，供下次打开使用：  
    //本地存储
    wx.setStorageSync('GLB_LastUseUser_' + currentUserId, lastUseUser.sort(compare))   
    //console.info(lastUseUser)  
    //记录完成=======================================================
    
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
            var label_attend=result.data.label_attend
            var attend=result.data.attend
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2]
            prevPage.setData({
              attend:attend,
              not_attend:not_attend,
              label_attend:label_attend
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
