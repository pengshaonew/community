// pages/addPublish/index.js
const db = wx.cloud.database();
const _ = db.command;
const sellList = db.collection('sellList');
Page({

    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    handleSubmit(e) {
        let values = e.detail.value;
        if (!wx.getStorageSync('openId')) {
            wx.showToast({
                title: '请先登录',
                icon: 'none'
            })
        }
        if (!values.roomNumber) {
            wx.showToast({
                title: '请输入房间号',
                icon: 'none'
            });
            return;
        }
        if (!values.owner) {
            wx.showToast({
                title: '请输入联系人',
                icon: 'none'
            });
            return;
        }
        if (!/^1[3-9]\d{9}$/.test(values.phone)) {
            wx.showToast({
                title: '联系方式有误,请检查确认',
                icon: 'none'
            });
            return;
        }
        sellList.add({
            data: {
                ...values,
                createTime: Date.now(),
                status: 'TO_AUDIT',
                openId: wx.getStorageSync('openId'),
                nickName: wx.getStorageSync('nickName'),
                avatarUrl: wx.getStorageSync('avatarUrl'),
                city: wx.getStorageSync('city') || '运城'
            }
        })
            .then(res => {
                if (res._id) {
                    wx.showToast({
                        title: '提交成功'
                    });
                    wx.redirectTo({
                        url:'/pages/myPublish/index'
                    })
                }
            })
    }
})