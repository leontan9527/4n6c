Page({
  onLoad: function () {
    this.setData({
      icon_huawei: '../resources/pic/huawei.png',
      icon_wxb: '../resources/pic/wxb.png'
    });
  },
  onShareAppMessage() {
    return {
      title: '课程',
      path: 'page/ke/web-view/web-view'
    }
  },
})
