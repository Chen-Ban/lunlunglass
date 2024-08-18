module.exports = async (app) => {
  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      ctx.status = err.status || 500
      // 设置响应内容
      ctx.body = {
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : '出错了',
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Server error', err)
      }
    }
  })
}
