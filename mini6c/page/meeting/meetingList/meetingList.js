const config = require('../../../config')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    contentlist: [],   
    pageSize:10,//返回数据的个数 
    pageNumber:1,
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏 
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
    name:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取最新消息数据
    this.myMeetingPage()
  },

  myMeetingPage: function (e) {

    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {
      wx.request({
        url: config.domain + '/meetingCr/myMeetingPage',
        data: {
          name:self.data.name,
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
            //console.log('contentlist=='+contentlist+'   pageNumber='+self.data.pageNumber+'   contentlistTem='+contentlistTem)
        
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
            
          }
        },
  
        fail({ errMsg }) {
          console.log('【plan/list fail】', errMsg)
        }
      })
    }
  },

  getBlurInputValue: function(e) {
    
    var value = e.detail.value
    if(value==''){
      this.setData({
        pageNumber:1,
        searchLoading: false, //"上拉加载"的变量，默认false，隐藏 
        searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
      })
    }
    this.setData({
      name:value
    })
  },

  toMeetingDetail: function (e) {
    
    var meetingId = e.currentTarget.dataset.meetingid
    wx.navigateTo({ url: '../meetingDetail/meetingDetail?meetingId='+ meetingId })
  },

  // 上滑加载更多数据
  onReachBottom: function(event) {

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
      that.myMeetingPage()//获取最新数据
    }  
    
  },

  // 下拉刷新
  onPullDownRefresh: function(event) {

    let that = this;  
  
    that.setData({  
      pageNumber: 1,  //每次触发上拉事件，把searchPageNum+1  
      searchLoading: false, //"上拉加载"的变量，默认false，隐藏 
      searchLoadingComplete: false  //“没有数据”的变量，默认false，隐藏
    });  

    that.myMeetingPage()//获取最新数据
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})