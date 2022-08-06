// pages/houseDetail/index.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
const sellList = db.collection('sellList');
const users = db.collection('users');
const intentionUsers = db.collection('intentionUsers');
// 在页面中定义激励视频广告
let videoAd = null;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isToAudit: null,
        houseInfo: {},
        openId: null,
        phone:null
    },

    onLoad: function (option) {
        const openId = wx.getStorageSync('openId');
        const phone = wx.getStorageSync('phone');
        this.setData({
            openId,
            phone,
            isToAudit: option.isToAudit,
            isDelBtn: openId === 'oxRJz5TIAWcLxkbJGq1grap0ZpPk' || openId === 'oxRJz5S3jhzU9ygdIofXoIXMsMWM'
        })
        this.getSellData(option.id);

        // 在页面onLoad回调事件中创建激励视频广告实例
        if (wx.createRewardedVideoAd) {
            videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-900a7ad3b047777b'
            })
            videoAd.onLoad(() => {})
            videoAd.onError((err) => {})
            videoAd.onClose((res) => {})
        }
        // 用户触发广告后，显示激励视频广告
        if (videoAd) {
            videoAd.onClose(res => {
                // 用户点击了【关闭广告】按钮
                if (res && res.isEnded) {
                    // 正常播放结束，可以下发游戏奖励
                    this.callPhone();
                } else {
                    // 播放中途退出，不下发游戏奖励
                }
            })
        }

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        const {houseInfo} = this.data;
        return {
            title: houseInfo.title + ' —— 逛一圈-房屋租售,免费发布租售信息',
            path: '/pages/home/index',
            imageUrl: houseInfo.imgList && houseInfo.imgList[0] ? houseInfo.imgList[0] : '../../images/logo.png'
        }
    },
    onShareTimeline: function () {
        return {
            title: '逛一圈'
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
        if (houseInfo.imgList) {
            wx.cloud.deleteFile({
                fileList: houseInfo.imgList
            }).then(res => {
                // handle success
                if (res.fileList.length) {

                }
                console.log(res.fileList)
            }).catch(error => {
                wx.hideLoading();
                console.error(error)
            })
        }
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
    getPhoneNumber: function (e) {
        console.log(e.detail);
        wx.cloud.callFunction({
            // 云函数名称
            name: 'getPhone',
            // 传给云函数的参数
            data: {
                cloudID: e.detail.cloudID
            },
        }).then(res => {
            let phone = res.result.list[0].data.phoneNumber;
            if (phone) {
                wx.setStorageSync('phone', phone);
                this.setData({phone});
                intentionUsers.where({
                    phone: _.eq(phone)
                }).get().then(result => {
                    if (!result.data.length) {
                        intentionUsers.add({
                            data: {
                                phone,
                                timeStr: app.formatDate(new Date()),
                                createTime: Date.now()
                            }
                        }).then(res => {
                            this.callPhone();
                        })
                    }else{
                        this.callPhone();
                    }
                });
                const openId = wx.getStorageSync('openId');
                if(openId){
                    wx.cloud.callFunction({
                        // 云函数名称
                        name: 'updateUserPhone',
                        data: {
                            openId,
                            phone
                        }
                    }).then(res => {
                        if (res && res.result && res.result.stats && res.result.stats.updated === 1) {

                        }
                    }).catch(console.error)
                }
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
    seeMaxImg(e){
        const src = e.currentTarget.dataset.src;//获取data-src
        //图片预览
        wx.previewImage({
            current: src, // 当前显示图片的http链接
            urls: this.data.houseInfo.imgList // 需要预览的图片http链接列表
        })
    },
    showVideo(){
        if(videoAd){

            videoAd.show().catch(() => {
                // 失败重试
                videoAd.load()
                    .then(() => videoAd.show())
                    .catch(err => {
                        console.log('激励视频 广告显示失败')
                    })
            })
        }
    }
})