// pages/addPublish/index.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
const sellList = db.collection('sellList');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgList: []
    },
    radioChange(e){
        console.log(15, e);
    },
    handleSubmit(e) {
        const {imgList} = this.data;
        let values = e.detail.value;
        if (!wx.getStorageSync('openId')) {
            wx.showToast({
                title: '请先登录',
                icon: 'none'
            })
        }
        if (!values.title) {
            wx.showToast({
                title: '请输入发布信息的标题',
                icon: 'none'
            });
            return;
        }
        if (!/^\d+$/.test(values.price)) {
            wx.showToast({
                title: '请输入有效的价格',
                icon: 'none'
            });
            return;
        }

        if (!values.phone) {
            wx.showToast({
                title: '请填写联系方式',
                icon: 'none'
            });
            return;
        }
        // values.title = values.title.replace(/1[3-9]\d{9}/, '');
        sellList.add({
            data: {
                ...values,
                imgList,
                createTime: Date.now(),
                timeStr: app.formatDate(new Date()),
                status: 'TO_AUDIT',
                openId: wx.getStorageSync('openId'),
                nickName: wx.getStorageSync('nickName'),
                avatarUrl: wx.getStorageSync('avatarUrl'),
                city: wx.getStorageSync('city') || '北京市'
            }
        })
            .then(res => {
                if (res._id) {
                    wx.showToast({
                        title: '提交成功'
                    });
                    wx.redirectTo({
                        url: '/pages/myPublish/index'
                    })
                }
            })
    },
    // 上传图片
    doUpload: function () {
        const _this = this;
        let imgList = this.data.imgList;
        // 选择图片
        if (imgList.length >= 5) {
            wx.showToast({
                icon: 'none',
                title: '最多上传5张图片',
            })
            return;
        }
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
                const cloudPath = 'sellImg/' + app.formatDate(new Date(), 'YYYYMMDD') + '_' + Date.now() + filePath.match(/\.[^.]+?$/)[0]
                wx.cloud.uploadFile({
                    cloudPath,  // 云存储路径
                    filePath,
                    success: res => {
                        console.log('[上传文件] 成功：', res.fileID)
                        // 文件路径 res.fileID
                        imgList.push(res.fileID);
                        _this.setData({
                            imgList: imgList
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
    delFile(e) {
        const _this = this;
        let imgList = this.data.imgList;
        const fileid = e.target.dataset.fileid;
        if (!fileid) return;
        // 删除文件
        wx.showLoading({
            title: '删除中',
        })

        wx.cloud.deleteFile({
            fileList: [fileid]
        }).then(res => {
            // handle success
            wx.hideLoading()
            if (res.fileList.length) {
                _this.setData({
                    imgList: imgList.filter(item => item !== fileid)
                })
            }
            console.log(res.fileList)
        }).catch(error => {
            wx.hideLoading();
            console.error(error)
        })
    }
})