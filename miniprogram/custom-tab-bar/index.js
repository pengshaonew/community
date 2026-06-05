Component({
  data: {
    selected: 0 // 当前选中的索引
  },
  methods: {
    switchTab(e) {
      const path = e.currentTarget.dataset.path;
      wx.switchTab({ url: path });
    },
    goPublish() {
      const openId = wx.getStorageSync('openId');
      console.log('openId: ', openId);
      // 点击发布按钮跳转，通常用 navigateTo 而不是 switchTab
      // 因为发布页通常不需要底部 TabBar
      if (openId) {
        wx.navigateTo({
          url: '/pages/addPublish/index'
        });
      } else {
        wx.switchTab({ url: '/pages/userInfo/index' });
      }

    }
  }
});