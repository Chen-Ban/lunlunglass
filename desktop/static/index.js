const serve = require('koa-static')
const path = require('path')
const staticPath = path.join(__dirname, '../public')

module.exports = async (app) => {
  app.use(serve(staticPath))
}
