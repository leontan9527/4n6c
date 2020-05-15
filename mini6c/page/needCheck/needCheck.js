const config = require('../../config')
var util = require("../../util/dateutil.js");
const app = getApp()

Page({

  data: {
    kpiPage: [],
    actionPage:[],
    num:0
  },

  onLoad: function (options) {
    
    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {
      
      wx.request({
        url: config.domain + '/check/wxNeedCheck',
        data: {          
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          //console.log('【targetCr/planTargetDetail=】', result.data.data.kpiPage)

          var kpiPage = result.data.data.kpiPage          
          var actionPage = result.data.data.actionPage

          var title = "当前待检查项"
          var num = 0

          if (kpiPage && kpiPage.length > 0) {
            num = num + kpiPage.length
          }

          if (actionPage && actionPage.length > 0) {
            num = num + actionPage.length
          }

          self.setData({
            kpiPage: kpiPage,
            actionPage: actionPage,
            num: num,
            title:title + " ( " + num + " )"
          })

        },

        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }

  },

  checkKpi: function (e) {
    var kpiId = e.currentTarget.dataset.id

    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {

      wx.request({
        url: config.domain + '/check/checkKpi',
        data: {
          id: kpiId
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {         
          var kpiPage = self.data.kpiPage
          var num = self.data.num - 1

          for (var i = 0; i < kpiPage.length; i++) {
            if (kpiPage[i].id == kpiId) {
              kpiPage[i].checkStatus = 1
              break
            }
          }

          var title = "当前待检查项"
          self.setData({
            kpiPage: kpiPage,
            num : num,
            title: title + " ( " + num + " )"
          })

        },

        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }

  },

  checkAction: function (e) {
    var actionId = e.currentTarget.dataset.id

    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {

      wx.request({
        url: config.domain + '/check/checkAction',
        data: {
          id: actionId
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          var actionPage = self.data.actionPage
          var num = self.data.num - 1

          for (var i = 0; i < actionPage.length; i++) {
            if (actionPage[i].id == actionId) {
              actionPage[i].checkStatus = 1
              break
            }
          }

          var title = "当前待检查项"
          self.setData({
            actionPage: actionPage,
            num: num,
            title: title + " ( " + num + " )"
          })

        },

        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }

  },

  checkAll: function () {    

    const self = this    
    var kpiPage = self.data.kpiPage
    var actionPage = self.data.actionPage


    let kpiIds = [];
    for (let i = 0; i < kpiPage.length; i++) {
      if (kpiPage[i].checkStatus != 1) {
        kpiIds.push(kpiPage[i].id);        
      }
    }
    let skpiIds = kpiIds.join(',');

    let actionIds = [];
    for (let i = 0; i < actionPage.length; i++) {
      if (actionPage[i].checkStatus != 1) {
        actionIds.push(actionPage[i].id);        
      }
    }
    let sactionIds = actionIds.join(',');

    if (kpiIds.length == 0 && actionIds.length == 0) {
      wx.showToast({
        title: '检查项已检查过',
        icon: 'success',
        mask: true,
        duration: 2000
      })      
      return
    } else {
      wx.showModal({
        title: '提示',
        content: "确认所有工作结果吗？",
        cancelText: '我再想想',
        confirmText: '确认继续',
        success: function (res) {
          if (res.confirm) { 
            var sessionId = app.globalData.sessionId
            if (sessionId) {

              wx.request({
                url: config.domain + '/check/checkAll',
                data: {
                  kpiIds: skpiIds, 
                  actionIds: sactionIds
                },
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                  'Cookie': 'JSESSIONID=' + sessionId
                },
                success(result) {
                  if (result.data.success) {
                    var num = 0
                    var title = "当前待检查项"

                    for (let i = 0; i < kpiPage.length; i++) {
                      if (kpiPage[i].checkStatus != 1) {                
                        kpiPage[i].checkStatus = 1;
                      }
                    }
                    
                    for (let i = 0; i < actionPage.length; i++) {
                      if (actionPage[i].checkStatus != 1) {                
                        actionPage[i].checkStatus = 1;
                      }
                    }


                    self.setData({
                      kpiPage: kpiPage,
                      actionPage: actionPage,
                      num: num,
                      title: title + " ( " + num + " )"
                    })

                    wx.showToast({
                      title: '检查完成',
                      icon: 'success',
                      mask: false,
                      duration: 1000
                    })

                  } else {
                    wx.showToast({
                      title: '检查失败',
                      icon: 'failed',
                      image: '../../image/failed.png',
                      mask: true,
                      duration: 2000
                    })
                  }          

                },

                fail({ errMsg }) {
                  console.log('【plan/detailMonth fail】', errMsg)
                }
              })
            }

          } else if (res.cancel) {
            return
          }
        }
      }) 
    }


  },
  goHis: function () {    
    wx.navigateTo({
      url: 'checkHis/checkHis'
    });
  }
  

})
