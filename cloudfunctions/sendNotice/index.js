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
      "touser": "oxRJz5TIAWcLxkbJGq1grap0ZpPk",
      "templateId": "mmChUuo0gQCk5geTc22116m9n4FLaXCH19GMO7TncNs",
      "page": 'index',
      "lang": 'zh_CN',
      "data": {
        "thing10": {
          value:"楼层"
        },
        "thing2": {
          "value": "2015年01月05日"
        },
        "date4": {
          "value": "2015年01月05日"
        },
        "character_string11": {
          "value": "XSDD-20210519-0014"
        },
      },
      "miniprogramState": 'developer'
    })
    return result
  } catch (err) {
    return err
  }
}