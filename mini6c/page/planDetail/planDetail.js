const config = require('../../config')
var util = require("../../util/dateutil.js");


const app = getApp()

Page({

  onLoad: function (options) {
    console.info("打开：" + options.id);

    //var arr = '1585843200000';//测试
    //var date = new Date(arr);
    //var clientDate = new Date() // 客户端时间
    //console.info("clientDate=" + clientDate);

    //console.log(util.formatDateTime(this.data.clientDate, true))



    this.setData({
      pid: options.id
    })

    

    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    //console.info('1. onLoad this.pid' + this.data.pid)
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/detailMonth',
        data: {
          id: this.data.pid
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          //console.log('【plan/detailMonth=】', result.data.data)
          self.setData({
            plan: result.data.data
          })

          //var temp = result.data.data.actionDetails[0].commitDate
          
          //console.log('【temp=】', util.timestampToTime(temp, true))
          //console.log('【temp=】', util.timestampToTime(temp,false))

          var title = result.data.data.title

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
    //console.log('【planAddAction/planAddAction】id=', id)
    wx.navigateTo({ url: '../planAddAction/planAddAction?id=' + id })
  }
})
