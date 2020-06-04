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
      planId: options.id,
      planCycle: options.planCycle,
      showWriteMask: false,
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

    var detailUrl
    if(self.data.planCycle==0){
      detailUrl='/planCr/detailWeek'
    }else if(self.data.planCycle==1){
      detailUrl='/planCr/detailMonth'
    }else{
      detailUrl='/planCr/detailYear'
    }

    if (sessionId) {
      wx.request({
        url: config.domain + detailUrl,
        data: {
          id: this.data.planId
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {

          console.log(result.data.success)
          var planProgressList=result.data.planProgressList
          var plan=result.data.plan
          let kpis = plan.kpiDetails;
          if(kpis!=null){
            for (let i = 0; i < kpis.length; i++ ){	
              kpis[i].score=util.formatDouble(kpis[i].score)
              kpis[i].baseValue=util.formatDouble(kpis[i].baseValue)
              kpis[i].reasonableValue=util.formatDouble(kpis[i].reasonableValue)
              kpis[i].weight=util.formatDouble(kpis[i].weight)
              kpis[i].actualValue=util.formatDouble(kpis[i].actualValue)
            }
          }

          self.setData({
            plan: plan,
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
    wx.navigateTo({ url: '../planProgressList/planProgressList?refrenceId=' + id  +'&toType=3'}) 
  },

   //跳转到发送消息对话框页面
   writeProcessMessage: function(e){

    wx.navigateTo({ url: '../../common/writeProcessMessage/writeProcessMessage?refrenceId=' + this.data.planId +'&toType=3'}) 
  },

})
