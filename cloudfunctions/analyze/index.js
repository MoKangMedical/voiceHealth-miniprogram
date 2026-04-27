// cloudfunctions/analyze/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, audioPath, reportId, page, pageSize } = event

  switch (action) {
    case 'getReport':
      return await getReport(reportId)
    case 'getHistory':
      return await getHistory(OPENID, page || 0, pageSize || 10)
    case 'getRecordCount':
      return await getRecordCount(OPENID)
    case 'deleteReport':
      return await deleteReport(OPENID, reportId)
    default:
      return await analyzeAudio(OPENID, audioPath)
  }
}

// 分析音频
async function analyzeAudio(userId, audioPath) {
  try {
    // 上传音频到云存储
    const audioResult = await cloud.uploadFile({
      fileContent: Buffer.from(audioPath, 'base64'),
      cloudPath: `audio/${userId}/${Date.now()}.wav`
    })

    // 调用分析服务（这里需要对接你的后端API）
    // 暂时返回模拟数据
    const mockReport = generateMockReport()

    // 保存报告到数据库
    const reportData = {
      userId: userId,
      audioFileId: audioResult.fileID,
      score: mockReport.overallScore,
      summary: mockReport.summary,
      features: mockReport.features,
      risks: mockReport.risks,
      insight: mockReport.insight,
      createTime: db.serverDate(),
      duration: 30
    }

    const result = await db.collection('reports').add({ data: reportData })

    return {
      success: true,
      reportId: result._id,
      report: mockReport
    }
  } catch (err) {
    console.error('分析失败:', err)
    return {
      success: false,
      message: '分析失败，请重试'
    }
  }
}

// 获取报告
async function getReport(reportId) {
  try {
    const result = await db.collection('reports').doc(reportId).get()
    return {
      success: true,
      report: result.data
    }
  } catch (err) {
    return {
      success: false,
      message: '报告不存在'
    }
  }
}

// 获取历史记录
async function getHistory(userId, page, pageSize) {
  try {
    const result = await db.collection('reports')
      .where({ userId })
      .orderBy('createTime', 'desc')
      .skip(page * pageSize)
      .limit(pageSize)
      .get()

    return {
      success: true,
      records: result.data
    }
  } catch (err) {
    return {
      success: false,
      records: []
    }
  }
}

// 获取记录数
async function getRecordCount(userId) {
  try {
    const result = await db.collection('reports')
      .where({ userId })
      .count()

    return {
      success: true,
      count: result.total
    }
  } catch (err) {
    return {
      success: false,
      count: 0
    }
  }
}

// 删除报告
async function deleteReport(userId, reportId) {
  try {
    // 验证报告属于当前用户
    const report = await db.collection('reports').doc(reportId).get()
    if (report.data.userId !== userId) {
      return { success: false, message: '无权删除' }
    }

    await db.collection('reports').doc(reportId).remove()
    return { success: true }
  } catch (err) {
    return { success: false, message: '删除失败' }
  }
}

// 生成模拟报告（实际应对接你的后端）
function generateMockReport() {
  const scores = [75, 80, 85, 70, 65, 88, 92, 60]
  const score = scores[Math.floor(Math.random() * scores.length)]
  
  const summaries = [
    '您的声纹特征显示整体健康状态良好，各项指标均在正常范围内。',
    '声学分析显示部分指标略有波动，建议关注相关健康维度。',
    'AI分析结果显示您的声音特征健康，建议保持良好的生活习惯。'
  ]

  const features = [
    { name: '语速', value: '4.2字/秒', percent: 85, color: '#22c55e' },
    { name: '音调', value: '180Hz', percent: 72, color: '#3b82f6' },
    { name: '音量', value: '65dB', percent: 68, color: '#eab308' },
    { name: '清晰度', value: '92%', percent: 92, color: '#22c55e' },
    { name: '稳定性', value: '88%', percent: 88, color: '#22c55e' },
    { name: '停顿', value: '正常', percent: 75, color: '#3b82f6' }
  ]

  const risks = [
    {
      name: '心血管健康',
      level: score > 80 ? 'low' : 'medium',
      levelText: score > 80 ? '低风险' : '中等风险',
      description: '声音的稳定性与心血管健康相关，您的指标显示正常。',
      suggestion: '建议保持规律运动，控制盐分摄入。'
    },
    {
      name: '呼吸系统',
      level: 'low',
      levelText: '低风险',
      description: '语音的流畅度和呼吸节奏反映呼吸系统状态。',
      suggestion: '如有呼吸不适，建议及时就医检查。'
    },
    {
      name: '神经系统',
      level: score > 70 ? 'low' : 'medium',
      levelText: score > 70 ? '低风险' : '中等风险',
      description: '语言的组织能力和反应速度与神经系统功能相关。',
      suggestion: '保持充足睡眠，适度进行脑力锻炼。'
    }
  ]

  return {
    overallScore: score,
    summary: summaries[Math.floor(Math.random() * summaries.length)],
    features: features,
    risks: risks,
    insight: '基于您的声纹特征分析，AI建议您保持良好的作息习惯，定期进行健康检查。本报告仅供参考，如有健康疑虑请咨询专业医生。'
  }
}
