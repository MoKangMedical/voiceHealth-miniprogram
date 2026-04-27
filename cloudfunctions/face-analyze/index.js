// cloudfunctions/face-analyze/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { fileId } = event

  try {
    // 获取文件临时链接
    const fileRes = await cloud.getTempFileURL({
      fileList: [fileId]
    })
    
    const imageUrl = fileRes.fileList[0].tempFileURL
    
    // 调用面部分析API（这里用模拟数据，实际可对接百度AI、腾讯云等）
    const analysis = await analyzeFace(imageUrl)
    
    // 保存分析记录
    await db.collection('face_reports').add({
      data: {
        userId: OPENID,
        fileId: fileId,
        analysis: analysis,
        createTime: db.serverDate()
      }
    })
    
    return {
      success: true,
      analysis: analysis
    }
  } catch (err) {
    console.error('面部分析失败:', err)
    return {
      success: false,
      message: '分析失败，请重试'
    }
  }
}

// 面部分析（模拟数据，实际应对接真实API）
async function analyzeFace(imageUrl) {
  // 模拟分析延迟
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 生成模拟数据
  const totalScore = 65 + Math.floor(Math.random() * 25)
  const predictedAge = 25 + Math.floor(Math.random() * 15)
  const actualAge = 30 // 假设实际年龄
  const ageDiff = predictedAge - actualAge
  
  return {
    totalScore,
    scoreColor: totalScore >= 80 ? '#22c55e' : totalScore >= 60 ? '#3b82f6' : '#ef4444',
    level: totalScore >= 80 ? 'good' : totalScore >= 60 ? 'normal' : 'warning',
    levelText: totalScore >= 80 ? '状态良好' : totalScore >= 60 ? '状态正常' : '需要关注',
    
    predictedAge,
    actualAge,
    ageDiff,
    
    dimensions: [
      {
        name: '皮肤年龄',
        icon: '👤',
        score: 70 + Math.floor(Math.random() * 20),
        description: '基于面部纹理和弹性评估'
      },
      {
        name: '皱纹程度',
        icon: '〰️',
        score: 65 + Math.floor(Math.random() * 25),
        description: '额头、眼角、嘴角皱纹分析'
      },
      {
        name: '色斑状况',
        icon: '🔴',
        score: 70 + Math.floor(Math.random() * 20),
        description: '色素沉着和斑点评估'
      },
      {
        name: '紧致度',
        icon: '💪',
        score: 60 + Math.floor(Math.random() * 30),
        description: '面部轮廓和皮肤弹性'
      },
      {
        name: '眼周状态',
        icon: '👁️',
        score: 65 + Math.floor(Math.random() * 25),
        description: '眼袋、黑眼圈、细纹'
      },
      {
        name: '法令纹',
        icon: '👃',
        score: 60 + Math.floor(Math.random() * 30),
        description: '鼻唇沟深度和明显程度'
      }
    ],
    
    suggestions: [
      {
        icon: '☀️',
        title: '防晒是关键',
        content: '紫外线是皮肤衰老的首要原因，日常务必做好防晒，SPF30+以上。'
      },
      {
        icon: '🧴',
        title: '抗氧化护肤',
        content: '使用含维C、维E、虾青素等抗氧化成分的护肤品，对抗自由基。'
      },
      {
        icon: '💤',
        title: '充足睡眠',
        content: '睡眠不足会加速皮肤衰老，保证每天7-8小时优质睡眠。'
      },
      {
        icon: '🥤',
        title: '补充水分',
        content: '每天饮水2000ml以上，保持皮肤水润有弹性。'
      }
    ]
  }
}
