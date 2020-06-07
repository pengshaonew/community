// pages/sell/index.js

const db = wx.cloud.database();
const _ = db.command;
const sellList = db.collection('sellList');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        dataList:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        // 获取列表数据
        this.getSellData();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },
    getSellData:function(){
        sellList.where({
          status: _.eq('THROUGH')
        }).get().then(res=>{
          this.setData({dataList:res.data});
        })
      },
})