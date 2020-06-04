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

  //跳转到发送消息对话框页面
  writeProcessMessage: function(e){
    
    var receiveUserId = e.currentTarget.dataset.receiveuserid
    wx.navigateTo({ 
      url: '../../common/writeProcessMessage/writeProcessMessage?refrenceId='+this.data.adviserMessageId+'&receiveUserId='+receiveUserId +'&toType=5'
    }) 
  },

})
