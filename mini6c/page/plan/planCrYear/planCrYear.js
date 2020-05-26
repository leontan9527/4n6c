const config = require('../../../config')
const app = getApp()

Page({
  
  onLoad: function(){   
    
    this.setData({     
        hasUserInfo: false,   
        planList: ''
    })

    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/createYearPaln',
        data: {
          api: "list"
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          self.setData({
            planList: result.data.data
          })
        },

        fail({ errMsg }) {
          console.log('【plan/planList fail】', errMsg)
        }
      })
    }

  },

  radioChange(e) {

    const items = this.data.planList
    for (let i = 0, len = items.length; i < len; ++i) {
   
      if(items[i].seq==e.detail.value){
        items[i].selected=true
      }else{
        items[i].selected=false
      }
    }
    this.setData({
      planList:items
    })
  },

  //创建年计划方法
  createYearPaln: function(){   
    
    const items = this.data.planList
    let set = [];
    for (let i = 0; i < items.length; i ++ ){
      if ( items[i].selected == true){	
        set	= items[i];
      } 
    }
      
    var sessionId = app.globalData.sessionId;
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/createYear',
        data : {
          year: set.year
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
 
            if(result.data.success){
              //创建成功，跳转到计划列表页面
              var id = result.data.data
              wx.redirectTo({ url: '../planDetailYear/planDetailYear?id=' + id})
            }else{ 
              //创建失败，提示错误信息
              var errorArray=result.data.data
              if(errorArray!=undefined){
                var errormsg=errorArray.join(' ');

                wx.showModal({  
                  title: '提示',  
                  content: errormsg,  
                  showCancel:false,
                  confirmText:'关闭',
                  success: function(res) {  
                      
                  }  
                }) 
              }
            
            }
        },
        fail({ errMsg }) {
          //创建失败提示错误信息代码开始
        }
      })
    }
  },

  navigateBack() {
    wx.navigateBack()
  },

})
