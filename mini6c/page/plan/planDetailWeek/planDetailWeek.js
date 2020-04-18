const config = require('../../../config')
var util = require("../../../util/dateutil.js");


const app = getApp()

Page({

  onLoad: function (options) {
    console.info("打开：" + options.id);
    //console.log(util.formatDateTime(this.data.clientDate, true))

    this.setData({
      pid: options.id,
      array: ['待提交结果', '完成', '未完成'],
      index: 0,
    })

    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    //console.info('1. onLoad this.pid' + this.data.pid)
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/detailWeek',
        data: {
          id: this.data.pid
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          //console.log('【plan/detailMonth=】', result.data.data)
          var plan=result.data.data
          let unCommit = 0
          let actions = plan.actionDetails	
          let actionsLength = actions.length;

					for (let i = 0; i < actions.length; i++ ){						
						if ( actions[i].status == 0){	
							unCommit ++
            }  
            if ( actions[i].status == 9){	
							actions[i].status=2
						} 
          }	
          
          self.setData({
            plan: plan,
            unCommit:unCommit,
            actionsLength:actionsLength
          })

          //console.log('【temp=】', util.timestampToTime(temp,false))
          var title = result.data.data.title

          wx.setNavigationBarTitle({
            title: title,
            success() {              
            },
            fail(err) {              
            }
          })
        },

        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }

  },

  bindPickerChange(e) {

    var planId = e.currentTarget.dataset.planid
    var detailId = e.currentTarget.dataset.actailid
    var value=e.detail.value
    var status=value
    if(value==2){
      status=9;
    }
    const self = this
    var sessionId = app.globalData.sessionId
    wx.request({
      url: config.domain + '/planCr/saveActionStatus',
      data : {
        id: detailId,
        status: status
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {
          if(result.data.success==true){
           
            var plan=self.data.plan;
            for (let i = 0; i < plan.actionDetails.length; i++ ){						
              if ( plan.actionDetails[i].id == detailId){	
                plan.actionDetails[i].status=value
              } 
            }	
        
            self.setData({
              plan: plan
            })
          }else{ 

          }
      },
      fail({ errMsg }) {
        //创建失败提示错误信息代码开始
      }
    })

  },

  addAction: function (e) {
    var id = e.currentTarget.dataset.id
    console.log('【planAddAction/planAddAction】id=', id)
    wx.navigateTo({ url: '../planAddAction/planAddAction?id=' + id})
  },

  editAction: function (e) {
    var isEditPlan=e.currentTarget.dataset.iseditplan
    console.log('planEditAction/planEditAction】isEditPlan=', isEditPlan)
    if(isEditPlan==true){
      var planId = e.currentTarget.dataset.planid
      var detailId = e.currentTarget.dataset.actailid
      wx.navigateTo({ url: '../planEditAction/planEditAction?planId=' + planId +'&detailId='+detailId})
    }
  },

  commitPlan:function(e){  
    const items = this.data.planList

    const self = this
    var planId = e.currentTarget.dataset.planid
    var status = e.currentTarget.dataset.status
    var layerMsg="确认要提交计划吗?";
    if(status==1){
      layerMsg="确认要提交结果吗?";
    }
		
    wx.showModal({  
      title: '提示',  
      content: layerMsg,  
      cancelText:'取消',
      confirmText:'确认',
      success: function(res) {  
            if (res.confirm) {  
              //用户点击确认按钮执行创建周计划代码
              console.log('点击确认按钮后，准备调用：checkOrCreatePlanWeek方法')
              self.commitWeekPlan(planId,status);
              
            } else if (res.cancel) { 
              //用户点击取消按钮执行如下代码
            }  
        }  
    }) 

  } , 

  //提交周计划方法
  commitWeekPlan: function(planId,status){   
    
    const self = this
    var sessionId = app.globalData.sessionId
    wx.request({
      url: config.domain + '/planCr/commitWeekPlan',
      data : {
        id: planId,
        status: status
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

            var plan=self.data.plan
            plan.status=status;
        
            self.setData({
              plan: plan
            })
          }else{ 

          }
      },
      fail({ errMsg }) {
        //创建失败提示错误信息代码开始
      }
    })
  },

})
