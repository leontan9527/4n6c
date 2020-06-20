const config = require('../../../config')
const app = getApp()

Page({

  data: {
    planCycle:0,
    deptId:'',
    userId:'',
    year:'',
    month:'',
    startDate:'',
    endDate:'',
    contentlist: [],   
    pageSize:30,//返回数据的个数 
    pageNumber:1,
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏 
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
    isShowDept:false,
    isShowUser:false,
    objectArray: [
      {
        id: 0,
        name: '周计划'
      },
      {
        id: 1,
        name: '月计划'
      },
      {
        id: 2,
        name: '年计划'
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPlanData()
  },

  getPlanData: function (e) {

    const self = this
    var sessionId = app.globalData.sessionId
    if(self.data.deptId==null){
      self.data.deptId=''
    }
    if(self.data.userId==null){
      self.data.userId=''
    }
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/queryPlanData',
        data: {
          deptId:self.data.deptId,
          userId:self.data.userId,
          year:self.data.year,
          month:self.data.month,
          planCycle:self.data.planCycle,
          startDate:self.data.startDate,
          endDate:self.data.endDate,
          pageSize: self.data.pageSize,
          pageNumber:self.data.pageNumber
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
  
          var contentlistTem = self.data.contentlist;
          if(result.data.success){
            
            var contentlist=result.data.items
            var totalPage=result.data.totalPage
            var isQueryDept=result.data.isQueryDept
            if (self.data.pageNumber == 1) {
              contentlistTem = []
            }
            
            if(contentlist!=null){
              contentlist=contentlistTem.concat(contentlist)
            }else{
              contentlist=contentlistTem
            }

            self.setData({
              contentlist: contentlist,
              totalPage:totalPage,
              searchLoading:false,
            })
          }
        },
  
        fail({ errMsg }) {
          console.log('【plan/list fail】', errMsg)
        }
      })
    }
  },

  toGetDeptListFun(e) {
    //获取最新用户数据
    const self = this
    var stype = e.currentTarget.dataset.stype
    if(stype==1){
      self.setData({
        isShowDept:true,
        isShowUser:false,
      })
    }else{
      self.setData({
        isShowDept:false,
        isShowUser:true,
      })
    }

    var sessionId = app.globalData.sessionId
    
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/getDeptList',
        data: {
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          var deptList=result.data.deptList
          var deptLength=deptList.length
          var userList=result.data.userList
          var userLength=userList.length
          if(userLength<deptLength){
            userLength=deptLength*58
          }else{
            userLength=userLength*58
          }
          if(userLength>300){
            userLength=300
          }

          self.setData({
            deptList:deptList,
            userList:userList,
            userLength:userLength
          })
        },
        fail({ errMsg }) {
          console.log('【userCr/deptList fail】', errMsg)
        }
      })
    }
  },

  toGetUserListFun(e) {

    var deptId = e.currentTarget.dataset.deptid
    if(deptId==null){
      deptId=''
    }
    //获取最新用户数据
    const self = this
    var sessionId = app.globalData.sessionId
    
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/getUserList',
        data: {
          deptId:deptId
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
        
          var deptList=self.data.deptList
          var deptLength=deptList.length
          var userList=result.data.userList
          var userLength=userList.length
          if(userLength<deptLength){
            userLength=deptLength*58
          }else{
            userLength=userLength*58
          }
          if(userLength>300){
            userLength=300
          }

          self.setData({
            userList:userList,
            userLength:userLength
          })
        },
        fail({ errMsg }) {
          console.log('【userCr/userList fail】', errMsg)
        }
      })
    }
  },

  getDeptIdFun(e){
    var deptId = e.currentTarget.dataset.id
    this.setData({
      deptId:deptId,
      isShowDept:false,
    })
    this.getPlanData()
  },

  getUserIdFun(e){
    var userId = e.currentTarget.dataset.id
    this.setData({
      userId:userId,
      isShowUser:false,
    })
    this.getPlanData()
  },

  toSetFileFun: function (e) { 
    this.setData({
      isShowDept:false,
      isShowUser:false,
    })
  },

  bindDateChange: function (e) {

    var type = e.currentTarget.dataset.type
    var selectData = e.detail.value
    if(type==1){
      var arr=selectData.split("-");
      var year=arr[0]
      var month=arr[1]
      this.setData({
        year: year,
        month: month,
      })
    }else if(type==2){
      this.setData({
        year: selectData,
      })
    }else if(type==3){
      this.setData({
        startDate: selectData,
      })
    }else if(type==4){
      this.setData({
        endDate: selectData,
      })
    }

    this.getPlanData()
  },

  toGetPlanCycleFun: function (e) {
    this.setData({
      planCycle: e.detail.value,
      isShowDept:false,
      isShowUser:false,
    })

    this.getPlanData()
  },

  toPlanDetail: function (e) {
    
    if(this.data.isShowDept){
      this.setData({
        isShowDept:false,
      })
    }else if(this.data.isShowUser){
      this.setData({
        isShowUser:false,
      })
    }else{
      var id = e.currentTarget.dataset.id
      var planCycle = e.currentTarget.dataset.plancycle
      var isToEditPage = e.currentTarget.dataset.istoeditpage
      if(isToEditPage){
        if(planCycle==0){
          wx.navigateTo({ url: '../planDetailWeek/planDetailWeek?id=' + id })
        }else if(planCycle==1){
          wx.navigateTo({ url: '../planDetailMonth/planDetailMonth?id=' + id })
        }else{
          wx.navigateTo({ url: '../planDetailYear/planDetailYear?id=' + id })
        }
      }else{  
        wx.navigateTo({ url: '../planDetailShow/planDetailShow?id=' + id + '&planCycle='+planCycle })
      }
    }

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    let that = this;  
    that.setData({  
      pageNumber: 1,  //每次触发上拉事件，把searchPageNum+1  
      searchLoading: false, //"上拉加载"的变量，默认false，隐藏 
      searchLoadingComplete: false  //“没有数据”的变量，默认false，隐藏
    });  

    that.getPlanData()//获取最新数据
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },
})