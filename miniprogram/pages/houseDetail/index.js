// pages/houseDetail/index.js
const db = wx.cloud.database();
const _ = db.command;
const sellList = db.collection('sellList');
const users = db.collection('users');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isToAudit: null,
        houseInfo: {},
        openId:null
    },

    onLoad: function (option) {
        const openId = wx.getStorageSync('openId');
        this.setData({
            openId,
            isToAudit: option.isToAudit,
            isDelBtn: openId === 'oxRJz5TIAWcLxkbJGq1grap0ZpPk' || openId === 'oxRJz5S3jhzU9ygdIofXoIXMsMWM'
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
    callPhone() {
        wx.makePhoneCall({
            phoneNumber: this.data.houseInfo.phone
        })
    },
    getUserProfile: function (e) {
        wx.getUserProfile({
            desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                this.setData({
                    userInfo: res.userInfo,
                    isLogin: true
                })
                this.onGetOpenid(res.userInfo);
            }
        })
    },

    onGetOpenid: function (userInfo) {
        console.log(userInfo);
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
                // console.log('[云函数] [login] user openId: ', res.result.openId);
                const openId = res.result.openid;
                const avatarUrl = userInfo.avatarUrl;
                const nickName = userInfo.nickName;
                wx.setStorage({
                    key: 'avatarUrl',
                    data: avatarUrl
                });
                wx.setStorage({
                    key: 'nickName',
                    data: nickName
                });
                wx.setStorage({
                    key: 'openId',
                    data: openId
                });
                this.callPhone();
                this.setData({
                    openId,
                    isDelBtn: openId === 'oxRJz5TIAWcLxkbJGq1grap0ZpPk' || openId === 'oxRJz5S3jhzU9ygdIofXoIXMsMWM'
                });
                users.where({
                    _openid: _.neq(openId)
                }).get().then(result => {
                    if (!result.data.length) {
                        users.add({
                            data: {
                                avatarUrl,
                                nickName,
                                openId,
                            }
                        })
                            .then(res => {
                                console.log(res);
                            })
                    }
                });

            },
            fail: err => {
                console.error('[云函数] [login] 调用失败', err)
            }
        })
    },
})