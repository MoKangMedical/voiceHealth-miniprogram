// pages/history/history.js
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    records: [],
    loading: true,
    hasMore: true,
    page: 0,
    pageSize: 10
  },

  onLoad() {
    this.loadRecords()
  },

  onShow() {
    // 每次显示时刷新
    this.setData({ records: [], page: 0 })
    this.loadRecords()
  },

  async loadRecords() {
    if (!app.globalData.userInfo) {
      this.setData({ loading: false })
      return
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'analyze',
        data: {
          action: 'getHistory',
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      })

      if (res.result.success) {
        const newRecords = res.result.records || []
        this.setData({
          records: [...this.data.records, ...newRecords],
          hasMore: newRecords.length >= this.data.pageSize,
          loading: false
        })
      }
    } catch (err) {
      console.error('加载记录失败:', err)
      this.setData({ loading: false })
    }
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.loadRecords()
    }
  },

  // 查看报告
  viewReport(e) {
    const reportId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/report/report?id=${reportId}`
    })
  },

  // 删除记录
  deleteRecord(e) {
    const reportId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await wx.cloud.callFunction({
              name: 'analyze',
              data: {
                action: 'deleteReport',
                reportId: reportId
              }
            })

            // 从列表中移除
            const records = this.data.records.filter(r => r.id !== reportId)
            this.setData({ records })

            wx.showToast({ title: '已删除', icon: 'success' })
          } catch (err) {
            console.error('删除失败:', err)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ records: [], page: 0 })
    this.loadRecords().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 触底加载
  onReachBottom() {
    this.loadMore()
  }
})
