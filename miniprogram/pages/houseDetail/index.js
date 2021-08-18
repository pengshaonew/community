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

    onLoad: function (option) {
        const openId = wx.getStorageSync('openId');
        this.setData({
            openId,
            isToAudit: option.isToAudit,
            isDelBtn: openId === 'oxRJz5TIAWcLxkbJGq1grap0ZpPk'
        })
        this.getSellData(option.id);
    },
    
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title:'水云间',
            path:'/pages/home/index',
            imageUrl:'../../images/banner_1.png'
        }
    },
    onShareTimeline:function(){
        return {
            title:'水云间'  
        }
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
            console.log(res);
            if (res && res.result && res.result.stats && res.result.stats.updated === 1) {
                wx.redirectTo({
                    url: '/pages/toAudit/index'
                })
            }
        }).catch(console.error)
    },
    handleDel() {
        const {houseInfo} = this.data;
        let id = houseInfo._id;
        wx.cloud.callFunction({
            // 云函数名称
            name: 'delHouseInfo',
            // 传给云函数的参数
            data: {
                id
            },
        }).then(res => {
            if (res && res.result && res.result.stats && res.result.stats.removed === 1) {
                wx.redirectTo({
                    url: '/pages/myPublish/index'
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