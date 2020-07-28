const config = require('../../../config')
const app = getApp()

Page({

  data: {
    icon_xiangxia: '../../images/xiangxia.png',
    showBackView:false,
    planCycle:0,
    deptId:'',
    userId:'',
    year:'',
    month:'',
    startDate:'',
    endDate:'',
    oldPlanCycle:0,
    oldDeptId:'',
    oldUserId:'',
    oldYear:'',
    oldMonth:'',
    oldStartDate:'',
    oldEndDate:'',
    selectDeptId:'',
    contentlist: [],   
    pageSize:10,//返回数据的个数 
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

  onShow() { 
    this.getPlanData(true,false)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const self = this
    if(options.isExcute!=undefined && options.isExcute!=''){
      if(options.planCycle!=undefined && options.planCycle!=''){
        self.setData({
          planCycle:options.planCycle,
          oldPlanCycle:options.planCycle,
        })
      }
      if(options.year!=undefined && options.year!=''){
        self.setData({
          year:options.year,
          oldYear:options.year,
        })
      }
      if(options.month!=undefined && options.month!=''){
        self.setData({
          month:options.month,
          oldMonth:options.month,
        })
      }
      if(options.startDate!=undefined && options.startDate!=''){
        self.setData({
          startDate:options.startDate,
          oldStartDate:options.startDate,
        })
      }
      if(options.endDate!=undefined && options.endDate!=''){
        self.setData({
          endDate:options.endDate,
          oldEndDate:options.endDate,
        })
      }
    }else{
      var sessionId = app.globalData.sessionId
      //初始化查询条件
      wx.request({
        url: config.domain + '/planCr/setInitQueryCondition',
        data: {},
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
  
            var startDate=result.data.startDate
            var endDate=result.data.endDate
            self.setData({
              startDate:startDate,
              endDate: endDate,
              oldStartDate:startDate,
              oldEndDate:endDate,
            })
        },
        fail({ errMsg }) {
          console.log('【plan/list fail】', errMsg)
        }
      })
    }
    
    this.getPlanData(false,false)//获取查询数据
  },

  getPlanData: function (isRefresh,isReachBottom) {

    const self = this
    self.setData({
      showBackView: false
    })
    var sessionId = app.globalData.sessionId
    if(self.data.deptId==null){
      self.data.deptId=''
    }
    if(self.data.userId==null){
      self.data.userId=''
    }
    var deptId=self.data.deptId
    var userId=self.data.userId
    var year=self.data.year
    var month=self.data.month
    var planCycle=self.data.planCycle
    var startDate=self.data.startDate
    var endDate=self.data.endDate
    let oldDeptId=self.data.oldDeptId
    let oldUserId=self.data.oldUserId
    let oldYear=self.data.oldYear
    let oldMonth=self.data.oldMonth
    let oldPlanCycle=self.data.oldPlanCycle
    let oldStartDate=self.data.oldStartDate
    let oldEndDate=self.data.oldEndDate
    /*
    因为做了分页处理，翻到下一页的时候需要把以前的数据连接起来，但是如果条件发生变化则需要清空以前的数据，即从第一页开始查询，为了达到目的，设置了两套变量来存放查询条件已old开头的变量用于存放老查询条件，目的时为了和最新的查询条件做比对，用于检查最新的查询条件是否发生了变化，发生了变化则清空以前所有查询数据，查询重第一页开始
    */
   var deptOrUserIdIsNull=false
   if(!isReachBottom && (deptId=='' || userId=='')){
    deptOrUserIdIsNull=true
   }
    var isContent=true
    if(isRefresh || deptOrUserIdIsNull || deptId!=oldDeptId  || userId!=oldUserId || year != oldYear || month!=oldMonth 
      || planCycle!=oldPlanCycle || startDate!=oldStartDate || endDate!=oldEndDate){
        isContent=false;
        self.setData({  
          oldPlanCycle:planCycle,
          oldDeptId:deptId,
          oldUserId:userId,
          oldYear:year,
          oldMonth:month,
          oldStartDate:startDate,
          oldEndDate:endDate,
          pageNumber: 1, //条件发生变化，数据从第一页开始查询 
          searchLoading: false, //"上拉加载"的变量，默认false，隐藏 
          searchLoadingComplete: false  //“没有数据”的变量，默认false，隐藏
        }); 
    }

    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/queryPlanData',
        data: {
          deptId:deptId,
          userId:userId,
          year:year,
          month:month,
          planCycle:planCycle,
          startDate:startDate,
          endDate:endDate,
          pageSize: self.data.pageSize,
          pageNumber:self.data.pageNumber
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          var contentlistTem=[]
          if(isContent==false){
              contentlistTem=[]
          }else{
              contentlistTem = self.data.contentlist;
          }
          if(result.data.success){
            var contentlist=result.data.items
            var totalPage=result.data.totalPage
            if(contentlistTem.length!=0){
              contentlist=contentlistTem.concat(contentlist)
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
    if(this.data.isShowDept==true){
      self.setData({
        isShowDept:false,
      })
    }else{
      self.setData({
        isShowDept:true,
      })
    }
    self.setData({
      isShowUser: false,
      showBackView: true
    })

    var sessionId = app.globalData.sessionId
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/getDeptList',
        data: {},
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
          if(userLength>350){
            userLength=350
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

  toGetUserDeptListFun(e) {
    //获取最新用户数据
    const self = this
    var stype = e.currentTarget.dataset.stype
    if(this.data.isShowUser==true){
      self.setData({
        isShowUser:false,
      })
    }else{
      self.setData({
        isShowUser:true,
      })
    }
    self.setData({
      isShowDept:false,      
      showBackView: true
    })

    var sessionId = app.globalData.sessionId
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/getUserDeptList',
        data: {
          deptId:self.data.deptId,
          userDeptId:self.data.selectDeptId
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
          if(userLength>350){
            userLength=350
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

    const self = this
    var deptId = e.currentTarget.dataset.deptid
    if(deptId==null){
      deptId=''
    }
    self.setData({
      selectDeptId: deptId,
      showBackView: true
    })
    //获取最新用户数据
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
    this.setData({
      oldDeptId:this.data.deptId,
    })
    var deptId = e.currentTarget.dataset.id
    this.setData({
      deptId:deptId,
      isShowDept:false,
      showBackView: true
    })
    this.getPlanData(false,false)
  },

  getUserIdFun(e){
    this.setData({
      oldUserId:this.data.userId,
      showBackView: true
    })
    var userId = e.currentTarget.dataset.id
    this.setData({
      userId:userId,
      isShowUser:false,
    })
    this.getPlanData(false,false)
  },

  toSetFileFun: function (e) { 
    this.setData({
      isShowDept:false,
      isShowUser:false,
      showBackView:true
    })
  },

  bindDateChange: function (e) {
    var type = e.currentTarget.dataset.type
    var selectData = e.detail.value
    if(type==1){
      this.setData({
        oldYear: this.data.year,
        oldMonth: this.data.month,
      })
      var arr=selectData.split("-");
      var year=arr[0]
      var month=arr[1]
      this.setData({
        year: year,
        month: month,
      })
    }else if(type==2){
      this.setData({
        oldYear: this.data.year,
      })
      this.setData({
        year: selectData,
      })
    }else if(type==3){
      this.setData({
        oldStartDate: this.data.startDate,
      })
      this.setData({
        startDate: selectData,
      })
    }else if(type==4){
      this.setData({
        oldEndDate: this.data.endDate,
      })
      this.setData({
        endDate: selectData,
      })
    }

    this.getPlanData()
  },

  toGetPlanCycleFun: function (e) {
    //console.info("类别："+e.detail.value);

    this.setData({
      oldPlanCycle: this.data.planCycle,
    })
    this.setData({
      planCycle: e.detail.value,
      isShowDept:false,
      isShowUser: false,
      showBackView: true
    })

    this.getPlanData(false,false)
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
      var userName = e.currentTarget.dataset.username
      if(isToEditPage){
        if(planCycle==0){
          wx.navigateTo({ url: '../planDetailWeek/planDetailWeek?id=' + id +'&userName='+userName})
        }else if(planCycle==1){
          wx.navigateTo({ url: '../planDetailMonth/planDetailMonth?id=' + id+'&userName='+userName })
        }else{
          wx.navigateTo({ url: '../planDetailYear/planDetailYear?id=' + id+'&userName='+userName })
        }
      }else{  
        wx.navigateTo({ url: '../planDetailShow/planDetailShow?id=' + id + '&planCycle='+planCycle +'&userName='+userName})
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

    that.getPlanData(true,false)//获取最新数据
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效 
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('上滑动onReachBottom')
    let that = this;  
    if(!that.data.searchLoadingComplete){ 
      let pageNumber =that.data.pageNumber+1
      that.setData({  
        pageNumber: pageNumber,  //每次触发上拉事件，把searchPageNum+1 
        searchLoading:true, 
      }); 

      if(pageNumber>=that.data.totalPage){
        that.setData({  
          searchLoadingComplete: true,  //每次触发上拉事件，把searchPageNum+1  
          searchLoading:false,
        });
      }
      that.getPlanData(false,true)//获取最新数据
    }  
  },
  toHideBackView: function () {   
    this.setData({      
      showBackView: false,
      isShowDept: false,
      isShowUser: false
    })
  }
})