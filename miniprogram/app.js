//app.js
App({
    onLaunch: function () {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                // env: 'room-q4ke9',
                env: 'product-0gy19fi7d42daa68',
                traceUser: true,
            })
        }
        this.globalData = {}
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            let userInfo = res.userInfo;
                            this.globalData.avatarUrl = userInfo.avatarUrl;
                            this.globalData.nickName = userInfo.nickName;
                        }
                    })
                }
            }
        })
    },
    formatDate(newDate, format) {
        const date = newDate;
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const days = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        let formatDate = `${year}-${this.fun(month)}-${this.fun(days)} ${this.fun(hours)}:${this.fun(minutes)}:${this.fun(seconds)} `;
        if (format === 'YYYY-MM-DD') {
            formatDate = formatDate.replace(/\s.+$/g, '');
        }else if(format === 'HH:MM:SS'){
            formatDate = formatDate.replace(/^[\s]+\s/g, '');
        }else if(format === 'YYYY年MM月DD日'){
            formatDate = formatDate.replace(/\s.+$/g, '').replace(/(\d+)-(\d+)-(\d+)/, '$1年$2月$3日');
        }else if(format === 'YYYY年MM月DD日'){
            formatDate = formatDate.replace(/^[\s]+\s/g, '').replace(/(\d+):(\d+):(\d+)/, '$1时$2分$3秒');
        }else if(format === 'YYYYMMDD'){
            formatDate = formatDate.replace(/\s.+$/g, '').replace(/-/g, '');
        }else if(format === 'YYYYMMDDHHMMSS'){
            formatDate = formatDate.replace(/[-: ]/g, '').replace(/-/g, '');
        }
        return formatDate;
    },
    fun(val){
        return val < 10 ? '0' + val : val
    }
})
