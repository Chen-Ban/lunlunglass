const Router = require('koa-router')
const StaticsController = require('../controllers/Statics')
const router = new Router({
  prefix: '/api/statics',
})

router.get('/', StaticsController.getStatics)

module.exports = router
