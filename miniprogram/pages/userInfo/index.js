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
        isToAudit:false,
        canIUseGetUserProfile: false
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
        if (nickName) {
            this.setData({
                isToAudit: openId === 'oxRJz5TIAWcLxkbJGq1grap0ZpPk' || openId === 'oxRJz5S3jhzU9ygdIofXoIXMsMWM',
                isLogin: true,
                avatarUrl,
                nickName
            })
        }
    },

    getUserProfile: function (e) {
        console.log(1);
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
                this.setData({
                    isToAudit: openId === 'oxRJz5TIAWcLxkbJGq1grap0ZpPk' || openId === 'oxRJz5S3jhzU9ygdIofXoIXMsMWM',
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

    goMyPublish(){
        wx.navigateTo({
            url:'/pages/myPublish/index'
        })
    },
    goToAudit(){
        wx.navigateTo({
            url:'/pages/toAudit/index'
        })
    },
    goProclamation(){
        wx.navigateTo({
            url:'/pages/proclamation/index'
        })
    },
    sendMsg(){
        wx.cloud.callFunction({
            // 云函数名称
            name: 'sendNotice',
            // 传给云函数的参数
            data: {
                content:'通知消息测试'
            },
        }).then(res => {
            console.log(107, res);
        }).catch(console.error)
    },
    msgSubscribe(){
        wx.requestSubscribeMessage({
            tmplIds: ['mmChUuo0gQCk5geTc22116m9n4FLaXCH19GMO7TncNs'],
            success (res) {
                console.log(res)
             },
             fail(res){
                 console.log('fail',res)
             },
             complete(){
                 console.log('complete')
             }
        })
    }
})