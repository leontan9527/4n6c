const config = require('../../config')

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    year:'',
    month:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    this.getExcuteProcress()
  },

  toPostFun: function (e) {

    var flag = e.currentTarget.dataset.flag
    var month=this.data.month
    var year=this.data.year
    if(flag==1){
      month=this.data.month-1
      if(month==0){
        year=this.data.year-1
        month=12;
      }
    }else{
      month=this.data.month+1
      if(month==13){
        year=this.data.year+1
        month=1;
      }
    }
    this.setData({
      year:year,
      month:month
    })

    this.getExcuteProcress()
  },

  getExcuteProcress: function (e) {

    const self = this
    var sessionId = app.globalData.sessionId
    
    if (sessionId) {
      wx.request({
        url: config.domain + '/targetCr/getExcuteProcress',
        data: {
          year:self.data.year,
          month:self.data.month
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          self.setData({
            targetMonthExcute: result.data.targetMonthExcute, 
            targetMinExcuteRadioDept: result.data.targetMinExcuteRadioDept,
            targetMAXExcuteRadioDept: result.data.targetMAXExcuteRadioDept,
            monthExcuteBulletinBoard: result.data.monthExcuteBulletinBoard,
            monthMinExcuteRadioDept: result.data.monthMinExcuteRadioDept,
            monthMaxExcuteRadioDept: result.data.monthMaxExcuteRadioDept,
            weekExcuteBulletinBoard: result.data.weekExcuteBulletinBoard,
            weekMinExcuteRadioDept: result.data.weekMinExcuteRadioDept,
            weekMaxExcuteRadioDept: result.data.weekMaxExcuteRadioDept,
            year:result.data.year,
            month:result.data.month,
            curYear:result.data.curYear,
            curMonth:result.data.curMonth,
            startDate:result.data.startDate,
            endDate:result.data.endDate,
          })
        },

        fail({ errMsg }) {
          console.log('3.【home/message fail】', errMsg)          
        }
      })      
    }
  },

  toTargetFun: function (e) {
    wx.switchTab({ url: '../target/dashboard/dashboard' })
  },

  toMonthQueryFun: function (e) {
    var month=this.data.month
    var year=this.data.year
    wx.navigateTo({ url: '../plan/planQuery/planQuery?planCycle=1'+'&year='+year+'&month='+month+'&isExcute=1'})
  },

  toWeekQueryFun: function (e) {
    var startDate=this.data.startDate
    var endDate=this.data.endDate
    wx.navigateTo({ url: '../plan/planQuery/planQuery?planCycle=0'+'&startDate='+startDate+'&endDate='+endDate+'&isExcute=1'})
  },

})