const config = require('../../../config')
var util = require("../../../util/dateutil.js")
const app = getApp()

Page({

  onLoad: function (options) {

    var resultRemark=options.resultRemark

    if(resultRemark=='null' || resultRemark==undefined){
      resultRemark=''
    }
    this.setData({
      actionDetailId: options.actionDetailId,
      resultRemark:resultRemark,
      actionName:options.actionName
    })

  },
  
  //添加结果说明
  writeResultFun:function(e){

    var that = this;
    var resultRemark=that.data.resultRemark
    if(resultRemark=='' || resultRemark==undefined){

      wx.showModal({  
        title: '提示',  
        content: '必须填写结果说明才能提交!',  
        showCancel:false,
        confirmText:'关闭',
        success: function(res) {  
            
        }  
      }) 
      return false;
    }
    var sessionId = app.globalData.sessionId
    wx.request({
      url: config.domain + '/planCr/saveActionResultRemark',
      data : {
        id: that.data.actionDetailId,
        resultRemark:that.data.resultRemark,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {

          if(result.data.success){
            that.toPlanPrevPage(that.data.actionDetailId,that.data.resultRemark)
          }else{ 
            //创建失败，提示错误信息
          }
      },
      fail({ errMsg }) {
        //创建失败提示错误信息代码开始
      }
    })
    
  },

  //从计划页点击安全指标进来的返回到计划页面
  toPlanPrevPage: function(actionDetailId,resultRemark) {
    //更新DATE								
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]
    var plan = prevPage.data.plan
    for (let i = 0; i < plan.actionDetails.length; i++ ){						
        if (actionDetailId == plan.actionDetails[i].id){	
          plan.actionDetails[i].resultRemark = resultRemark
          break;
        }  
    }	 
    
    prevPage.setData({
        plan:plan,
    })
    wx.navigateBack({
        delta: 1
    })
  },

  getBlurResultValue: function(e) {
    
    var value = e.detail.value
    this.setData({
      resultRemark:value
    })
  },

})