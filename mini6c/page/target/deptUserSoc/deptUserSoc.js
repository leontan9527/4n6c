const config = require('../../../config')
const app = getApp()

Page({

  data: {  
    currentPage: 1,
    planScore:[],
    loadingMsg: ''
  },
  onLoad: function (options) {
    
    console.info("打开type：" + options.type);
    //type 2: compay, 1: dept, 0 : person
    var type = options.type
    this.setData({
      type:type
    })

    this.getPageDate(type,1)
  },

  addMore(){

    if (this.data.currentPage == this.data.totalPage){
      wx.showToast({
        title: '没有更多啦...',
        mask: false,
        duration: 1000
      })
    } else {
      this.setData({
        currentPage: this.data.currentPage + 1
      })

      this.getPageDate(this.data.type, this.data.currentPage)
    }

  },
  // 上滑加载更多数据
  onReachBottom: function (event) {
    console.log('上滑动onReachBottom')
    if (this.data.currentPage == this.data.totalPage) {
      /*wx.showToast({
        title: '没有更多啦...',
        mask: false,
        duration: 500
      })*/
    } else {
      this.setData({
        currentPage: this.data.currentPage + 1
      })

      this.getPageDate(this.data.type,this.data.currentPage)
    }
  },


  getPageDate(type,newPage){
    //获取最新消息数据  
    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {
      wx.request({
        url: config.domain + '/targetCr/deptUserSoc',
        data: {
          type: type,
          page: newPage
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          //console.log('【targetCr/targetBar=】', result.data.data.planScore)
          var planScore = result.data.data.planScore
          var currentPage = result.data.data.currentPage
          var totalPage = result.data.data.totalPage
          var total = result.data.data.total

          self.setData({
            planScore: self.data.planScore.concat(planScore),
            currentPage: currentPage,
            totalPage: totalPage
          })

          var loadingMsg = ""
          if (currentPage == totalPage){
            loadingMsg = "已加载完" + total + "行，没有更多了"
          } else {
            loadingMsg = "加载" + self.data.planScore.length + "行，共" + total + "行"
          }

          self.setData({
            loadingMsg: loadingMsg
          })


        },

        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }

  },

  open: function (e) {
    
    var pid = e.currentTarget.dataset.pid      
    wx.navigateTo({
      url: '../targetValue/targetValue?pid=' + pid
    });
  }

});
