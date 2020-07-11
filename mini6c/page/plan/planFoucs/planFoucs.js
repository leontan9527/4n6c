const config = require('../../../config')
var util = require("../../../util/dateutil.js");
const app = getApp()

Page({
  onLoad: function (options) {
    this.setData({
      planId: options.id,
      showFouceMask: false,
    })

    //获取最新消息数据
    this.getMyFoucsPlanData()
  },
  
  getMyFoucsPlanData: function () {
    
    const self = this
    var sessionId = app.globalData.sessionId
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/findFoucsMyPlan',
        data: {
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          var planActionList=result.data.planActionList
          self.setData({
            planActionList: planActionList,
          })
        },
        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }
  },

  //跳转到发送消息对话框页面
  writeProcessMessage: function(e){
    wx.navigateTo({ url: '../../common/writeProcessMessage/writeProcessMessage?refrenceId=' + this.data.planId +'&toType=3'}) 
  },
  toPlanDetail: function(e){
    var planId = e.currentTarget.dataset.planid
    var planCycle = e.currentTarget.dataset.plancycle
    wx.navigateTo({ url: '../planDetailShow/planDetailShow?id=' + planId + '&planCycle='+planCycle })
  },
  deletePlanFouce: function(e) {

    var isDeleteAll = e.currentTarget.dataset.all
    const self = this
    var sessionId = app.globalData.sessionId
    var deleteUrl='/planCr/planDeleteFoucs'
    if(isDeleteAll=='true'){
      deleteUrl='/planCr/planDeleteAllFoucs'
    }
    wx.showModal({  
      title: '提示',  
      content: '确认要删除吗?',  
      cancelText:'取消',
      confirmText:'确定',
      success: function(res) {  
            if (res.confirm) {  
              if (sessionId) {
                wx.request({
                  url: config.domain + deleteUrl,
                  data: {
                    detailId: self.data.foucsActionId
                  },
                  method: 'POST',
                  header: {
                    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'Cookie': 'JSESSIONID=' + sessionId
                  },
                  success(result) {
                    wx.showModal({  
                      title: '提示',  
                      content: '删除成功',  
                      showCancel:false,
                      confirmText:'关闭',
                      success: function(res) { 
                        wx.switchTab({ url: '../../home/home'}) 
                      }  
                    })
                  },
                  fail({ errMsg }) {
                    console.log('【plan/detailMonth fail】', errMsg)
                  }
                })
              }
            } else if (res.cancel) { 
              //用户点击取消按钮执行如下代码
            }  
        }  
    }) 
  },
  closeFouce: function(e) {
    this.setData({
      showFouceMask:false,
    })
  },
  showAddFoucs: function(e) {
    var self=this
    var foucsActionId = e.currentTarget.dataset.actionid
    var foucsAction = e.currentTarget.dataset.action
    var planId = e.currentTarget.dataset.planid
    var planCycle = e.currentTarget.dataset.plancycle
    var showTop //通过下面方法得到长按行动计划的位置，弹出的添加关注界面，就显示在该位置
    var query = wx.createSelectorQuery()
    query.select('#action'+foucsActionId).boundingClientRect(function (res) {
      //console.log(res);
      self.setData({
        showFouceMask:true,
        foucsActionId: foucsActionId,
        foucsAction:foucsAction,
        planId:planId,
        planCycle:planCycle,
        showTop:res.top
      })
    }).exec();
  },
})
