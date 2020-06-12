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
  

  onShow: function(){
    this.getAdviserMessagePage()
  },

  onLoad: function(){   
    
    this.setData({     
      icon_add: '../../images/write.png',
      contentlist: [],   
      pageSize:10,//返回数据的个数 
      pageNumber:1,
      searchLoading: false, //"上拉加载"的变量，默认false，隐藏 
      searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
      audKey:'',  //当前选中的音频key
    })

    //获取最新消息数据
    this.getAdviserMessagePage()
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
  
  getAdviserMessagePage: function (e) {

    const self = this
    var sessionId = app.globalData.sessionId
    
    if (sessionId) {
      wx.request({
        url: config.domain + '/adviserMessageCr/myAdviserMessagePage',
        data: {
          pageSize: self.data.pageSize,
          pageNumber:self.data.pageNumber
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

            self.setData({
              contentlist: contentlist,
              totalPage:totalPage,
              searchLoading:false,
            })

            console.log('searchLoading=='+self.data.searchLoading)
          }
        },
  
        fail({ errMsg }) {
          console.log('【plan/list fail】', errMsg)
        }
      })
    }
  },

  // 上滑加载更多数据
  onReachBottom: function(event) {
    console.log('上滑动onReachBottom')
    let that = this;  

    if(!that.data.searchLoadingComplete){ 
      let pageNumber =that.data.pageNumber+1
      that.setData({  
        pageNumber: pageNumber,  //每次触发上拉事件，把searchPageNum+1 
        searchLoading:true, 
      }); 

      if(pageNumber>=that.data.totalPage){
        that.setData({  
          searchLoadingComplete: true,  //每次触发上拉事件，把searchPageNum+1  
          searchLoading:false,
        });
      }
      that.getAdviserMessagePage()//获取最新数据
    }  
    
  },

  // 下拉刷新
  onPullDownRefresh: function(event) {
    console.log('onPullDownRefresh')
    let that = this;  
  
    that.setData({  
      pageNumber: 1,  //每次触发上拉事件，把searchPageNum+1  
      searchLoading: false, //"上拉加载"的变量，默认false，隐藏 
      searchLoadingComplete: false  //“没有数据”的变量，默认false，隐藏
    });  

    that.getAdviserMessagePage()//获取最新数据
  },

  toSendAdviserInfo(e) {

    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '../sendAdviserInfo/sendAdviserInfo?id='+id })
  },

  //音频播放   开始
 audioPlay: function (e) {

    var that = this
    var id = e.currentTarget.dataset.id
    var key = e.currentTarget.dataset.key
    var audioArr = that.data.contentlist
    
    //设置状态
    audioArr.forEach((v, i, array) => {
      v.isBof = false;
      if (i == key) {
        v.isBof = true;
      }
    })

    that.setData({
      contentlist: audioArr,
      audKey: key,
    })
  
    myaudio.autoplay = true
    var audKey = that.data.audKey
    var vidSrc = config.domain + audioArr[audKey].message
    myaudio.src = vidSrc

    myaudio.play();
    //开始监听
    myaudio.onPlay(() => {
      //console.log('onPlay======开始播放')
    })
    
    //结束监听
    myaudio.onEnded(() => {

      audioArr[key].isBof = false;
      that.setData({
        contentlist: audioArr,
      })
      return
    })

    //错误回调
    myaudio.onError((err) => {
      console.log(err); 
      audioArr[key].isBof = false;
      that.setData({
        contentlist: audioArr,
      })
      return
    })
  },
  
  // 再次点击播放按钮， 停止播放
  audioStop(e){
    var that = this
    var key = e.currentTarget.dataset.key
    var audioArr = that.data.contentlist
    //设置状态
    audioArr.forEach((v, i, array) => {
      v.isBof = false;
    })
    that.setData({
      contentlist: audioArr
    })

    myaudio.stop();

    //停止监听
    myaudio.onStop(() => {
      //console.log('停止播放');
    })
  },

  //跳转到发送消息对话框页面
  writeProcessMessage: function(e){

    wx.navigateTo({ 
      url: '../../common/writeProcessMessage/writeProcessMessage?refrenceId=' +'&toType=4'+'&pageSize='+this.data.pageSize+'&pageNumber='+this.data.pageNumber
    }) 
  },
    
})
