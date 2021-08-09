//index.js
const app = getApp()
const db = wx.cloud.database();
const _ = db.command;
const sellList = db.collection('sellList');
const users = db.collection('users');
Page({
    data: {
        avatarUrl: './user-unlogin.png',
        userInfo: {},
        userDataList: [],
        dataList: [],
        navIndex: "0"
    },

    onShow(){
        this.getSellData()
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

    getSellData: function () {
        sellList.where({
            status: _.eq('THROUGH')
        }).get().then(res => {
            this.setData({dataList: res.data});
        })
    },

    goDetail(e){
        const id = e.target.dataset.id;
        wx.navigateTo({
            url:'/pages/houseDetail/index?id='+id
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
            console.log(res);
            if (res && res.result && res.result.stats && res.result.stats.updated === 1) {
                wx.redirectTo({
                    url: '/pages/toAudit/index'
                })
            }
        }).catch(console.error)
    },
    msgSubscribe(){
        wx.requestSubscribeMessage({
            tmplIds: ['8Mc3G7Lq3c1SZvTf5q2dLd2jLKDH6EVrl9Oa5PRFCXE'],
            success (res) { }
        })
    }
})
