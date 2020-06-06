const config = require('../../../config')
const app = getApp()
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

Page({

  onLoad: function () {

    this.setData({
      hasUserInfo: false,
      icon_year: 'pic/icon_2.png',
      icon_month: 'pic/icon_1.png',
      icon_week: 'pic/icon_0.png',
      icon_add: '../../images/add.png'
    })

    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    console.info('1. onLoad 开始登陆,使用Cookie=')
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/unReadProcess',
        data: {
          api: "unReadProcess"
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          
          self.setData({
            planList: result.data.unReadProcess,
            process:result.data.wxPlanProcessList
          })
        },

        fail({ errMsg }) {
          console.log('【plan/unReadProcess fail】', errMsg)
        }
      })
    }

  },
  
  toPlanDetail: function (e) {

    var id = e.currentTarget.dataset.id
    var planCycle = e.currentTarget.dataset.plancycle
    var isToEditPage = e.currentTarget.dataset.istoeditpage
    if(isToEditPage){
      if(planCycle==0){
        wx.navigateTo({ url: '../planDetailWeek/planDetailWeek?id=' + id })
      }else if(planCycle==1){
        wx.navigateTo({ url: '../planDetailMonth/planDetailMonth?id=' + id })
      }else{
        wx.navigateTo({ url: '../planDetailYear/planDetailYear?id=' + id })
      }
    }else{  
      wx.navigateTo({ url: '../planDetailShow/planDetailShow?id=' + id + '&planCycle='+planCycle })
    }
  },

  //音频播放   开始
  audioPlay: function (e) {

    var that = this
    var id = e.currentTarget.dataset.id

    var unReadProcess=that.data.planList
    var vidSrc
    var process
    for (let i = 0; i < unReadProcess.length; i++ ){			
      process=unReadProcess[i].process
      for (let j = 0; j < process.length; j++ ){
        process[j].isBof = false
        if(id=process[j].id){
          process[j].isBof = true
          vidSrc=config.domain + process[j].content
          that.setData({
            planList: unReadProcess,
          })
        }
      }
    }
  
    myaudio.autoplay = true
    myaudio.src = vidSrc

    myaudio.play();
    //开始监听
    myaudio.onPlay(() => {
      //console.log('onPlay======开始播放')
    })
    
    //结束监听
    myaudio.onEnded(() => {

      //console.log('onEnded======自动播放完毕');
      for (let i = 0; i < unReadProcess.length; i++ ){			
        process=unReadProcess[i].process
        for (let j = 0; j < process.length; j++ ){
          process[j].isBof = false
          if(id=process[j].id){
            process[j].isBof = false
            that.setData({
              planList: unReadProcess,
            })
          }
        }
      }
      return
    })

    //错误回调
    myaudio.onError((err) => {
      console.log(err); 
      for (let i = 0; i < unReadProcess.length; i++ ){			
        process=unReadProcess[i].process
        for (let j = 0; j < process.length; j++ ){
          process[j].isBof = false
          if(id=process[j].id){
            process[j].isBof = false
            that.setData({
              planList: unReadProcess,
            })
          }
        }
      }
      return
    })
  },

  // 再次点击播放按钮， 停止播放
  audioStop(e){

    var that = this
    var id = e.currentTarget.dataset.id
    var vidSrc = config.domain + audioArr[audKey].content
    var unReadProcess=that.data.planList
    var process
    for (let i = 0; i < unReadProcess.length; i++ ){			
      process=unReadProcess[i].process
      for (let j = 0; j < process.length; j++ ){
        process[j].isBof = false
        if(id=process[j].id){
          process[j].isBof = false
          that.setData({
            planList: unReadProcess,
          })
        }
      }
    }

    myaudio.stop();

    //停止监听
    myaudio.onStop(() => {
      //console.log('停止播放');
    })
  },
  
})
