const cloud = require('wx-server-sdk'); // 引用 wx-server-sdk 依赖文件
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,       //进行云能力初始化
})
exports.main = async function (params, context) {
  //cloudId 得到前端通过手机号按钮获取到的clouid
  // const result = await cloud.openapi.phonenumber.getPhoneNumber(params);
  const result = await cloud.getOpenData({
    list:[params.cloudID]
  });
  return result;

}