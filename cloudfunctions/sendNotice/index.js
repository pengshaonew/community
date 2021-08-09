// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      "touser": 'oPpIh5c7GikfzgDoiT4Ig3aPKSUs',
      "templateId": '8Mc3G7Lq3c1SZvTf5q2dLd2jLKDH6EVrl9Oa5PRFCXE',
      "data": {
        "thing7": "楼层",
        "thing8": "申请人",
        "time10": "日期",
        "time3": "时间",
      }
    })
    return result
  } catch (err) {
    return err
  }
}