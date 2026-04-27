// cloudfunctions/payment-callback/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { outTradeNo, resultCode, totalFee } = event

  if (resultCode !== 'SUCCESS') {
    return { errcode: 0, errmsg: 'OK' }
  }

  try {
    // 更新订单状态
    await db.collection('orders')
      .where({ tradeNo: outTradeNo })
      .update({
        data: {
          status: 'paid',
          payTime: db.serverDate()
        }
      })

    // 获取订单信息
    const order = await db.collection('orders')
      .where({ tradeNo: outTradeNo })
      .get()

    if (order.data.length > 0) {
      const { userId, type } = order.data[0]

      // 如果是会员订单，更新用户会员状态
      if (type === 'vip') {
        // 计算会员到期时间（30天后）
        const expireTime = new Date()
        expireTime.setDate(expireTime.getDate() + 30)

        // 更新或创建用户会员记录
        const userVip = await db.collection('user_vip')
          .where({ userId })
          .get()

        if (userVip.data.length > 0) {
          await db.collection('user_vip')
            .where({ userId })
            .update({
              data: {
                isVip: true,
                expireTime: expireTime,
                updateTime: db.serverDate()
              }
            })
        } else {
          await db.collection('user_vip').add({
            data: {
              userId: userId,
              isVip: true,
              expireTime: expireTime,
              createTime: db.serverDate(),
              updateTime: db.serverDate()
            }
          })
        }
      }
    }

    return { errcode: 0, errmsg: 'OK' }
  } catch (err) {
    console.error('支付回调处理失败:', err)
    return { errcode: 0, errmsg: 'OK' }
  }
}
