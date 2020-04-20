const config = require('../../../config')
const app = getApp()

Page({
  
  onLoad: function(){   
    
    this.setData({     
        planList: '',
        hasUserInfo: false,   
        icon_year: 'pic/icon_2.png',
        icon_month: 'pic/icon_1.png',
        icon_week: 'pic/icon_0.png',      
        icon_add: '../../images/add.png'
    })

    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    console.info('1. onLoad 开始登陆,使用Cookie=')
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/list',
        data: {
          api: "list"
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
  
          if(result.data.success){
  
            self.setData({
              planList: result.data.data
            })
          }
        },
  
        fail({ errMsg }) {
          console.log('【plan/list fail】', errMsg)
        }
      })
    }

  },
  onShow() { 
    console.info('2. onShow')     
    wx.reportAnalytics('enter_home_programmatically', {})

    //每次点击计划tar时候都会请求一次后台
    const self = this
    var sessionId = app.globalData.sessionId
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/list',
        data: {
          api: "list"
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
  
          if(result.data.success){
  
            self.setData({
              planList: result.data.data
            })
          }
        },
  
        fail({ errMsg }) {
          console.log('【plan/list fail】', errMsg)
        }
      })
    }
    
  },


  onShareAppMessage() {
    console.info('3. onShareAppMessage')     
    return {
      title: '我的计划',
      path: 'page/home/home'
    }
  },
  actionSheetTap:function(e){
   
    console.log('创建成功:'+ e.currentTarget.dataset.name);
    if(e.currentTarget.dataset.name=='创建周计划'){
      wx.navigateTo({ url: '../planCrWeek/planCrWeek'})
    }else if(e.currentTarget.dataset.name=='创建月计划'){
      wx.navigateTo({ url: '../planCrMonth/planCrMonth'})
    }else{
      wx.navigateTo({ url: '../planCrYear/planCrYear'})
    }  
  },
  getUserInfo(info) {
    const userInfo = info.detail.userInfo
    this.setData({
      userInfo,
      hasUserInfo: true
    })
  },
  clear() {
    this.setData({
      hasUserInfo: false,
      userInfo: {}
    })
  },
  data: {
    list: [
      {
          id: '1',
          name: '我的计划',
          open: false,
          pages: ['创建周计划', '创建月计划', '创建年度计划']
      }
    ]
  },

  kindToggle(e) {
    const id = e.currentTarget.id
    const list = this.data.list
    for (let i = 0, len = list.length; i < len; ++i) {
      
      if (list[i].id === id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list
    })
    wx.reportAnalytics('click_view_programmatically', {})
  },

  toPlanDetail: function (e) {

    var id = e.currentTarget.dataset.id
    var planCycle = e.currentTarget.dataset.plancycle
    var status = e.currentTarget.dataset.status
    if(status>0){
      wx.navigateTo({ url: '../planDetail/planDetail?id=' + id })
    }else{
      if(planCycle==0){
        wx.navigateTo({ url: '../planDetailWeek/planDetailWeek?id=' + id })
      }else if(planCycle==1){
        wx.navigateTo({ url: '../planDetailMonth/planDetailMonth?id=' + id })
      }else{
        wx.navigateTo({ url: '../planDetailYear/planDetailYear?id=' + id })
      }
    }
    
  }
})
