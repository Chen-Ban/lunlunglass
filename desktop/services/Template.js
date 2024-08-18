const TemplateModel = require('../database/models/Template')

class TemplateService {
  async createTemplate(template) {
    const newTemplate = new TemplateModel(template)
    await newTemplate.save()
  }
  async getTemplates() {
    return await TemplateModel.find({})
  }
}

module.exports = new TemplateService()
