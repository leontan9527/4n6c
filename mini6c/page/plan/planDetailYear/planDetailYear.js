const config = require('../../../config')
var util = require("../../../util/dateutil.js");


const app = getApp()

Page({

  onLoad: function (options) {

    this.setData({
      pid: options.id,
      array: ['待提交结果', '完成', '未完成'],
      index: 0
    })

    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    //console.info('1. onLoad this.pid' + this.data.pid)
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/detailYear',
        data: {
          id: this.data.pid
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          var plan=result.data.data
          let unCommit = 0
          let kpis = plan.kpiDetails;
          let actions = plan.actionDetails	
          let actionsLength = actions.length;

          //kpi未添加结果的条数
          for (let i = 0; i < kpis.length; i++ ){	
						if (kpis[i].isNoVote == true){
							if(typeof(kpis[i].actualValueString) == 'undefined' || !kpis[i].actualValueString ){						
								unCommit ++;
							} 
						} else {
							if(kpis[i].actualValue==null ){							
								unCommit ++;
							}  							
						}
          }
          
          //行动计划为添加结果的条数
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
  addAction: function (e) {
    var id = e.currentTarget.dataset.id
    console.log('【planAddAction/planAddAction】id=', id)
    wx.navigateTo({ url: '../planAddAction/planAddAction?id=' + id })
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
            let unCommit = 0

            //kpi未添加结果的条数
            for (let i = 0; i < plan.kpiDetails.length; i++ ){	
              if (plan.kpiDetails[i].isNoVote == true){
                if(typeof(plan.kpiDetails[i].actualValueString) == 'undefined' || !plan.kpiDetails[i].actualValueString ){						
                  unCommit ++;
                } 
              } else {
                if(plan.kpiDetails[i].actualValue==null ){							
                  unCommit ++;
                }  							
              }
            }

            for (let i = 0; i < plan.actionDetails.length; i++ ){
              
              if ( plan.actionDetails[i].id == detailId){	
                plan.actionDetails[i].status=value
              } 
              if (plan.actionDetails[i].status == 0){	
                unCommit ++
              } 
            }	
        
            self.setData({
              plan: plan,
              unCommit:unCommit
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
