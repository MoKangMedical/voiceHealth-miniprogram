// cloudfunctions/face-analyze/index.js
// VoiceHealth 面部分析云函数 - 对接真实后端API

const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 后端API配置
const API_BASE = 'https://voicehealth-api.example.com' // 替换为你的实际API地址

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, imageUrl, reportId } = event

  switch (action) {
    case 'getReport':
      return await getFaceReport(reportId)
    case 'getHistory':
      return await getFaceHistory(OPENID)
    default:
      return await analyzeFace(OPENID, imageUrl)
  }
}

// 分析面部 - 对接真实API
async function analyzeFace(userId, imageUrl) {
  try {
    // 1. 调用后端API进行面部分析
    const response = await axios.post(`${API_BASE}/api/v1/face/analyze`, {
      image_url: imageUrl,
      user_id: userId
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId
      },
      timeout: 30000
    })

    const apiResult = response.data

    if (!apiResult.ok) {
      throw new Error(apiResult.message || '分析失败')
    }

    // 2. 保存报告到数据库
    const reportData = {
      userId: userId,
      imageUrl: imageUrl,
      score: apiResult.report.overall_score,
      predictedAge: apiResult.report.predicted_age,
      dimensions: apiResult.report.dimensions,
      summary: apiResult.report.summary,
      createTime: db.serverDate()
    }

    const result = await db.collection('face_reports').add({ data: reportData })

    return {
      success: true,
      reportId: result._id,
      report: apiResult.report
    }
  } catch (err) {
    console.error('面部分析失败:', err)
    
    // 开发阶段返回模拟数据
    if (process.env.NODE_ENV === 'development') {
      return generateMockFaceResponse(userId)
    }
    
    return {
      success: false,
      message: err.message || '分析失败，请重试'
    }
  }
}

// 获取面部报告
async function getFaceReport(reportId) {
  try {
    const result = await db.collection('face_reports').doc(reportId).get()
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

// 获取面部分析历史
async function getFaceHistory(userId) {
  try {
    const result = await db.collection('face_reports')
      .where({ userId })
      .orderBy('createTime', 'desc')
      .limit(20)
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

// 生成模拟面部响应（开发阶段）
function generateMockFaceResponse(userId) {
  const baseAge = 30
  const variance = Math.floor(Math.random() * 10) - 5
  const predictedAge = baseAge + variance
  
  const dimensions = [
    { name: '皱纹', score: 70 + Math.floor(Math.random() * 20), level: '良好' },
    { name: '色斑', score: 65 + Math.floor(Math.random() * 25), level: '一般' },
    { name: '紧致度', score: 75 + Math.floor(Math.random() * 15), level: '良好' },
    { name: '眼部', score: 60 + Math.floor(Math.random() * 30), level: '一般' },
    { name: '法令纹', score: 70 + Math.floor(Math.random() * 20), level: '良好' },
    { name: '肤色', score: 80 + Math.floor(Math.random() * 15), level: '优秀' }
  ]

  const overallScore = Math.floor(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length)

  return {
    success: true,
    reportId: `face_mock_${Date.now()}`,
    report: {
      overall_score: overallScore,
      predicted_age: predictedAge,
      dimensions: dimensions,
      summary: `AI分析显示您的面部年龄约为${predictedAge}岁，整体皮肤状态${overallScore > 75 ? '良好' : '一般'}。`,
      suggestions: [
        '建议加强防晒，减少紫外线伤害',
        '保持充足睡眠，有助于皮肤修复',
        '适当补充胶原蛋白和维生素C'
      ]
    }
  }
}
