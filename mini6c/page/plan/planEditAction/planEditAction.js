const config = require('../../../config')
var util = require("../../../util/dateutil.js")
const app = getApp()

Page({

  onLoad: function (options) {
    var detailId=options.detailId;
    if (detailId== undefined) {
      detailId=''
    }
    this.setData({
      planId: options.planId,
      id: detailId,
      actionDetail:'',
    })
    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId
    if (sessionId && detailId != undefined) {
      wx.request({
        url: config.domain + '/planCr/getPlanActionDetailById',
        data: {
          id: self.data.id
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          var actiondetail = result.data.data
          var date=util.timestampToTime(actiondetail.commitDate, 3)
          let setformDataValue = {      
            action: actiondetail.action,
            name: actiondetail.name,
            outcome: actiondetail.outcome,
            unFinishRemark: actiondetail.unFinishRemark,
            inspectorId: actiondetail.inspectorId,
            inspectorName:actiondetail.inspectorName,
            date:date
          }
          var dateStart=util.timestampToTime(actiondetail.dateStart, 3)
          var dateEnd=util.timestampToTime(actiondetail.dateEnd, 3)
          self.setData({
            formData: setformDataValue,
            dateStart: dateStart, 
            dateEnd: dateEnd,
            isBringInto:actiondetail.isBringInto
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
    formData: '',
    rules: [{
        name: 'action',
        rules: { required: true, message: '请输入工作事项内容' },
      }, {
        name: 'date',
        rules: { required: true, message: '请选择完成时间'},
      }, {
        name: 'inspectorId',
          rules: {required: true, message: '请选择检查人'},
    }],
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
          id:self.data.id,
          planId: self.data.planId,
          action: formData.action,
          outcome: formData.outcome,
          unFinishRemark: formData.unFinishRemark,
          commitDate: formData.date,
          inspectorId: self.data.userId
        },
        method: 'POST',
        dataType: 'json',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {

          let pages = getCurrentPages()
          let prevPage = pages[pages.length - 2]
          var plan = prevPage.data.plan
          for(let i=0;i<plan.actionDetails.length;i++){

            if (self.data.id == plan.actionDetails[i].id){
              plan.actionDetails[i].action =  formData.action;
              plan.actionDetails[i].outcome =  formData.outcome;
              plan.actionDetails[i].commitDate =  formData.date;
              plan.actionDetails[i].inspectorId =  self.data.userId;
              plan.actionDetails[i].inspectorName =  formData.inspectorName;
              plan.actionDetails[i].unFinishRemark =  formData.unFinishRemark;
              plan.actionDetails[i].isEditPlan = true;
              break;
            } 		
          }
          
          prevPage.setData({
            plan:plan
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

    console.log('【2.End wx.request】')

  },


});
