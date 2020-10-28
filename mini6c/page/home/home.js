var base64 = require("../images/base64");
const config = require('../../config')

const app = getApp()
Page({
  
  onLoad: function(){   
    this.setData({  
      icon_meeting: 'resources/pic/meeting.png',
      icon_ggao: 'resources/pic/ggao.png',
      image_hd: 'resources/pic/lng.jpg', 
      icon_check: '../images/check.png',
      icon_msg: '../images/msg.png',
      icon_pro: '../images/process.png',
      icon_acheck: '../images/acheck.png',
      icon_excute: '../images/excute.png',
      icon_foucs: '../images/foucs.png',
      icon_dashboard: '../images/dashboard.png'
    });

    var hasLogin = app.globalData.hasLogin
    var userInfo = app.globalData.userInfo
    var bindingUser = getApp().globalData.bindingUser
    this.setData({     
      hasLogin,
      bindingUser
    })
          
    if (userInfo){
      //console.info('1. Home page 从全局变量中读取用户信息：' + userInfo.nickName)
      this.setData({
        userInfo   
      })
    }
    this.getNewHomeData()

  },

  onShow: function(){ 
    this.getNewHomeData()
  },

  getNewHomeData: function () {
    
    //获取最新消息数据
    this.waitLogin().then((res) => {
      
      const self = this    
      var sessionId = getApp().globalData.sessionId
      var hasLogin = getApp().globalData.hasLogin
      var bindingUser = getApp().globalData.bindingUser

      if (hasLogin && sessionId) {
        this.setData({
          hasLogin,
          bindingUser
        })
        //console.info('2. Home page 开始请求数据,使用sessionId=' + sessionId)
        wx.request({
          url: config.domain + '/home/message',
          data: {
            api: "message"
          },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Cookie': 'JSESSIONID=' + sessionId
          },
          success(result) {
            //console.log('3.【home/message=】', result.data.data)
            self.setData({
              excuteDp: result.data.excuteDp,
              checkDb: result.data.checkDb,
              foucsDb: result.data.foucsDb,
              planDb: result.data.planDb, 
              meetingDb: result.data.meetingDb,
              docDb: result.data.docDb,
              adviserDb: result.data.adviserDb,
              systemType: result.data.systemType,
              companyBoardMsg: result.data.companyBoardMsg
            })
          },

          fail({ errMsg }) {
            console.log('3.【home/message fail】', errMsg)          
          }
        })        
              
      }

    }, (error) => {
      console.log('登录超时：' + error)
    })
    //获取首页数据结束
  },

  onShareAppMessage() {
    return {
      title: '6C绩效',
      path: 'page/home/home'
    }
  },

  waitLogin: function () {

    let promise = new Promise((resolve, reject) => {
      var timeout = 0;
      let timer = setInterval(() => {
        if (getApp().globalData.hasLogin) {
          console.info("已经登录了，不需要等待，请立即请求数据")
          clearInterval(timer);
          resolve(getApp().globalData.sessionId);
        } else {
          //todo 信息构建中， 可以添加累计等待多长时间结束
          if (timeout > 14) {
            clearInterval(timer);
          } else {
            timeout ++
            console.info("正在等待登录...,等待时间" + timeout + "秒")
          }
        }
      }, 1000);
    });

    return promise;
  },

  // 下拉刷新
  onPullDownRefresh: function(event) {
    let that = this;    
    //获取最新消息数据
    this.getNewHomeData()
    //获取首页数据结束
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
  },
  
  toExcuteprocess() {
    wx.navigateTo({ url: '../excuteProcess/excuteProcess' })
  },

  toPlanprocess() {
    wx.navigateTo({ url: '../plan/planprocess/planprocess' })
  },

  toAdviserMessage() {
    wx.navigateTo({ url: '../adviser/adviserList/adviserList' })
  },

  toDocument() {
    wx.navigateTo({ url: '../document/documentList/documentList' })
  },
  toMeeting() {
    wx.navigateTo({ url: '../meeting/meetingList/meetingList' })
  },
  toNeedCheck() {
    wx.navigateTo({ url: '../needCheck/needCheck' })
  },
  toPlanFoucs() {
    wx.navigateTo({ url: '../plan/planFoucs/planFoucs' })
  },

  toScan() {
    if (this.data.userInfo){
      wx.navigateTo({ url: '../user/scan-code/scan-code' })
    } else {
      wx.navigateTo({ url: '../user/login/login' })
    }
  },
  toCompanyBoard(){
    wx.navigateTo({ url: '../target/companyBoard/companyBoard' })
  }
  
})
