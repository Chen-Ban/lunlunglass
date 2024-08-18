const Router = require('koa-router')
const router = new Router({
  prefix: '/api/template',
})

const TemplateController = require('../controllers/Template')

router.patch('/', TemplateController.createTemplate)
router.get('/', TemplateController.getTemplates)

module.exports = router
