// pages/profile/profile.js
const app = getApp()
const util = require('../../utils/util.js')
const config = require('../../config.js')

Page({
  data: {
    userInfo: null,
    isVip: false,
    vipExpire: '',
    freeCount: 0,
    maxFree: 1,
    totalRecords: 0,
    menuItems: [
      { id: 'science', name: '科学依据', desc: '理论基础与研究支持', icon: '🔬' },
      { id: 'face', name: '面部衰老分析', desc: 'AI面部识别评估', icon: '📸' },
      { id: 'combined', name: '综合健康评估', desc: '声纹+面部双维度', icon: '📊' },
      { id: 'vip', name: '开通会员', desc: '无限次使用', icon: '👑' },
      { id: 'records', name: '检测记录', desc: '查看历史报告', icon: '📋' },
      { id: 'about', name: '关于我们', desc: '了解VoiceHealth', icon: 'ℹ️' },
      { id: 'feedback', name: '意见反馈', desc: '帮助我们改进', icon: '💬' },
      { id: 'share', name: '分享给朋友', desc: '一起关注健康', icon: '📤' }
    ]
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isVip: app.globalData.isVip,
        freeCount: app.globalData.freeCount,
        maxFree: app.globalData.maxFreePerDay
      })
      this.loadRecordCount()
    }
  },

  async loadRecordCount() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'analyze',
        data: { action: 'getRecordCount' }
      })
      if (res.result.success) {
        this.setData({ totalRecords: res.result.count })
      }
    } catch (err) {
      console.error('获取记录数失败:', err)
    }
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于展示个人信息',
      success: (res) => {
        const userInfo = res.userInfo
        app.globalData.userInfo = userInfo
        wx.setStorageSync('userInfo', userInfo)
        this.setData({ userInfo })
        this.loadRecordCount()
      }
    })
  },

  // 菜单点击
  onMenuTap(e) {
    const id = e.currentTarget.dataset.id
    switch (id) {
      case 'science':
        wx.navigateTo({ url: '/pages/science/science' })
        break
      case 'face':
        wx.navigateTo({ url: '/pages/face/face' })
        break
      case 'combined':
        wx.navigateTo({ url: '/pages/combined/combined' })
        break
      case 'vip':
        this.showVipModal()
        break
      case 'records':
        wx.switchTab({ url: '/pages/history/history' })
        break
      case 'about':
        this.showAbout()
        break
      case 'feedback':
        this.showFeedback()
        break
      case 'share':
        // 分享由右上角菜单触发
        wx.showToast({ title: '点击右上角分享', icon: 'none' })
        break
    }
  },

  // 显示VIP弹窗
  showVipModal() {
    wx.showModal({
      title: '开通会员',
      content: `会员特权：\n• 无限次健康参考分析\n• 详细健康趋势报告\n• 专属客服支持\n\n价格：${config.payment.vipMonthlyPrice / 100}元/月`,
      confirmText: '立即开通',
      cancelText: '暂不开通',
      success: (res) => {
        if (res.confirm) {
          this.createVipPayment()
        }
      }
    })
  },

  // 创建VIP支付
  async createVipPayment() {
    try {
      wx.showLoading({ title: '创建订单...' })

      const res = await wx.cloud.callFunction({
        name: 'payment',
        data: {
          type: 'vip',
          amount: config.payment.vipMonthlyPrice,
          description: 'VoiceHealth 月度会员'
        }
      })

      wx.hideLoading()

      if (res.result.payment) {
        wx.requestPayment({
          ...res.result.payment,
          success: () => {
            app.globalData.isVip = true
            wx.setStorageSync('isVip', true)
            this.setData({ isVip: true })
            wx.showToast({ title: '开通成功', icon: 'success' })
          },
          fail: () => {
            wx.showToast({ title: '支付取消', icon: 'none' })
          }
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('支付失败:', err)
      wx.showToast({ title: '支付创建失败', icon: 'none' })
    }
  },

  // 显示关于
  showAbout() {
    wx.showModal({
      title: '关于 VoiceHealth',
      content: 'VoiceHealth 是一款AI声纹健康参考工具。\n\n通过分析59维声学特征，为您提供25个健康维度的参考信息。\n\n声明：本服务仅供参考，不构成医疗建议。',
      showCancel: false
    })
  },

  // 显示反馈
  showFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有问题或建议，请联系：\n\n邮箱：feedback@voicehealth.ai\n微信：VoiceHealth_AI',
      showCancel: false
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: 'VoiceHealth - AI声纹健康参考',
      path: '/pages/index/index'
    }
  }
})
