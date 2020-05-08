// page/adviser/sendAdviserInfo/sendAdviserInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
 * 弹窗
 */
showDialogBtn: function() {
  this.setData({
      showModal: true
  })
},
/**
* 弹出框蒙层截断touchmove事件
*/
preventTouchMove: function() {},
/**
* 隐藏模态对话框
*/
hideModal: function() {
  this.setData({
      showModal: false
  });
},
/**
* 对话框取消按钮点击事件
*/
onCancel: function() {
  this.hideModal();
},
/**
* 对话框确认按钮点击事件
*/
onConfirm: function() {
  wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 2000
  })
  this.hideModal();
}
})