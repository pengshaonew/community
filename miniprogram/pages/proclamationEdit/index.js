// pages/proclamationEdit/index.js
const db = wx.cloud.database();
const _ = db.command;
const proclamation = db.collection('proclamation');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    proclamation: ''
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getProclamation();
  },

  getProclamation() {
    proclamation.where({
      _id: _.eq('2d44d6c2611e68460601fdb224019a96')
    }).get().then(res => {
      this.setData({
        proclamation: res.data[0].content
      });
    })
  },

  changeCon(e) {
    let value = e.detail.value;
    this.setData({
      proclamation: value
    })
  },

  handleSubmit(e) {
    let {proclamation} = this.data;
    wx.cloud.callFunction({
      // 云函数名称
      name: 'proclamationEdit',
      // 传给云函数的参数
      data: {
        content:proclamation
      },
    }).then(res => {
      console.log(41, res);
      wx.showToast({
        title: '修改成功',
      })
    }).catch(console.error)
  }

})