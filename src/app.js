const http = require('http')
const path = require('path')
const chalk = require('chalk')

const conf = require('../config/defaultConfig')
const route = require('../helper/route')


class Server {
  constructor(config) {
    this.conf = Object.assign({}, conf, config)

    console.info(Object.assign({}, conf, config))
  }

  start() {
    http.createServer( (req, res) => {
    // 获取路径
    const filePath = path.join(this.conf.root, req.url)
    // 
    route(req, res, filePath, this.conf)
      
    }).listen(this.conf.port, this.conf.hostName, () => {
      console.info(chalk.cyanBright.bgRedBright(`http://${this.conf.hostName}:${this.conf.port}`))
    })
  }
}

module.exports = Server