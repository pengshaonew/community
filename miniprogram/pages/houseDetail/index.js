// pages/houseDetail/index.js
const db = wx.cloud.database();
const _ = db.command;
const sellList = db.collection('sellList');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        houseInfo: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (option) {
        this.getSellData(option.id);
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    getSellData: function (id) {
        sellList.where({
            _id: _.eq(id)
        }).get().then(res => {
            console.log(res);
            this.setData({
                houseInfo:res.data[0]
            })
        })
    },
    callPhone(e){
        let phone = e.target.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone
        })
    }
})