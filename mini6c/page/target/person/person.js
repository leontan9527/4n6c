const config = require('../../../config')
var util = require("../../../util/dateutil.js");


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
      pid: 431,
      icon_target: 'pic/target.png'
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

        },

        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }

  },
  data: {
    list: [
      {
        id: 'TAR',
        name: '目标',
        open: true,
        pages: [
          {
            zh: '营业收入',
            value:'28.45 万元',
            url: 'login/login'
          }, {
            zh: '联营收入',
            value: '128.77 万元',
            url: 'get-user-info/get-user-info'
          }, {
            zh: '毛利率',
            value: '28.45 %',
            url: 'request-payment/request-payment'
          }, {
            zh: '新产品研发成功数',
            value: '7 项',
            url: 'share/share'
          }, {
            zh: '安全事故',
            value: '轻微事故：1',
            url: 'share-button/share-button'
          }
        ]
      }, {
        id: 'SOC',
        name: '绩效',
        open: false,
        pages: [
          {
            zh: '2019年度计划',
            value: '待评价',
            url: 'set-navigation-bar-title/set-navigation-bar-title'
          }, {
            zh: '2019年12月',
            value: '98.5',
            url: 'navigation-bar-loading/navigation-bar-loading'
          }, {
            zh: '2019年11月',
            value: '102.5',
            url: 'animation/animation'
          }, {
            zh: '2019年10月',
            value: '88.5',
            url: 'navigator/navigator'
          }, {
            zh: '2019年9月',
            value: '95',
            url: 'pull-down-refresh/pull-down-refresh'
          }, {
            zh: '2019年8月',
            value: '100',
            url: 'animation/animation'
          }
        ]
      }, {
        id: 'ACTW',
        name: '执行率 （ 周 ）',
        open: false,
        pages: [
          {
            zh: '2019年54周',
            value: '80.5%',
            url: 'on-compass-change/on-compass-change'
          }, {
            zh: '2019年53周',
            value: '100%',
            url: 'make-phone-call/make-phone-call'
          }, {
            zh: '2019年52周',
            value: '60%',
            url: 'scan-code/scan-code'
          }, {
            zh: '2019年51周',
            value: '90%',
            url: 'clipboard-data/clipboard-data'
          }
        ]
      }, {
        id: 'ACTM',
        name: '执行率 （ 月 ）',
        open: false,
        pages: [
          {
            zh: '2019年12月',
            value: '80.5%',
            url: 'on-compass-change/on-compass-change'
          }, {
            zh: '2019年11月',
            value: '100%',
            url: 'make-phone-call/make-phone-call'
          }, {
            zh: '2019年10月',
            value: '60%',
            url: 'scan-code/scan-code'
          }, {
            zh: '2019年8月',
            value: '90%',
            url: 'clipboard-data/clipboard-data'
          }
        ]
      }
    ],
    isSetTabBarPage: false,
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
    wx.reportAnalytics('click_view_programmatically', {})
  },
  addAction: function (e) {
    var id = e.currentTarget.dataset.id
    //console.log('【planAddAction/planAddAction】id=', id)
    wx.navigateTo({ url: '../planAddAction/planAddAction?id=' + id })
  }
})
