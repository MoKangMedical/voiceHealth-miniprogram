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
    
    // 检查VIP是否过期
    this.checkVipStatus()
  },

  globalData: {
    userInfo: null,
    freeCount: 0,      // 今日免费次数
    isVip: false,       // 是否会员
    maxFreePerDay: config.payment.freePerDay,
    pricePerReport: config.payment.singlePrice / 100 // 转换为元
  },

  // 检查VIP状态
  checkVipStatus: function () {
    const vipExpire = wx.getStorageSync('vipExpire')
    if (vipExpire && new Date(vipExpire) > new Date()) {
      this.globalData.isVip = true
    } else {
      this.globalData.isVip = false
      wx.setStorageSync('isVip', false)
    }
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
  },

  // 获取API基础URL
  getApiBaseUrl: function () {
    return config.api.useDev ? config.api.devBaseUrl : config.api.baseUrl
  },

  // 通用API请求方法
  request: function (options) {
    const that = this
    const baseUrl = that.getApiBaseUrl()
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseUrl}${options.url}`,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'X-User-Id': that.globalData.userInfo?.nickName || 'anonymous',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(res.data?.message || '请求失败'))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }
})
