// pages/userInfo/index.js

const app = getApp();
const { globalData } = getApp();
const db = wx.cloud.database();
const _ = db.command;
const users = db.collection('users');
// import moment from 'moment';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        avatarUrl: '../../images/defaultHeader.png',
        nickName: '微信用户',
        isLogin: false,
        isToAudit: false,
        canIUseGetUserProfile: false
    },
    onShow() {
        // 获取自定义 tabBar 组件实例并更新选中状态
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 2
            });
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true
            })
        }

        const avatarUrl = wx.getStorageSync('avatarUrl');
        const nickName = wx.getStorageSync('nickName');
        const openId = wx.getStorageSync('openId');
        if (openId) {
            this.setData({
                isToAudit: openId === 'oKPoQxtaybVUA_VLzTE9ukOvWcq8',
                isLogin: true,
                openId
            })
        } 
        if(avatarUrl){
            this.setData({
                avatarUrl
            })
        }
        if(nickName){
            this.setData({
                nickName
            })
        }
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
    // 选择头像回调函数
    onChooseAvatar(e) {
        const avatarUrl = e.detail.avatarUrl;
        this.setData({
            avatarUrl: avatarUrl
        });

        // 将头像保存到本地缓存
        wx.setStorageSync('avatarUrl', avatarUrl);
        this.updateUser('avatarUrl', avatarUrl)
        // 如果之前已有昵称，则认为用户信息完整
        if (this.data.nickName) {
            this.setData({ hasUserInfo: true });
        }
    },
    // 昵称输入框变化回调
    onNickNameInput(e) {
        const nickName = e.detail.value;
        this.setData({
            nickName: nickName
        });

        // 将昵称保存到本地缓存
        wx.setStorageSync('nickName', nickName);
        this.updateUser('nickName', nickName)
        // 如果之前已有头像，则认为用户信息完整
        if (this.data.avatarUrl) {
            this.setData({ hasUserInfo: true });
        }
    },
    updateUser(key,data) {
        wx.cloud.callFunction({
            // 云函数名称
            name: 'updateUserPhone',
            data: {
                openId: 'oKPoQxtaybVUA_VLzTE9ukOvWcq8',
                key,
                data
                
            }
        }).then(res => {
            console.log(61, res.result.stats);
            if (res && res.result && res.result.stats && res.result.stats.updated === 1) {

            }
        }).catch(console.error)
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
                this.setData({
                    isToAudit: openId === 'oKPoQxtaybVUA_VLzTE9ukOvWcq8',
                    isLogin: true,
                    avatarUrl,
                    nickName
                });
                users.where({
                    _openid: openId
                }).get().then(result => {
                    if (!result.data.length) {
                        users.add({
                            data: {
                                avatarUrl,
                                nickName,
                                openId,
                                timeStr: app.formatDate(new Date()),
                                createTime: Date.now()
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
    goPublish() {
        wx.navigateTo({
            url: '/pages/addPublish/index'
        })
    },

    goMyPublish() {
        wx.navigateTo({
            url: '/pages/myPublish/index'
        })
    },
    goToAudit() {
        wx.navigateTo({
            url: '/pages/toAudit/index'
        })
    },
    goProclamation() {
        wx.navigateTo({
            url: '/pages/proclamation/index'
        })
    },
    goUserList() {
        wx.navigateTo({
            url: '/pages/userList/index'
        })
    },
    sendMsg() {
        wx.cloud.callFunction({
            // 云函数名称
            name: 'sendNotice',
            // 传给云函数的参数
            data: {
                content: '通知消息测试'
            },
        }).then(res => {
            console.log(107, res);
        }).catch(console.error)
    },
    msgSubscribe() {
        wx.requestSubscribeMessage({
            tmplIds: ['mmChUuo0gQCk5geTc22116m9n4FLaXCH19GMO7TncNs'],
            success(res) {
                console.log(res)
            },
            fail(res) {
                console.log('fail', res)
            },
            complete() {
                console.log('complete')
            }
        })
    }
})