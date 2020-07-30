const config = require('../../../config')
var util = require("../../../util/dateutil.js")
const app = getApp()

Page({

  onLoad: function (options) {
    this.setData({
      planId: options.id
    })

    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/getStartAndEndDate',
        data: {
          id: self.data.planId
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {

          var dateStart=util.timestampToTime(result.data.dateStart, 3)
          var dateEnd=util.timestampToTime(result.data.dateEnd, 3)
       
          self.setData({
            dateStart: dateStart, 
            dateEnd: dateEnd
          })

        },

        fail({ errMsg }) {
          console.log('【plan/planList fail】', errMsg)
        }
      })
    }

  },
  
  data: {
    showTopTips: false,
    date: "请选择",  
    userId:'',
    userName:'请选择', 

    formData: {      
      action: "",
      name:'',
      outcome:'',
      unFinishRemark:'',
      userId: ''
    },
    rules: [{
        name: 'action',
        rules: { required: true, message: '请输入工作事项内容' },
      }, {
        name: 'date',
        rules: { required: true, message: '请选择完成时间'},
      }, {
        name: 'userId',
          rules: {required: true, message: '请选择检查人'},
    }]
  },
     
  bindDateChange: function (e) {
      this.setData({
          date: e.detail.value,
          [`formData.date`]: e.detail.value
      })
  },
  formInputChange(e) {
      const {field} = e.currentTarget.dataset
      this.setData({
          [`formData.${field}`]: e.detail.value
      })
  },  

  selectOneUser: function (e) {      
      wx.navigateTo({ url: '../../user/suser/suser'})
  },      
              
  submitForm() {
    this.selectComponent('#form').validate((valid, errors) => {
        if (!valid) {
            const firstError = Object.keys(errors)
            if (firstError.length) {
                this.setData({
                    error: errors[firstError[0]].message
                })    
            }
        } else {
          this.saveNewAction(this.data.formData)
        }
    })
        
  },
  saveNewAction: function (formData) {
    const self = this
    var sessionId = app.globalData.sessionId
    if (sessionId) {
     
      wx.request({
        url: config.domain + '/planCr/saveNewAction',
        data: {
          planId: this.data.planId,
          action: formData.action,
          outcome: formData.outcome,
          unFinishRemark: formData.unFinishRemark,
          commitDate: formData.date,
          inspectorId: this.data.userId
        },
        method: 'POST',
        dataType: 'json',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {

          let pages = getCurrentPages();
          let prevPage = pages[pages.length - 2]
          var plan = prevPage.data.plan;
          var planDetail = {
            id:result.data.data,
            planId: self.data.planId,
            action: formData.action,
            outcome: formData.outcome,
            unFinishRemark: formData.unFinishRemark,
            commitDate: formData.date,
            inspectorId: self.data.userId,
            inspectorName:self.data.userName,
            isEditPlan : true
          };
          plan.actionDetails.push(planDetail);

          //添加一条数据后，反应页面剩余项数加1
          let unCommit = prevPage.data.unCommit+1
          let actionsLength = prevPage.data.actionsLength+1
          
          prevPage.setData({
            plan:plan,
            unCommit:unCommit,
            actionsLength:actionsLength
          })
          wx.navigateBack({
            delta: 1
          })
          
        },

        fail({ errMsg }) {
          console.log('【plan/saveNewAction fail】', errMsg)
        }
      })
    }

  },

});
