const Statics = require('../database/models/Statics')

class StaticsServices {
  async getStatics() {
    return await Statics.find({})
  }
}

module.exports = new StaticsServices()
