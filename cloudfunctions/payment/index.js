// cloudfunctions/payment/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { type, amount, description } = event

  try {
    // 创建支付订单
    const res = await cloud.cloudPay.unifiedOrder({
      body: description || 'VoiceHealth 健康参考服务',
      outTradeNo: generateTradeNo(),
      spbillCreateIp: '127.0.0.1',
      subMchId: 'YOUR_SUB_MCH_ID', // 替换为你的子商户号
      totalFee: amount, // 单位：分
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'payment-callback', // 支付回调云函数
      nonceStr: generateNonceStr(),
      tradeType: 'JSAPI'
    })

    if (res.returnCode === 'SUCCESS' && res.resultCode === 'SUCCESS') {
      // 保存订单到数据库
      const db = cloud.database()
      await db.collection('orders').add({
        data: {
          userId: OPENID,
          tradeNo: res.outTradeNo,
          type: type, // 'single' 或 'vip'
          amount: amount,
          status: 'pending',
          createTime: db.serverDate()
        }
      })

      return {
        success: true,
        payment: {
          timeStamp: res.timeStamp,
          nonceStr: res.nonceStr,
          package: res.package,
          signType: res.signType,
          paySign: res.paySign
        }
      }
    } else {
      return {
        success: false,
        message: res.returnMsg || '创建订单失败'
      }
    }
  } catch (err) {
    console.error('支付创建失败:', err)
    return {
      success: false,
      message: '支付创建失败'
    }
  }
}

// 生成交易号
function generateTradeNo() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
  return `VH${year}${month}${day}${hour}${minute}${second}${random}`
}

// 生成随机字符串
function generateNonceStr(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
