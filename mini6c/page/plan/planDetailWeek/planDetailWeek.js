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
      isShowBottomVoice:false
    })

    //获取最新消息数据
    this.getNewPlanData()

  },

  showSendMessageFun:function(e){
    if(this.data.isShowBottomVoice){
      this.setData({
        isShowBottomVoice: false,
      })
    } else{
      this.setData({
        isShowBottomVoice: true,
      })
    }
  },

  getNewPlanData: function () {

    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/detailWeek',
        data: {
          id: self.data.pid
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          //console.log('【plan/detailMonth=】', result.data.data)

          var planProgressList=result.data.planProgressList
          var plan=result.data.plan
          let kpis = plan.kpiDetails;
          let unCommit = 0
          let actions = plan.actionDetails	
          let actionsLength = actions.length;

					for (let i = 0; i < actions.length; i++ ){
            //处理页面计划完成时间只能选择本周内的时间
            actions[i].dateStart=util.timestampToTime(actions[i].dateStart, false)
            actions[i].dateEnd=util.timestampToTime(actions[i].dateEnd, false)
            //当改变状态时，页面未完成项数改变
						if (actions[i].status == 0){	
							unCommit ++
            }  
            //因为页面选择状态的组件按照序号来的，而我们代码理的状态不一致，所以9时候改成2
            if (actions[i].status == 9){	
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
          console.log('【plan/detailWeek fail】', errMsg)
        }
      })
    }
  },

  bindDateChange: function (e) {

    var planId = e.currentTarget.dataset.planid
    var detailId = e.currentTarget.dataset.actailid
    var commitDate=e.detail.value

    const self = this
    var sessionId = app.globalData.sessionId
    wx.request({
      url: config.domain + '/planCr/saveActionCommitDate',
      data : {
        id: detailId,
        commitDate: commitDate
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
                plan.actionDetails[i].commitDate=commitDate
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

addAction: function (e) {
    var id = e.currentTarget.dataset.id
    console.log('【planAddAction/planAddAction】id=', id)
    wx.navigateTo({ url: '../planAddAction/planAddAction?id=' + id})
},

editAction: function (e) {
    var isEditPlan=e.currentTarget.dataset.iseditplan
    if(isEditPlan==true){
      var planId = e.currentTarget.dataset.planid
      var detailId = e.currentTarget.dataset.actailid
      wx.navigateTo({ url: '../planEditAction/planEditAction?planId=' + planId +'&detailId='+detailId})
    }
},

commitPlan:function(e){  

    var commitstatus = e.currentTarget.dataset.status
    var isHasCommitDate=true
    var isHasResultRemark=true
    const self = this
    var plan=self.data.plan;
    for (let i = 0; i < plan.actionDetails.length; i++ ){	
			
      if ( plan.actionDetails[i].commitDate == null || plan.actionDetails[i].commitDate == ''){	
        isHasCommitDate=false
        break
      } 
      if (commitstatus==1 && plan.actionDetails[i].resultRemark == null || plan.actionDetails[i].resultRemark == ''){	
        isHasResultRemark=false
        break
      } 
      
    }

    var errormsg
    if(isHasCommitDate==false){
      errormsg='有计划完成时间没有填写，请检查并填写完成后，才能提交计划!';
    }
    if(isHasResultRemark==false){
      errormsg='有结果说明没有填写，请检查并填写完成后，才能提交计划!';
    }

    //上周未完成带入本周的计划，由于计划完成时间情况了，所以在本周提交计划的时候要校验计划完成时间必须填写
    //结果说明必须填写
    if(isHasCommitDate==false || isHasResultRemark==false){
      
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
                self.commitWeekPlan(planId,status);
                
              } else if (res.cancel) { 
                //用户点击取消按钮执行如下代码
              }  
          }  
      }) 
    }

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
          if(result.data.success==true){
            if(status==1){
              
              wx.redirectTo({ url: '../planDetail/planDetail?id=' + planId })
            }else{
              var plan=self.data.plan
              plan.status=status;
              self.setData({
                plan: plan
              })
            }
          }else{ 

          }
      },
      fail({ errMsg }) {
        //创建失败提示错误信息代码开始
      }
    })
  },

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

    wx.navigateTo({ url: '../../common/writeProcessMessage/writeProcessMessage?refrenceId=' + this.data.pid +'&toType=0'}) 
  },

  //跳转到发送消息对话框页面
  planWriteResult: function(e){

      var actionDetailId = e.currentTarget.dataset.detailid
      var resultRemark = e.currentTarget.dataset.resultremark
      var actionName = e.currentTarget.dataset.actionname
      wx.navigateTo({ url: '../planWriteResult/planWriteResult?actionDetailId=' + actionDetailId +'&resultRemark='+resultRemark+'&actionName='+actionName}) 
  },


})
