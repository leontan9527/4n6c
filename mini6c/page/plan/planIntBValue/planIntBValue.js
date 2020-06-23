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
            storeCode:planKpiDetail.storeCode,
            isOneUnitBuckleScore:planKpiDetail.isOneUnitBuckleScore
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
  computeINTBValue(e) {

    const self = this

    var kpiId= self.data.id
    var targetIndexId= self.data.targetIndexId
    var unit= self.data.unit
    var reasonableValue= self.data.reasonableValue

    var isOneUnitBuckleScore=self.data.isOneUnitBuckleScore
    if(isOneUnitBuckleScore=='' || isOneUnitBuckleScore==undefined){
      isOneUnitBuckleScore=false
    }
    var storeCode=self.data.storeCode
    var storeValue1 = e.detail.value.storevalue1
    var storeValue2
    var actualValue

    if(storeCode=='finishAddBuckleScore'){
                          
      if(storeValue1==''){
        //如果用户选择未完成，并且指标库中勾选了 “以一个单位扣分”，则必须校验填写 未完成项数
        var errormsg='必须填未完成项数!';
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
      
      actualValue=storeValue1;
      if(storeValue1<reasonableValue){
        storeValue2=reasonableValue-storeValue1;
      }else{
        storeValue2=0;
      }
    }else if(storeCode=='unPlanScore'){
      
      actualValue=0;
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

          var toUrl
          if(self.data.toType==0){
            toUrl=config.domain + '/planCr/savekpiActualValue'
          }else{
            toUrl=config.domain + '/check/checkKpiActualValue'
          }

          wx.request({
            url: toUrl,
            data : {
              id:kpiId,
              isNoVote: false,
              isMonthRules: true,
              storeCode: storeCode,
              storeValue1: storeValue1,
              storeValue2: storeValue2,
              actualValue:actualValue,
              isOneUnitBuckleScore:isOneUnitBuckleScore
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
                    self.toPlanPrevPage(kpiId,actualValue,storeCode,storeValue1,storeValue2,scoreValue,status,isOneUnitBuckleScore)
                  }else{
                    self.toCheckPrevPage(kpiId,actualValue,storeCode,storeValue1,storeValue2,scoreValue,isOneUnitBuckleScore)
                  }                        
                  
                }
            },
            fail({ errMsg }) {
              //创建失败提示错误信息代码开始
            }
          })
        }
      },
      fail({ errMsg }) {
        console.log('【plan/list fail】', errMsg)
      }
    })
  }, 
 
  //从计划页点击安全指标进来的返回到计划页面
  toPlanPrevPage: function(kpiId,actualValue,storeCode,storeValue1,storeValue2,scoreValue,status,isOneUnitBuckleScore) {
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
          plan.kpiDetails[i].isOneUnitBuckleScore = isOneUnitBuckleScore
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

  //从计划页点击安全指标进来的返回到计划页面
  toCheckPrevPage: function(kpiId,actualValue,storeCode,storeValue1,storeValue2,scoreValue,isOneUnitBuckleScore) {
    //更新DATE								
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]
    var kpiPage=prevPage.data.kpiPage;	 		
    for (let i = 0; i < kpiPage.length; i++ ){
        if (kpiId == kpiPage[i].id){	
          kpiPage[i].actualValue = actualValue
          kpiPage[i].storeCode=storeCode
          kpiPage[i].storeValue1=storeValue1
          kpiPage[i].storeValue2=storeValue2
          kpiPage[i].score = scoreValue
          kpiPage[i].isOneUnitBuckleScore = isOneUnitBuckleScore
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
