// utils/util.js
// VoiceHealth 工具函数

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 格式化时长（秒 -> mm:ss）
const formatDuration = seconds => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${formatNumber(min)}:${formatNumber(sec)}`
}

// 格式化日期（友好显示）
const formatDate = dateStr => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  // 1分钟内
  if (diff < 60000) {
    return '刚刚'
  }
  // 1小时内
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  // 24小时内
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  // 7天内
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }
  // 超过7天
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 获取风险等级颜色
const getRiskColor = level => {
  const colors = {
    'low': '#22c55e',
    'medium': '#eab308',
    'high': '#ef4444'
  }
  return colors[level] || '#6b7280'
}

// 获取风险等级文字
const getRiskText = level => {
  const texts = {
    'low': '低风险',
    'medium': '中等风险',
    'high': '高风险'
  }
  return texts[level] || '未知'
}

// 获取风险等级背景色
const getRiskBgColor = level => {
  const colors = {
    'low': 'rgba(34, 197, 94, 0.1)',
    'medium': 'rgba(234, 179, 8, 0.1)',
    'high': 'rgba(239, 68, 68, 0.1)'
  }
  return colors[level] || 'rgba(107, 114, 128, 0.1)'
}

// 获取分数等级
const getScoreLevel = score => {
  if (score >= 90) return { text: '优秀', color: '#22c55e' }
  if (score >= 80) return { text: '良好', color: '#3b82f6' }
  if (score >= 70) return { text: '一般', color: '#eab308' }
  if (score >= 60) return { text: '较差', color: '#f97316' }
  return { text: '异常', color: '#ef4444' }
}

// 生成分享图片描述
const generateShareDesc = report => {
  if (!report) return '来看看我的健康报告'
  return `我的健康评分：${report.overall_score}分，${report.summary?.substring(0, 20)}...`
}

module.exports = {
  formatTime,
  formatNumber,
  formatDuration,
  formatDate,
  getRiskColor,
  getRiskText,
  getRiskBgColor,
  getScoreLevel,
  generateShareDesc
}
