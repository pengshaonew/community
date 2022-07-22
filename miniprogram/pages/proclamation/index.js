// pages/proclamation/index.js
const db = wx.cloud.database();
const _ = db.command;
const publish = db.collection('proclamation');
Page({
    data: {
        formats: {},
        readOnly: false,
        placeholder: '开始输入...',
        editorHeight: 300,
        keyboardHeight: 0,
        isIOS: false,
        publishContent: '',
        publishContentNew: ''
    },
    readOnlyChange() {
        this.setData({
            readOnly: !this.data.readOnly
        })
    },
    onLoad() {
        this.getPublishData();
        const platform = wx.getSystemInfoSync().platform
        const isIOS = platform === 'ios'
        this.setData({isIOS})
        const that = this
        this.updatePosition(0)
        let keyboardHeight = 0
        wx.onKeyboardHeightChange(res => {
            if (res.height === keyboardHeight) return
            const duration = res.height > 0 ? res.duration * 1000 : 0
            keyboardHeight = res.height
            setTimeout(() => {
                wx.pageScrollTo({
                    scrollTop: 0,
                    success() {
                        that.updatePosition(keyboardHeight)
                        that.editorCtx.scrollIntoView()
                    }
                })
            }, duration)

        })
    },
    updatePosition(keyboardHeight) {
        const toolbarHeight = 50
        const {windowHeight, platform} = wx.getSystemInfoSync()
        let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
        this.setData({editorHeight, keyboardHeight})
    },
    calNavigationBarAndStatusBar() {
        const systemInfo = wx.getSystemInfoSync()
        const {statusBarHeight, platform} = systemInfo
        const isIOS = platform === 'ios'
        const navigationBarHeight = isIOS ? 44 : 48
        return statusBarHeight + navigationBarHeight
    },
    onEditorReady() {
        const that = this;
        wx.createSelectorQuery().select('#editor').context(function (res) {
            that.editorCtx = res.context;
            that.editorCtx.setContents({
                html: that.data.publishContent
            });
        }).exec()
    },
    format(e) {
        let {name, value} = e.target.dataset
        if (!name) return
        // console.log('format', name, value)
        this.editorCtx.format(name, value)

    },
    onStatusChange(e) {
        const formats = e.detail
        console.log(e)
        this.setData({formats})
    },
    insertDivider() {
        this.editorCtx.insertDivider({
            success: function () {
                console.log('insert divider success')
            }
        })
    },
    clear() {
        this.editorCtx.clear({
            success: function (res) {
                console.log("clear success")
            }
        })
    },
    removeFormat() {
        this.editorCtx.removeFormat()
    },
    insertDate() {
        const date = new Date()
        const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
        this.editorCtx.insertText({
            text: formatDate
        })
    },
    insertImage() {
        const that = this
        wx.chooseImage({
            count: 1,
            success: function (res) {
                that.editorCtx.insertImage({
                    src: res.tempFilePaths[0],
                    data: {
                        id: 'abcd',
                        role: 'god'
                    },
                    width: '80%',
                    success: function () {
                        console.log('insert image success')
                    }
                })
            }
        })
    },
    editComplate(e) {
        this.setData({publishContentNew: e.detail.html});
    },

    // 查询公告
    getPublishData: function () {
        publish.get().then(res => {
            let content = res.data[0].content;
            this.setData({publishContent: content}, () => this.onEditorReady());
        })
    },
    // 提交
    handleSubmit() {
        setTimeout(() => {

            const data = this.data.publishContentNew;
            wx.cloud.callFunction({
                // 云函数名称
                name: 'updateProclamation',
                // 传给云函数的参数
                data: {
                    id: '2d44d6c2611e68460601fdb224019a96',
                    data
                },
            }).then(res => {
                if (res && res.result && res.result.stats && res.result.stats.updated === 1) {
                    wx.showToast({title: '保存成功'});
                    this.setData({publishContentNew: ''});
                } else {
                    wx.showToast({title: '保存失败，请联系管理员'});
                }
            }).catch(console.error);
            // console.log(this.data.publishContentNew);
        }, 1000);
    }
})
