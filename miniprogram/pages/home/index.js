//index.js
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
        }).get().then(res => {
            this.setData({dataList: res.data});
        })
    },

    // 租房列表
    getPublishData: function () {
        publish.where({}).get().then(res => {
            console.log(res.data[0].content);
            let content = res.data[0].content;
            this.setData({publishContent: content});
        })
    },

    goDetail(e){
        const id = e.target.dataset.id;
        wx.navigateTo({
            url:'/pages/houseDetail/index?id='+id
        })
    }
})
