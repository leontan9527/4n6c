const config = require('../../../config')
var util = require("../../../util/dateutil.js")
var tempFilePath
const myaudio = wx.createInnerAudioContext()
//苹果手机，静音模式 也能播放录音
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
      refrenceId: options.refrenceId,
      receiveUserId:options.receiveUserId,
      toType: options.toType,
      pageSize:options.pageSize,
      pageNumber:options.pageNumber,
      index: 0,
      unCommit:0,
      showVoiceMask: false,
      showWriteMask:true,
      startRecording: false,
      cancleRecording:false,
      recordAnimationNum:0,
      lastVoiceYPostion:0,
      audKey:'',  //当前选中的音频key
      isSendAdviser:false,
      isShowBottomVoice:false
    })

  },

  
  //显示文字消息   开始
  showWriteDialog:function(e){
    
    this.setData({
      showWriteMask:true,
      isSendAdviser:false,
      showVoiceMask:false
    })
  },

  //添加文字消息
  addCommentFun:function(e){
    var that = this;

    var content=that.data.content
    if(content=='' || content==undefined){

      wx.showModal({  
        title: '提示',  
        content: '必须填写进程内容才能提交!',  
        showCancel:false,
        confirmText:'关闭',
        success: function(res) {  
            
        }  
      }) 
      return false;
    }

    var sessionId = app.globalData.sessionId
    var toUrl=config.domain + '/planCr/addComment'
    if(that.data.toType==4){
      toUrl=config.domain + '/adviserMessageCr/addAdviserMessage'
    }else if(that.data.toType==5){
      toUrl=config.domain + '/adviserMessageCr/addAdviserMessageExchagne'
    }
    wx.request({
      url: toUrl,
      data : {
        refrenceId: that.data.refrenceId,
        detailId:'',
        content:that.data.content,
        idType: 0,
        isSendAdviser:that.data.isSendAdviser,
        receiveUserId:that.data.receiveUserId,
        mainType:2,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {

          if(result.data.success){
              if(that.data.toType==4){
                that.getAdviserMessagePage(that.data.pageSize,that.data.pageNumber)
              }else if(that.data.toType==5){
                that.allReplyAdviserMessageList(that.data.refrenceId)
              }else{
                that.toPlanPrevPage(that.data.refrenceId)
              }
          }else{ 
            //创建失败，提示错误信息
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
    
    this.setData({
       showVoiceMask:true,
       isSendAdviser:false,
       showWriteMask:false
    })
    
  },

  //语音上传                                        开始
  //按住录音按钮，开始录音方法
  startRecording:function (e) {

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
              },
              success:function(result){

                var resultData = JSON.parse(result.data.replace(/\n/g,"\\n").replace(/\r/g,"\\r"))
                //语音文件上传成功后
                if(resultData.success){
                  var toUrl=config.domain + '/planCr/addVoiceProcess'
                  if(that.data.toType==4){
                    toUrl=config.domain + '/adviserMessageCr/addVoiceProcess'
                  }else if(that.data.toType==5){
                    toUrl=config.domain + '/adviserMessageCr/addVoiceProcessExchagne'
                  }
                  wx.request({
                    url: toUrl,
                    data : {
                      refrenceId: that.data.refrenceId,
                      detailId:'',
                      uuid:resultData.uuid,
                      timeLength:that.data.recordingTime,
                      idType: 0,
                      isSendAdviser:that.data.isSendAdviser,
                      receiveUserId:that.data.receiveUserId,
                      mainType:2,
                    },
                    method: 'POST',
                    header: {
                      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                      'Cookie': 'JSESSIONID=' + sessionId
                    },
                    success(result) {
             
                        if(result.data.success){
                            if(that.data.toType==4){
                              that.getAdviserMessagePage(that.data.pageSize,that.data.pageNumber)
                            }else if(that.data.toType==5){
                              that.allReplyAdviserMessageList(that.data.refrenceId)
                            }else{
                              that.toPlanPrevPage(that.data.refrenceId)
                            }
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
  //发送计划进程消息代码                    结束

  //从计划页点击进来的返回到计划页面
  toPlanPrevPage: function(refrenceId) {
    var sessionId = app.globalData.sessionId		
    wx.request({
      url: config.domain + '/planCr/planProgressList',
      data: {
        id: refrenceId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {

        var planProgressList=result.data.planProgressList
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2]
        prevPage.setData({
          planProgressList:planProgressList,
        })
        wx.navigateBack({
          delta: 1
        })
      },
      fail({ errMsg }) {
        console.log('【plan/detailMonth fail】', errMsg)
      }
    })
  },

  //从顾问信息页面进来的返回到顾问信息页面
  getAdviserMessagePage: function (pageSize,pageNumber) {

    const self = this
    var sessionId = app.globalData.sessionId
    
    if (sessionId) {
      wx.request({
        url: config.domain + '/adviserMessageCr/myAdviserMessagePage',
        data: {
          pageSize: pageSize,
          pageNumber:pageNumber
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
  
          var contentlistTem = self.data.contentlist;
          if(result.data.success){
            
            var contentlist=result.data.items
            var totalPage=result.data.totalPage

            if (self.data.pageNumber == 1) {
              contentlistTem = []
            }
            
            if(contentlist!=null){
              contentlist=contentlistTem.concat(contentlist)
            }else{
              contentlist=contentlistTem
            }

            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2]
            prevPage.setData({
              contentlist: contentlist,
              totalPage:totalPage,
              searchLoading:false,
            })
            wx.navigateBack({
              delta: 1
            })

          }
        },
  
        fail({ errMsg }) {
          console.log('【plan/list fail】', errMsg)
        }
      })
    }
  },

   //从顾问子信息页面进来的返回到顾问子信息页面
  allReplyAdviserMessageList: function (refrenceId) {

    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {
      wx.request({
        url: config.domain + '/adviserMessageCr/allReplyAdviserMessageList',
        data: {
          id: refrenceId,
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
  
          if(result.data.success){
            
            var adviserMessageExchangeList=result.data.adviserMessageExchangeList
            var adviserMessage=result.data.adviserMessage

            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2]
            prevPage.setData({
              adviserMessageExchangeList: adviserMessageExchangeList,
              adviserMessage:adviserMessage
            })
            wx.navigateBack({
              delta: 1
            })

          }
        },
  
        fail({ errMsg }) {
          console.log('【plan/list fail】', errMsg)
        }
      })
    }
  },

})