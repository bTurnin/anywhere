module.exports = {
  hostName: '127.0.0.1',
  port: 8888,
  root: process.cwd(),
  compress: /\.(json|js|css|html|md)/,
  cache: {
    maxAge: 600,
    expires: true,
    cacheControl: true,
    lastModified: true,
    etag: true
  }
}