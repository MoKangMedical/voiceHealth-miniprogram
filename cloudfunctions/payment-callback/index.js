// cloudfunctions/payment-callback/index.js
// VoiceHealth 支付回调云函数 - 处理微信支付结果

const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { orderId, status, transactionId } = event

  try {
    // 1. 获取订单信息
    const orderResult = await db.collection('orders')
      .where({ orderId })
      .get()

    if (orderResult.data.length === 0) {
      return { success: false, message: '订单不存在' }
    }

    const order = orderResult.data[0]

    // 2. 更新订单状态
    await db.collection('orders').where({ orderId }).update({
      data: {
        status: status, // 'success' 或 'failed'
        transactionId: transactionId,
        updateTime: db.serverDate()
      }
    })

    // 3. 如果支付成功，更新用户VIP状态
    if (status === 'success') {
      if (order.type === 'vip') {
        // 开通VIP会员
        await db.collection('user_vip').add({
          data: {
            userId: order.userId,
            type: 'monthly',
            startTime: db.serverDate(),
            endTime: _.serverDate(30 * 24 * 60 * 60 * 1000), // 30天后
            orderId: orderId,
            createTime: db.serverDate()
          }
        })
      }
      // 单次购买不需要额外处理，前端会根据支付状态允许使用
    }

    return {
      success: true,
      orderId: orderId,
      status: status
    }
  } catch (err) {
    console.error('处理支付回调失败:', err)
    return {
      success: false,
      message: '处理失败'
    }
  }
}
