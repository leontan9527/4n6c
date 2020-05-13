const config = require('../../../config')
const app = getApp()

Page({

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log('options.userId===='+options.userId)
    var url=config.domain + '/documentController/detailForMobilePage?id='+options.documentId+'&userId='+options.userId+'&organizationId='+options.organizationId

    this.setData({
      documentId: options.documentId,
      userId: options.userId,
      organizationId: options.organizationId,
      httpDomainDocumentAddr:url
    })
    //获取最新消息数据
    //this.getDocumentDetail()
  },

  getDocumentDetail: function (e) {

    const self = this
    var sessionId = app.globalData.sessionId
    
    if (sessionId) {
      wx.request({
        url: config.domain + '/documentCr/documentDetail',
        data: {
          id:self.data.documentId,
          userId:self.data.userId,
          organizationId:self.data.organizationId
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
  
          if(result.data.success){
            
            var redDoc=result.data.data
            
            self.setData({
              redDoc: redDoc,
            })

            console.log('redDoc=='+self.data.redDoc)
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


})