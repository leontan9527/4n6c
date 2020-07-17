const config = require('../../../config')
var util = require("../../../util/dateutil.js");
const app = getApp()

Page({ 
  data: {
    list: [],    
    icon_target: 'pic/target.png',
    type: 0,
    canReadCompany:false,
    canReadDept:false
  },

  onLoad: function (options) {
    //console.info("onLoad 被调用， this.data.type = " + this.data.type);
    //type 2: compay, 1: dept, 0 : person

    var hasLogin = app.globalData.hasLogin
    var userInfo = app.globalData.userInfo

    if (hasLogin) {
      //去登录。。。
    } else {
      if (userInfo) {
        wx.redirectTo({ url: '../../user/scan-code/scan-code' })
      } else {
        wx.redirectTo({ url: '../../user/login/login' })
      }
    }


    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {
      //console.log('【targetCr/domain=】', this.data.type)
      wx.request({
        url: config.domain + '/targetCr/domain',
        data: {
          type: this.data.type
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          //console.log('【targetCr/domain=】', result.data.data)

          var canReadCompany = result.data.data.canReadCompany
          var canReadDept = result.data.data.canReadDept

          //console.info(canReadCompany);
          var targets = result.data.data.target
          var planScore = result.data.data.planScore
          var excuteWeek = result.data.data.excuteWeek
          var excuteMonth = result.data.data.excuteMonth
          var excuteRate = result.data.data.excuteRate
          var newestOrAvgSoce = result.data.data.newestOrAvgSoce
          var isOpened = false

          if (excuteRate){
            excuteRate = (100.0 * excuteRate).toFixed(1)            
          } else {
            excuteRate = 0.0
          }

          if (newestOrAvgSoce) {
            newestOrAvgSoce = newestOrAvgSoce.toFixed(1)
          } else {
            newestOrAvgSoce = 0.0
          }


          var listDB = []

          if (targets){
            var listTarget = {
              id: 'TAR',
              name: '目标',
              open: (isOpened == false && targets.length > 0),
              pages: []              
            }

            isOpened = isOpened || listTarget.open

            var pagesTarget = []
            for (let i = 0, len = targets.length; i < len; ++i) {
              var page = {
                zh: targets[i].targetName,
                value: targets[i].totalReasonableValue + targets[i].unit,
                pid: targets[i].decomposeDetailId
              }

              pagesTarget.push(page)
              
            }

            listTarget.pages = pagesTarget

            listDB.push(listTarget)
          }
          
          if (planScore) {
            var listSoc = {
              id: 'SOC',
              name: '绩效',
              open: (isOpened == false && planScore.length > 0),
              pages: []
            }

            isOpened = isOpened || listSoc.open

            var pagesScore = []
            for (let i = 0, len = planScore.length; i < len; ++i) {
              var vt = planScore[i].score
              if (planScore[i].status == 1 || planScore[i].status == 9){
                vt = (planScore[i].score ).toFixed(1)
              } else {
                vt = planScore[i].statusName
              }
              var page = {
                zh: planScore[i].title,
                value: vt,              
                pid: planScore[i].id
            }
            pagesScore.push(page)
          }

          listSoc.pages = pagesScore

          listDB.push(listSoc)
        }

        if (excuteWeek) { 
          var listActionWeek = {
            id: 'ACTW',
            name: '执行率 （ 周 ）',
            open: (isOpened == false && excuteWeek.length > 0),
            pages: []
          }

          isOpened = isOpened || listActionWeek.open 

          var pagesWeek = []
          for (let i = excuteWeek.length - 1, len = 0; i >= len; i--) {
            if (excuteWeek[i].planExcuteEfficiency){
              var page = {
                zh: excuteWeek[i].month + "周",
                value: (100.0 * excuteWeek[i].planExcuteEfficiency).toFixed(1)  + "%",
                pid: excuteWeek[i].year
              }
              pagesWeek.push(page)

            }
          }
          listActionWeek.pages = pagesWeek
          listDB.push(listActionWeek)
        }

        if (excuteMonth) {  
          var listActionMonth = {
            id: 'ACTM',
            name: '执行率 （ 月 ）',
            open: (isOpened == false && excuteMonth.length > 0),
            pages: []
          }

          isOpened = isOpened || listActionMonth.open 

          var pagesMonth = []
          for (let i = excuteMonth.length - 1, len = 0; i >= len; i--) {
            if (excuteMonth[i].planExcuteEfficiency) {
              var page = {
                zh: excuteMonth[i].month + "月",
                value: (100.0 * excuteMonth[i].planExcuteEfficiency).toFixed(1) + "%",
                pid: excuteMonth[i].year
              }

              pagesMonth.push(page)
            }
          }
          listActionMonth.pages = pagesMonth
          listDB.push(listActionMonth)
        }  

          self.setData({
            list: listDB,
            excuteRate: excuteRate,
            newestOrAvgSoce: newestOrAvgSoce,
            canReadCompany: canReadCompany,
            canReadDept: canReadDept
          })
         

        },

        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }

  },
  
  kindToggle(e) {
    const id = e.currentTarget.id
    const list = this.data.list
    for (let i = 0, len = list.length; i < len; ++i) {

      if (list[i].id === id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list
    })    
  },

  switchType: function (e) {
    var sType = e.currentTarget.dataset.type
    if (this.data.type == sType){
      //console.info("没有切换" + sType)
    } else{
      //console.info("准备切换" + sType)
      this.setData({
        type: sType       
      })

      this.onLoad()

    }  
  },
  open: function (e) {
    var sType = e.currentTarget.dataset.type
    var pid = e.currentTarget.dataset.pid

    //console.info("数据ID=" + pid)
    if (sType == 'TAR') {
      wx.navigateTo({
        url: '../targetBar/targetBar?type=' + this.data.type + '&pid=' + pid
      });
    }

    if (sType == 'SOC' && (this.data.type == 1 || this.data.type == 2)) {
      //部门绩效列表 
      wx.navigateTo({
        url: '../deptUserSoc/deptUserSoc?type=' + this.data.type
      });
    }

    if (sType == 'SOC' && this.data.type == 0 ) {
      //个人绩效列表 
      wx.navigateTo({
        url: '../targetValue/targetValue?pid=' + pid
      });
    }


    if (sType == 'ACTW') {
      wx.navigateTo({
        url: '../excuteWeek/excuteWeek?type=' + this.data.type
      });
    }

    if (sType == 'ACTM') {
      wx.navigateTo({
        url: '../excuteMonth/excuteMonth?type=' + this.data.type
      });
    }

  }

})
