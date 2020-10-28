const config = require('../../config')
var util = require("../../util/dateutil.js");
const app = getApp()

Page({

  data: {
    kpiPage: [],
    actionPage:[],
    num:0,
    array: ['完成', '未完成'],
    checkItemstatus:0,
    currentTab:0
  },

  onLoad: function (options) {
    
    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId
   /**
    * 获取当前设备的宽高
   */
    wx.getSystemInfo( {
          success: function( res ) {
            self.setData( {
                  winWidth: res.windowWidth,
                  winHeight: res.windowHeight
              });
          }
    });

    if (sessionId) {   
      self.getCheckPlanData(sessionId,0)
    }

  },

  //  tab切换逻辑
  swichNav: function( e ) {

    var that = this;
    var sessionId = app.globalData.sessionId
    if( this.data.currentTab != e.target.dataset.current ) {

        that.setData( {
            currentTab: e.target.dataset.current
        })
        this.getCheckPlanData(sessionId,this.data.currentTab)
    }
  },

  bindChange: function( e ) {
      var that = this;
      that.setData( { currentTab: e.detail.current });
  },

  getCheckPlanData: function (sessionId,planCycle) {

    const self = this
    wx.request({
      url: config.domain + '/check/wxNeedCheck',
      data: {   
        planCycle:planCycle       
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
        var checkNum=0;
        if (kpiPage && kpiPage.length > 0) {
          num = num + kpiPage.length
          for(var i=0;i<kpiPage.length;i++){
            if(kpiPage[i].planStatus==1){
              checkNum++
            }
          }
        }
        
        if (actionPage && actionPage.length > 0) {
          num = num + actionPage.length
          for(var i=0;i<actionPage.length;i++){
            if(actionPage[i].planStatus==1){
              checkNum++
            }
          }
        }

        self.setData({
          kpiPage: kpiPage,
          actionPage: actionPage,
          num: num,
          checkNum: checkNum,
          title:'总项数:' + num +'  待检测项数:' + checkNum
        })

      },

      fail({ errMsg }) {
        console.log('【plan/detailMonth fail】', errMsg)
      }
    })
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
          var checkNum = self.data.checkNum - 1
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
            checkNum: checkNum,
            title:'总项数:' + num+'  待检测项数:' + checkNum
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
          var checkNum = self.data.checkNum - 1

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
            checkNum: checkNum,
            title:'总项数:' + num +'  待检测项数:' + checkNum
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

    let kpiIds = []
    let skpiIds=''
    if (kpiPage && kpiPage.length > 0) {

      for (let i = 0; i < kpiPage.length; i++) {
        if (kpiPage[i].checkStatus != 1 && kpiPage[i].planStatus==1) {
          kpiIds.push(kpiPage[i].id);        
        }
      }
      skpiIds = kpiIds.join(',');
    }

    let actionIds = []
    let sactionIds=''
    if (actionPage && actionPage.length > 0) {

      for (let i = 0; i < actionPage.length; i++) {
        if (actionPage[i].checkStatus != 1 && actionPage[i].planStatus==1) {
          actionIds.push(actionPage[i].id);        
        }
      }
      sactionIds = actionIds.join(',');
    }

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

                    if (kpiPage && kpiPage.length > 0) {
                      for (let i = 0; i < kpiPage.length; i++) {
                        if (kpiPage[i].checkStatus != 1) {                
                          kpiPage[i].checkStatus = 1;
                        }
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
    console.log('options.planCycle======'+this.data.currentTab) 
    wx.navigateTo({
      url: 'checkHis/checkHis?planCycle='+this.data.currentTab
    });
  },

  //跳转到计算IntA("完成率项次扣分类",6) 页面
  toPlanIntAValue: function (e) {

    var id = e.currentTarget.dataset.kpiid
    var kpiName = e.currentTarget.dataset.kpiname
    var targetIndexId = e.currentTarget.dataset.targetindexid
    var unit = e.currentTarget.dataset.unit
    var reasonableValue = e.currentTarget.dataset.reasonablevalue
    var weight = e.currentTarget.dataset.weight

    wx.navigateTo({ url: '../plan/planIntAValue/planIntAValue?id=' + id +'&kpiName='+kpiName+ '&targetIndexId='+targetIndexId+'&unit='+unit+'&reasonableValue='+reasonableValue+'&weight='+weight+'&toType=1'}) 
  },

   //跳转到计算IntB("直接加减分(月度无权重)类",7) 页面
  toPlanIntBValue: function (e) {

    var id = e.currentTarget.dataset.kpiid
    var kpiName = e.currentTarget.dataset.kpiname
    var targetIndexId = e.currentTarget.dataset.targetindexid
    var unit = e.currentTarget.dataset.unit
    var reasonableValue = e.currentTarget.dataset.reasonablevalue

    wx.navigateTo({ url: '../plan/planIntBValue/planIntBValue?id=' + id +'&kpiName='+kpiName+ '&targetIndexId='+targetIndexId+'&unit='+unit+'&reasonableValue='+reasonableValue+'&toType=1'})
  },

  //跳转到计算电网指标页面
  toPlanNoVoteValue: function (e) {

    var id = e.currentTarget.dataset.kpiid
    var kpiName = e.currentTarget.dataset.kpiname
    var targetIndexId = e.currentTarget.dataset.targetindexid
    var planCycle = e.currentTarget.dataset.plancycle
    var isMonthRules
    if(planCycle==1){
      isMonthRules=true;
    }else{
      isMonthRules=false;
    }
    console.log('targetIndexId=='+targetIndexId+'    kpiName==='+kpiName)

    wx.navigateTo({ url: '../plan/planNoVoteValue/planNoVoteValue?id=' + id +'&kpiName='+kpiName+ '&targetIndexId='+targetIndexId+'&isMonthRules='+isMonthRules+'&toType=1'})
  },
  
  getBlurInputValue: function(e) {
    
    var value = e.detail.value
    this.setData({
      actualVal:value
    })
  },

  //显示检查实际值消息对话框   开始
  checkKpiValueDialog:function(e){

    var kpiId = e.currentTarget.dataset.kpiid
    var kpiName = e.currentTarget.dataset.kpiname
    var userActualValue=e.currentTarget.dataset.useractualvalue
    var planCycle = e.currentTarget.dataset.plancycle
    var isMonthRules;//ture 表示使用月度绩效考核规则，false年度绩效考核规则
    if(planCycle==1){
      isMonthRules=true;
    }else{
      isMonthRules=false;
    }
    this.setData({
      kpiId:kpiId,
      isMonthRules:isMonthRules,
      kpiName:kpiName,
      userActualValue:userActualValue
    })
    if(this.data.showWriteMask){
      this.setData({
        showWriteMask:false,
      })
    }else{
      this.setData({
        showWriteMask:true,
      })
    }
  },

  //输入实际值时，调用的方法       开始
  checkKpiValue(e) {

    const self = this
    var sessionId = app.globalData.sessionId

    var kpiId = self.data.kpiId
    var isMonthRules = self.data.isMonthRules
    var actualVal=self.data.actualVal

    wx.request({
      url: config.domain + '/check/checkKpiActualValue',
      data : {
        id:kpiId,
        isNoVote: false,
        isMonthRules: isMonthRules,
        actualValue: actualVal
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {

          self.hideModal()
          //if(result.data.success==true){
                                        
            //更新DATE								
            var kpiPage=self.data.kpiPage;	 																	
            for (let i = 0; i < kpiPage.length; i++ ){						
                if (kpiId == kpiPage[i].id){	
                  kpiPage[i].actualValue = actualVal;
                  kpiPage[i].checkStatus = 1;
                  break;
                }  
            }	
            self.setData({
              kpiPage: kpiPage
            })
          //}
      },
      fail({ errMsg }) {
        //创建失败提示错误信息代码开始
      }
    })
  },

  //隐藏模态对话框
  hideModal: function() {
    this.setData({
      showWriteMask: false,
      showCheckMask: false,
      kpiId:'',
      planCycle:'',
      kpiName:'',
    });
  },

  //对话框取消按钮点击事件
  onCancel: function() {
    this.hideModal()
  },

  //显示检查实际值消息对话框   开始
  checkActionDialog:function(e){

    var actionid = e.currentTarget.dataset.actionid
    var actionName = e.currentTarget.dataset.action

    this.setData({
      actionDetailId:actionid,
      actionName:actionName,
    })
    if(this.data.showCheckMask){
      this.setData({
        showCheckMask:false,
      })
    }else{
      this.setData({
        showCheckMask:true,
      })
    }
  },

  bindPickerChange(e) {

    const self = this
    var sessionId = app.globalData.sessionId

    var actionDetailId = e.currentTarget.dataset.actionid
    var actionName = e.currentTarget.dataset.action
    var checkItemstatus=e.detail.value
    var checkItemStatusName
    if(checkItemstatus==0){
      checkItemstatus=1
      checkItemStatusName='完成'
    }else{
      checkItemstatus=9
      checkItemStatusName='未完成'
    }

    wx.request({
      url: config.domain + '/check/checkActionStatus',
      data : {
        id:actionDetailId,
        status:checkItemstatus
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {

          self.hideModal()
          //if(result.data.success==true){
                                        
            //更新DATE								
            var actionPage=self.data.actionPage;	 																	
            for (let i = 0; i < actionPage.length; i++ ){						
                if (actionDetailId == actionPage[i].id){	
                  actionPage[i].checkStatus = 1;
                  actionPage[i].status = checkItemstatus;
                  actionPage[i].statusName = checkItemStatusName;   
                  break;
                }  
            }	
            self.setData({
              actionPage: actionPage
            })
      },
      fail({ errMsg }) {
        //创建失败提示错误信息代码开始
      }
    })
  },

})
