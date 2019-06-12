const http = require('http')
const path = require('path')
const chalk = require('chalk')

const { port, hostName, root } = require('../config/defaultConfig')
const route = require('../helper/route')
http.createServer( (req, res) => {
  // 获取路径
  const filePath = path.join(root, req.url)
  // 
  route(req, res, filePath)
  
}).listen(port, hostName, () => {
  console.info(chalk.cyanBright.bgRedBright(`http://${hostName}:${port}`))
})