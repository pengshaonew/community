// pages/userList/index.js
const db = wx.cloud.database();
const _ = db.command;
const users = db.collection('users');
let users_currentPage = 0 // 当前第几页,0代表第一页
let users_pageSize = 20 //每页显示多少数据
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.queryUserList();
    },
    searchScrollLower: function () {
        if (!this.data.loadMore) {
            this.setData({
                loadMore: true, //加载中
                loadAll: false //是否加载完所有数据
            });

            //加载更多，这里做下延时加载
            setTimeout(() => {
                this.queryUserList()
            }, 1000)
        }
    },
    queryUserList() {//第一次加载数据
        if (users_currentPage === 1) {
            this.setData({
                loadMore: true, //把"上拉加载"的变量设为true，显示
                loadAll: false //把“没有数据”设为false，隐藏
            })
        }
        users.where({
            openId: _.neq('少鹏')
        }).skip(users_currentPage * users_pageSize) //从第几个数据开始
            .limit(users_pageSize).get().then(res => {
                if (res.data && res.data.length > 0) {
                    users_currentPage++;
                    this.setData({
                        userList: this.data.userList.concat(res.data),
                        loadMore: false //把"上拉加载"的变量设为false，显示
                    });
                    if (res.data.length < users_pageSize) {
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
            });
    }
})