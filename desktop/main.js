const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
  encoding: 'utf8',
  debug: false,
})

const { app, BrowserWindow } = require('electron')
const bodyParser = require('koa-bodyparser')

const registerErrorCatcher = require('./error_catcher')
const registerRoutes = require('./router')
const registerStatic = require('./static')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  })
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000')
    console.log('页面监听3000')
  } else {
    win.loadURL('http://localhost:' + process.env.PORT)
    console.log('页面监听' + process.env.PORT)
  }
}

const Koa = require('koa')

function startServer() {
  const koa_app = new Koa()
  require('./database/connection')
  registerErrorCatcher(koa_app)
  koa_app.use(bodyParser())
  registerRoutes(koa_app)
  registerStatic(koa_app)

  koa_app.listen(process.env.PORT, () => {
    console.log('服务器监听' + process.env.PORT)
  })
}

app.whenReady().then(startServer).then(createWindow)
