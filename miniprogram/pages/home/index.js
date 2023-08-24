//index.js
import QQMapWX from '../../utils/qqmap-wx-jssdk.min.js'

let qqmapsdk;
const app = getApp()
const db = wx.cloud.database();
const _ = db.command;
const sellList = db.collection('sellList');
const publish = db.collection('proclamation');
let currentPage = 0 // 当前第几页,0代表第一页
let pageSize = 10 //每页显示多少数据
Page({
    data: {
        avatarUrl: './user-unlogin.png',
        userInfo: {},
        userDataList: [],
        dataList: [],
        navIndex: "0",
        publishContent: '',
        city: '运城市'
    },

    onShow() {
        if (wx.getStorageSync('city')) {
            this.setData({
                city: wx.getStorageSync('city')
            }, () => {
                this.getSellData();
            })
        } else {
            this.getSellData();
        }
        this.getPublishData();
    },
    onLoad() {
        const _this = this;
        // 实例化API核心类
        qqmapsdk = new QQMapWX({
            key: 'FT5BZ-ZG7CV-M22PM-U2RMI-X2IL2-OPFZP'    // 必填
        });
        this.checkAuth((latitude, longitude) => {
            // https://lbs.qq.com/qqmap_wx_jssdk/method-reverseGeocoder.html
            qqmapsdk.reverseGeocoder({
                sig: 'T88UoZvi5yQgAS1160cozGl3NgoIIAJa',    // 必填
                location: { latitude, longitude },
                success(res) {
                    const city = res.result.ad_info.city;
                    if (city) {
                        currentPage = 0;
                        pageSize = 10;
                        wx.setStorageSync('city', city);
                        _this.setData({ city, dataList: [] }, () => {
                            _this.getSellData();
                        });
                    }
                },
                fail(err) {
                    console.log('获取城市失败', err);
                    _this.getSellData();
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
            title: '逛一圈-房屋租售，免费发布租售信息',
            path: '/pages/home/index',
            imageUrl: '../../images/logo.png'
        }
    },
    onShareTimeline: function () {
        return {
            title: '逛一圈'
        }
    },
    searchScrollLower: function () {
        if (!this.data.loadMore) {
            this.setData({
                loadMore: true, //加载中
                loadAll: false //是否加载完所有数据
            });

            //加载更多，这里做下延时加载
            setTimeout(() => {
                this.getSellData()
            }, 1000)
        }
    },
    clickNav: function (e) {
        let index = e.currentTarget.dataset.index;
        this.setData({ navIndex: index });
    },

    // 列表
    getSellData: function () {
        const { city, searchWd } = this.data;
        //第一次加载数据
        if (currentPage === 1) {
            this.setData({
                loadMore: true, //把"上拉加载"的变量设为true，显示
                loadAll: false //把“没有数据”设为false，隐藏
            })
        }
        let params = {
            status: _.eq('THROUGH'),
            city: _.eq(city)
        };
        if (searchWd) {
            params.title = new RegExp(searchWd, 'i');
        }
        sellList.orderBy('createTime', 'desc')
            .where(params)
            .skip(currentPage * pageSize) //从第几个数据开始
            .limit(pageSize).get().then(res => {
                if (res.data && res.data.length > 0) {
                    currentPage++;
                    this.setData({
                        dataList: this.data.dataList.concat(res.data),
                        loadMore: false //把"上拉加载"的变量设为false，显示
                    });
                    if (res.data.length < pageSize) {
                        this.setData({
                            loadMore: false, //隐藏加载中。。
                            loadAll: true //所有数据都加载完了
                        });
                    }
                } else {
                    this.setData({
                        loadAll: true, //把“没有数据”设为true，显示
                        loadMore: false //把"上拉加载"的变量设为false，隐藏
                    });
                }
            }).catch((err) => {
                console.log("请求失败err", err)
                this.setData({
                    loadAll: false,
                    loadMore: false
                });
            })
    },

    // 公告
    getPublishData: function () {
        publish.get().then(res => {
            let content = res.data[0]?.content;
            this.setData({ publishContent: content });
        })
    },

    goDetail(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/houseDetail/index?id=' + id
        })
    },
    checkAuth(callback) {
        const _this = this;
        wx.getFuzzyLocation({
            type: 'wgs84',
            success(res) {
                callback(res.latitude, res.longitude)
            },
            fail() {
                _this.getSellData();
            }
        })
    },

    bindRegionChange: function (e) {
        const city = e.detail.value[1];
        wx.setStorageSync('city', city);
        currentPage = 0;
        pageSize = 10;
        this.setData({
            region: e.detail.value,
            city, dataList: []
        }, () => {
            this.getSellData();
        })
    },
    handleSearch(e) {
        const searchWd = e.detail.value;
        currentPage = 0 // 当前第几页,0代表第一页
        pageSize = 10 //每页显示多少数据
        this.setData({ dataList: [], searchWd }, () => {
            this.getSellData();
        })
    },
})
