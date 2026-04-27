// pages/report/report.js
const util = require('../../utils/util.js')

Page({
  data: {
    reportId: '',
    report: null,
    loading: true,
    error: null
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ reportId: options.id })
      this.loadReport(options.id)
    }
  },

  async loadReport(reportId) {
    try {
      wx.showLoading({ title: '加载报告...' })

      const res = await wx.cloud.callFunction({
        name: 'analyze',
        data: {
          action: 'getReport',
          reportId: reportId
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        this.setData({
          report: res.result.report,
          loading: false
        })
      } else {
        this.setData({
          error: res.result.message || '加载失败',
          loading: false
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('加载报告失败:', err)
      this.setData({
        error: '网络错误，请重试',
        loading: false
      })
    }
  },

  // 获取风险等级颜色
  getRiskColor(level) {
    return util.getRiskColor(level)
  },

  // 获取风险等级文字
  getRiskText(level) {
    return util.getRiskText(level)
  },

  // 分享报告
  onShareAppMessage() {
    return {
      title: '我的AI声纹健康参考报告',
      path: `/pages/report/report?id=${this.data.reportId}`
    }
  },

  // 保存报告图片
  async saveReportImage() {
    try {
      // 这里可以实现截图功能
      wx.showToast({ title: '功能开发中', icon: 'none' })
    } catch (err) {
      console.error('保存失败:', err)
    }
  },

  // 返回首页
  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
