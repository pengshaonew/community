//index.js
import QQMapWX from '../../utils/qqmap-wx-jssdk.min.js'
let qqmapsdk;
const app = getApp()
const db = wx.cloud.database();
const _ = db.command;
const sellList = db.collection('sellList');
const publish = db.collection('proclamation');
const users = db.collection('users');
Page({
    data: {
        avatarUrl: './user-unlogin.png',
        userInfo: {},
        userDataList: [],
        dataList: [],
        navIndex: "0",
        publishContent:''
    },

    onShow(){
        this.getSellData();
        this.getPublishData();
    },
    onLoad(){
        // 实例化API核心类
        qqmapsdk = new QQMapWX({
            key: 'FT5BZ-ZG7CV-M22PM-U2RMI-X2IL2-OPFZP'    // 必填
        });
        this.checkAuth((latitude, longitude) => {
            // https://lbs.qq.com/qqmap_wx_jssdk/method-reverseGeocoder.html
            qqmapsdk.reverseGeocoder({
                sig: 'T88UoZvi5yQgAS1160cozGl3NgoIIAJa',    // 必填
                location: {latitude, longitude},
                success(res) {
                    console.log(res);
                    const  city = res.result.ad_info.city
                    wx.setStorageSync('loca_city', city);
                },
                fail(err) {
                    console.log(err)
                    wx.showToast('获取城市失败')
                },
                complete() {
                    // 做点什么
                }
            })
        })
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
    // 上传图片
    doUpload: function () {
        // 选择图片
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {

                wx.showLoading({
                    title: '上传中',
                })

                const filePath = res.tempFilePaths[0]

                // 上传图片
                const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
                wx.cloud.uploadFile({
                    cloudPath,
                    filePath,
                    success: res => {
                        console.log('[上传文件] 成功：', res)

                        app.globalData.fileID = res.fileID
                        app.globalData.cloudPath = cloudPath
                        app.globalData.imagePath = filePath

                        wx.navigateTo({
                            url: '../storageConsole/storageConsole'
                        })
                    },
                    fail: e => {
                        console.error('[上传文件] 失败：', e)
                        wx.showToast({
                            icon: 'none',
                            title: '上传失败',
                        })
                    },
                    complete: () => {
                        wx.hideLoading()
                    }
                })

            },
            fail: e => {
                console.error(e)
            }
        })
    },

    clickNav: function (e) {
        console.log(e);
        let index = e.currentTarget.dataset.index;
        this.setData({navIndex: index});
    },

    getUserList: function () {
        users.where({
            _openid: _.neq("")
        }).get().then(result => {
            this.setData({userDataList: result.data});
        });
    },

    // 租房列表
    getSellData: function () {
        sellList.where({
            status: _.eq('THROUGH')
        }).orderBy('createTime', 'desc').get().then(res => {
            this.setData({dataList: res.data});
        })
    },

    // 公告
    getPublishData: function () {
        publish.where({}).get().then(res => {
            let content = res.data[0].content;
            this.setData({publishContent: content});
        })
    },

    goDetail(e){
        const id = e.target.dataset.id;
        wx.navigateTo({
            url:'/pages/houseDetail/index?id='+id
        })
    },
    checkAuth(callback) {
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.userLocation']) {
                    wx.authorize({
                        scope: 'scope.userLocation',
                        success() {
                            wx.getLocation({
                                type: 'wgs84',
                                success(res) {
                                    callback(res.latitude, res.longitude)
                                }
                            })
                        }
                    })
                }
            }
        })
    }
})
