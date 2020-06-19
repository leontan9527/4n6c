const config = require('../../../config')
var util = require("../../../util/dateutil.js")
const app = getApp()

Page({

  onLoad: function (options) {
    
    var resultRemark=options.resultRemark
    if(resultRemark=='null' || resultRemark==undefined){
      resultRemark=''
    }
    var placeholderName
    var refrenceName
    var refrenceType=options.refrenceType
    if(refrenceType==3){
      placeholderName='请填写退回原因!'
      refrenceName='计划名称:'+options.refrenceName
    }else if(refrenceType==0 || refrenceType==1 || refrenceType==2){
      placeholderName='请填写结果说明'
      refrenceName='计划项:'+options.refrenceName
    }

    this.setData({
      refrenceType:refrenceType,
      refrenceId: options.refrenceId,
      refrenceName:refrenceName,
      refrenceStatus:options.refrenceStatus,
      resultRemark:resultRemark,
      placeholderName:placeholderName,
    })
  },
  
  //添加结果说明
  writeResultFun:function(e){

    var that = this;

    var url
    var content
    if(that.data.refrenceType==3){
      url='/planCr/commitWeekPlan'
      content='必须填写退回原因!'
    }else if(that.data.refrenceType==0 || that.data.refrenceType==1 || that.data.refrenceType==2){
      url='/planCr/saveActionResultRemark'
      content='必须填写结果说明才能提交!'
    }

    var resultRemark=that.data.resultRemark
    if(resultRemark=='' || resultRemark==undefined){

      wx.showModal({  
        title: '提示',  
        content: content,  
        showCancel:false,
        confirmText:'关闭',
        success: function(res) {  
            
        }  
      }) 
      return false;
    }
    var sessionId = app.globalData.sessionId
    wx.request({
      url: config.domain + url,
      data : {
        id: that.data.refrenceId,
        resultRemark:that.data.resultRemark,
        status:that.data.refrenceStatus
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {

          if(result.data.success){
            that.toPlanPrevPage(that.data.refrenceType,that.data.refrenceId,that.data.resultRemark)
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
  toPlanPrevPage: function(refrenceType,refrenceId,resultRemark) {
    //更新DATE								
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]
    var plan = prevPage.data.plan
    if(refrenceType==0 || refrenceType==1 || refrenceType==2){
      for (let i = 0; i < plan.actionDetails.length; i++ ){						
        if (refrenceId == plan.actionDetails[i].id){	
          plan.actionDetails[i].resultRemark = resultRemark
          break;
        }  
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