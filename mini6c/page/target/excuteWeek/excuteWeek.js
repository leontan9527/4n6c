import * as echarts from '../../components/ec-canvas/echarts';
const config = require('../../../config')
const app = getApp()

let chart = null;

var option = {
  title: {
    text: '',
    left: 'center',
    textStyle:{
      fontSize: 16
    }
  },
  color: ["#37A2DA"],
  legend: {
    data: ['执行率'],
    top: 50,
    left: 'center',    
    z: 100
  },
  grid: {
    containLabel: true
  },
  tooltip: {
    show: true,
    trigger: 'axis'
  },
  yAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['第1周'],
    // show: false
  },
  xAxis: {
    x: 'center',
    type: 'value',
    splitLine: {
      lineStyle: {
        type: 'dashed'
      }
    }
    // show: false
  },
  series: [{
    name: '执行率',
    type: 'line',
    smooth: true,
    data: [100.0]
  }]
};

function initChart(canvas, width, height, dpr) {

  console.info("initChart:width=" + width);

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

    console.info("打开pid：" + options.pid);
    console.info("打开type：" + options.type);
    //type 2: compay, 1: dept, 0 : person
    var type = options.type
    var pid = options.pid

    //获取最新消息数据  
    const self = this
    var sessionId = app.globalData.sessionId

    if (sessionId) {
      wx.request({
        url: config.domain + '/targetCr/excuteBullet',
        data: {
          type: type,
          planCycle: 0
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Cookie': 'JSESSIONID=' + sessionId
        },
        success(result) {
          console.log('【targetCr/excuteBullet=】', result.data.data.excuteBullet)
          var title = result.data.data.title
          var excuteBullet = result.data.data.excuteBullet
          
          var categoryDatas = []
          var seriesDatas = []

          var listDB = []

          if (excuteBullet) {
            
            for (let i = excuteBullet.length -1, len = 0; i >= len; --i) {
              categoryDatas.push("第"+excuteBullet[i].month + "周")
              seriesDatas.push(excuteBullet[i].planExcuteEfficiency ? (100 * excuteBullet[i].planExcuteEfficiency).toFixed(1)  : 0.0)
            }

            option.yAxis.data = categoryDatas;
            option.series[0].data = seriesDatas;
            option.title.text = title
          }
          /*
          wx.setNavigationBarTitle({
            title: title,
            success() {
            },
            fail(err) {
            }
          })*/


          self.setData({
            title: title,
            excuteBullet: excuteBullet
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
