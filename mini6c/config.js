/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la

const host = '192.168.0.168:8080/eqtit'

const config = {

  // 云开发环境 ID
  envId: 'c6n4-d38er',

  // 下面的地址配合云端 Server 工作
  host,
  domain: `http://${host}`,
    
  // 测试的请求地址，用于测试会话
  wxTestUrl: `http://${host}/userController/wxTestData`,

}

module.exports = config
