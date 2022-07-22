// pages/test/index.js
/**
 * 批量更改数据
 * */
Page({

    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },
    updateList() {
        wx.cloud.callFunction({
            // 云函数名称
            name: 'updateData'
        }).then(res => {
            console.log(res);
            if (res && res.result && res.result.stats && res.result.stats.updated === 1) {

            }
        }).catch(console.error)
    },
    getPhoneNumber(e) {
        let cloudID = e.detail.cloudID //开放数据ID
        console.log(e.detail);
        wx.cloud.callFunction({
            // 云函数名称
            name: 'getPhone',
            // 传给云函数的参数
            data: {
                cloudID: e.detail.cloudID
            },
        }).then(res => {
            console.log(res);
            let phone = res.result.list[0].data.phoneNumber
            if (phone) {

            }
        }).catch(console.error)
    },
})