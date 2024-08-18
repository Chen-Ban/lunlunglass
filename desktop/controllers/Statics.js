const StaticsServices = require('../services/Statics')

class StaticsController {
  async getStatics(ctx) {
    const [{ customerCount, optometryCount, purchaseCount }] =
      await StaticsServices.getStatics()

    ctx.status = 201
    ctx.body = {
      errno: 0,
      data: { customerCount, optometryCount, purchaseCount },
    }
  }
}

module.exports = new StaticsController()
