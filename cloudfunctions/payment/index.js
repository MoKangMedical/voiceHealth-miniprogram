// cloudfunctions/payment/index.js
// VoiceHealth 支付云函数 - 对接微信支付

const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { type, amount, description } = event

  try {
    // 1. 创建订单
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const orderData = {
      orderId: orderId,
      userId: OPENID,
      type: type, // 'single' 或 'vip'
      amount: amount,
      description: description,
      status: 'pending',
      createTime: db.serverDate()
    }

    await db.collection('orders').add({ data: orderData })

    // 2. 调用微信支付统一下单接口
    // 注意：实际项目中需要配置微信支付商户号和API密钥
    // 这里返回模拟的支付参数
    
    const paymentParams = {
      timeStamp: String(Math.floor(Date.now() / 1000)),
      nonceStr: Math.random().toString(36).substr(2, 15),
      package: `prepay_id=${orderId}`,
      signType: 'MD5',
      paySign: 'mock_sign_' + orderId // 实际项目中需要真实签名
    }

    // 3. 更新订单状态
    await db.collection('orders').where({ orderId }).update({
      data: {
        prepayId: orderId,
        paymentParams: paymentParams,
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      orderId: orderId,
      payment: paymentParams
    }
  } catch (err) {
    console.error('创建支付失败:', err)
    return {
      success: false,
      message: '支付创建失败，请重试'
    }
  }
}
