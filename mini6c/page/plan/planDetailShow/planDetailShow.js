const config = require('../../../config')
var util = require("../../../util/dateutil.js");

const app = getApp()

Page({

  onLoad: function (options) {
    console.info("打开：" + options.id);

    this.setData({
      pid: options.id,
      planCycle: options.planCycle
    })

    //获取最新消息数据
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
          id: this.data.pid
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {

          var plan=result.data.data
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
            plan: plan
          })

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
    console.log('【planAddAction/planAddAction】id=', id)
    wx.navigateTo({ url: '../planAddAction/planAddAction?id=' + id })
  }
})
