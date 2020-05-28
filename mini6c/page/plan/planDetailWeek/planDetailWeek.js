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
      showVoiceMask: false,
      startRecording: false,
      cancleRecording:false,
      recordAnimationNum:0,
      lastVoiceYPostion:0,
      audKey:'',  //当前选中的音频key
      isSendAdviser:false,
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

          //console.log('【temp=】', util.timestampToTime(temp,false))
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
    console.log('planEditAction/planEditAction】isEditPlan=', isEditPlan)
    if(isEditPlan==true){
      var planId = e.currentTarget.dataset.planid
      var detailId = e.currentTarget.dataset.actailid
      wx.navigateTo({ url: '../planEditAction/planEditAction?planId=' + planId +'&detailId='+detailId})
    }
},

commitPlan:function(e){  

    var isHasCommitDate=true
    var isHasResultRemark=true
    const self = this
    var plan=self.data.plan;
    for (let i = 0; i < plan.actionDetails.length; i++ ){	
			
      if ( plan.actionDetails[i].commitDate == null || plan.actionDetails[i].commitDate == ''){	
        isHasCommitDate=false
        break
      } 
      if ( plan.actionDetails[i].resultRemark == null || plan.actionDetails[i].resultRemark == ''){	
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

  //发送计划进程消息代码                    开始
  getBlurInputValue: function(e) {
    
    var value = e.detail.value
    this.setData({
      content:value
    })
  },

  //添加文字消息
  addCommentFun:function(e){

    var that = this;
    var sessionId = app.globalData.sessionId
    wx.request({
      url: config.domain + '/planCr/addComment',
      data : {
        planId: that.data.pid,
        detailId:'',
        content:that.data.content,
        idType: 0,
        isSendAdviser:that.data.isSendAdviser
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {

          if(result.data.success){
            that.hideModal()
            //创建成功，获取最新消息数据
            that.setData({
              content:''
            })
            that.getNewPlanData()
          }else{ 
            //创建失败，提示错误信息
          }
      },
      fail({ errMsg }) {
        //创建失败提示错误信息代码开始
      }
    })
     
  },

  //选中发送顾问老师
  checkboxChange:function(e){

    if (e.detail.value =='') {
      this.setData({
        isSendAdviser:false
      })
    }else {
      this.setData({
        isSendAdviser:true
      })
    }  
  },

  showVoiceDialog:function(e){
    
    if(this.data.showVoiceMask){
      this.setData({
         showVoiceMask:false,
         isSendAdviser:false
      })
    }else{
      this.setData({
         showVoiceMask:true,
         isSendAdviser:false
      })
    }
    
  },

  //语音上传                                        开始
  //按住录音按钮，开始录音方法
  startRecording:function (e) {

    console.log('开始录音');
    this.setData({
      selectType: 'voice',
      startRecording:true
    })

    this.startVoiceRecordAnimation();
    var that = this;
    const recorderManager = wx.getRecorderManager();
    recorderManager.start({
        duration: 60000, //指定录音的时长，单位 ms，最大为10分钟（600000），默认为1分钟（60000）
        sampleRate: 16000, //采样率
        numberOfChannels: 1, //录音通道数
        encodeBitRate: 96000, //编码码率
        format: 'mp3', //音频格式，有效值 aac/mp3
        frameSize: 50, //指定帧大小，单位 KB
    });

    recorderManager.onStart(() => {
      console.log('recorder start')
    })
  },

  //手指松开录音按钮，停止录音
  stopRecording: function (e) {

    var that = this;
    const recorderManager = wx.getRecorderManager();
    recorderManager.stop();
    recorderManager.onStop((res) => {
     
      console.log('recorder stop', res)
      //const { tempFilePath } = res;
      tempFilePath=res.tempFilePath

      if (res.duration < 1000) {
          wx.showToast({
            title: '说话时间太短!',
            icon:'none'
          })
          this.stopVoiceRecordAnimation();

          that.setData({
            startRecording: false
          })
          return;
      }

      console.log('cancleRecording==='+this.data.cancleRecording)
      if (this.data.cancleRecording === false) {
        //判断tempFilePath是否真实有效
        if (tempFilePath.length !== 0) {
          var recordLength = 0;
          if (res.duration / 1000 < 22) {
            recordLength = 160;
          } else {
            recordLength = (res.duration / 1000) / 60 * 440;
          }
          var recordTime = (res.duration / 1000).toFixed(0);

          that.setData({
            recordingLength: recordLength,
            recordingTime: recordTime,
            voiceTempFilePath: tempFilePath,
            selectResource: true,
            showVoiceMask: false,
            startRecording: false
          })
          that.stopVoiceRecordAnimation();

          //手指挪开，暂停录音后，向后台传送录音文件 开始
          console.log('tempFilePath=====',tempFilePath)
          var sessionId = app.globalData.sessionId
          wx.uploadFile({
              url: config.domain + '/fileController/weiXingUploadImFile',
              filePath: tempFilePath,
              name:"file",//后台要绑定的名称
              header: {
                "content-Type": "multipart/form-data",
                'Cookie': 'JSESSIONID=' + sessionId
              },
              //参数绑定,可以向后台传递多个参数
              formData:{
                upFileType:16,
                //recordingtime: recordTime,//发送语音的时间
                //facId: 11211,//业务id
                //userId:1,//用户id
              },
              success:function(result){

                var resultData = JSON.parse(result.data.replace(/\n/g,"\\n").replace(/\r/g,"\\r"))
                console.log('result.data.uuid====='+resultData.uuid);
                //语音文件上传成功后
                if(resultData.success){

                  wx.request({
                    url: config.domain + '/planCr/addVoiceProcess',
                    data : {
                      planId: that.data.pid,
                      detailId:'',
                      uuid:resultData.uuid,
                      timeLength:that.data.recordingTime,
                      idType: 0,
                      isSendAdviser:that.data.isSendAdviser
                    },
                    method: 'POST',
                    header: {
                      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                      'Cookie': 'JSESSIONID=' + sessionId
                    },
                    success(result) {
             
                        if(result.data.success){
                          //创建成功，获取最新消息数据
                          that.getNewPlanData()
                        }else{ 
                          //创建失败，提示错误信息
                        }
                    },
                    fail({ errMsg }) {
                      //创建失败提示错误信息代码开始
                    }
                  })
                }
      
              },
              fail: function(ress){
                console.log("。。录音保存失败。。");
              }
          })

        }
      } else {

        that.setData({
          selectResource: false,
          showVoiceMask: false,
          startRecording: false,
          cancleRecording:false
        })
        //console.log('recorderManager.onStop被调用showVoiceMask========='+this.data.showVoiceMask+'   startRecording============='+this.data.startRecording);
        that.stopVoiceRecordAnimation();
      }

    })
  },

  //向上滑动取消录音
  moveToCancle: function (event) {

    let currentY = event.touches[0].pageY;
    if (this.data.lastVoiceYPostion !== 0) {
      if (currentY - this.data.lastVoiceYPostion < 0 && currentY < 470) {
        this.setData({
          cancleRecording:true
        })
      }
      //console.log('moveToCancle被调用======'+this.data.cancleRecording);
    }

    this.setData({
      lastVoiceYPostion: currentY
    })
  },

  //计数器，用于点击录音时候，动态图片显示 
  startVoiceRecordAnimation:function () {

    var that = this;
    var i = 1;
    that.data.recordAnimationSetInter = setInterval(function () {
      i++;
      i = i % 5;
      that.setData({
        recordAnimationNum: i
      })
      //console.log('recordAnimationSetInter被调用======'+that.data.recordAnimationNum);
    }, 600);
  },

  // 停止计时器
  stopVoiceRecordAnimation:function () {
    var that = this;
    clearInterval(that.data.recordAnimationSetInter);
  },
  //语音上传   结束


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

  //显示发送文字消息   开始
  showWriteDialog:function(e){
    
    console.log('showWriteDialog  方法被调用')
    if(this.data.showWriteMask){
      this.setData({
        showWriteMask:false,
         isSendAdviser:false
      })
    }else{
      this.setData({
         showWriteMask:true,
         isSendAdviser:false
      })
    }
  },

  //弹出框蒙层截断touchmove事件
  preventTouchMove: function() {
    
  },

  //隐藏模态对话框
  hideModal: function() {
    this.setData({
      showWriteMask: false,
      showResultRemarkMask:false
    });
  },

  //对话框取消按钮点击事件
  onCancel: function() {
    this.hideModal();
  },
  //发送计划进程消息代码                    结束

  toPlanProgressPage: function(e){

    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '../planProgressList/planProgressList?planId=' + id }) 
  },
  
  //显示结果说明   开始
  showResultRemarkDialog:function(e){
    
    var itemDetialId = e.currentTarget.dataset.detailid
    var resultRemark = e.currentTarget.dataset.resultremark
    if(resultRemark==null){
      resultRemark='';
    }
    
    if(this.data.showResultRemarkMask){
      this.setData({
        showResultRemarkMask:false,
        itemDetialId:itemDetialId,
        resultRemark:resultRemark
      })
    }else{
      this.setData({
        showResultRemarkMask:true,
        itemDetialId:itemDetialId,
        resultRemark:resultRemark
      })
    }
  },
  
//添加结果说明
writeResultFun:function(e){

  var that = this;
  var sessionId = app.globalData.sessionId
  wx.request({
    url: config.domain + '/planCr/saveActionResultRemark',
    data : {
      id: that.data.itemDetialId,
      resultRemark:that.data.resultRemark,
    },
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Cookie': 'JSESSIONID=' + sessionId
    },
    success(result) {

        if(result.data.success){
          that.hideModal()
          //创建成功，获取最新消息数据
          that.setData({
            content:''
          })
          that.getNewPlanData()
        }else{ 
          //创建失败，提示错误信息
        }
    },
    fail({ errMsg }) {
      //创建失败提示错误信息代码开始
    }
  })
   
},

getBlurResultValue: function(e) {
  
  var value = e.detail.value
  this.setData({
    resultRemark:value
  })
},

})
