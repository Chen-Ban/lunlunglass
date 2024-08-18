const { v4: uuid } = require('uuid')

const { ArchiveModel } = require('../database/models/Archive')
const CustomerModel = require('../database/models/Customer')
class ArchiveService {
  async getSingleArchive(archiveId) {
    return await ArchiveModel.findOne({ archiveId })
  }
  async patchArchiveByCustomerId(customerId, archive) {
    const archiveId = await this.createArchive(customerId, archive)
    archive.archiveId = archiveId
    archive.customerId = customerId
    await CustomerModel.findOneAndUpdate(
      { customerId },
      { $set: { lastArchive: archive }, $push: { archives: archiveId } },
    )
    return archiveId
  }
  async createArchive(customerId, archive) {
    const archiveId = uuid()
    archive.archiveId = archiveId
    archive.customerId = customerId
    const newArchive = new ArchiveModel(archive)
    await newArchive.save()
    return archiveId
  }
}

module.exports = new ArchiveService()
