// pages/userInfo/index.js

const app = getApp();
const {globalData} = getApp();
const db = wx.cloud.database();
const _ = db.command;
const users = db.collection('users');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        avatarUrl: '../../images/defaultHeader.png',
        nickName: '邻居',
        isLogin: false,
        isToAudit:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const avatarUrl = wx.getStorageSync('avatarUrl');
        const nickName = wx.getStorageSync('nickName');
        const openId = wx.getStorageSync('openId');
        if (nickName) {
            this.setData({
                isToAudit: openId === 'oPpIh5c7GikfzgDoiT4Ig3aPKSUs',
                isLogin: true,
                avatarUrl,
                nickName
            })
        }
    },

    getUserInfo: function (e) {
        this.setData({
            isLogin: true
        })
        this.onGetOpenid(e.detail.userInfo);
    },

    onGetOpenid: function (userInfo) {
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
                this.setData({
                    isToAudit: openId === 'oPpIh5c7GikfzgDoiT4Ig3aPKSUs',
                    isLogin: true,
                    avatarUrl,
                    nickName
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

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    goMyPublish(){
        wx.navigateTo({
            url:'/pages/myPublish/index'
        })
    },
    goToAudit(){
        wx.navigateTo({
            url:'/pages/toAudit/index'
        })
    }
})