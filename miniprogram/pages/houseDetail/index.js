// pages/houseDetail/index.js
const db = wx.cloud.database();
const _ = db.command;
const sellList = db.collection('sellList');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isToAudit: null,
        houseInfo: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (option) {
        this.setData({
            isToAudit: option.isToAudit
        })
        this.getSellData(option.id);
    },
    handleStatus() {
        const {houseInfo} = this.data;
        let id = houseInfo._id;
        wx.cloud.callFunction({
            // 云函数名称
            name: 'changePublishStatus',
            // 传给云函数的参数
            data: {
                id
            },
        }).then(res => {
            console.log(36, res.result);
            if(res && res.result && res.result.stats && res.result.stats.updated === 1){
                wx.redirectTo({
                    url: '/pages/home/index'
                })
            }
        }).catch(console.error)
    },
    getSellData: function (id) {
        sellList.where({
            _id: _.eq(id)
        }).get().then(res => {
            this.setData({
                houseInfo: res.data[0]
            })
        })
    },
    callPhone(e) {
        let phone = e.target.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone
        })
    }
})