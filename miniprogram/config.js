// config.js
// VoiceHealth 配置文件

module.exports = {
  // 云环境ID（需要替换）
  cloudEnv: 'voicehealth-xxxxx',
  
  // 支付配置
  payment: {
    // 单次分析价格（单位：分）
    singlePrice: 990, // 9.9元
    // 会员月费（单位：分）
    vipMonthlyPrice: 2990, // 29.9元
    // 每天免费次数
    freePerDay: 1
  },
  
  // 分析配置
  analysis: {
    // 录音最长时间（毫秒）
    maxDuration: 60000,
    // 推荐录音时间（秒）
    recommendDuration: 30,
    // 采样率
    sampleRate: 16000,
    // 声道数
    numberOfChannels: 1,
    // 编码码率
    encodeBitRate: 96000,
    // 音频格式
    format: 'wav'
  },
  
  // 分享配置
  share: {
    title: 'VoiceHealth - AI声纹健康参考',
    path: '/pages/index/index',
    imageUrl: '' // 分享图片URL
  },
  
  // 联系方式
  contact: {
    email: 'support@voicehealth.ai',
    wechat: 'VoiceHealth_AI'
  }
}
