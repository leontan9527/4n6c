const config = require('../../../config')
var util = require("../../../util/dateutil.js");


const app = getApp()

Page({

  onLoad: function (options) {

    this.setData({
      pid: options.id,
      array: ['待提交结果', '完成', '未完成'],
      index: 0,
      unCommit:0
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
            kpis[i].score=util.formatDouble(kpis[i].score)
            kpis[i].baseValue=util.formatDouble(kpis[i].baseValue)
            kpis[i].reasonableValue=util.formatDouble(kpis[i].reasonableValue)
            kpis[i].weight=util.formatDouble(kpis[i].weight)
            kpis[i].accumulateActualValue=util.formatDouble(kpis[i].accumulateActualValue)
            kpis[i].actualValue=util.formatDouble(kpis[i].actualValue)
            kpis[i].yearActualValueString=util.formatDouble(kpis[i].yearActualValueString)
            kpis[i].actualValueString=util.formatDouble(kpis[i].actualValueString)
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

  //输入实际值时，调用的方法       开始
  writeKpiValue(e) {

    var kpiId = e.currentTarget.dataset.kpiid
    var targetIndexId = e.currentTarget.dataset.targetindexid
    var weight = e.currentTarget.dataset.weight
    var isPerformanceCptRule = e.currentTarget.dataset.isperformancecptrule
    var value=e.detail.value
    console.log('targetIndexId:'+targetIndexId)

    const self = this
    var sessionId = app.globalData.sessionId

    wx.request({
      url: config.domain + '/planCr/isHasTargetRules',
      data : {
        id: targetIndexId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {
        //console.log('find:'+result.data.success+'  year:'+year+'seq:'+seq)
        if(result.data.success==true){

          var isTrueWeight=true;
          if(weight==undefined || weight==null){
            isTrueWeight=false;
            var errormsg='未录入权重，无法计算绩效分数，请找管理员设置指标权重!';
            wx.showModal({  
              title: '提示',  
              content: errormsg,  
              showCancel:false,
              confirmText:'关闭',
              success: function(res) {  
                  
              }  
            }) 
          }

          if(isTrueWeight){
            wx.request({
              url: config.domain + '/planCr/savekpiActualValue',
              data : {
                id:kpiId,
                isNoVote: false,
                isMonthRules: false,
                actualValue: value
              },
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Cookie': 'JSESSIONID=' + sessionId
              },
              success(result) {
                  //创建成功自动返回上级页面
                  if(result.data.success==true){
                    if(isPerformanceCptRule==false){

                      var scoreValue = result.data.data[0].toFixed(2);
                      var status = result.data[2];                               
                      //更新DATE								
                      var plan=self.data.plan;	 																	
                      for (let i = 0; i < plan.kpiDetails.length; i++ ){						
                          if (kpiId == plan.kpiDetails[i].id){	
                            plan.kpiDetails[i].actualValue = value;
                            plan.kpiDetails[i].score = scoreValue;
                            plan.kpiDetails[i].status = status;
                            break;
                          }  
                        }	

                        self.setData({
                          plan: plan
                        })
                    }
                      
                  }
              },
              fail({ errMsg }) {
                //创建失败提示错误信息代码开始
              }
            })
          }
        }else{
           //否则没有提交上周计划，则提示必须提交上周计划，才能创建该周计划
          var errormsg='未设置指标计算规则，无法计算绩效分数，请找管理员设置指标计算规则!';
          wx.showModal({  
            title: '提示',  
            content: errormsg,  
            showCancel:false,
            confirmText:'关闭',
            success: function(res) {  
                
            }  
          })   
        } 
      },
      fail({ errMsg }) {
        console.log('【plan/list fail】', errMsg)
      }
    })
  },

  //跳转到计算电网指标页面
  toPlanNoVoteValue: function (e) {

    var id = e.currentTarget.dataset.kpiid
    var kpiName = e.currentTarget.dataset.kpiname
    var targetIndexId = e.currentTarget.dataset.targetindexid

    wx.navigateTo({ url: '../planNoVoteValue/planNoVoteValue?id=' + id +'&kpiName='+kpiName+ '&targetIndexId='+targetIndexId+'&isMonthRules=false'})
  }

})
