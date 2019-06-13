const { promisify } = require('util')
const path = require('path')
const fs = require('fs')
/* 包装异步方法 */
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)


const template = require('art-template') // 模板
const mime = require('mime') // 获取对应扩展名mime类型

const compress = require('./compress')
const range = require('./range')
const isFresh = require('./cache')

module.exports = async (req, res, filePath, config) => {
  try {
    // 判断当前的资源类型
    const stats = await stat(filePath)

    // 当前为 文件资源
    if (stats.isFile()) {
      
      const type = mime.getType(filePath)
      console.info('文件', type)
      res.statusCode = 200
      res.setHeader('Content-Type', `${type}; charset=utf-8`)
      // 管道 读取文件
      // fs.createReadStream(filePath).pipe(res).on('close', () => {
      //   res.end()
      //   return
      // })
      
      if (isFresh(stats, req, res)) {
        res.statusCode = 304
        res.end()
        return
      }
      let rs;
      const {code, start, end} = range(stats.size, req, res)
      if ( code === 200 ) {
        res.statusCode = 200
        rs = fs.createReadStream(filePath)
      } else {
        res.statusCode = 206
        rs = fs.createReadStream(filePath, {start, end})
      }
      
      // 压缩
      if (filePath.match(config.compress)) {
        rs = compress(rs, req, res)
      }
      rs.pipe(res)
    }

    // 当前为 文件夹
    if (stats.isDirectory()) {
      console.info('文件夹')
      const files = await readdir(filePath)
      const tpl = await readFile(path.join(__dirname, '../view/index.html'))
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html')

      // 文件 路径
      const dir = path.relative(config.root, filePath)
      console.info(dir)
      const data = {
        title: path.basename(filePath),
        dir: dir ? `/${dir}` : '', // 在访问根路径是 dir的相对路径 为/ 返回 ''
        files
      }
      const html = template.render(tpl.toString(), {data})
      res.end(html)
    }
  } catch(e) {
      console.error(e)
      // 资源不存在
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/plain')
      res.end(`${filePath}is not a directory or file`)
      return
  }
}