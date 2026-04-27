// pages/combined/combined.js
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    voiceResult: null,
    faceResult: null,
    combinedResult: null,
    loading: true,
    
    // 综合评估维度
    categories: [
      { name: '生理年龄', key: 'biologicalAge', icon: '👤' },
      { name: '心血管健康', key: 'cardiovascular', icon: '❤️' },
      { name: '神经系统', key: 'neurological', icon: '🧠' },
      { name: '呼吸系统', key: 'respiratory', icon: '🫁' },
      { name: '皮肤状态', key: 'skin', icon: '✨' },
      { name: '整体活力', key: 'vitality', icon: '⚡' }
    ]
  },

  onLoad() {
    this.loadData()
  },

  loadData() {
    // 获取声音分析结果
    const voiceResult = app.globalData.voiceResult
    const faceResult = app.globalData.faceResult

    if (!voiceResult && !faceResult) {
      wx.showToast({ title: '请先完成分析', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    this.setData({ voiceResult, faceResult })
    this.generateCombinedReport()
  },

  // 生成综合报告
  generateCombinedReport() {
    const { voiceResult, faceResult } = this.data
    
    // 计算综合评分
    let totalScore = 0
    let scoreCount = 0
    
    if (voiceResult) {
      totalScore += voiceResult.overallScore || 75
      scoreCount++
    }
    
    if (faceResult) {
      totalScore += faceResult.totalScore || 80
      scoreCount++
    }
    
    const avgScore = Math.round(totalScore / scoreCount)
    
    // 生成综合评估
    const combinedResult = {
      totalScore: avgScore,
      scoreColor: util.getScoreColor(avgScore),
      level: avgScore >= 80 ? 'good' : avgScore >= 60 ? 'normal' : 'warning',
      levelText: avgScore >= 80 ? '状态良好' : avgScore >= 60 ? '状态正常' : '需要关注',
      
      // 综合年龄评估
      ageAssessment: this.calculateAgeAssessment(voiceResult, faceResult),
      
      // 各维度评分
      dimensions: this.calculateDimensions(voiceResult, faceResult),
      
      // 综合建议
      suggestions: this.generateSuggestions(voiceResult, faceResult, avgScore),
      
      // 数据来源
      dataSources: []
    }
    
    if (voiceResult) combinedResult.dataSources.push('声纹分析')
    if (faceResult) combinedResult.dataSources.push('面部识别')
    
    this.setData({ 
      combinedResult,
      loading: false 
    })
  },

  // 计算年龄评估
  calculateAgeAssessment(voiceResult, faceResult) {
    let voiceAge = null
    let faceAge = null
    let predictedAge = null
    
    if (voiceResult) {
      // 声音年龄评估（模拟）
      voiceAge = 28 + Math.floor(Math.random() * 10) - 5
    }
    
    if (faceResult) {
      faceAge = faceResult.predictedAge || 30
    }
    
    // 综合预测
    if (voiceAge && faceAge) {
      predictedAge = Math.round((voiceAge * 0.4 + faceAge * 0.6))
    } else if (voiceAge) {
      predictedAge = voiceAge
    } else {
      predictedAge = faceAge
    }
    
    const actualAge = app.globalData.userInfo?.age || 30
    const ageDiff = predictedAge - actualAge
    
    return {
      predictedAge,
      actualAge,
      ageDiff,
      voiceAge,
      faceAge,
      diffText: ageDiff > 0 ? `比实际年龄大${ageDiff}岁` : 
                ageDiff < 0 ? `比实际年龄小${Math.abs(ageDiff)}岁` : 
                '与实际年龄相符'
    }
  },

  // 计算各维度评分
  calculateDimensions(voiceResult, faceResult) {
    const dimensions = []
    
    // 生理年龄
    dimensions.push({
      name: '生理年龄',
      icon: '👤',
      score: faceResult ? faceResult.totalScore : 75,
      color: '#8b5cf6'
    })
    
    // 心血管健康
    const cardioVoice = voiceResult?.risks?.find(r => r.name === '心血管健康')
    dimensions.push({
      name: '心血管健康',
      icon: '❤️',
      score: cardioVoice?.level === 'low' ? 85 : cardioVoice?.level === 'medium' ? 70 : 60,
      color: '#ef4444'
    })
    
    // 神经系统
    const neuroVoice = voiceResult?.risks?.find(r => r.name === '神经系统')
    dimensions.push({
      name: '神经系统',
      icon: '🧠',
      score: neuroVoice?.level === 'low' ? 82 : neuroVoice?.level === 'medium' ? 68 : 55,
      color: '#3b82f6'
    })
    
    // 呼吸系统
    const respVoice = voiceResult?.risks?.find(r => r.name === '呼吸系统')
    dimensions.push({
      name: '呼吸系统',
      icon: '🫁',
      score: respVoice?.level === 'low' ? 88 : respVoice?.level === 'medium' ? 72 : 60,
      color: '#22c55e'
    })
    
    // 皮肤状态
    if (faceResult) {
      const skinDim = faceResult.dimensions?.find(d => d.name === '紧致度')
      dimensions.push({
        name: '皮肤状态',
        icon: '✨',
        score: skinDim?.score || 75,
        color: '#eab308'
      })
    }
    
    // 整体活力
    dimensions.push({
      name: '整体活力',
      icon: '⚡',
      score: Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length),
      color: '#f97316'
    })
    
    return dimensions
  },

  // 生成综合建议
  generateSuggestions(voiceResult, faceResult, score) {
    const suggestions = []
    
    // 基于综合评分
    if (score < 70) {
      suggestions.push({
        icon: '🏥',
        title: '建议体检',
        content: '综合评估显示部分指标需要关注，建议进行全面体检。'
      })
    }
    
    // 基于声音分析
    if (voiceResult) {
      suggestions.push({
        icon: '💤',
        title: '充足睡眠',
        content: '保持7-8小时优质睡眠，有助于声带恢复和整体健康。'
      })
    }
    
    // 基于面部分析
    if (faceResult) {
      suggestions.push({
        icon: '🧴',
        title: '防晒护肤',
        content: '日常做好防晒，使用抗氧化护肤品，延缓皮肤衰老。'
      })
    }
    
    // 通用建议
    suggestions.push({
      icon: '🏃',
      title: '规律运动',
      content: '每周至少150分钟中等强度运动，提升心肺功能和整体活力。'
    })
    
    suggestions.push({
      icon: '🥗',
      title: '均衡饮食',
      content: '多摄入抗氧化食物，控制糖分和加工食品摄入。'
    })
    
    return suggestions
  },

  // 保存报告
  async saveReport() {
    try {
      wx.showLoading({ title: '保存中...' })
      
      const res = await wx.cloud.callFunction({
        name: 'analyze',
        data: {
          action: 'saveCombinedReport',
          voiceResult: this.data.voiceResult,
          faceResult: this.data.faceResult,
          combinedResult: this.data.combinedResult
        }
      })
      
      wx.hideLoading()
      
      if (res.result.success) {
        wx.showToast({ title: '保存成功', icon: 'success' })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('保存失败:', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  // 分享报告
  onShareAppMessage() {
    return {
      title: '我的VoiceHealth综合健康评估报告',
      path: '/pages/combined/combined'
    }
  },

  // 返回首页
  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
