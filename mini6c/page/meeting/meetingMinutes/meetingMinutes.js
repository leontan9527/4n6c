const config = require('../../../config')
const app = getApp()

Page({

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var url=config.domain + '/meetingMinutesController/mobileMeetingMinutes?meetingId='+options.meetingId

    this.setData({
      meetingId: options.meetingId,
      httpDomainDocumentAddr:url,
      httpDownFileAddr:config.domain + '/fileController/download',
      httpPreviewImageAddr:config.domain,
      uuid:options.uuid,
      suffixName:options.suffixName
    })
    //获取最新消息数据
    if(options.uuid!=undefined){
        this.downloadFile()
    }
  },

   /**
  * 下载文件并预览
  */
  downloadFile: function (e) {
   
    //let type = e.currentTarget.dataset.type
    //let url = e.currentTarget.dataset.url
    let type = this.data.suffixName
    let url=this.data.httpDownFileAddr+'?uuid='+this.data.uuid+'&uploadFileType=9'
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