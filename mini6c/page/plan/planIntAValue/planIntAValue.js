const config = require('../../../config')
const app = getApp()

Page({
  
  onLoad: function(options){   
    
    console.info('kpiName==='+options.kpiName)
    this.setData({     
        id: options.id,  
        kpiName: options.kpiName, 
        targetIndexId: options.targetIndexId, 
        unit: options.unit, 
        reasonableValue: options.reasonableValue, 
        weight: options.weight,
        toType:options.toType,//0:从计划页面跳转过来，1从检查页面跳转过来
    })

    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    console.info('1. onLoad 开始登陆,使用Cookie=')
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/getIntValue',
        data: {
          id: self.data.id
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          var planKpiDetail = result.data.data
          console.log('【plan/planList=】', planKpiDetail)
          self.setData({
            planKpiDetail: planKpiDetail,
            storeCode:planKpiDetail.storeCode
          })
        },

        fail({ errMsg }) {
          console.log('【plan/planList fail】', errMsg)
        }
      })
    }

  },

  radioChange(e) {

    console.log("storeCode="+e.detail.value);
    var storeCode=e.detail.value
    this.setData({
      storeCode:storeCode
    })
  },


  //输入实际值时，调用的方法       开始
  computeINTAValue(e) {

    const self = this

    var kpiId= self.data.id
    var targetIndexId= self.data.targetIndexId
    var unit= self.data.unit
    var reasonableValue= self.data.reasonableValue
    var weight=self.data.weight

    var storeCode=self.data.storeCode
    var storeValue1 = e.detail.value.storevalue1
    var storeValue2 = e.detail.value.storevalue2
    var actualValue

    if(storeCode=='unfinishBuckleScore'){
                          
      if(storeValue1=='' || storeValue2==''){

        var errormsg='请确保未完成项次数和总项数都已填写完毕!';
        wx.showModal({  
          title: '提示',  
          content: errormsg,  
          showCancel:false,
          confirmText:'关闭',
          success: function(res) {  
              
          }  
        }) 

        return;
      }
      if(unit=='%'){
        
      actualValue=100*(storeValue2-storeValue1)/storeValue2;
      }else{
        
        actualValue=storeValue2-storeValue1;
      }
    }else if(storeCode=='unexpandedScore'){
      
      actualValue=0;
      storeValue1=''
      storeValue2=''
    }else if(storeCode=='finishMultiple'){
      
      actualValue=reasonableValue;
      storeValue1=''
      storeValue2=''
    }

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

          var toUrl
          if(self.data.toType==0){
            toUrl=config.domain + '/planCr/savekpiActualValue'
          }else{
            toUrl=config.domain + '/check/checkKpiActualValue'
          }

          if(isTrueWeight){
            wx.request({
              url: toUrl,
              data : {
                id:kpiId,
                isNoVote: false,
                isMonthRules: true,
                storeCode: storeCode,
                storeValue1: storeValue1,
                storeValue2: storeValue2,
                actualValue:actualValue
              },
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Cookie': 'JSESSIONID=' + sessionId
              },
              success(result) {
                  //填写成功自动返回上级页面
                  if(result.data.success==true){                       
                    //toType  0:从计划页面跳转过来，1从检查页面跳转过来
                    if(self.data.toType==0){
                      var scoreValue = result.data.data[0].toFixed(2);
                      var status = result.data.data[2];     
                      self.toPlanPrevPage(kpiId,actualValue,storeCode,storeValue1,storeValue2,scoreValue,status)
                    }else{
                      self.toCheckPrevPage(kpiId,actualValue,storeCode,storeValue1,storeValue2,scoreValue)
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
 
  //从计划页点击INTA类指标进来的返回到计划页面
  toPlanPrevPage: function(kpiId,actualValue,storeCode,storeValue1,storeValue2,scoreValue,status) {
    //更新DATE								
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]
    var plan = prevPage.data.plan
    let unCommit = prevPage.data.unCommit
    for (let i = 0; i < plan.kpiDetails.length; i++ ){						
        if (kpiId == plan.kpiDetails[i].id){							
          unCommit --;
          plan.kpiDetails[i].actualValue = actualValue
          plan.kpiDetails[i].storeCode=storeCode
          plan.kpiDetails[i].storeValue1=storeValue1
          plan.kpiDetails[i].storeValue2=storeValue2
          plan.kpiDetails[i].score = scoreValue
          plan.kpiDetails[i].status = status
          break;
        }  
    }	 
    
    prevPage.setData({
        plan:plan,
        unCommit:unCommit
    })
    wx.navigateBack({
        delta: 1
    })
  },

  //从检查页点击安全指标进来的返回到计划页面
  toCheckPrevPage: function(kpiId,actualValue,storeCode,storeValue1,storeValue2,scoreValue,status) {
    //更新DATE								
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]
    var kpiPage=prevPage.data.kpiPage;	 		

    for (let i = 0; i < kpiPage.length; i++ ){
        if (kpiId == kpiPage[i].id){	

          kpiPage[i].actualValue = actualValue
          kpiPage[i].storeCode = storeCode
          kpiPage[i].storeValue1 = storeValue1
          kpiPage[i].storeValue2 = storeValue2
          kpiPage[i].score = scoreValue
          kpiPage[i].checkStatus = 1;
          break;
        }  
    }	 
    
    prevPage.setData({
       kpiPage:kpiPage,
    })
    wx.navigateBack({
        delta: 1
    })
  },

  navigateBack() {
    wx.navigateBack()
  },

})
