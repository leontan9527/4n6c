import * as echarts from '../../common/ec-canvas/echarts';
const config = require('../../../config')
const app = getApp()

let chart = null;

var option = {
  color: ['#37a2da', '#67e0e3'],
  tooltip: {
    trigger: 'axis',
    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
      type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
    },
    confine: true
  },
  legend: {
    data: ['目标值', '实际值']
  },
  grid: {
    left: 20,
    right: 20,
    bottom: 15,
    top: 40,
    containLabel: true
  },
  xAxis: [
    {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      axisLabel: {
        color: '#666'
      }
    }
  ],
  yAxis: [
    {
      type: 'category',
      axisTick: { show: false },
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      axisLabel: {
        color: '#666'
      }
    }
  ],
  series: [
    {
      name: '目标值',
      type: 'bar',
      label: {
        normal: {
          show: true,
          position: 'inside'
        }
      },
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      itemStyle: {
        // emphasis: {
        //   color: '#37a2da'
        // }
      }
    },
    {
      name: '实际值',
      type: 'bar',
      stack: '总量',
      label: {
        normal: {
          show: true
        }
      },
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      itemStyle: {
        // emphasis: {
        //   color: '#32c5e9'
        // }
      }
    }
  ]
};

function initChart(canvas, width, height, dpr) {

  //console.info("initChart:width=" + width);

  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  chart.setOption(option);
  return chart;
}

Page({

  data: {
    ec: {
      onInit: initChart
    }    
  },
  onLoad: function (options) {
    
    //console.info("打开pid：" + options.pid);
    //console.info("打开type：" + options.type);
    //type 2: compay, 1: dept, 0 : person
    var type = options.type
    var pid = options.pid

    //获取最新消息数据  
    const self = this  
    var sessionId = app.globalData.sessionId

    if (sessionId) {      
      wx.request({
        url: config.domain + '/targetCr/targetBar',
        data: {
          type: type,
          pid:pid
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          //console.log('【targetCr/targetBar=】', result.data.data.targetBar)
          var targetBar = result.data.data.targetBar
          var year = result.data.data.year
          var month = result.data.data.month

          var tarDatas = []
          var actDatas = []
          
          var listDB = []

          if (targetBar) { 
            var tarMonths = targetBar.targetDetalDataList[1].targetMonthDataList  
            var actMonths = targetBar.targetDetalDataList[2].targetMonthDataList           
            for (let i = 0, len = 12; i < len; ++i) {
              tarDatas.push(tarMonths[i].targeValue)
              actDatas.push(actMonths[i].targeValue)
            }

            option.series[0].data = tarDatas;
            option.series[1].data = actDatas;
            
          } 

          var title = targetBar.targetName + "（"+year +"年" + month +"月）"

          wx.setNavigationBarTitle({
            title: title,
            success() {
            },
            fail(err) {
            }
          })


          self.setData({
            target: targetBar, 
            year: year,
            month: month          
          })


        },

        fail({ errMsg }) {
          console.log('【plan/detailMonth fail】', errMsg)
        }
      })
    }

    

  },  

  onReady() {
    setTimeout(function () {
      // 获取 chart 实例的方式
      // console.log(chart)
    }, 2000);
  }
});
