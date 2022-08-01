// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const _ = db.command;
const proclamation = db.collection('proclamation');

// 云函数入口函数
exports.main = async (event, context) => {
  return proclamation.where({
    _id: _.eq('2d44d6c2611e68460601fdb224019a96')
  }).update({
    data: {
      content: event.content
    },
  });
}