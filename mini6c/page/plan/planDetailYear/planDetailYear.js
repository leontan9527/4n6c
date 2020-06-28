const config = require('../../../config')
var util = require("../../../util/dateutil.js");
var tempFilePath
const myaudio = wx.createInnerAudioContext()
//苹果手机，静银模式 也能播放录音
if (wx.setInnerAudioOption) {
  wx.setInnerAudioOption({
    obeyMuteSwitch: false,
    autoplay: true
  })
}else {
  myaudio.obeyMuteSwitch = false;
  myaudio.autoplay = true;
}

const app = getApp()

Page({

  onLoad: function (options) {

    this.setData({
      pid: options.id,
      array: ['待提交结果', '完成', '未完成'],
      index: 0,
      unCommit:0,
      audKey:'',  //当前选中的音频key
    })

    //获取最新消息数据
    this.getNewPlanData()

  },

  getNewPlanData: function () {
    const self = this
    var sessionId = app.globalData.sessionId

    //console.info('1. onLoad this.pid' + this.data.pid)
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/detailYear',
        data: {
          id: self.data.pid
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          var planProgressList=result.data.planProgressList
          var plan=result.data.plan
          let unCommit = 0
          let kpis = plan.kpiDetails;
          let actions = plan.actionDetails	
          let actionsLength = actions.length;

          //kpi未添加结果的条数
          for (let i = 0; i < kpis.length; i++ ){	
						if (kpis[i].isNoVote == true){
							if(typeof(kpis[i].actualValueString) == 'undefined' || !kpis[i].actualValueString ){						
                unCommit ++;
                kpis[i].actualValueString=''
							} 
						} else {			
              if(kpis[i].actualValue == null || typeof(kpis[i].actualValue) == 'undefined'){					
								unCommit ++;
							}  							
            }
            kpis[i].score=util.formatDouble(kpis[i].score)
            kpis[i].baseValue=util.formatDouble(kpis[i].baseValue)
            kpis[i].reasonableValue=util.formatDouble(kpis[i].reasonableValue)
            kpis[i].weight=util.formatDouble(kpis[i].weight)
            kpis[i].accumulateActualValue=util.formatDouble(kpis[i].accumulateActualValue)
            kpis[i].actualValue=util.formatDouble(kpis[i].actualValue)
            kpis[i].yearActualValueString=util.formatNull(kpis[i].yearActualValueString)
            kpis[i].actualValueString=util.formatNull(kpis[i].actualValueString)
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
            actionsLength:actionsLength,
            planProgressList:planProgressList
          })

          var title = plan.title

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
                if(plan.kpiDetails[i].actualValue==null || plan.kpiDetails[i].actualValue=='' ){							
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
                      
                      var scoreValue
                      if(result.data.data[0]!=null){
                        var scoreValue = result.data.data[0].toFixed(2);
                      }

                      var status
                      if(result.data.data[2]!=null){
                        var status = result.data.data[2];  
                      }
                      let unCommit = self.data.unCommit
                      //更新DATE								
                      var plan=self.data.plan;	 																	
                      for (let i = 0; i < plan.kpiDetails.length; i++ ){						
                          if (kpiId == plan.kpiDetails[i].id){
                            if(plan.kpiDetails[i].actualValue!='' && value==''){
                              unCommit ++;
                            }else if(plan.kpiDetails[i].actualValue=='' && value!=''){
                              unCommit --;
                            }
                            plan.kpiDetails[i].actualValue = value;
                            plan.kpiDetails[i].score = scoreValue;
                            plan.kpiDetails[i].status = status;
                            break;
                          }  
                        }	

                        self.setData({
                          plan: plan,
                          unCommit:unCommit
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

    wx.navigateTo({ url: '../planNoVoteValue/planNoVoteValue?id=' + id +'&kpiName='+kpiName+ '&targetIndexId='+targetIndexId+'&isMonthRules=false'+'&toType=0'})
  },

  //提交计划
  commitPlan:function(e){  

    var isHasResultRemark=true
    const self = this
    var plan=self.data.plan;
    for (let i = 0; i < plan.actionDetails.length; i++ ){						
      if ( plan.actionDetails[i].resultRemark == null || plan.actionDetails[i].resultRemark == ''){	
        isHasResultRemark=false
        break
      } 
    }

    var errormsg
    if(isHasResultRemark==false){
      errormsg='有结果说明没有填写，请检查并填写完成后，才能提交计划!';
    }

    //上周未完成带入本周的计划，由于计划完成时间情况了，所以在本周提交计划的时候要校验计划完成时间必须填写
    //结果说明必须填写
    if(isHasResultRemark==false){
      
      wx.showModal({  
        title: '提示',  
        content: errormsg,  
        showCancel:false,
        confirmText:'关闭',
        success: function(res) {  
            
        }  
      })  
    }else{

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
                self.commitYearPlan(planId,status);
                
              } else if (res.cancel) { 
                //用户点击取消按钮执行如下代码
              }  
          }  
      }) 
    }

  } , 

  //提交年度计划方法
  commitYearPlan: function(planId,status){   

    const self = this
    var sessionId = app.globalData.sessionId
    wx.request({
      url: config.domain + '/planCr/commitYearPlan',
      data : {
        id: planId,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {
          //创建成功自动返回上级页面
          if(result.data.success==true){
            wx.showModal({  
              title: '提示',  
              content: '提交成功',  
              showCancel:false,
              confirmText:'关闭',
              success: function(res) {  
                wx.switchTab({ url: '../planlist/planlist' })
              }  
            }) 
          }else{ 

          }
      },
      fail({ errMsg }) {
        //创建失败提示错误信息代码开始
      }
    })
  },
  //提交计划 结束 

  //音频播放   开始
 audioPlay: function (e) {

    var that = this
    var id = e.currentTarget.dataset.id
    var key = e.currentTarget.dataset.key
    var audioArr = that.data.planProgressList
    
    //设置状态
    audioArr.forEach((v, i, array) => {
      v.isBof = false;
      if (i == key) {
        v.isBof = true;
      }
    })

    that.setData({
      planProgressList: audioArr,
      audKey: key,
    })
  
    myaudio.autoplay = true
    var audKey = that.data.audKey
    var vidSrc = config.domain + audioArr[audKey].content
    myaudio.src = vidSrc

    myaudio.play();
    //开始监听
    myaudio.onPlay(() => {
      //console.log('onPlay======开始播放')
    })
    
    //结束监听
    myaudio.onEnded(() => {

      //console.log('onEnded======自动播放完毕');
      audioArr[key].isBof = false;
      that.setData({
        planProgressList: audioArr,
      })
      return
    })

    //错误回调
    myaudio.onError((err) => {
      console.log(err); 
      audioArr[key].isBof = false;
      that.setData({
        planProgressList: audioArr,
      })
      return
    })
  },
  
  // 再次点击播放按钮， 停止播放
  audioStop(e){
    var that = this
    var key = e.currentTarget.dataset.key
    var audioArr = that.data.planProgressList
    //设置状态
    audioArr.forEach((v, i, array) => {
      v.isBof = false;
    })
    that.setData({
      planProgressList: audioArr
    })

    myaudio.stop();

    //停止监听
    myaudio.onStop(() => {
      //console.log('停止播放');
    })
  },

  toPlanProgressPage: function(e){

    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '../planProgressList/planProgressList?planId=' + id }) 
  },
  
  //跳转到发送消息对话框页面
  writeProcessMessage: function(e){

    wx.navigateTo({ url: '../../common/writeProcessMessage/writeProcessMessage?refrenceId=' + this.data.pid +'&toType=2'}) 
  },

  //跳转到填写结果说明对话框页面
  planWriteResult: function(e){
    var status = e.currentTarget.dataset.status
    if(status==0){
      var actionDetailId = e.currentTarget.dataset.detailid
      var resultRemark = e.currentTarget.dataset.resultremark
      var actionName = e.currentTarget.dataset.actionname
      wx.navigateTo({ url: '../planWriteResult/planWriteResult?refrenceId=' + actionDetailId +'&resultRemark='+resultRemark+'&refrenceName='+actionName+'&refrenceType=2'}) 
    }
  },

})
