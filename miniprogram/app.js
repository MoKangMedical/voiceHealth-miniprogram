// app.js
const util = require('./utils/util.js')
const config = require('./config.js')

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: config.cloudEnv,
        traceUser: true,
      })
    }

    // 获取用户信息
    this.globalData.userInfo = wx.getStorageSync('userInfo') || null
    this.globalData.freeCount = wx.getStorageSync('freeCount') || 0
    this.globalData.isVip = wx.getStorageSync('isVip') || false
  },

  globalData: {
    userInfo: null,
    freeCount: 0,      // 今日免费次数
    isVip: false,       // 是否会员
    maxFreePerDay: config.payment.freePerDay,
    pricePerReport: config.payment.singlePrice / 100 // 转换为元
  },

  // 检查是否可以免费使用
  canUseFree: function () {
    const today = new Date().toDateString()
    const lastDate = wx.getStorageSync('lastFreeDate')
    if (lastDate !== today) {
      this.globalData.freeCount = 0
      wx.setStorageSync('freeCount', 0)
      wx.setStorageSync('lastFreeDate', today)
    }
    return this.globalData.freeCount < this.globalData.maxFreePerDay
  },

  // 消耗免费次数
  useFree: function () {
    this.globalData.freeCount++
    wx.setStorageSync('freeCount', this.globalData.freeCount)
    wx.setStorageSync('lastFreeDate', new Date().toDateString())
  }
})
