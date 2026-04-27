// pages/face/face.js
const app = getApp()
const config = require('../../config.js')

Page({
  data: {
    cameraMode: false,
    photoPath: '',
    photoPreview: '',
    isAnalyzing: false,
    analysisResult: null,
    canAnalyze: false,
    
    // 检测维度
    dimensions: [
      { name: '皮肤年龄', icon: '👤', desc: 'AI预测的皮肤年龄' },
      { name: '皱纹程度', icon: '〰️', desc: '面部皱纹分析' },
      { name: '色斑状况', icon: '🔴', desc: '色素沉着评估' },
      { name: '紧致度', icon: '💪', desc: '皮肤弹性分析' },
      { name: '眼周状态', icon: '👁️', desc: '眼袋/黑眼圈' },
      { name: '法令纹', icon: '👃', desc: '鼻唇沟深度' },
      { name: '整体评分', icon: '⭐', desc: '综合抗衰指数' }
    ]
  },

  onLoad() {},

  // 打开相机
  openCamera() {
    this.setData({ cameraMode: true })
  },

  // 从相册选择
  choosePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        this.setData({
          photoPath: res.tempFilePaths[0],
          photoPreview: res.tempFilePaths[0],
          canAnalyze: true,
          cameraMode: false,
          analysisResult: null
        })
      }
    })
  },

  // 拍照
  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          photoPath: res.tempImagePath,
          photoPreview: res.tempImagePath,
          canAnalyze: true,
          cameraMode: false,
          analysisResult: null
        })
      },
      fail: (err) => {
        console.error('拍照失败:', err)
        wx.showToast({ title: '拍照失败', icon: 'none' })
      }
    })
  },

  // 重新拍照
  retake() {
    this.setData({
      photoPath: '',
      photoPreview: '',
      canAnalyze: false,
      cameraMode: true,
      analysisResult: null
    })
  },

  // 开始分析
  async startAnalysis() {
    if (!this.data.canAnalyze || this.data.isAnalyzing) return
    
    // 检查免费次数
    if (!app.globalData.isVip && !app.canUseFree()) {
      this.showPaymentModal()
      return
    }

    this.setData({ isAnalyzing: true })

    try {
      wx.showLoading({ title: '面部分析中...' })

      // 上传照片到云函数
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath: `face/${Date.now()}.jpg`,
        filePath: this.data.photoPath
      })

      // 调用分析云函数
      const res = await wx.cloud.callFunction({
        name: 'face-analyze',
        data: {
          fileId: uploadRes.fileID
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        // 消耗免费次数
        if (!app.globalData.isVip) {
          app.useFree()
        }

        this.setData({
          analysisResult: res.result.analysis,
          canAnalyze: false
        })
      } else {
        wx.showToast({ title: res.result.message || '分析失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('分析失败:', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      this.setData({ isAnalyzing: false })
    }
  },

  // 显示支付弹窗
  showPaymentModal() {
    wx.showModal({
      title: '免费次数已用完',
      content: `单次分析 ${app.globalData.pricePerReport} 元，或开通会员无限次使用。`,
      confirmText: '立即支付',
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
          description: 'VoiceHealth 面部衰老参考分析'
        }
      })

      wx.hideLoading()

      if (res.result.payment) {
        wx.requestPayment({
          ...res.result.payment,
          success: () => {
            wx.showToast({ title: '支付成功', icon: 'success' })
            this.startAnalysis()
          }
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('支付失败:', err)
    }
  },

  // 生成综合报告
  goToCombined() {
    if (!this.data.analysisResult) return
    
    // 保存面部分析结果到全局
    app.globalData.faceResult = this.data.analysisResult
    app.globalData.facePhoto = this.data.photoPath
    
    wx.navigateTo({
      url: '/pages/combined/combined'
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: 'VoiceHealth - AI面部衰老分析',
      path: '/pages/face/face'
    }
  }
})
