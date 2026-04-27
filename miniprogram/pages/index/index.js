// pages/index/index.js
const app = getApp()
const util = require('../../utils/util.js')
const config = require('../../config.js')
const recorderManager = wx.getRecorderManager()

Page({
  data: {
    isRecording: false,
    recordingTime: 0,
    timer: null,
    canAnalyze: false,
    audioFilePath: '',
    isAnalyzing: false,
    freeCount: 0,
    maxFree: 1,
    isVip: false,
    tips: [
      '请在安静环境下录制',
      '建议朗读一段文字',
      '保持正常语速和音量',
      '录制30秒效果最佳'
    ]
  },

  onLoad() {
    this.setData({
      freeCount: app.globalData.freeCount,
      maxFree: app.globalData.maxFreePerDay,
      isVip: app.globalData.isVip
    })
  },

  onShow() {
    this.setData({
      freeCount: app.globalData.freeCount,
      isVip: app.globalData.isVip
    })
  },

  // 开始录音
  startRecording() {
    if (!app.globalData.userInfo) {
      this.getUserProfile()
      return
    }

    recorderManager.start({
      duration: config.analysis.maxDuration,
      sampleRate: config.analysis.sampleRate,
      numberOfChannels: config.analysis.numberOfChannels,
      encodeBitRate: config.analysis.encodeBitRate,
      format: config.analysis.format
    })

    recorderManager.onStart(() => {
      this.setData({ isRecording: true, recordingTime: 0 })
      this.startTimer()
    })

    recorderManager.onError((err) => {
      console.error('录音失败:', err)
      wx.showToast({ title: '录音失败，请重试', icon: 'none' })
    })
  },

  // 停止录音
  stopRecording() {
    recorderManager.stop()
    recorderManager.onStop((res) => {
      this.stopTimer()
      this.setData({
        isRecording: false,
        audioFilePath: res.tempFilePath,
        canAnalyze: true
      })
    })
  },

  // 计时器
  startTimer() {
    const timer = setInterval(() => {
      this.setData({ recordingTime: this.data.recordingTime + 1 })
    }, 1000)
    this.setData({ timer })
  },

  stopTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
      this.setData({ timer: null })
    }
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于生成健康参考报告',
      success: (res) => {
        const userInfo = res.userInfo
        app.globalData.userInfo = userInfo
        wx.setStorageSync('userInfo', userInfo)
        this.setData({ userInfo })
        this.startRecording()
      },
      fail: () => {
        wx.showToast({ title: '需要授权才能使用', icon: 'none' })
      }
    })
  },

  // 开始分析
  async startAnalysis() {
    if (!this.data.canAnalyze || this.data.isAnalyzing) return

    // 检查免费次数或付费状态
    if (!app.globalData.isVip && !app.canUseFree()) {
      this.showPaymentModal()
      return
    }

    this.setData({ isAnalyzing: true })

    try {
      wx.showLoading({ title: '分析中...' })

      // 上传音频到云函数
      const res = await wx.cloud.callFunction({
        name: 'analyze',
        data: {
          audioPath: this.data.audioFilePath,
          userId: app.globalData.userInfo?.nickName || 'anonymous'
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        // 消耗免费次数
        if (!app.globalData.isVip) {
          app.useFree()
          this.setData({ freeCount: app.globalData.freeCount })
        }

        // 跳转到报告页
        const reportId = res.result.reportId
        wx.navigateTo({
          url: `/pages/report/report?id=${reportId}`
        })
      } else {
        wx.showToast({ title: res.result.message || '分析失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('分析失败:', err)
      wx.showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      this.setData({ isAnalyzing: false, canAnalyze: false, recordingTime: 0 })
    }
  },

  // 显示支付弹窗
  showPaymentModal() {
    wx.showModal({
      title: '免费次数已用完',
      content: `今日免费次数已用完。单次分析 ${app.globalData.pricePerReport} 元，或开通会员无限次使用。`,
      confirmText: '立即支付',
      cancelText: '明天再来',
      success: (res) => {
        if (res.confirm) {
          this.createPayment()
        }
      }
    })
  },

  // 创建支付
  async createPayment() {
    try {
      wx.showLoading({ title: '创建订单...' })

      const res = await wx.cloud.callFunction({
        name: 'payment',
        data: {
          type: 'single',
          amount: config.payment.singlePrice,
          description: 'VoiceHealth 单次健康参考报告'
        }
      })

      wx.hideLoading()

      if (res.result.payment) {
        wx.requestPayment({
          ...res.result.payment,
          success: () => {
            wx.showToast({ title: '支付成功', icon: 'success' })
            // 支付成功后可以免费使用
            app.globalData.isVip = true
            wx.setStorageSync('isVip', true)
            this.startAnalysis()
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

  // 格式化时间
  formatTime(seconds) {
    return util.formatDuration(seconds)
  },

  // 跳转到科学依据页
  goScience() {
    wx.navigateTo({ url: '/pages/science/science' })
  },

  // 跳转到面部分析页
  goFace() {
    wx.navigateTo({ url: '/pages/face/face' })
  },

  // 跳转到综合评估页
  goCombined() {
    wx.navigateTo({ url: '/pages/combined/combined' })
  }
})
