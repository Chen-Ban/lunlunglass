const TemplateService = require('../services/Template')

class TemplateController {
  async createTemplate(ctx, next) {
    const { template } = ctx.request.body
  }
  async getTemplates(ctx) {
    const templates = await TemplateService.getTemplates()
    ctx.status = 200
    ctx.body = {
      errno: 0,
      data: templates,
      msg: '',
    }
  }
}

module.exports = new TemplateController()
