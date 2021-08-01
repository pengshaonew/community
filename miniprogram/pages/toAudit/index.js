// pages/toAudit/index.js
const db = wx.cloud.database();
const _ = db.command;
const sellList = db.collection('sellList');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dataList:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getSellData();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    // 获取列表数据
    getSellData() {
        const openId = wx.getStorageSync('openId');
        sellList.where({
            status: _.eq('TO_AUDIT')
        }).get().then(res => {
            this.setData({dataList: res.data});
        })
    },
})