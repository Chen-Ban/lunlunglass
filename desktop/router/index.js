const fs = require('fs')
const path = require('path')
const Router = require('koa-router')
const router = Router()
function findJsFiles(dirPath, callback) {
  // 确保传入的路径是一个字符串
  if (typeof dirPath !== 'string') {
    throw new Error('dirPath must be a string')
  }

  // 确保回调函数是一个函数
  if (typeof callback !== 'function') {
    throw new Error('callback must be a function')
  }

  // 读取目录的函数
  function readDir(currentDirPath, callback) {
    fs.readdir(currentDirPath, (err, files) => {
      if (err) {
        console.error(`Unable to scan directory: ${currentDirPath}`, err)
        return
      }

      files.forEach((file) => {
        const fullPath = path.join(currentDirPath, file)

        // 检查是否为文件
        fs.lstat(fullPath, (err, stats) => {
          if (err) {
            console.error(`Unable to get stats for file: ${fullPath}`, err)
            return
          }

          // 如果是目录，则递归处理
          if (stats.isDirectory()) {
            readDir(fullPath, callback)
          }
          // 如果是文件且是.js文件，则调用回调函数
          else if (stats.isFile() && path.extname(fullPath) === '.js') {
            callback(fullPath)
          }
        })
      })
    })
  }

  // 开始从给定的dirPath读取目录
  readDir(dirPath, callback)
}

async function registerRouter(app) {
  findJsFiles(__dirname, (filePath) => {
    try {
      const module = require(filePath)
      if (module instanceof Router) {
        console.log(`成功加载路由： ${filePath}`)
        app.use(module.routes()).use(module.allowedMethods())
      }
    } catch (err) {
      console.error(`Error loading module from ${filePath}:`, err)
    }
  })
  // router.get('/', async (ctx, next) => {})
  // app.use(router.routes()).use(router.allowedMethods())
  // console.log('加载默认路由')
}

module.exports = registerRouter
