// pages/mantisChat/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.mantisChat = this.selectComponent('#mantisChat');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  getPhoneNumber:function(e){
    
    console.log(e.detail);
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getPhone',
      // 传给云函数的参数
      data: {
        cloudID:e.detail.cloudID
      },
  }).then(res => {
      console.log(res);
      let phone = res.result.list[0].data.phoneNumber
      if (phone) {
        
      }
  }).catch(console.error)
  }
})