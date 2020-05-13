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
      httpDomainDocumentAddr:url,
      httpDownFileAddr:config.domain + '/fileController/download',
      httpPreviewImageAddr:config.domain,
    })
    //获取最新消息数据
    this.getDocumentDetail()
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

   /**
  * 下载文件并预览
  */
  downloadFile: function (e) {
   
    let type = e.currentTarget.dataset.type
    let url = e.currentTarget.dataset.url

    let fileName = new Date().valueOf();

    wx.downloadFile({
      url: url,
      filePath: wx.env.USER_DATA_PATH + '/' + fileName + type,
      success: function (res) {
        //var filePath = res.tempFilePath;
        var filePath = res.filePath;
        console.log("filePath====="+filePath);
        wx.openDocument({
          filePath: filePath,
          success: function (res) {
            console.log('打开文档成功')
          },
          fail: function (res) {
            console.log(res);
          },
          complete: function (res) {
            console.log(res);
          }
        })
      },
      fail: function (res) {
        console.log('文件下载失败');
      },
      complete: function (res) { },
    })
  },

   //预览单个图片
   previewImage: function (e) {
    let that = this;
    let src = e.currentTarget.dataset.src;
    console.log(src)
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: [src] // =============重点重点=============
    })
 
  },

})