const config = require('../../../config')
const app = getApp()

Page({
  
  onLoad: function(){   
    
    this.setData({     
        hasUserInfo: false,   
        planList: ''
    })

    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    console.info('1. onLoad 开始登陆,使用Cookie=')
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/createMonthPaln',
        data: {
          api: "list"
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          console.log('【plan/planList=】', result.data.data)
          self.setData({
            planList: result.data.data
          })
        },

        fail({ errMsg }) {
          console.log('【plan/planList fail】', errMsg)
        }
      })
    }

  },

  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)

    const items = this.data.planList
    for (let i = 0, len = items.length; i < len; ++i) {
   
      if(items[i].seq==e.detail.value){
        items[i].selected=true
      }else{
        items[i].selected=false
      }
    }
    this.setData({
      planList:items
    })
  },

  //创建月计划方法
  createMonth: function(year,seq){   
    
    var sessionId = app.globalData.sessionId;
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/createMonth',
        data : {
          year: year,
          seq: seq
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
            //创建成功自动返回上级页面
            console.log('创建成功:'+result.data.success)
            if(result.data.success==true){
              //创建成功，跳转到计划列表页面
              wx.switchTab({ url: '../plan/planlist/planlist'})
            }else{ 

            }
        },
        fail({ errMsg }) {
          //创建失败提示错误信息代码开始
        }
      })
    }
  },

  navigateBack() {
    wx.navigateBack()
  },

})
