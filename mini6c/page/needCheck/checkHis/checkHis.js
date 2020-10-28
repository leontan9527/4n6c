const config = require('../../../config')
var util = require("../../../util/dateutil.js");
const app = getApp()

Page({

  data: {
    kpiPage: [],
    actionPage: [],
    num: 0,
    theDate:'',
    theDateStr : '',
    planCycle:0,
    year:'',
    seq:''
  },

  onLoad: function (options) { 
    var planCycle=options.planCycle
    var cycle
    if(planCycle==0){
      cycle='周'
    }else if(planCycle==1){
      cycle='月'
    }else if(planCycle==2){
      cycle='年'
    }else{
      cycle='周'
    }
    this.setData({
      cycle: cycle,
      planCycle:planCycle
    })
    this.getData()
  },
  getData(){
    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {

      wx.request({
        url: config.domain + '/check/checkHis',
        data: {
          year:self.data.year,
          seq:self.data.seq,
          planCycle:self.data.planCycle,
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {          

          var kpiPage = result.data.data.kpiPage
          var actionPage = result.data.data.actionPage
          var title = result.data.data.yearMonth          
          console.log('result.data.data.year==='+result.data.data.year)
          var num = 0

          if (kpiPage && kpiPage.length > 0) {
            num = num + kpiPage.length
          }

          if (actionPage && actionPage.length > 0) {
            num = num + actionPage.length
          }
          
          self.setData({
            kpiPage: kpiPage,
            actionPage: actionPage,
            num: num,
            title: title,
            year:result.data.data.year,
            seq:result.data.data.seq
          })

        },

        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }
  },
  preMonth:function(){
    var seq=this.data.seq-1
    var year
    if(seq==0){
      year=this.data.year-1
    }else{
      year=this.data.year
    }
    this.setData({
      year:year,
      seq: seq
    })
    this.getData()

  },
  nextMonth: function () {
    var seq=this.data.seq+1;   
    this.setData({
      seq: seq
    })
    this.getData()
  },

})
