const config = require('../../../config')
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
  
  onLoad: function(options){   
    
    this.setData({  
      adviserMessageId: options.id,   
      icon_add: '../../images/write.png',
      showVoiceMask: false,
      startRecording: false,
      cancleRecording:false,
      recordAnimationNum:0,
      lastVoiceYPostion:0,
      audKey:'',  //当前选中的音频key
      isSendAdviser:false
    })

    //获取最新消息数据
    this.allReplyAdviserMessageList()
  },

  allReplyAdviserMessageList: function (e) {

    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {
      wx.request({
        url: config.domain + '/adviserMessageCr/allReplyAdviserMessageList',
        data: {
          id: self.data.adviserMessageId,
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
 
            self.setData({
              adviserMessageExchangeList: adviserMessageExchangeList,
              adviserMessage:adviserMessage
            })
          }
        },
  
        fail({ errMsg }) {
          console.log('【plan/list fail】', errMsg)
        }
      })
    }
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
      url: config.domain + '/adviserMessageCr/addAdviserMessageExchagne',
      data : {
        cusOrgId: '',
        adviserMessageId:that.data.adviserMessageId,
        content:that.data.content,
        isAdviserMessage:false,
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

            //更新DATE								
            let pages = getCurrentPages()
            let prevPage = pages[pages.length - 2]
            var contentlist = prevPage.data.contentlist
            let adviserMessageId = that.data.adviserMessageId

            for (let i = 0; i < contentlist.length; i++ ){

              if (adviserMessageId == contentlist[i].id){	
                contentlist[i].exchangeCount=contentlist[i].exchangeCount+1
              }
            }
            prevPage.setData({
              contentlist:contentlist
            })

            that.hideModal()
            //创建成功，获取最新消息数据
            that.setData({
              content:''
            })
            that.allReplyAdviserMessageList()//获取最新数据
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
    
    var receiveUserId = e.currentTarget.dataset.receiveuserid

    if(this.data.showVoiceMask){
      this.setData({
         showVoiceMask:false,
         isSendAdviser:false,
         receiveUserId:''
      })
    }else{
      this.setData({
         showVoiceMask:true,
         isSendAdviser:false,
         receiveUserId:receiveUserId
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
                //语音文件上传成功后
                if(resultData.success){

                  wx.request({
                    url: config.domain + '/adviserMessageCr/addVoiceProcessExchagne',
                    data : {
                      cusOrgId:'',
                      adviserMessageId:that.data.adviserMessageId,
                      mainType:2,
                      isAdviserMessage:false,
                      receiveUserId:that.data.receiveUserId,
                      uuid:resultData.uuid,
                      timeLength:that.data.recordingTime,
                    },
                    method: 'POST',
                    header: {
                      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                      'Cookie': 'JSESSIONID=' + sessionId
                    },
                    success(result) {
             
                        //更新DATE								
                        let pages = getCurrentPages()
                        let prevPage = pages[pages.length - 2]
                        var contentlist = prevPage.data.contentlist
                        for (let i = 0; i < contentlist.length; i++ ){
                          if (that.data.adviserMessageId == contentlist[i].id){	
                            contentlist[i].exchangeCount=contentlist[i].exchangeCount+1
                          }
                        }
                        prevPage.setData({
                          contentlist:contentlist
                        })

                        if(result.data.success){
                          //创建成功，获取最新消息数据
                          that.allReplyAdviserMessageList()
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

    var audioArr = that.data.adviserMessageExchangeList
    
    //设置状态
    audioArr.forEach((v, i, array) => {
      v.isBof = false;
      if (i == key) {
        v.isBof = true;
      }
    })

    that.setData({
      adviserMessageExchangeList: audioArr,
      audKey: key,
    })
  
    myaudio.autoplay = true
    var audKey = that.data.audKey
    var vidSrc = config.domain + audioArr[audKey].message
    console.log('vidSrc=='+vidSrc)
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
        adviserMessageExchangeList: audioArr,
      })
      return
    })

    //错误回调
    myaudio.onError((err) => {
      console.log(err); 
      audioArr[key].isBof = false;
      that.setData({
        adviserMessageExchangeList: audioArr,
      })
      return
    })
  },
  
  // 再次点击播放按钮， 停止播放
  audioStop(e){
    var that = this
    var key = e.currentTarget.dataset.key
    var audioArr = that.data.adviserMessageExchangeList
    //设置状态
    audioArr.forEach((v, i, array) => {
      v.isBof = false;
    })
    that.setData({
      adviserMessageExchangeList: audioArr
    })

    myaudio.stop();

    //停止监听
    myaudio.onStop(() => {
      //console.log('停止播放');
    })
  },

  //显示发送文字消息   开始
  showWriteDialog:function(e){
    
    var receiveUserId = e.currentTarget.dataset.receiveuserid

    if(this.data.showWriteMask){
      this.setData({
        showWriteMask:false,
        isSendAdviser:false,
        receiveUserId:''
      })
    }else{
      this.setData({
         showWriteMask:true,
         isSendAdviser:false,
         receiveUserId:receiveUserId
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
      receiveUserId:''
    });
  },

  //对话框取消按钮点击事件
  onCancel: function() {
    this.hideModal();
  },
  //发送计划进程消息代码                    结束

})
