const config = require('../../../config')
const app = getApp()

Page({
  
  onLoad: function(options){   
    
    console.info('kpiName==='+options.kpiName)
    this.setData({     
        id: options.id,  
        kpiName: options.kpiName, 
        targetIndexId: options.targetIndexId, 
        noVotes:[]
    })

    //获取最新消息数据
    const self = this
    var sessionId = app.globalData.sessionId

    console.info('1. onLoad 开始登陆,使用Cookie=')
    if (sessionId) {
      wx.request({
        url: config.domain + '/planCr/getNoVoteValue',
        data: {
          id: self.data.id
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          var noVotes = result.data.data
          var noVotes = JSON.parse(noVotes); 
          self.setData({
            noVotes: noVotes
          })
        },

        fail({ errMsg }) {
          console.log('【plan/noVotes fail】', errMsg)
        }
      })
    }

  },

  selectNoNotes(e) {

    var seq = e.currentTarget.dataset.seq
    var single=e.currentTarget.dataset.single
    
    const noVotes = this.data.noVotes
    console.log('seq===：',seq)
    console.log('single===：',single)

    let index;
    for (let i = 0; i < noVotes.length; i ++ ){				
      if (seq == noVotes[i].seq){
        index = i;
        break;
      } 
    }
    if ( noVotes[index].selected == false ){
      if (noVotes[index].single == true){
        for (let i = 0; i < noVotes.length; i ++ ){				
          //1.如果选择的是排他项，需要将其多选排除解除
          noVotes[i].selected = false;	
          noVotes[i].value = 0;
        }
      } else {
        //2.如果选择的是多选项，需要将排他项解除
        for (let i = 0; i < noVotes.length; i ++ ){				
          if (noVotes[i].single == true){
            noVotes[i].selected = false;
            noVotes[i].value = 0;
            break;
          }
        }
      }
      noVotes[index].selected = true;
      noVotes[index].value = 1;
    } else {
      noVotes[index].selected = false;
      noVotes[index].value = 0;
    }
  
    this.setData({
      noVotes:noVotes
    })

  },

  getFocusInputValue: function(e) {

    var seq = e.currentTarget.dataset.seq
    const noVotes = this.data.noVotes
    for (let i = 0; i < noVotes.length; i ++ ){				
      if(seq==noVotes[i].seq){
        noVotes[i].selected = true;
        break
      }
    }

    this.setData({
      noVotes:noVotes
    })
  },

  getBlurInputValue: function(e) {

    var seq = e.currentTarget.dataset.seq
    var value = e.detail.value
   
    const noVotes = this.data.noVotes
    for (let i = 0; i < noVotes.length; i ++ ){				
      if(seq==noVotes[i].seq){
        noVotes[i].value = value;
        break
      }
    }

    this.setData({
      noVotes:noVotes
    })
  },

  //输入实际值时，调用的方法       开始
  computeNoVoteValue(e) {

    const self = this
    var kpiId= self.data.id
    var targetIndexId= self.data.targetIndexId
    var isCheckValue=true;           
    const noVotes = self.data.noVotes
    var j=0;
    const selectNoVotes = []   //只将页面勾选的电网项传递给后台
    for (let i = 0; i < noVotes.length; i ++ ){				
      if(noVotes[i].selected == true){
        selectNoVotes[j]=noVotes[i]
        j++;
      }
    }

    //该循环用于判断是否填写实际值
    if(j>0){

      for (let i = 0; i < selectNoVotes.length; i ++ ){				
        if(selectNoVotes[i].value == undefined){
          isCheckValue=false
          break
        }
      }
    }else{
      isCheckValue=false
    }

    //检验必须填写发生次数
    if(isCheckValue==false){
      var errormsg='必须填写发生次数!';
      if(j==0){
        errormsg='没有选择任何一项!';
      }

      wx.showModal({  
        title: '提示',  
        content: errormsg,  
        showCancel:false,
        confirmText:'关闭',
        success: function(res) {  
            
        }  
      }) 
      return;
    }

    var sessionId = app.globalData.sessionId

    wx.request({
      url: config.domain + '/planCr/isHasTargetRules',
      data : {
        id: targetIndexId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'JSESSIONID=' + sessionId
      },
      success(result) {
        if(result.data.success==true){

          let actualValueString = "";
          let score = 0;
          let flag=0;
          //console.log("noVotes ...= "+ JSON.stringify(noVotes));
          for (let i = 0; i < selectNoVotes.length; i ++ ){	

            console.log('selectNoVotes[i]===='+selectNoVotes[i].value)
            if(selectNoVotes[i].value==undefined){
              selectNoVotes[i].value=0;
            }
            if (i > 0){
              actualValueString = actualValueString + "; ";
            }
            if (selectNoVotes[i].single == true){
              actualValueString =  actualValueString + selectNoVotes[i].name;	
              score = score + selectNoVotes[i].score * selectNoVotes[i].value;
              if(score<0){
                score=0;
              }
              flag=1;
            } else {
              actualValueString =  actualValueString + selectNoVotes[i].name + ":" + selectNoVotes[i].value + "次";
              score = Math.abs(score) + Math.abs(selectNoVotes[i].score * selectNoVotes[i].value);
            }
          }
          if(flag==0){
            score=-score;
          }
                          
          wx.request({
            url: config.domain + '/planCr/savekpiActualValue',
            data : {
              id:kpiId,
              isNoVote: true,
              isMonthRules: true,
              actualValueString: actualValueString,
              actualValueJson:JSON.stringify(noVotes),
              score:score
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
              'Cookie': 'JSESSIONID=' + sessionId
            },
            success(result) {
                //填写成功自动返回上级页面
                if(result.data.success==true){
                  console.log('find:'+result.data.data[0])
                  var scoreValue = result.data.data[0].toFixed(2);
                  var status = result.data.data[2];                               
                  //更新DATE								
                  let pages = getCurrentPages()
                  let prevPage = pages[pages.length - 2]
                  var plan = prevPage.data.plan

                  let unCommit = prevPage.data.unCommit-1
     
                  for (let i = 0; i < plan.kpiDetails.length; i++ ){
   
                      if (kpiId == plan.kpiDetails[i].id){	
                        plan.kpiDetails[i].actualValueString = actualValueString;
                        plan.kpiDetails[i].actualValueJson = JSON.stringify(noVotes);
                        plan.kpiDetails[i].score = score;
                        plan.kpiDetails[i].status = status;
                        break;
                      }  
                  }	 
                  
                  prevPage.setData({
                      plan:plan,
                      unCommit:unCommit
                  })
                  wx.navigateBack({
                      delta: 1
                  })

                  self.setData({
                      plan: plan
                  })
                }
            },
            fail({ errMsg }) {
              //创建失败提示错误信息代码开始
            }
          })
        }
      },
      fail({ errMsg }) {
        console.log('【plan/list fail】', errMsg)
      }
    })
  }, 
 
  navigateBack() {
    wx.navigateBack()
  },

})
