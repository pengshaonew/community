//index.js
import QQMapWX from '../../utils/qqmap-wx-jssdk.min.js'

let qqmapsdk;
const app = getApp()
const db = wx.cloud.database();
const _ = db.command;
const sellList = db.collection('sellList');
const publish = db.collection('proclamation');
const users = db.collection('users');
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
        refresherTriggered: false,
        isFetching: false , // 是否正在获取数据
        city: '运城市'
    },

    onShow() {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 0 // 首页对应索引 0
            })
        }
        if (wx.getStorageSync('city')) {
            this.setData({
                city: wx.getStorageSync('city')
            }, () => {
                this.getSellDataOnce();
            })
        } else {
            this.getSellDataOnce();
        }
        // this.getPublishData();
    },
    onLoad() {
        const _this = this;
        // 实例化API核心类
        qqmapsdk = new QQMapWX({
            key: 'FT5BZ-ZG7CV-M22PM-U2RMI-X2IL2-OPFZP'    // 必填
        });
        // this.checkAuth((latitude, longitude) => {
        //     // https://lbs.qq.com/qqmap_wx_jssdk/method-reverseGeocoder.html
        //     qqmapsdk.reverseGeocoder({
        //         sig: 'T88UoZvi5yQgAS1160cozGl3NgoIIAJa',    // 必填
        //         location: { latitude, longitude },
        //         success(res) {
        //             const city = res.result.ad_info.city;
        //             if (city) {
        //                 currentPage = 0;
        //                 pageSize = 10;
        //                 wx.setStorageSync('city', city);
        //                 _this.setData({ city, dataList: [] }, () => {
        //                     _this.getSellData();
        //                 });
        //             }
        //         },
        //         fail(err) {
        //             console.log('获取城市失败', err);
        //             _this.getSellData();
        //         },
        //         complete() {
        //             // 做点什么
        //         }
        //     })
        // })
        this.onGetOpenid()
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '逛一逛-盐湖区闲置物品发布，线下自提，面对面交易',
            path: '/pages/home/index',
            imageUrl: '../../images/logo.png'
        }
    },
    onShareTimeline: function () {
        return {
            title: '逛一逛'
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
    onRefresherPulling() {
        // console.log('下拉中...');
        currentPage = 0; // 当前第几页,0代表第一页
        pageSize = 10; //每页显示多少数据
    },
    onRefresherRefresh() {
        // console.log('刷新中...');
        // 改成真实请示数据的函数
        this.getSellData();
    },
    // 优化后的数据请求方法，防止重复调用
    getSellDataOnce() {
        if (this.data.isFetching) return; // 如果正在请求，直接返回
        this.setData({ isFetching: true }); // 设置标志位
        this.getSellData().finally(() => {
            this.setData({ isFetching: false }); // 请求完成后重置标志位
        });
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
        return sellList.orderBy('createTime', 'desc')
            .where(params)
            .skip(currentPage * pageSize) //从第几个数据开始
            .limit(pageSize).get().then(res => {
                if (currentPage < 2) {
                    this.setData({
                        refresherTriggered: false, // 关闭刷新状态
                    });
                }
                if (res.data && res.data.length > 0) {
                    this.setData({
                        dataList: currentPage === 0 ? res.data : this.data.dataList.concat(res.data),
                        loadMore: false //把"上拉加载"的变量设为false，显示
                    });
                    currentPage++;
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

    onGetOpenid: function () {
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
                // console.log('[云函数] [login] user openId: ', res.result.openId);
                const openId = res.result.openid;
                wx.setStorage({
                    key: 'openId',
                    data: openId
                });
                users.where({
                    _openid: openId
                }).get().then(result => {
                    if (!result.data.length) {
                        users.add({
                            data: {
                                openId,
                                timeStr: app.formatDate(new Date()),
                                createTime: Date.now()
                            }
                        })
                            .then(res => {
                                console.log(res);
                            })
                    } else {
                        const userInfo = result.data[0];
                        const avatarUrl = userInfo.avatarUrl;
                        const nickName = userInfo.nickName;
                        avatarUrl && wx.setStorage({
                            key: 'avatarUrl',
                            data: avatarUrl
                        });
                        nickName && wx.setStorage({
                            key: 'nickName',
                            data: nickName
                        });
                    }
                });

            },
            fail: err => {
                console.error('[云函数] [login] 调用失败', err)
            }
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
