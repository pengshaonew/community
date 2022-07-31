// pages/test/index.js
import QQMapWX from "../../utils/qqmap-wx-jssdk.min";
const app = getApp();

let qqmapsdk;
let currentPage = 0 // 当前第几页,0代表第一页
let pageSize = 10 //每页显示多少数据
/**
 * 批量更改数据
 * */
Page({

    /**
     * 页面的初始数据
     */
    data: {
        region: ['广东省', '广州市'],
        customItem: '全部',
        city: '',
        dataList: [], //放置返回数据的数组
        loadMore: false, //"上拉加载"的变量，默认false，隐藏
        loadAll: false //“没有数据”的变量，默认false，隐藏
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(app.formatDate(new Date, 'YYYY年MM月DD日'));
        const _this = this;
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
                    console.log(res.result.ad_info);
                    const city = res.result.ad_info.city;
                    wx.setStorageSync('city', city);
                    _this.setData({city});
                },
                fail(err) {
                    console.log(err);
                    _this.getSellData();
                    wx.showToast('获取城市失败')
                },
                complete() {
                    // 做点什么
                }
            })
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.getData()
    },
    //页面上拉触底事件的处理函数
    onReachBottom: function () {
        console.log("上拉触底事件")
        let that = this
        if (!that.data.loadMore) {
            that.setData({
                loadMore: true, //加载中
                loadAll: false //是否加载完所有数据
            });

            //加载更多，这里做下延时加载
            setTimeout(function () {
                that.getData()
            }, 2000)
        }
    },
    handleSearch(e) {
        console.log('handleSearch', e);
        const val = e.detail.value;
        if (val){
            currentPage = 0 // 当前第几页,0代表第一页
            pageSize = 10 //每页显示多少数据
            this.getData(val);
        }
    },
    //请求数据
    getData(searchWd) {
        let that = this;
        //第一次加载数据
        if (currentPage === 1) {
            this.setData({
                loadMore: true, //把"上拉加载"的变量设为true，显示
                loadAll: false //把“没有数据”设为false，隐藏
            })
        }
        let params = {}
        if(searchWd){
            params.content = new RegExp(searchWd, 'i');
        }
        //云数据的请求
        wx.cloud.database().collection("testList").where(params)
            .skip(currentPage * pageSize) //从第几个数据开始
            .limit(pageSize)
            .get({
                success(res) {
                    if (res.data && res.data.length > 0) {
                        console.log("请求成功", res.data)
                        currentPage++
                        //把新请求到的数据添加到dataList里
                        let list = that.data.dataList.concat(res.data)
                        that.setData({
                            dataList: list, //获取数据数组
                            loadMore: false //把"上拉加载"的变量设为false，显示
                        });
                        if (res.data.length < pageSize) {
                            that.setData({
                                loadMore: false, //隐藏加载中。。
                                loadAll: true //所有数据都加载完了
                            });
                        }
                    } else {
                        that.setData({
                            loadAll: true, //把“没有数据”设为true，显示
                            loadMore: false //把"上拉加载"的变量设为false，隐藏
                        });
                    }
                },
                fail(res) {
                    console.log("请求失败", res)
                    that.setData({
                        loadAll: false,
                        loadMore: false
                    });
                }
            })
    },
    getPhoneNumber(e) {
        console.log(e.detail);
        wx.cloud.callFunction({
            // 云函数名称
            name: 'getPhone',
            // 传给云函数的参数
            data: {
                cloudID: e.detail.cloudID
            },
        }).then(res => {
            console.log(res);
            let phone = res.result.list[0].data.phoneNumber
            if (phone) {

            }
        }).catch(console.error)
    },
    updateUser() {
        wx.cloud.callFunction({
            // 云函数名称
            name: 'updateUserPhone',
            data: {
                openId: 'oyi1h42zdjsGZRXXrGfRaPsnFC0w',
                phone: '13191241119'
            }
        }).then(res => {
            console.log(61, res.result.stats);
            if (res && res.result && res.result.stats && res.result.stats.updated === 1) {

            }
        }).catch(console.error)
    },

    bindRegionChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            region: e.detail.value
        })
    },
    checkAuth(callback) {   // 获取经纬度
        const _this = this;
        wx.getFuzzyLocation({
            type: 'wgs84',
            success(res) {
                callback(res.latitude, res.longitude)
            },
            fail() {

            }
        })
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
                const cloudPath = 'sellImg/' + app.formatDate(new Date, 'YYYYMMDD') + '_' + Date.now() + filePath.match(/\.[^.]+?$/)[0]
                wx.cloud.uploadFile({
                    cloudPath,  // 云存储路径
                    filePath,
                    success: res => {
                        console.log('[上传文件] 成功：', res)
                        // 文件路径 res.fileID

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
    delFile() {
        // 删除文件
        wx.cloud.deleteFile({
            fileList: ['cloud://product-6gmyj2bv28878f63.7072-product-6gmyj2bv28878f63-1306873602/my-image.png']
        }).then(res => {
            // handle success
            console.log(res.fileList)
        }).catch(error => {
            // handle error
        })
    }
})