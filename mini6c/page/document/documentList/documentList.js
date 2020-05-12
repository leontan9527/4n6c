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
    title:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取最新消息数据
    this.getMyDocumentPage()
  },

  getMyDocumentPage: function (e) {

    const self = this
    var sessionId = app.globalData.sessionId
    
    if (sessionId) {
      wx.request({
        url: config.domain + '/documentCr/myDocumentPage',
        data: {
          title:self.data.title,
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
            
            self.setData({
              contentlist: contentlistTem.concat(contentlist),
              totalPage:totalPage,
              userId:result.data.userId,
              organizationId:result.data.organizationId,
              searchLoading:false,
            })

            console.log('contentlist=='+self.data.contentlist)
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
    this.setData({
      title:value
    })
  },

  toDocumentDetail: function (e) {
    
    var documentId = e.currentTarget.dataset.documentid
    var userId=e.currentTarget.dataset.userid
    var organizationId=e.currentTarget.dataset.organizationid
    wx.navigateTo({ url: '../documentDetail/documentDetail?documentId='+ documentId+'&userId='+userId+'&organizationId='+organizationId })
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
      that.getMyDocumentPage()//获取最新数据
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

    that.getMyDocumentPage()//获取最新数据
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})